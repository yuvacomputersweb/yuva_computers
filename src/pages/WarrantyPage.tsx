import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Hash, MessageCircle, Phone, RefreshCw, Search, ShieldCheck, ShieldX } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { engageService } from "@/services/api";
import { whatsappLink } from "@/lib/site";

interface WarrantyItem {
  product: string;
  variant: string;
  serial_number: string;
  order_id: number;
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
  const [mode, setMode] = useState<"serial" | "order">("serial");
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
        mode === "serial" ? { serial: serial.trim() } : { order_id: orderId.trim(), phone: phone.trim() }
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
        description="Check the warranty and 15-day replacement status of a laptop bought from Yuva Computers, using its serial number or your order number."
        canonical="/warranty"
      />
      <PageHero
        eyebrow="Warranty check"
        title="Is my laptop still under warranty?"
        text="Use the serial number on the sticker under your laptop, or your order number and phone."
        crumbs={[{ label: "Warranty check" }]}
      />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
            {(["serial", "order"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`h-10 rounded-lg text-sm font-semibold ${mode === m ? "bg-white shadow-sm" : "text-muted-foreground"}`}
              >
                {m === "serial" ? "Serial number" : "Order number"}
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
                <span className="sr-only">Order number</span>
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order number" required inputMode="numeric" className={inputClass} />
              </label>
              <label className="relative block">
                <span className="sr-only">Phone number</span>
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(-10))}
                  placeholder="Phone used at checkout"
                  required
                  inputMode="numeric"
                  className={inputClass}
                />
              </label>
            </>
          )}
          <button disabled={loading} className="w-full h-12 rounded-full bg-brand-navy text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            <Search className="w-4 h-4" /> {loading ? "Checking…" : "Check warranty"}
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bought in a store? Your serial is on the invoice and on the sticker under the laptop. Can’t find it?{" "}
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
              <article key={`${w.order_id}-${w.serial_number}-${w.product}`} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-xl">{w.product}</h2>
                    <p className="text-sm text-muted-foreground">
                      {[w.variant, w.serial_number && `Serial ${w.serial_number}`, `Order #${w.order_id}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-semibold ${s.cls}`}>
                    <Icon className="w-4 h-4" /> {s.label}
                  </span>
                </div>
                <dl className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">Delivered on</dt>
                    <dd className="font-semibold">{fmt(w.delivered_on)}</dd>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">{w.warranty_period || "Warranty"} until</dt>
                    <dd className="font-semibold">
                      {fmt(w.warranty_until)}
                      {w.status === "active" && w.days_left !== null && (
                        <span className="text-brand-leaf-dark"> · {w.days_left} days left</span>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <dt className="text-muted-foreground">15-day replacement</dt>
                    <dd className="font-semibold">
                      {w.replacement_until ? (w.replacement_open ? `Open until ${fmt(w.replacement_until)}` : "Closed") : "Starts on delivery"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  {w.replacement_open && (
                    <Link to="/profile" className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-navy text-white text-sm font-semibold">
                      <RefreshCw className="w-4 h-4" /> Request replacement
                    </Link>
                  )}
                  {w.status === "active" && (
                    <a
                      href={whatsappLink(`Hi, I need warranty support for ${w.product}${w.serial_number ? ` (serial ${w.serial_number})` : ""}, order #${w.order_id}.`)}
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
