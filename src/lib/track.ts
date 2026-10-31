/**
 * Marketing events for Google Analytics 4 (gtag) and the Meta Pixel (fbq).
 * Both tags are loaded in index.html. Every helper is safe to call when a
 * tag is blocked or missing.
 *
 * Purchases also go to Meta from the server (Conversions API) with the same
 * event id, `order_<id>`, so Meta counts each order once.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// Google Ads: fill these in when Google Ads runs (Tools → Conversions).
export const GOOGLE_ADS_ID = "";              // e.g. "AW-123456789"
export const GOOGLE_ADS_PURCHASE_LABEL = "";  // e.g. "AbCdEfGhIjk"

export interface TrackItem {
  id: string;        // product SKU — matches the product feed
  name: string;
  brand?: string;
  category?: string;
  variant?: string;
  price: number;
  quantity: number;
}

const ga = (name: string, params: Record<string, unknown>) => {
  try {
    window.gtag?.("event", name, params);
  } catch {
    /* tag blocked */
  }
};

const meta = (name: string, params: Record<string, unknown> = {}, eventID?: string, custom = false) => {
  try {
    window.fbq?.(custom ? "trackCustom" : "track", name, params, eventID ? { eventID } : undefined);
  } catch {
    /* tag blocked */
  }
};

const gaItems = (items: TrackItem[]) =>
  items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    item_brand: i.brand,
    item_category: i.category,
    item_variant: i.variant,
    price: i.price,
    quantity: i.quantity,
  }));

const total = (items: TrackItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

/** Product → TrackItem. */
export const productItem = (product: any, variant?: any, quantity = 1): TrackItem => ({
  id: String(product.sku || product.id),
  name: product.title,
  brand: product.brand_name,
  category: product.category_name,
  variant: variant ? [variant.processor, variant.edition, variant.ram, variant.storage].filter(Boolean).join(" / ") : undefined,
  price: Number(variant?.final_price ?? product.price) || 0,
  quantity,
});

/** Meta PageView for in-app navigation (GA4 counts these itself). */
export const trackPageView = () => meta("PageView");

export const trackViewItem = (item: TrackItem) => {
  ga("view_item", { currency: "INR", value: item.price, items: gaItems([item]) });
  meta("ViewContent", { content_ids: [item.id], content_type: "product", content_name: item.name, value: item.price, currency: "INR" });
};

export const trackAddToCart = (item: TrackItem) => {
  ga("add_to_cart", { currency: "INR", value: item.price * item.quantity, items: gaItems([item]) });
  meta("AddToCart", { content_ids: [item.id], content_type: "product", content_name: item.name, value: item.price * item.quantity, currency: "INR" });
};

export const trackBeginCheckout = (items: TrackItem[]) => {
  ga("begin_checkout", { currency: "INR", value: total(items), items: gaItems(items) });
  meta("InitiateCheckout", { content_ids: items.map((i) => i.id), content_type: "product", num_items: items.length, value: total(items), currency: "INR" });
};

export const trackPurchase = (orderId: number | string, items: TrackItem[], value: number, paymentMethod: string) => {
  const transaction_id = String(orderId);
  ga("purchase", { transaction_id, currency: "INR", value, payment_type: paymentMethod, items: gaItems(items) });
  if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
    ga("conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`, value, currency: "INR", transaction_id });
  }
  meta(
    "Purchase",
    { content_ids: items.map((i) => i.id), content_type: "product", num_items: items.length, value, currency: "INR" },
    `order_${transaction_id}`
  );
};

/** Form leads: trade-in, back-in-stock, bulk order, contact, complaint. */
export const trackLead = (leadType: string, value?: number) => {
  ga("generate_lead", { lead_type: leadType, currency: "INR", value: value ?? 0 });
  meta("Lead", { content_name: leadType, ...(value ? { value, currency: "INR" } : {}) });
};

/** WhatsApp / phone taps — many customers buy this way. */
export const trackContact = (channel: "whatsapp" | "phone", where: string) => {
  ga("contact", { method: channel, link_location: where });
  meta("Contact", { content_name: channel, content_category: where });
};

export const trackSearch = (query: string) => {
  ga("search", { search_term: query });
  meta("Search", { search_string: query });
};

/** Meta browser cookies, sent with the order so the server-side Purchase matches the visitor. */
export const metaCookies = () => {
  const read = (name: string) => document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] ?? "";
  return { fbp: read("_fbp"), fbc: read("_fbc") };
};
