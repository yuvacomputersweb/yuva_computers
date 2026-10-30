import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Hash, MessageCircle, Phone, RefreshCw, Search, ShieldCheck, ShieldX } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { engageService } from "@/services/api";
import { whatsappLink } from "@/lib/site";

interface WarrantyItem {
  source: "online" | "store";
  store: string;
  product: string;
  variant: string;
  serial_number: string;
  order_id: number | null;
  order_status: string;
  purchased_on: string;
  delivered_on: string | null;
  warranty_period: string;
  status: "active" | "expired" | "not_started" | "cancelled";
  warranty_until: string | null;
  days_left: number | null;
  replacement_until: string | null;
  replacement_open: boolean;
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS = {
  active: { label: "Under warranty", cls: "bg-brand-leaf/15 text-brand-leaf-dark", icon: ShieldCheck },
  expired: { label: "Warranty expired", cls: "bg-destructive/10 text-destructive", icon: ShieldX },
  not_started: { label: "Starts on delivery", cls: "bg-brand-sky/15 text-sky-700", icon: CalendarCheck },
  cancelled: { label: "Order cancelled", cls: "bg-muted text-muted-foreground", icon: ShieldX },
};

const inputClass =
  "w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20";

const WarrantyPage = () => {
  const [mode, setMode] = useState<"phone" | "serial">("phone");
  const [serial, setSerial] = useState("");
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<WarrantyItem[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItems(null);
    try {
      const data = await engageService.lookupWarranty(
        mode === "serial" ? { serial: serial.trim() } : { phone: phone.trim(), ...(orderId.trim() ? { order_id: orderId.trim() } : {}) }
      );
      setItems(data.items);
    } catch (err: any) {
      setError(err?.error || "Couldn't check right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Check Laptop Warranty | Yuva Computers"
        description="Check the warranty and 15-day replacement status of a laptop bought from Yuva Computers, using your phone number or serial number."
        canonical="/warranty"
      />
      <PageHero
        eyebrow="Warranty check"
        title="Is my laptop still under warranty?"
        text="Enter the phone number you gave when you bought it — in a store or online."
        crumbs={[{ label: "Warranty check" }]}
      />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
            {(["phone", "serial"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`h-10 rounded-lg text-sm font-semibold ${mode === m ? "bg-white shadow-sm" : "text-muted-foreground"}`}
              >
                {m === "serial" ? "Serial number" : "Phone number"}
              </button>
            ))}
          </div>

          {mode === "serial" ? (
            <label className="relative block">
              <span className="sr-only">Serial number</span>
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                placeholder="Serial no. / Service tag"
                required
                className={`${inputClass} font-mono uppercase`}
              />
            </label>
          ) : (
            <>
              <label className="relative block">
                <span className="sr-only">Phone number</span>
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(-10))}
                  placeholder="Phone number given at purchase"
                  required
                  inputMode="numeric"
                  className={inputClass}
                />
              </label>
              <label className="relative block">
                <span className="sr-only">Order number (optional)</span>
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Online order number (optional)" inputMode="numeric" className={inputClass} />
              </label>
            </>
          )}
          <button disabled={loading} className="w-full h-12 rounded-full bg-brand-navy text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            <Search className="w-4 h-4" /> {loading ? "Checking…" : "Check warranty"}
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Works for laptops bought in our stores and online. Can’t find yours?{" "}
            <a href={whatsappLink("Hi, I'd like to check the warranty on my laptop.")} target="_blank" rel="noopener noreferrer" className="underline">
              WhatsApp us
            </a>.
          </p>
        </form>

        <div className="space-y-4">
          {error && <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm">{error}</div>}
          {!items && !error && (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <ShieldCheck className="mx-auto w-10 h-10 opacity-40" />
              <p className="mt-3">Warranty details will appear here.</p>
            </div>
          )}
          {items?.map((w) => {
            const s = STATUS[w.status] ?? STATUS.not_started;
            const Icon = s.icon;
            return (
              <article key={`${w.source}-${w.order_id}-${w.serial_number}-${w.product}-${w.purchased_on}`} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-xl">{w.product}</h2>
                    <p className="text-sm text-muted-foreground">
                      {[
                        w.variant,
                        w.serial_number && `Serial ${w.serial_number}`,
                        w.order_id ? `Order #${w.order_id}` : w.store ? `Bought at ${w.store}` : "Bought in store",
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-semibold ${s.cls}`}>
                    <Icon className="w-4 h-4" /> {s.label}
                  </span>
                </div>
                <dl className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">{w.source === "store" ? "Bought on" : "Delivered on"}</dt>
                    <dd className="font-semibold">{fmt(w.delivered_on)}</dd>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">Parts warranty until</dt>
                    <dd className="font-semibold">
                      {fmt(w.warranty_until)}
                      {w.status === "active" && w.days_left !== null && (
                        <span className="text-brand-leaf-dark"> · {w.days_left} days left</span>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">Testing warranty (replacement)</dt>
                    <dd className="font-semibold">
                      {w.replacement_until ? (w.replacement_open ? `Open until ${fmt(w.replacement_until)}` : "Closed") : "Starts on delivery"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  {w.replacement_open && w.order_id && (
                    <Link to="/profile" className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-navy text-white text-sm font-semibold">
                      <RefreshCw className="w-4 h-4" /> Request replacement
                    </Link>
                  )}
                  {w.status === "active" && (
                    <a
                      href={whatsappLink(`Hi, I need warranty support for ${w.product}${w.serial_number ? ` (serial ${w.serial_number})` : ""}${w.order_id ? `, order #${w.order_id}` : `, bought on ${fmt(w.purchased_on)}${w.store ? ` at ${w.store}` : ""}`}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-leaf text-white text-sm font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" /> Claim warranty on WhatsApp
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default WarrantyPage;
