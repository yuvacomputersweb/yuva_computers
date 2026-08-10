//referenc profile page
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, orderService } from '@/services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LogOut, User, Package, MapPin, ChevronDown, ChevronUp,
  Clock, CheckCircle, Truck, XCircle, RotateCcw, AlertCircle,
  ChevronLeft, ChevronRight, Gift,
} from 'lucide-react';
import AddressManager from '@/components/profile/AddressManager';
import { SEO } from "@/components/SEO";

type Tab = 'profile' | 'orders' | 'addresses';

const ORDER_STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; step: number }> = {
  Pending:    { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, label: 'Pending', step: 0 },
  Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock, label: 'Processing', step: 1 },
  Confirmed:  { color: 'text-primary bg-primary/10 border-primary/20', icon: CheckCircle, label: 'Confirmed', step: 2 },
  Shipped:    { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck, label: 'Shipped', step: 3 },
  Delivered:  { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, label: 'Delivered', step: 4 },
  Cancelled:  { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, label: 'Cancelled', step: -1 },
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  Paid: 'text-green-700 bg-green-50',
  Pending: 'text-yellow-700 bg-yellow-50',
  Failed: 'text-red-700 bg-red-50',
  Refunded: 'text-blue-700 bg-blue-50',
  'Refund Pending': 'text-orange-700 bg-orange-50',
};

const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const tabParam = searchParams.get('tab') as Tab;
  const [tab, setTab] = useState<Tab>(
    ['profile', 'orders', 'addresses'].includes(tabParam) ? tabParam : 'profile'
  );

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);

  // Return modal
  const [returnModal, setReturnModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [returnForm, setReturnForm] = useState({ request_type: 'Exchange', defect_description: '', defect_video_url: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' });
  }, [user]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setSearchParams({ tab: t });
  };

  useEffect(() => {
    if (tab === 'orders') loadOrders(currentPage);
  }, [tab, currentPage]);

  const loadOrders = useCallback(async (page: number) => {
    setOrdersLoading(true);
    try {
      const data = await orderService.getUserOrders(page);
      if (data.results) {
        setOrders(data.results);
        setTotalOrders(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 5));
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch { toast.error('Failed to load orders'); }
    finally { setOrdersLoading(false); }
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await authService.updateProfile(profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSavingProfile(false); }
  };

 const handleCancelOrder = async (orderId: number) => {
  setCancellingOrder(orderId);
  try {
    const res = await orderService.cancelOrder(orderId);
    toast.success(res.message || 'Order cancelled successfully.');
    loadOrders(currentPage);
  } catch (err: any) {
    toast.error(err?.error || 'Failed to cancel order.');
  } finally {
    setCancellingOrder(null);
  }
};
  const handleSubmitReturn = async () => {
    if (!returnModal.orderId) return;
    if (!returnForm.defect_description.trim()) { toast.error('Please describe the defect'); return; }
    setSubmittingReturn(true);
    try {
      await orderService.submitReturnRequest(returnModal.orderId, returnForm);
      toast.success('Return request submitted! We will review within 2-3 business days.');
      setReturnModal({ open: false, orderId: null });
      setReturnForm({ request_type: 'Exchange', defect_description: '', defect_video_url: '' });
      loadOrders(currentPage);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to submit request');
    } finally { setSubmittingReturn(false); }
  };

  if (!user) return null;

  return (
    <>
    <SEO title="My Account & Orders | Yuva Computers" noindex={true} />
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-lg shadow-primary/20">
              {(user.first_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'My Account'}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-sm text-destructive border border-destructive/30 px-4 py-2 rounded-xl hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/30 rounded-xl p-1 border border-border/30">
          {([
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'orders', label: `Orders${totalOrders > 0 ? ` (${totalOrders})` : ''}`, icon: Package },
            { key: 'addresses', label: 'Addresses', icon: MapPin },
          ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="bg-card rounded-2xl border border-border/30 p-6 space-y-6">
            <h2 className="font-display font-bold text-foreground">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'first_name', label: 'First Name' },
                { key: 'last_name', label: 'Last Name' },
                { key: 'phone', label: 'Phone Number' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    value={(profileForm as any)[key]}
                    onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-border/30 rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
                <input value={user.email} disabled className="w-full border border-border/20 rounded-xl px-4 py-2.5 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed" />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile} className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 hover:opacity-90 transition">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="text-center py-16 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-semibold text-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Your order history will appear here.</p>
                <Link to="/products" className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold">Shop Now</Link>
              </div>
            ) : (
              <>
                {orders.map(order => {
                  const statusCfg = ORDER_STATUS_CONFIG[order.order_status] || ORDER_STATUS_CONFIG['Pending'];
                  const StatusIcon = statusCfg.icon;
                  const isExpanded = expandedOrder === order.id;
                  const firstItem = order.items?.[0];

                  return (
                    <div key={order.id} className="bg-card rounded-2xl border border-border/30 overflow-hidden">
                      
                      {/* ── Collapsed View (Amazon-style) ── */}
                      <div
                        className="p-5 cursor-pointer hover:bg-muted/10 transition-colors"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Product thumbnail */}
                          {firstItem?.image_url ? (
                            <img src={firstItem.image_url} alt={firstItem.product_name} className="w-16 h-16 object-contain rounded-xl bg-muted/30 border border-border/20 p-1 shrink-0" />
                          ) : (
                            <div className="w-16 h-16 bg-muted/30 rounded-xl shrink-0 flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Title row */}
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="font-semibold text-sm text-foreground line-clamp-1">
                                  {firstItem?.product_name || 'Order'}
                                  {order.items?.length > 1 && (
                                    <span className="text-muted-foreground font-normal"> +{order.items.length - 1} more</span>
                                  )}
                                </p>
                                {firstItem?.variant_label && (
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{firstItem.variant_label}</p>
                                )}
                              </div>
                              <span className="font-display font-bold text-foreground whitespace-nowrap">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                #{order.id} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                                <StatusIcon className="w-3 h-3" />{statusCfg.label}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLOR[order.payment_status] || 'text-muted-foreground bg-muted'}`}>
                                {order.payment_status}
                              </span>
                              <span className="text-xs text-muted-foreground">{order.payment_method}</span>
                            </div>

                            {/* Progress bar for active orders */}
                            {!['Cancelled'].includes(order.order_status) && (
                              <div className="mt-3 flex items-center gap-1">
                                {STATUS_STEPS.map((step, idx) => {
                                  const currentStep = STATUS_STEPS.indexOf(order.order_status);
                                  const isDone = idx <= currentStep;
                                  return (
                                    <div key={step} className="flex items-center gap-1 flex-1">
                                      <div className={`h-1.5 flex-1 rounded-full transition-all ${isDone ? 'bg-primary' : 'bg-border'}`} />
                                      {idx === STATUS_STEPS.length - 1 && (
                                        <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-primary' : 'bg-border'}`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 pt-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded View ── */}
                      {isExpanded && (
                        <div className="border-t border-border/20 p-5 space-y-5 animate-fade-in">

                          {/* All items */}
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Items in this Order</p>
                            <div className="space-y-3">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                                  {item.image_url
                                    ? <img src={item.image_url} alt={item.product_name} className="w-14 h-14 object-contain rounded-lg bg-card border border-border/20 p-1 shrink-0" />
                                    : <div className="w-14 h-14 bg-muted rounded-lg shrink-0" />
                                  }
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
                                    {item.variant_label && <p className="text-[10px] text-muted-foreground uppercase">{item.variant_label}</p>}
                                    <p className="text-xs text-muted-foreground mt-0.5">₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-bold text-foreground shrink-0">₹{Number(item.item_total).toLocaleString('en-IN')}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order summary */}
                          <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Order Summary</p>

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Product Subtotal</span>
                              <span className="font-medium text-foreground">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                            </div>

                            {Number(order.discount_amount) > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-success">−₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            {Number(order.tax_amount) > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST / Tax</span>
                                <span className="font-medium text-foreground">₹{Number(order.tax_amount).toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipping Fee</span>
                              <span className="font-medium text-foreground">{Number(order.shipping_fee) === 0 ? 'FREE' : `₹${Number(order.shipping_fee).toLocaleString('en-IN')}`}</span>
                            </div>

                            {order.is_partial_cod && Number(order.payment_summary?.cod_upfront_charge) > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">COD Processing Fee (2%)</span>
                                <span className="font-medium text-foreground">₹{Number(order.payment_summary.cod_upfront_charge).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}

                            {order.is_partial_cod && Number(order.payment_summary?.cod_upfront_gst) > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST on COD Fee (18%)</span>
                                <span className="font-medium text-foreground">₹{Number(order.payment_summary.cod_upfront_gst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}

                            {order.coupon_code && (
                              <p className="text-xs text-muted-foreground">Coupon: <span className="font-mono font-bold">{order.coupon_code}</span></p>
                            )}
                            {order.exchange_code_used && (
                              <p className="text-xs text-primary flex items-center gap-1">
                                <Gift className="w-3 h-3" /> Exchange code: <span className="font-mono font-bold">{order.exchange_code_used}</span>
                              </p>
                            )}

                            <div className="flex justify-between pt-2 border-t border-border/20">
                              <span className="font-bold text-foreground text-sm">Grand Total Order Value</span>
                              <span className="font-bold text-foreground text-sm">₹{(
                                Number(order.total_amount) +
                                (order.is_partial_cod ? Number(order.payment_summary?.paid_online ?? 0) : 0)
                              ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          {/* Payment breakdown */}
                          {order.is_partial_cod ? (
                            <div className="space-y-3">
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between text-sm items-center">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  Paid Online Now <span className="text-green-700 font-semibold">(COD Fee + GST)</span>
                                  {order.payment_summary?.deposit_confirmed && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                                </span>
                                <span className="font-bold text-green-700">₹{Number(order.payment_summary?.paid_online ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>

                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">
                                  Due on Delivery <span className="text-yellow-700 font-semibold">(Product Price)</span>
                                </span>
                                <span className="font-bold text-yellow-700">₹{Number(order.payment_summary?.payable_at_delivery ?? 0).toLocaleString('en-IN')}</span>
                              </div>

                              <p className="text-xs text-muted-foreground leading-relaxed px-1">
                                The ₹{Number(order.payment_summary?.paid_online ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} paid online covers a 2% COD processing fee plus 18% GST on that fee. Only the base product price of ₹{Number(order.payment_summary?.payable_at_delivery ?? 0).toLocaleString('en-IN')} is collected at the door.
                              </p>

                              {!order.payment_summary?.deposit_confirmed && (
                                <p className="text-xs text-yellow-700 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Online fee not yet paid. Order confirms once it's received.
                                </p>
                              )}
                            </div>
                          ) : order.payment_summary?.deposit_confirmed ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between text-sm items-center">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                Total Paid Online <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              </span>
                              <span className="font-bold text-green-700">₹{Number(order.payment_summary.paid_online).toLocaleString('en-IN')}</span>
                            </div>
                          ) : null}

                          {/* Shipping address */}
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivered To</p>
                            <p className="text-sm font-semibold text-foreground">{order.first_name} {order.last_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_address}{order.apartment ? `, ${order.apartment}` : ''}</p>
                            {order.landmark && <p className="text-xs text-muted-foreground">Near: {order.landmark}</p>}
                            <p className="text-sm text-muted-foreground">{order.city}, {order.state} — {order.zip_code}</p>
                            <p className="text-sm text-muted-foreground">📞 {order.phone}</p>
                          </div>

                          {/* Tracking */}
                          {order.tracking_link && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Tracking</p>
                              {order.tracking_note && <p className="text-sm text-foreground mb-2">{order.tracking_note}</p>}
                              <a href={order.tracking_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                                <Truck className="w-3.5 h-3.5" /> Track your package →
                              </a>
                            </div>
                          )}

                          {/* Exchange code from approved return */}
                          {order.return_requests?.map((req: any) => (
                            <div key={req.id} className={`rounded-xl p-4 border ${req.status === 'Approved' ? 'bg-success/5 border-success/20' : req.status === 'Rejected' ? 'bg-destructive/5 border-destructive/20' : 'bg-yellow-50 border-yellow-200'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${req.status === 'Approved' ? 'bg-success/20 text-success' : req.status === 'Rejected' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {req.status}
                                </span>
                                <span className="text-xs text-muted-foreground">{req.request_type} Request</span>
                              </div>
                              {req.admin_notes && <p className="text-sm text-foreground mb-3">{req.admin_notes}</p>}
                              {req.exchange_code && (
                                <div className="bg-card rounded-lg p-3 border border-border/30">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Exchange Code</p>
                                  <p className="font-mono font-bold text-2xl text-primary tracking-widest mt-1">{req.exchange_code.code}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Min order: ₹{Number(req.exchange_code.original_order_value).toLocaleString('en-IN')}
                                    {req.exchange_code.expires_at && <> · Expires {new Date(req.exchange_code.expires_at).toLocaleDateString('en-IN')}</>}
                                  </p>
                                  <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2">
                                    Shop now to use this code →
                                  </Link>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-3">
                            {/* Cancel button */}
                            {order.can_cancel && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrder === order.id}
                                className="flex items-center gap-2 text-sm font-medium text-destructive border border-destructive/30 px-4 py-2 rounded-xl hover:bg-destructive/5 transition disabled:opacity-60"
                              >
                                <XCircle className="w-4 h-4" />
                                {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                              </button>
                            )}

                            {/* Return/Exchange button */}
                            {order.can_request_return && order.return_requests?.length === 0 && (
                              <button
                                onClick={() => setReturnModal({ open: true, orderId: order.id })}
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground border border-border/30 px-4 py-2 rounded-xl hover:bg-muted transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Request Exchange / Upgrade
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border/30 hover:bg-muted transition disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border/30 hover:bg-muted transition disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {tab === 'addresses' && (
          <div className="bg-card rounded-2xl border border-border/30 p-6">
            <AddressManager />
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/30 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Request Exchange / Upgrade</h2>
              <p className="text-sm text-muted-foreground mt-1">Only for product defects. No refunds — exchange or upgrade only.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Exchange Policy</p>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1 pl-6 list-disc">
                <li>Valid only for confirmed product defects</li>
                <li>No cash refunds — exchange or upgrade only</li>
                <li>Replacement must be equal or higher value</li>
                <li>Review within 2–3 business days</li>
              </ul>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Request Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Exchange', 'Upgrade'].map(type => (
                  <button
                    key={type}
                    onClick={() => setReturnForm(f => ({ ...f, request_type: type }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${returnForm.request_type === type ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-border'}`}
                  >
                    <p className="text-sm font-bold text-foreground">{type}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{type === 'Exchange' ? 'Same value replacement' : 'Higher value upgrade'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Describe the Defect *</label>
              <textarea
                rows={4}
                value={returnForm.defect_description}
                onChange={e => setReturnForm(f => ({ ...f, defect_description: e.target.value }))}
                placeholder="Describe clearly. E.g. Screen has dead pixels on the right side, noticed after 2 days of use."
                className="w-full border border-border/30 rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Defect Video Link (Recommended)</label>
              <input
                value={returnForm.defect_video_url}
                onChange={e => setReturnForm(f => ({ ...f, defect_video_url: e.target.value }))}
                placeholder="YouTube or Google Drive link"
                className="w-full border border-border/30 rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">A video significantly speeds up the review process.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmitReturn} disabled={submittingReturn} className="flex-1 gradient-primary text-primary-foreground py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                {submittingReturn ? 'Submitting...' : 'Submit Request'}
              </button>
              <button onClick={() => setReturnModal({ open: false, orderId: null })} className="px-5 py-3 rounded-xl border border-border/30 text-sm text-muted-foreground hover:bg-muted transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}