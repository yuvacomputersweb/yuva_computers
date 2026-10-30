//yuva
import axios from 'axios';

export interface BulkOrderPayload {
  name: string;
  company: string;
  email: string;
  phone: string;          // sent as 10-digit string (no +91 prefix)
  device_type: string;
  quantity: number;
  requirements?: string;
}
 
export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  order_id?: string;
  issue_type: string;
  message: string;
}
 
export interface ComplaintPayload {
  name: string;
  order_id: string;
  issue_type: string;
  email: string;
  phone: string;
  description: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yuvaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/google') ||
        error.config.url.includes('/auth/signup');

      if (!isAuthRequest) {
        localStorage.removeItem('yuvaToken');
        localStorage.removeItem('yuvaUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const submitBulkOrder = (data: BulkOrderPayload) =>
  api.post<{ detail: string }>("/forms/bulk-order/", data);
 
export const submitContactForm = (data: ContactPayload) =>
  api.post<{ detail: string }>("/forms/contact/", data);
 
export const submitComplaint = (data: ComplaintPayload) =>
  api.post<{ detail: string }>("/forms/complaint/", data);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login/', credentials);
    const token = res.data.access;
    if (token) {
      localStorage.setItem('yuvaToken', token);
      localStorage.setItem('yuvaUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  googleLogin: async (code: string) => {
    const res = await api.post('/auth/google/', {
      code,
      callback_url: 'postmessage',
    });
    const token = res.data.access || res.data.access_token || res.data.key;
    if (token) {
      localStorage.setItem('yuvaToken', token);
    }
    // fetch full profile after google login
    const profile = await authService.getProfile();
    localStorage.setItem('yuvaUser', JSON.stringify(profile));
    return { ...res.data, user: profile };
  },

  signup: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
  }) => {
    return (await api.post('/auth/signup/', data)).data;
  },

  getProfile: async () => (await api.get('/auth/user/')).data,

  updateProfile: async (data: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
  }>) => {
    const res = await api.patch('/auth/user/', data);
    localStorage.setItem('yuvaUser', JSON.stringify(res.data));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('yuvaToken');
    localStorage.removeItem('yuvaUser');
  },

  isLoggedIn: () => !!localStorage.getItem('yuvaToken'),

  getStoredUser: () => {
    const u = localStorage.getItem('yuvaUser');
    return u ? JSON.parse(u) : null;
  },

  // Addresses
  getSavedAddresses: async () => (await api.get('/auth/addresses/')).data,

  saveAddress: async (data: any) => {
    if (data.id) {
      return (await api.put(`/auth/addresses/${data.id}/`, data)).data;
    }
    return (await api.post('/auth/addresses/', data)).data;
  },

  deleteAddress: async (id: number) =>
    (await api.delete(`/auth/addresses/${id}/`)).data,

  setDefaultAddress: async (id: number) =>
    (await api.post(`/auth/addresses/${id}/set-default/`)).data,
};

// ─── STORE ───────────────────────────────────────────────────────────────────
export const storeService = {
  getProducts: async (params?: any) =>
    (await api.get('/store/products/', { params })).data,

  getProductBySlug: async (slug: string) =>
    (await api.get(`/store/products/${slug}/`)).data,

  getCategories: async (params?: any) =>
    params ? (await api.get('/store/categories/', { params })).data : cachedGet('/store/categories/'),

  
  getBrands: async () => cachedGet('/store/brands/'),
  getUsageTags: async () => cachedGet('/store/usage-tags/'),
  getReviews: async (slug: string) =>
    (await api.get(`/store/products/${slug}/reviews/`)).data,
  addReview: async (slug: string, formData: FormData) =>
    (await api.post(`/store/products/${slug}/reviews/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data,
  getBrandsForCategory: async (categorySlug: string) =>
  (await api.get(`/store/categories/${categorySlug}/brands/`)).data,

  getHomeData: async () => (await api.get('/store/home-data/')).data,

  getSiteConfig: async () => (await api.get('/store/config/')).data,

  validateCoupon: async (code: string, orderTotal: number) =>
    (await api.post('/store/validate-coupon/', { code, order_total: orderTotal })).data,

  // Replace existing searchProducts method
  searchProducts: async (query: string) => {
  if (!query.trim()) return { products: [], categories: [], brands: [], message: 'Enter search term' };
  return (await api.get('/store/search/', { params: { q: query.trim() } })).data;
},
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const orderService = {
  createOrder: async (orderData: any) =>
    (await api.post('/orders/checkout/', orderData)).data,

  getUserOrders: async (page = 1) =>
    (await api.get(`/orders/?page=${page}`)).data,

  getOrderDetail: async (id: number) =>
    (await api.get(`/orders/${id}/`)).data,

  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => (await api.post('/payments/verify/', paymentData)).data,

  submitReturnRequest: async (orderId: number, data: {
    request_type: string;
    defect_description: string;
    defect_video_url?: string;
  }) => (await api.post(`/orders/${orderId}/return/`, data)).data,

  validateExchangeCode: async (code: string) =>
    (await api.post('/orders/validate-exchange-code/', { code })).data,
  cancelOrder: async (orderId: number) =>
  (await api.post(`/orders/${orderId}/cancel/`)).data,
};

// ─── SESSION CACHE ───────────────────────────────────────────────────────────
// Site-wide data (menus, stores, page content) rarely changes while someone
// browses, and several components ask for the same endpoint on every page.
// Sharing one in-flight request per URL keeps visitors well under the API's
// per-IP rate limit. Failed requests are dropped so they can be retried.
const cache = new Map<string, Promise<any>>();
const cachedGet = (url: string) => {
  if (!cache.has(url)) {
    cache.set(url, api.get(url).then((r) => r.data).catch((err) => { cache.delete(url); throw err; }));
  }
  return cache.get(url)!;
};

// ─── CONTENT ─────────────────────────────────────────────────────────────────
export const contentService = {
  getHomeContent: async () =>
    cachedGet('/content/home/'),

  getCompanyContent: async () =>
    cachedGet('/content/company/'),

  getBulkOrderContent: async () =>
    cachedGet('/content/bulk-orders/'),

  getStoresContent: async () =>
    cachedGet('/content/stores/'),

  getContactContent: async () =>
    cachedGet('/content/contact/'),
  getBlogsContent: async (limit?: number) => {
  const params = limit ? { limit } : {};
  return (await api.get('/content/blogs/', { params })).data;
},

getBlogBySlug: async (slug: string) =>
  (await api.get(`/content/blogs/${slug}/`)).data,
};

// ─── CONTACT ─────────────────────────────────────────────────────────────────
export const contactService = {
  sendContactForm: async (data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => (await api.post('/contact/', data)).data,

  sendComplaintForm: async (data: {
    name: string;
    email: string;
    order_id?: string;
    complaint: string;
  }) => (await api.post('/contact/complaint/', data)).data,
};

export default api;