import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, PackageCheck, Truck, MapPin, Home, CircleCheck, Search, ExternalLink, MessageCircle } from "lucide-react";
import { orderService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { whatsappLink } from "@/lib/site";

interface Scan { status: string; detail: string; location: string; time: string }
interface TrackResult {
  order_id: number;
  placed_at: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  total_amount: string;
  amount_due_on_delivery: string | number;
  delivered_at: string | null;
  city: string;
  items: { name: string; variant: string; quantity: number }[];
  waybill: string | null;
  tracking_link: string | null;
  tracking_note: string | null;
  courier: { status: string; stage: string; location: string; updated_at: string; expected_delivery: string; scans: Scan[] } | null;
}

const STEPS = [
  { key: "placed", label: "Order placed", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: Home },
];

const stepIndex = (r: TrackResult) => {
  const stage = r.courier?.stage;
  if (r.order_status === "Delivered" || stage === "delivered") return 3;
  if (stage === "out_for_delivery") return 2;
  if (r.order_status === "Shipped" || stage === "in_transit") return 1;
  return 0;
};

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";

const TrackOrderPage = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  useEffect(() => setError(""), [orderId, phone]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      setResult(await orderService.trackOrder(orderId.replace(/\D/g, ""), phone.replace(/\D/g, "")));
    } catch (err: any) {
      setError(err?.error || "Something went wrong. Please try again, or message us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const cancelled = result?.order_status === "Cancelled";
  const current = result ? stepIndex(result) : 0;
  const input = "w-full h-12 px-4 rounded-xl border border-border bg-background text-base outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10";

  return (
    <>
      <SEO title="Track Your Order | Yuva Computers" description="Track your Yuva Computers order and Delhivery shipment with your order number and phone number." canonical="/track-order" />
      <PageHero eyebrow="Order tracking" title="Where’s my order?" text="Enter your order number and the phone number you used at checkout." crumbs={[{ label: "Track order" }]} />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 space-y-4 lg:sticky lg:top-40">
          <label className="block">
            <span className="text-sm font-medium">Order number</span>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 1042" inputMode="numeric" required className={`mt-1.5 ${input}`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" inputMode="tel" required className={`mt-1.5 ${input}`} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="w-full h-12 rounded-full bg-brand-navy text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Track order
          </button>
          <p className="text-xs text-muted-foreground">
            Your order number is in the WhatsApp message and email we sent after you ordered. Logged in? See all orders in{" "}
            <a href="/profile?tab=orders" className="text-primary underline">My orders</a>.
          </p>
        </form>

        <div>
          {!result ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <Truck className="w-10 h-10 mx-auto opacity-40" />
              <p className="mt-3">Your order status and live Delhivery updates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{result.order_id} · placed {fmt(result.placed_at)}</p>
                    <h2 className="mt-1 font-display font-extrabold text-2xl md:text-3xl">
                      {cancelled ? "Order cancelled" : STEPS[current].label}
                    </h2>
                    {result.courier?.expected_delivery && current < 3 && !cancelled && (
                      <p className="mt-1 text-sm font-semibold text-brand-leaf-dark">Expected by {new Date(result.courier.expected_delivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                    )}
                  </div>
                  {result.tracking_link && (
                    <a href={result.tracking_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border text-sm font-semibold hover:bg-muted">
                      Delhivery tracking <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {!cancelled && (
                  <ol className="mt-8 grid grid-cols-4 gap-2">
                    {STEPS.map(({ key, label, icon: Icon }, i) => (
                      <li key={key} className="text-center">
                        <div className="relative flex items-center">
                          <div className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : i <= current ? "bg-brand-leaf" : "bg-muted"}`} />
                          <span className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${i <= current ? "bg-brand-leaf text-white" : "bg-muted text-muted-foreground"}`}>
                            {i < current ? <CircleCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                          </span>
                          <div className={`h-1 flex-1 rounded ${i === STEPS.length - 1 ? "invisible" : i < current ? "bg-brand-leaf" : "bg-muted"}`} />
                        </div>
                        <p className={`mt-2 text-xs sm:text-sm ${i <= current ? "font-semibold" : "text-muted-foreground"}`}>{label}</p>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/70 p-4">
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-semibold">{result.payment_method === "COD" ? "Cash on delivery" : "Paid online"} · {result.payment_status}</p>
                  </div>
                  {Number(result.amount_due_on_delivery) > 0 && result.order_status !== "Delivered" && (
                    <div className="rounded-2xl bg-muted/70 p-4">
                      <p className="text-muted-foreground">To pay on delivery</p>
                      <p className="font-semibold">₹{Number(result.amount_due_on_delivery).toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  {result.waybill && (
                    <div className="rounded-2xl bg-muted/70 p-4">
                      <p className="text-muted-foreground">Delhivery AWB</p>
                      <p className="font-semibold font-mono">{result.waybill}</p>
                    </div>
                  )}
                </div>

                <ul className="mt-6 divide-y divide-border border-t border-border">
                  {result.items.map((it, i) => (
                    <li key={i} className="py-3 flex justify-between gap-3 text-sm">
                      <span>{it.name}{it.variant && <span className="text-muted-foreground"> · {it.variant}</span>}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.courier?.scans?.length ? (
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                  <h3 className="font-display font-bold text-lg">Shipment updates</h3>
                  <ol className="mt-5 relative border-l-2 border-border ml-2 space-y-5">
                    {result.courier.scans.map((s, i) => (
                      <li key={i} className="pl-5 relative">
                        <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ${i === 0 ? "bg-brand-leaf ring-4 ring-brand-leaf/20" : "bg-muted-foreground/40"}`} />
                        <p className="font-semibold text-sm">{s.status}{s.detail && <span className="font-normal text-muted-foreground"> — {s.detail}</span>}</p>
                        <p className="text-xs text-muted-foreground">{s.location} · {fmt(s.time)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : result.tracking_note ? (
                <p className="text-sm text-muted-foreground">Latest update: {result.tracking_note}</p>
              ) : null}

              <a
                href={whatsappLink(`Hi, I have a question about my order #${result.order_id}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-leaf text-white text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" /> Questions about this order? WhatsApp us
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default TrackOrderPage;
