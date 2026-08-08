// src/components/profile/OrderHistory.tsx
import { useEffect, useState } from "react";
import { orderService } from "@/services/api";
import {
  Package, ChevronDown, ChevronUp, Truck,
  MapPin, CreditCard, Wallet, Clock, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, Receipt, Percent,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentType = 'COD' | 'Online';

interface PaymentSummary {
  type: PaymentType;
  label: string;
  product_total: number;
  cod_upfront_charge: number;
  cod_upfront_gst: number;
  paid_online: number;
  paid_online_label: string;
  payable_at_delivery: number;
  payable_at_delivery_label: string;
  deposit_confirmed: boolean;
  refund_note: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  variant_label: string;
  price: number;
  quantity: number;
  image_url: string;
  item_total: number;
}

interface Order {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  state: string;
  subtotal: string;
  discount_amount: string;
  shipping_fee: string;
  tax_amount: string;
  total_amount: string;
  advance_amount: string;
  collectible_cod_amount: string;
  is_partial_cod: boolean;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_link: string | null;
  tracking_note: string | null;
  delhivery_waybill: string | null;
  created_at: string;
  items: OrderItem[];
  can_cancel: boolean;
  payment_summary: PaymentSummary;
}

interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

interface ApiError {
  error?: string;
  message?: string;
}

interface StatusConfigItem {
  color: string;
  bg: string;
  icon?: React.ReactNode;
  label: string;
}

interface BreakdownRow {
  label: string;
  value: number;
  isNegative?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inr = (n: number): string =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (v: string | number): number => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  Pending:    { color: '#92400e', bg: '#fef9c3', icon: <Clock className="w-3 h-3" />,         label: 'Pending' },
  Processing: { color: '#1e40af', bg: '#dbeafe', icon: <RefreshCw className="w-3 h-3" />,     label: 'Processing' },
  Confirmed:  { color: '#065f46', bg: '#d1fae5', icon: <CheckCircle2 className="w-3 h-3" />,  label: 'Confirmed' },
  Shipped:    { color: '#1e3a5f', bg: '#e0f2fe', icon: <Truck className="w-3 h-3" />,         label: 'Shipped' },
  Delivered:  { color: '#14532d', bg: '#bbf7d0', icon: <CheckCircle2 className="w-3 h-3" />,  label: 'Delivered' },
  Cancelled:  { color: '#7f1d1d', bg: '#fee2e2', icon: <XCircle className="w-3 h-3" />,       label: 'Cancelled' },
};

const PAYMENT_STATUS_CONFIG: Record<string, StatusConfigItem> = {
  Pending:         { color: '#92400e', bg: '#fef9c3', label: 'Payment Pending' },
  'Deposit Paid':  { color: '#1e40af', bg: '#dbeafe', label: '2% Deposit Paid' },
  Paid:            { color: '#14532d', bg: '#bbf7d0', label: 'Paid' },
  Failed:          { color: '#7f1d1d', bg: '#fee2e2', label: 'Payment Failed' },
  Refunded:        { color: '#374151', bg: '#f3f4f6', label: 'Refunded' },
  'Refund Pending': { color: '#92400e', bg: '#fef9c3', label: 'Refund Pending' },
};

function StatusBadge({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) {
  const config: StatusConfigItem = type === 'order'
    ? STATUS_CONFIG[status]  || { color: '#374151', bg: '#f3f4f6', label: status }
    : PAYMENT_STATUS_CONFIG[status] || { color: '#374151', bg: '#f3f4f6', label: status };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: config.bg, color: config.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      {type === 'order' && config.icon}
      {config.label}
    </span>
  );
}

// ─── Charge Breakdown Card ────────────────────────────────────────────────────

function ChargeBreakdown({ order }: { order: Order }) {
  const summary = order.payment_summary;
  const isCod   = order.is_partial_cod && summary.type === 'COD';

  const subtotal = num(order.subtotal) > 0
    ? num(order.subtotal)
    : order.items.reduce((sum, item) => sum + num(item.item_total), 0);
  const discount = num(order.discount_amount);
  const tax      = num(order.tax_amount);
  const shipping = num(order.shipping_fee);
  const total    = num(order.total_amount);

  const rows: BreakdownRow[] = [{ label: 'Item Subtotal', value: subtotal }];
  if (discount > 0) rows.push({ label: 'Discount', value: discount, isNegative: true });
  if (tax > 0)      rows.push({ label: 'GST / Tax', value: tax });
  if (shipping > 0) rows.push({ label: 'Shipping Fee', value: shipping });
  if (isCod) {
    rows.push({ label: 'COD Surcharge (2%)', value: summary.cod_upfront_charge });
    if (summary.cod_upfront_gst > 0) {
      rows.push({ label: 'GST on COD Surcharge', value: summary.cod_upfront_gst });
    }
  }

  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '14px 16px', marginTop: 12,
    }}>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Receipt className="w-3.5 h-3.5" />
        Charge Breakdown
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#475569' }}>{row.label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
              {row.isNegative ? '−' : ''}₹{inr(row.value)}
            </span>
          </div>
        ))}

        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{inr(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Split Card ───────────────────────────────────────────────────────

function PaymentSplit({ order }: { order: Order }) {
  const summary = order.payment_summary;
  const isCod   = order.is_partial_cod && summary.type === 'COD';

  if (isCod) {
    return (
      <div style={{
        background: '#fff7ed', border: '1px solid #fed7aa',
        borderRadius: 10, padding: '14px 16px', marginTop: 12,
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9a3412', margin: '0 0 10px' }}>
          💳 Payment Split
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 2% Online Deposit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '0.82rem', color: '#374151' }}>
                2% Online Deposit <em style={{ color: '#16a34a', fontStyle: 'normal', fontWeight: 700 }}>(Paid Online)</em>
              </span>
              {summary.deposit_confirmed && (
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
              )}
            </div>
            <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>
              ₹{inr(summary.paid_online)}
            </span>
          </div>

          {/* Remaining balance due on delivery */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wallet className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
              <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                Remaining Balance <strong>Due on Delivery</strong>
              </span>
            </div>
            <span style={{ fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>
              ₹{inr(summary.payable_at_delivery)}
            </span>
          </div>
        </div>

        {!summary.deposit_confirmed && (
          <div style={{
            marginTop: 10, background: '#fef9c3', border: '1px solid #fde68a',
            borderRadius: 6, padding: '8px 12px', fontSize: '0.78rem', color: '#92400e',
          }}>
            <AlertCircle className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 4 }} />
            2% advance not yet paid. Your order will be confirmed once the deposit is received.
          </div>
        )}
      </div>
    );
  }

  // Online payment
  return (
    <div style={{
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      borderRadius: 10, padding: '14px 16px', marginTop: 12,
    }}>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', margin: '0 0 10px' }}>
        💳 Payment
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CreditCard className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
          <span style={{ fontSize: '0.82rem', color: '#374151' }}>
            Total Paid Online
          </span>
          {summary.deposit_confirmed && (
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
          )}
        </div>
        <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>
          ₹{inr(summary.paid_online)}
        </span>
      </div>
    </div>
  );
}

// ─── COD Surcharge Note ───────────────────────────────────────────────────────

function CodSurchargeNote({ order }: { order: Order }) {
  const summary = order.payment_summary;
  const isCod   = order.is_partial_cod && summary.type === 'COD';
  if (!isCod || summary.cod_upfront_charge <= 0) return null;

  return (
    <div style={{
      marginTop: 10, background: '#fef9c3', border: '1px solid #fde68a',
      borderRadius: 6, padding: '8px 12px', fontSize: '0.78rem', color: '#92400e',
      display: 'flex', alignItems: 'flex-start', gap: 6,
    }}>
      <Percent className="w-3.5 h-3.5" style={{ flexShrink: 0, marginTop: 1 }} />
      <span>
        A 2% COD surcharge of ₹{inr(summary.cod_upfront_charge)} (plus GST) is charged online and is
        non-refundable. It is not part of the order total above.
      </span>
    </div>
  );
}

// ─── Single Order Card ────────────────────────────────────────────────────────

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id);
      onCancel(order.id);
    } catch (err: unknown) {
      const error = err as ApiError;
      alert(error?.error || 'Could not cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 12,
      background: '#fff', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: expanded ? '#f8fafc' : '#fff',
          borderBottom: expanded ? '1px solid #f3f4f6' : 'none',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <Package className="w-4 h-4" style={{ color: '#6b7280' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Order #{order.id}</span>
            <StatusBadge status={order.order_status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.82rem', color: '#6b7280' }}>
            <span>📅 {date}</span>
            <span>
              <MapPin className="w-3 h-3" style={{ display: 'inline' }} />
              {' '}{order.city}, {order.state}
            </span>
            <span style={{ fontWeight: 700, color: '#111' }}>
              ₹{inr(num(order.total_amount))}
            </span>
            {order.is_partial_cod && (
              <span style={{
                background: '#e0f2fe', color: '#0369a1',
                padding: '1px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
              }}>
                COD — ₹{inr(num(order.collectible_cod_amount))} on delivery
              </span>
            )}
          </div>
        </div>

        <div style={{ marginLeft: 8, color: '#9ca3af' }}>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div style={{ padding: '16px' }}>

          {/* Charge breakdown */}
          <ChargeBreakdown order={order} />

          {/* Payment split */}
          <PaymentSplit order={order} />

          {/* COD surcharge note */}
          <CodSurchargeNote order={order} />

          {/* Items */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px', background: '#f9fafb', borderRadius: 8,
              }}>
                {item.image_url && (
                  <img
                    src={item.image_url} alt={item.product_name}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: '0 0 2px' }}>
                    {item.product_name}
                  </p>
                  {item.variant_label && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 2px' }}>
                      {item.variant_label}
                    </p>
                  )}
                  <p style={{ fontSize: '0.82rem', color: '#374151', margin: 0 }}>
                    ₹{inr(num(item.price))} × {item.quantity}
                    {' = '}
                    <strong>₹{inr(num(item.item_total))}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tracking */}
          {(order.delhivery_waybill || order.tracking_link || order.tracking_note) && (
            <div style={{
              marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 8, padding: '12px 14px',
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#166534', margin: '0 0 6px' }}>
                🚚 Tracking Info
              </p>
              {order.delhivery_waybill && (
                <p style={{ fontSize: '0.82rem', color: '#374151', margin: '0 0 4px' }}>
                  Waybill: <strong>{order.delhivery_waybill}</strong>
                </p>
              )}
              {order.tracking_link && (
                <a
                  href={order.tracking_link} target="_blank" rel="noreferrer"
                  style={{ fontSize: '0.82rem', color: '#2563eb', display: 'block', marginBottom: 4 }}
                >
                  Track your shipment →
                </a>
              )}
              {order.tracking_note && (
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>{order.tracking_note}</p>
              )}
            </div>
          )}

          {/* Cancel button */}
          {order.can_cancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                marginTop: 14, padding: '8px 18px',
                background: cancelling ? '#f3f4f6' : '#fee2e2',
                color: cancelling ? '#9ca3af' : '#b91c1c',
                border: '1px solid #fca5a5', borderRadius: 8,
                fontWeight: 700, fontSize: '0.84rem', cursor: cancelling ? 'not-allowed' : 'pointer',
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderHistory() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = async (p: number) => {
    setLoading(true);
    try {
      const data: OrdersResponse | Order[] = await orderService.getUserOrders(p);
      const results: Order[] = Array.isArray(data) ? data : data.results;
      if (p === 1) {
        setOrders(results);
      } else {
        setOrders(prev => [...prev, ...results]);
      }
      setHasMore(!Array.isArray(data) && Boolean(data.next));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(1); }, []);

  const handleCancel = (orderId: number) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId
        ? { ...o, order_status: 'Cancelled', can_cancel: false }
        : o
      )
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
        Loading orders...
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <Package className="w-10 h-10" style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontWeight: 600 }}>No orders yet</p>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
        Order History
      </h3>

      {orders.map(order => (
        <OrderCard key={order.id} order={order} onCancel={handleCancel} />
      ))}

      {hasMore && (
        <button
          onClick={() => { const next = page + 1; setPage(next); fetchOrders(next); }}
          disabled={loading}
          style={{
            padding: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb',
            borderRadius: 8, fontWeight: 600, fontSize: '0.88rem',
            cursor: loading ? 'not-allowed' : 'pointer', color: '#374151',
          }}
        >
          {loading ? 'Loading...' : 'Load more orders'}
        </button>
      )}
    </div>
  );
}
