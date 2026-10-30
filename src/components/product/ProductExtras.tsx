import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CreditCard, Gift, MapPin, PackageCheck, Tag, Truck, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { engageService, type Offer, type PincodeResult } from "@/services/api";
import { lines, useSiteConfig } from "@/lib/siteConfig";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* ─── EMI ──────────────────────────────────────────────────────────────── */

// Typical bank card EMI rate; the exact rate is shown by Razorpay at payment.
export const EMI_RATE = 16;
export const EMI_MIN_AMOUNT = 3000;
const TENURES = [3, 6, 9, 12];

export const monthlyEmi = (amount: number, months: number, rate = EMI_RATE) => {
  const r = rate / 12 / 100;
  const f = Math.pow(1 + r, months);
  return (amount * r * f) / (f - 1);
};

export function EmiLine({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState(12);
  if (price < EMI_MIN_AMOUNT) return null;

  const emi = monthlyEmi(price, months);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
      >
        <CreditCard className="w-4 h-4 text-primary" />
        EMI from <span className="font-bold">{inr(monthlyEmi(price, 12))}/month</span>
        <span className="text-primary font-semibold underline underline-offset-2">See plans</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">EMI plans</DialogTitle>
            <DialogDescription>On {inr(price)} with credit cards, debit cards and cardless EMI at checkout.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2">
            {TENURES.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`h-11 rounded-xl border text-sm font-semibold ${
                  months === m ? "border-brand-navy bg-brand-navy text-white" : "border-border hover:border-foreground/40"
                }`}
              >
                {m} months
              </button>
            ))}
          </div>
          <dl className="rounded-2xl bg-muted/70 p-4 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Monthly EMI</dt>
            <dd className="text-right font-display font-extrabold text-xl">{inr(emi)}</dd>
            <dt className="text-muted-foreground">Total payable</dt>
            <dd className="text-right font-semibold">{inr(emi * months)}</dd>
            <dt className="text-muted-foreground">Interest ({EMI_RATE}% p.a.)</dt>
            <dd className="text-right font-semibold">{inr(emi * months - price)}</dd>
          </dl>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Indicative only. Choose <b>EMI</b> on the payment screen at checkout; your bank decides the final interest
            rate and tenures. Some banks offer no-cost EMI.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Offers ───────────────────────────────────────────────────────────── */

export function OffersList({ price }: { price: number }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    engageService.getOffers().then(setOffers).catch(() => setOffers([]));
  }, []);
  if (!offers.length) return null;

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success(`Code ${code} copied — apply it at checkout`);
  };

  return (
    <div className="rounded-2xl border border-dashed border-brand-leaf/60 bg-brand-leaf/5 p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Tag className="w-4 h-4 text-brand-leaf-dark" /> Offers for you
      </p>
      <ul className="mt-3 space-y-2.5">
        {offers.slice(0, 3).map((o) => {
          const eligible = price >= o.min_order_value;
          return (
            <li key={o.code} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold">{o.description}</p>
                <p className="text-xs text-muted-foreground">
                  {o.min_order_value > 0 && `On orders above ${inr(o.min_order_value)}. `}
                  {o.first_order_only && "First order only. "}
                  {!eligible && "Not applicable on this price."}
                </p>
              </div>
              <button
                onClick={() => copy(o.code)}
                className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-brand-leaf/60 bg-white font-mono text-xs font-bold text-brand-leaf-dark hover:bg-brand-leaf/10"
              >
                {o.code} <Copy className="w-3 h-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── What's in the box ────────────────────────────────────────────────── */

export function InTheBox() {
  const items = lines(useSiteConfig().in_the_box);
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <PackageCheck className="w-4 h-4 text-primary" /> What’s in the box
      </p>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
        {items.map((item) => {
          const free = /free/i.test(item);
          return (
            <li key={item} className="flex items-center gap-2 text-sm">
              {free ? (
                <Gift className="w-4 h-4 text-brand-leaf-dark shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-brand-leaf-dark shrink-0" />
              )}
              <span className={free ? "font-semibold" : ""}>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Delivery estimate by pincode ─────────────────────────────────────── */

const PIN_KEY = "yuvaPincode";

/** Adds working days (Sundays off). Orders after 4 PM IST dispatch the next day. */
const addWorkingDays = (days: number) => {
  const d = new Date();
  const istHour = (d.getUTCHours() + 5.5) % 24;
  let left = days + (istHour >= 16 ? 1 : 0);
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

export function DeliveryEstimate() {
  const [pin, setPin] = useState(() => {
    try {
      return localStorage.getItem(PIN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (value = pin) => {
    if (!/^[1-9]\d{5}$/.test(value)) {
      setError("Enter a valid 6-digit pincode");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await engageService.checkPincode(value);
      setResult(r);
      try {
        localStorage.setItem(PIN_KEY, value);
      } catch {
        /* ignore */
      }
    } catch (e: any) {
      setError(e?.error || "Couldn't check right now. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (/^[1-9]\d{5}$/.test(pin)) check(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-3">
        <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 text-sm">
          <p className="font-semibold">Check delivery</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
            className="mt-2 flex gap-2"
          >
            <label className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="Enter pincode"
                aria-label="Delivery pincode"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <button
              disabled={loading}
              className="h-10 px-4 rounded-xl bg-brand-navy text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "…" : "Check"}
            </button>
          </form>
          {error && <p className="mt-2 text-destructive">{error}</p>}
          {result && !result.serviceable && (
            <p className="mt-2 text-destructive">
              Sorry, courier delivery isn’t available to {result.pin} yet.{" "}
              <Link to="/stores" className="underline font-semibold">Pick up from a store</Link> or WhatsApp us.
            </p>
          )}
          {result?.serviceable && (
            <div className="mt-2 space-y-0.5">
              <p>
                Delivery by{" "}
                <span className="font-bold">
                  {addWorkingDays(result.min_days)} – {addWorkingDays(result.max_days)}
                </span>
                {result.city && <span className="text-muted-foreground"> to {result.city}</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Approx. {result.min_days}–{result.max_days} working days
                {result.cod === true && " · Cash on delivery available"}
                {result.cod === false && " · Prepaid only for this pincode"}
              </p>
            </div>
          )}
          {!result && !error && (
            <p className="mt-1.5 text-xs text-muted-foreground">Usually 1–2 days in Hyderabad, 2–4 days in Telangana & AP.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Notify me when back in stock ─────────────────────────────────────── */

export function NotifyMe({ productId, variantId, label }: { productId: number; variantId?: number; label?: string }) {
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      await engageService.createStockAlert({ product: productId, variant: variantId, phone });
      setDone(true);
    } catch (err: any) {
      toast.error(err?.error || "Couldn't save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-brand-leaf/10 p-4 text-sm flex gap-3">
        <BellRing className="w-5 h-5 text-brand-leaf-dark shrink-0" />
        <p>
          <span className="font-semibold">You’re on the list.</span> We’ll WhatsApp you on {phone} as soon as this
          {label ? ` (${label})` : ""} is back in stock.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-brand-navy/10 bg-muted/40 p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <BellRing className="w-4 h-4 text-primary" /> Sold out — get a WhatsApp when it’s back
      </p>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(-10))}
            inputMode="numeric"
            placeholder="WhatsApp number"
            aria-label="WhatsApp number"
            className="w-full h-11 pl-12 pr-3 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button disabled={busy} className="h-11 px-5 rounded-xl bg-brand-leaf text-white text-sm font-bold disabled:opacity-60">
          Notify me
        </button>
      </div>
    </form>
  );
}
