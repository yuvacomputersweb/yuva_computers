// CheckoutPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2, Tag, X, ChevronRight, ShieldCheck,
  Truck, Gift, CheckCircle, CreditCard, Wallet, Info,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { orderService, storeService } from "@/services/api";
import { toast } from "sonner";
import AddressManager from "@/components/profile/AddressManager";
import { SEO } from "@/components/SEO";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Address {
  id?: number | string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
}

interface SiteConfig {
  free_shipping_threshold?: number;
  shipping_fee?: number;
  cod_surcharge_percentage?: number;
  tax_percentage?: number;
}

interface ApiError {
  error?: string;
  message?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutResponse {
  order_id: number;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key: string;
  payment_method: string;
  // COD-specific fields from backend
  product_total?: number;
  cod_upfront_charge?: number;
  cod_upfront_gst?: number;
  advance_amount?: number;
  collectible_cod_amount?: number;
}

interface VerifyResponse {
  message: string;
  payment_status: string;
  advance_paid?: number;
  amount_due_on_delivery?: number;
  total_amount?: number;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// ─── COD_GST fixed rate (mirrors backend COD_SERVICE_GST_PCT = 18) ──────────
const COD_GST_PCT = 18;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [checkoutError, setCheckoutError]   = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod]   = useState<"Online" | "COD">("Online");

  // Coupon
  const [couponCode, setCouponCode]         = useState("");
  const [couponApplied, setCouponApplied]   = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading]   = useState(false);

  // Exchange
  const [exchangeCode, setExchangeCode]     = useState("");
  const [exchangeApplied, setExchangeApplied] = useState<{ code: string; minValue: number } | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const [saveAsDefault, setSaveAsDefault]   = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [siteConfig, setSiteConfig]         = useState<SiteConfig | null>(null);

  // Financial state
  const [subtotal, setSubtotal]             = useState(0);
  const [discount, setDiscount]             = useState(0);
  const [tax, setTax]                       = useState(0);
  const [shipping, setShipping]             = useState(0);
  const [total, setTotal]                   = useState(0);

  // COD service charge breakdown (separate from product price)
  const [codUpfrontCharge, setCodUpfrontCharge] = useState(0);  // 2% of subtotal
  const [codUpfrontGst, setCodUpfrontGst]       = useState(0);  // 18% of charge
  const [advanceAmount, setAdvanceAmount]       = useState(0);  // charge + gst (paid now)
  // collectibleCod = total (product price, paid at delivery — always equals `total`)

  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { state: { from: "/checkout" } });
    storeService.getSiteConfig().then(setSiteConfig).catch(() => {});
  }, [isLoggedIn, navigate]);

  // ── Fee calculations ─────────────────────────────────────────────────────
  useEffect(() => {
    const subtotalNum      = totalPrice;
    const couponDiscount   = couponApplied?.discount ?? 0;
    const exchangeDiscount = exchangeApplied
      ? Math.min(exchangeApplied.minValue, subtotalNum)
      : 0;
    const totalDiscount    = couponDiscount + exchangeDiscount;
    const taxable          = Math.max(0, subtotalNum - totalDiscount);
    const taxNum           = (taxable * Number(siteConfig?.tax_percentage ?? 0)) / 100;

    const freeThreshold    = Number(siteConfig?.free_shipping_threshold ?? 0);
    const shippingFlat     = Number(siteConfig?.shipping_fee ?? 0);
    const shippingNum      = freeThreshold > 0 && subtotalNum >= freeThreshold ? 0 : shippingFlat;

    // total = product cost (no COD charge added here)
    const totalNum = taxable + taxNum + shippingNum;

    // COD service charge — separate from product price
    // Mirrors backend logic exactly:
    //   cod_upfront_charge = 2% × subtotal (gross product value)
    //   cod_upfront_gst    = 18% × cod_upfront_charge
    //   advance_amount     = charge + gst  (Razorpay charges this now)
    //   product at delivery = totalNum     (unchanged)
    const codChargePct  = Number(siteConfig?.cod_surcharge_percentage ?? 2);
    const chargeNum     = paymentMethod === "COD"
      ? parseFloat(((subtotalNum * codChargePct) / 100).toFixed(2))
      : 0;
    const gstNum        = paymentMethod === "COD"
      ? parseFloat(((chargeNum * COD_GST_PCT) / 100).toFixed(2))
      : 0;
    const advanceNum    = parseFloat((chargeNum + gstNum).toFixed(2));

    setSubtotal(subtotalNum);
    setDiscount(totalDiscount);
    setTax(taxNum);
    setShipping(shippingNum);
    setTotal(totalNum);
    setCodUpfrontCharge(chargeNum);
    setCodUpfrontGst(gstNum);
    setAdvanceAmount(advanceNum);
  }, [totalPrice, siteConfig, paymentMethod, couponApplied, exchangeApplied]);

  // ── Coupon ───────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (couponApplied) { setCouponApplied(null); setCouponCode(""); return; }
    setCouponLoading(true);
    try {
      const res = await storeService.validateCoupon(couponCode.trim(), totalPrice);
      setCouponApplied({ code: couponCode.trim().toUpperCase(), discount: res.discount });
      toast.success(res.message ?? "Coupon applied!");
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e?.error ?? "Invalid coupon code");
    } finally { setCouponLoading(false); }
  };

  // ── Exchange code ────────────────────────────────────────────────────────
  const handleApplyExchangeCode = async () => {
    if (!exchangeCode.trim()) return;
    if (exchangeApplied) { setExchangeApplied(null); setExchangeCode(""); return; }
    setExchangeLoading(true);
    try {
      const res = await orderService.validateExchangeCode(exchangeCode.trim());
      if (res.valid) {
        if (totalPrice < res.original_order_value) {
          toast.error(
            `New order must be at least ₹${res.original_order_value.toLocaleString("en-IN")} to use this code`
          );
          return;
        }
        setExchangeApplied({
          code:     exchangeCode.trim().toUpperCase(),
          minValue: res.original_order_value,
        });
        toast.success(
          `Exchange code applied! ₹${res.original_order_value.toLocaleString("en-IN")} credit applied.`
        );
      } else {
        toast.error(res.error ?? "Invalid exchange code");
      }
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e?.error ?? "Invalid exchange code");
    } finally { setExchangeLoading(false); }
  };

  // ── Place Order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    if (!selectedAddress) {
      setCheckoutError("Please add or select a shipping address to continue");
      return;
    }
    if (!acceptedPolicy) {
      setCheckoutError("Please accept return & exchange policy");
      return;
    }
    if (items.length === 0) {
      setCheckoutError("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.id.toString().split("-")[0],
          variant_id: item.variantId ?? null,
          price:      item.price,
          quantity:   item.quantity,
        })),
        payment_method:         paymentMethod,
        coupon_code:            couponApplied?.code ?? "",
        exchange_code:          exchangeApplied?.code ?? "",
        save_as_default:        saveAsDefault,
        accepted_return_policy: acceptedPolicy,
        first_name:             selectedAddress.first_name,
        last_name:              selectedAddress.last_name,
        phone:                  selectedAddress.phone,
        address:                selectedAddress.address,
        apartment:              selectedAddress.apartment ?? "",
        landmark:               selectedAddress.landmark ?? "",
        city:                   selectedAddress.city,
        state:                  selectedAddress.state,
        zip_code:               selectedAddress.zip_code,
        country:                selectedAddress.country ?? "India",
      };

      const data = await orderService.createOrder(orderPayload) as CheckoutResponse;
      const isCOD = paymentMethod === "COD";
      const envKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_RAZORPAY_KEY_ID;

      const razorpayOptions: Record<string, unknown> = {
        key:         data.key ?? envKey,
        amount:      data.amount,  // paise — backend sends correct amount for each case
        currency:    "INR",
        name:        "Yuva Computers",
        description: isCOD
          ? `COD Service Charge (₹${codUpfrontCharge.toFixed(2)}) + GST (₹${codUpfrontGst.toFixed(2)})`
          : "Order Payment",
        order_id: data.razorpay_order_id,
        prefill: {
          name:    `${selectedAddress.first_name} ${selectedAddress.last_name}`.trim(),
          email:   user?.email ?? "",
          contact: selectedAddress.phone,
        },
        theme: { color: "#2563eb" },

        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await orderService.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }) as VerifyResponse;

            clearCart();

            if (isCOD) {
              const paidNow = verifyRes.advance_paid ?? advanceAmount;
              const atDoor  = verifyRes.amount_due_on_delivery ?? total;
              toast.success(
                `Order confirmed! ₹${paidNow.toFixed(2)} service charge paid. ` +
                `Pay ₹${atDoor.toFixed(2)} to the delivery agent.`,
                { duration: 7000 }
              );
            } else {
              toast.success("Payment successful! Order confirmed.");
            }

            navigate("/profile?tab=orders");
          } catch (err: unknown) {
            const e = err as ApiError;
            toast.error(e?.error ?? "Payment verification failed. Please contact support.");
          } finally {
            setIsPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast.error(
              isCOD
                ? "Payment cancelled. Please complete the service charge payment to confirm your COD order."
                : "Payment cancelled."
            );
          },
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e?.error ?? "Order failed. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  // ── Empty cart guard ─────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">Your cart is empty</h1>
        <Link to="/products" className="text-primary hover:underline font-semibold">
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  const isCOD = paymentMethod === "COD";

  return (
    <>
    import { SEO } from "@/components/SEO";
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Address */}
            <div className="bg-card rounded-2xl border border-border/30 p-6">
              <AddressManager
                onSelect={(addr) => setSelectedAddress(addr as unknown as Address)}
                selectedId={
                  selectedAddress?.id !== undefined ? Number(selectedAddress.id) : undefined
                }
              />
              {selectedAddress && (
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Save as my default address
                  </span>
                </label>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-border/30 p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["Online", "COD"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === method
                        ? "border-primary bg-primary/5"
                        : "border-border/30 hover:border-border"
                    }`}
                  >
                    <p className="font-bold text-sm text-foreground">
                      {method === "Online" ? "💳 Online Payment" : "💵 Cash on Delivery"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {method === "Online"
                        ? "UPI, Cards, Net Banking via Razorpay"
                        : "Pay small service charge now — product price at delivery"}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-success text-sm pt-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Secure & encrypted checkout</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border/30 p-6 space-y-5 lg:sticky lg:top-28">
              <h3 className="font-display font-bold text-foreground">Order Summary</h3>

              {/* Cart items */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-muted/30 border border-border/20 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {item.variant}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground whitespace-nowrap">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!couponApplied}
                    placeholder="SAVE20"
                    className="flex-1 border border-border/30 rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 font-mono uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 ${
                      couponApplied
                        ? "bg-destructive/10 text-destructive"
                        : "gradient-primary text-primary-foreground"
                    }`}
                  >
                    {couponLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : couponApplied ? (
                      <X className="w-4 h-4" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {couponApplied && (
                  <div className="flex items-center gap-2 p-2.5 bg-success/10 border border-success/20 rounded-lg">
                    <Tag className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-bold text-success">
                      {couponApplied.code} — Save ₹{couponApplied.discount.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Exchange Code */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-primary" /> Exchange Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={exchangeCode}
                    onChange={(e) => setExchangeCode(e.target.value.toUpperCase())}
                    disabled={!!exchangeApplied}
                    placeholder="YC-XXXXXXXX"
                    className="flex-1 border border-border/30 rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 font-mono uppercase"
                  />
                  <button
                    onClick={handleApplyExchangeCode}
                    disabled={exchangeLoading || !exchangeCode.trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 ${
                      exchangeApplied
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary border border-primary/30"
                    }`}
                  >
                    {exchangeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : exchangeApplied ? (
                      <X className="w-4 h-4" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {exchangeApplied && (
                  <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">
                      {exchangeApplied.code} — ₹
                      {exchangeApplied.minValue.toLocaleString("en-IN")} credit applied
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-border/20 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discounts & Credits</span>
                    <span className="font-medium">−₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Shipping
                  </span>
                  <span className={`font-medium ${shipping === 0 ? "text-success" : ""}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product Tax</span>
                    <span className="font-medium">₹{tax.toFixed(0)}</span>
                  </div>
                )}

                {/* Product total — always shows true product price */}
                <div className="flex justify-between items-center pt-3 border-t border-border/20">
                  <span className="font-display font-bold text-foreground">
                    {isCOD ? "Product Total" : "Total"}
                  </span>
                  <span className="font-display font-extrabold text-xl text-foreground">
                    ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* COD service charge breakdown — only when COD selected */}
                {isCOD && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                        COD Service Charge Breakdown
                      </p>
                    </div>

                    {/* Charge rows */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          COD Upfront Charge ({siteConfig?.cod_surcharge_percentage ?? 2}% of subtotal)
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₹{codUpfrontCharge.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">GST on service charge (18%)</span>
                        <span className="font-semibold text-slate-800">
                          ₹{codUpfrontGst.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-blue-200 pt-3 space-y-2">
                      {/* Pay now (service charge) */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-blue-800">
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay now online
                        </span>
                        <span className="font-extrabold text-blue-800 text-base">
                          ₹{advanceAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Pay at delivery (product price) */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                          <Wallet className="w-3.5 h-3.5" />
                          Pay at delivery (product)
                        </span>
                        <span className="font-extrabold text-amber-700 text-base">
                          ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-blue-600 leading-relaxed border-t border-blue-200 pt-2">
                      The COD service charge is a non-refundable processing fee.
                      Your product price of ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })} remains unchanged
                      and is paid directly to the delivery agent.
                    </p>
                  </div>
                )}
              </div>

              {/* Return Policy */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/20">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Return & Exchange Policy
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    15-day exchange/upgrade for product defects only
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    No cash refunds — exchange or upgrade only
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    Replacement must be equal or higher value
                  </li>
                </ul>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    className="mt-0.5 accent-primary"
                  />
                  <span className="text-xs text-foreground font-medium leading-relaxed">
                    I accept the return & exchange policy
                  </span>
                </label>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {checkoutError}
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-display font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Processing...
                  </>
                ) : isCOD ? (
                  <>
                    Pay ₹{advanceAmount.toFixed(2)} & Confirm Order
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Pay ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}