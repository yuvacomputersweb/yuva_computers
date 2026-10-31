import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, CheckCircle2, IndianRupee, MessageCircle, RefreshCw, ShieldCheck, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { engageService } from "@/services/api";
import { whatsappLink } from "@/lib/site";
import {
  BRANDS, CONDITIONS, GENERATIONS, PROCESSORS, RAM_OPTIONS, STORAGE_OPTIONS, estimateTradeIn,
} from "@/lib/tradein";
import { trackLead } from "@/lib/track";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Chips = ({
  options, value, onChange, name,
}: { options: string[]; value: string; onChange: (v: string) => void; name: string }) => (
  <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        type="button"
        role="radio"
        aria-checked={value === o}
        key={o}
        onClick={() => onChange(o)}
        className={`min-h-10 px-4 rounded-xl border text-sm font-medium transition-colors ${
          value === o ? "border-brand-navy bg-brand-navy text-white" : "border-border bg-card hover:border-foreground/40"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <p className="text-sm font-semibold mb-2">{label}</p>
    {children}
    {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20";

const SellLaptopPage = () => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [processor, setProcessor] = useState("");
  const [generation, setGeneration] = useState("");
  const [ram, setRam] = useState("8 GB");
  const [storage, setStorage] = useState("256 GB SSD");
  const [condition, setCondition] = useState("");
  const [hasCharger, setHasCharger] = useState(true);
  const [wantsExchange, setWantsExchange] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const isApple = brand === "Apple";
  const processorOptions = PROCESSORS.filter((p) => (isApple ? p.apple : !p.apple));
  const proc = PROCESSORS.find((p) => p.label === processor);

  const estimate = useMemo(
    () => estimateTradeIn({ processor, generation, ram, storage, condition, hasCharger }),
    [processor, generation, ram, storage, condition, hasCharger]
  );

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos, ...Array.from(files)].filter((f) => f.type.startsWith("image/")).slice(0, 3);
    if (next.some((f) => f.size > 8 * 1024 * 1024)) {
      toast.error("Each photo must be under 8 MB");
      return;
    }
    setPhotos(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !processor || !condition) {
      toast.error("Choose the brand, processor and condition");
      return;
    }
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter your name and a valid 10-digit mobile number");
      return;
    }
    const form = new FormData();
    const fields: Record<string, string> = {
      name: name.trim(), phone, city, brand, model_name: model,
      processor: [processor, !isApple && generation ? generation : ""].filter(Boolean).join(", "),
      ram, storage, condition, notes,
      has_charger: String(hasCharger), wants_exchange: String(wantsExchange),
      estimate_low: String(estimate?.low ?? 0), estimate_high: String(estimate?.high ?? 0),
    };
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    photos.forEach((p, i) => form.append(`photo_${i + 1}`, p));

    setBusy(true);
    try {
      await engageService.submitTradeIn(form);
      setDone(true);
      trackLead("trade_in", estimate?.low);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg = err?.phone?.[0] || err?.error || err?.detail || "Couldn't send your request. Please try again or WhatsApp us.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const waText = `Hi Yuva Computers, I'd like to ${wantsExchange ? "exchange" : "sell"} my ${brand} ${model} (${processor}${
    generation && !isApple ? `, ${generation}` : ""
  }, ${ram}, ${storage}, ${CONDITIONS.find((c) => c.value === condition)?.label ?? ""} condition).${
    estimate ? ` Website estimate: ${inr(estimate.low)}–${inr(estimate.high)}.` : ""
  } Sharing photos here.`;

  return (
    <>
      <SEO
        title="Sell or Exchange Your Old Laptop in Hyderabad | Yuva Computers"
        description="Get an instant estimate for your old laptop or MacBook. Sell it for cash or exchange it for a certified refurbished laptop at Yuva Computers stores."
        canonical="/sell-your-laptop"
      />
      <PageHero
        eyebrow="Sell or exchange"
        title={<>Get the best price for your <span className="text-brand-leaf">old laptop</span></>}
        text="Answer a few questions for an instant estimate. Sell it for cash, or exchange it for a Yuva laptop and pay only the difference."
        crumbs={[{ label: "Sell your laptop" }]}
      />

      {done ? (
        <section className="container mx-auto px-4 md:px-6 py-14 max-w-2xl text-center">
          <CheckCircle2 className="mx-auto w-14 h-14 text-brand-leaf" />
          <h2 className="mt-4 font-display font-extrabold text-3xl">Request received!</h2>
          <p className="mt-3 text-muted-foreground">
            Our team will call or WhatsApp you on {phone} within one working day with a firm offer.
            {estimate && <> Your estimate: <b className="text-foreground">{inr(estimate.low)} – {inr(estimate.high)}</b>.</>}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand-leaf text-white font-semibold"
            >
              <MessageCircle className="w-4 h-4" /> Send more photos on WhatsApp
            </a>
            <Link to="/products" className="inline-flex items-center h-12 px-6 rounded-full border border-border font-semibold hover:bg-muted">
              Browse laptops to exchange
            </Link>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
          <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="space-y-7 rounded-3xl border border-border bg-card p-5 md:p-8">
              <Field label="1. Brand">
                <Chips name="Brand" options={BRANDS} value={brand} onChange={(b) => { setBrand(b); setProcessor(""); }} />
              </Field>

              <Field label="2. Model (optional)" hint="Printed under the laptop, e.g. Latitude 7490, EliteBook 840 G6, MacBook Air 2020.">
                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. ThinkPad T480" className={inputClass} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="3. Processor">
                  <select value={processor} onChange={(e) => setProcessor(e.target.value)} className={inputClass} disabled={!brand}>
                    <option value="">{brand ? "Select processor" : "Choose a brand first"}</option>
                    {processorOptions.map((p) => <option key={p.label}>{p.label}</option>)}
                  </select>
                </Field>
                {!isApple && (
                  <Field label="Generation" hint="Find it in Settings → System → About.">
                    <select value={generation} onChange={(e) => setGeneration(e.target.value)} className={inputClass}>
                      <option value="">Select generation</option>
                      {GENERATIONS.map((g) => <option key={g.label}>{g.label}</option>)}
                    </select>
                  </Field>
                )}
              </div>

              <Field label="4. RAM">
                <Chips name="RAM" options={RAM_OPTIONS.map((r) => r.label)} value={ram} onChange={setRam} />
              </Field>
              <Field label="5. Storage">
                <Chips name="Storage" options={STORAGE_OPTIONS.map((s) => s.label)} value={storage} onChange={setStorage} />
              </Field>

              <Field label="6. Condition">
                <div className="grid sm:grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setCondition(c.value)}
                      aria-pressed={condition === c.value}
                      className={`text-left rounded-xl border p-3 transition-colors ${
                        condition === c.value ? "border-brand-navy ring-2 ring-brand-navy/10" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <p className="font-semibold text-sm">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.hint}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer">
                  <input type="checkbox" checked={hasCharger} onChange={(e) => setHasCharger(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">Original charger included</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer">
                  <input type="checkbox" checked={wantsExchange} onChange={(e) => setWantsExchange(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">I want to exchange for a Yuva laptop</span>
                </label>
              </div>

              <Field label="7. Photos (optional, up to 3)" hint="Front, back and the screen switched on help us give a firm price.">
                <div className="flex flex-wrap gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted">
                      <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/60 text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground cursor-pointer hover:border-foreground/40">
                      <span className="flex flex-col items-center gap-1 text-xs">
                        <Camera className="w-5 h-5" /> Add photo
                      </span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
                    </label>
                  )}
                </div>
              </Field>

              <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                <Field label="Your name">
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
                </Field>
                <Field label="Mobile (WhatsApp)">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(-10))}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit number"
                    className={inputClass}
                  />
                </Field>
                <Field label="City">
                  <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={inputClass} />
                </Field>
              </div>
              <Field label="Anything else? (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Battery backup, any repairs, box/bill available…"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
            </div>

            {/* Estimate */}
            <aside className="lg:sticky lg:top-40 space-y-4">
              <div className="rounded-3xl bg-brand-navy text-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf">Instant estimate</p>
                {estimate ? (
                  <>
                    <p className="mt-3 font-display font-extrabold text-4xl tracking-tight">
                      {inr(estimate.low)} – {inr(estimate.high)}
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {wantsExchange
                        ? "Adjusted against your new Yuva laptop — you pay only the difference."
                        : "Paid by UPI, bank transfer or cash after inspection."}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-white/70 text-sm">Choose brand, processor and condition to see your price.</p>
                )}
                <button
                  disabled={busy}
                  className="mt-6 w-full h-12 rounded-full bg-brand-leaf text-white font-bold disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Get my firm offer"}
                </button>
                <p className="mt-3 text-[11px] text-white/50 leading-relaxed">
                  Final price is confirmed after a quick check at our store or at pickup. Estimates depend on model,
                  battery health and market prices.
                </p>
              </div>
              <ul className="rounded-3xl border border-border p-5 space-y-3 text-sm">
                <li className="flex gap-3"><IndianRupee className="w-5 h-5 text-primary shrink-0" /> Paid by UPI, bank transfer or cash after a quick check</li>
                <li className="flex gap-3"><RefreshCw className="w-5 h-5 text-primary shrink-0" /> Exchange towards any laptop in our stores</li>
                <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-primary shrink-0" /> Your data is wiped securely before resale</li>
                <li className="flex gap-3"><Wallet className="w-5 h-5 text-primary shrink-0" /> Working or not — tell us about it</li>
              </ul>
            </aside>
          </form>
        </section>
      )}
    </>
  );
};

export default SellLaptopPage;
