import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BatteryCharging, CheckCircle, FileText, ShieldCheck, ShieldX, Truck, Wrench, XCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { storeService } from "@/services/api";
import { coverLength, lines, useSiteConfig, type WarrantyPlan } from "@/lib/siteConfig";

// Who each plan applies to (the backend picks plans with the same rules).
const APPLIES_TO: Record<string, string> = {
  standard: "Laptops priced ₹15,000 and above",
  basic: "Laptops and desktops under ₹15,000",
  graphics: "Laptops with dedicated graphics (NVIDIA / AMD graphics cards)",
  apple: "Apple MacBooks and iMacs from Yuva iStore",
  monitor: "Monitors",
};

const ListBlock = ({ title, icon: Icon, items, tone = "ok" }: { title: string; icon: any; items: string[]; tone?: "ok" | "no" | "info" }) =>
  items.length ? (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display font-bold text-xl flex items-center gap-2">
        <Icon className={`w-5 h-5 ${tone === "no" ? "text-destructive" : "text-brand-leaf-dark"}`} /> {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm leading-relaxed">
            {tone === "no" ? (
              <XCircle className="w-4 h-4 mt-0.5 text-destructive/70 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 mt-0.5 text-brand-leaf-dark shrink-0" />
            )}
            {t}
          </li>
        ))}
      </ul>
    </section>
  ) : null;

const WarrantyPolicyPage = () => {
  const c = useSiteConfig();
  const [plans, setPlans] = useState<WarrantyPlan[]>([]);
  useEffect(() => {
    storeService.getWarrantyPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  return (
    <>
      <SEO
        title="Warranty Policy | Yuva Computers"
        description="Yuva Computers and Yuva iStore warranty: 15-day testing warranty, 1-year RAM, SSD and motherboard warranty on laptops from ₹15,000, 6-month free service on Apple and graphics laptops, and transit damage cover."
        canonical="/warranty-policy"
      />
      <PageHero
        eyebrow="Warranty policy"
        title="What your warranty covers"
        text="Every device is tested, certified and sealed with a warranty sticker. Your cover depends on the product — each product page shows its plan."
        crumbs={[{ label: "Warranty policy" }]}
      />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <article key={p.code} className="rounded-3xl border border-border bg-card p-6 flex flex-col">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf-dark">{APPLIES_TO[p.code] ?? "Selected products"}</p>
              <h2 className="mt-1 font-display font-extrabold text-xl">{p.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {p.testing_days > 0 && <span className="h-7 px-3 inline-flex items-center rounded-full bg-brand-leaf/15 text-brand-leaf-dark">{p.testing_days}-day testing</span>}
                {p.parts_months > 0 && <span className="h-7 px-3 inline-flex items-center rounded-full bg-brand-sky/15 text-sky-800">{coverLength(p.parts_months)} parts</span>}
                {p.free_service && (
                  <span className="h-7 px-3 inline-flex items-center gap-1 rounded-full bg-muted"><Wrench className="w-3 h-3" /> {p.service_months ? `${p.service_months} months free service` : "Free service"}</span>
                )}
                {p.battery_hours > 0 && (
                  <span className="h-7 px-3 inline-flex items-center gap-1 rounded-full bg-muted"><BatteryCharging className="w-3 h-3" /> {p.battery_hours}+ hr battery</span>
                )}
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                {p.points.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-brand-leaf-dark shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="flex gap-3 rounded-3xl border border-brand-leaf/40 bg-brand-leaf/5 p-6">
          <Truck className="w-6 h-6 text-brand-leaf-dark shrink-0" />
          <div>
            <h2 className="font-display font-bold text-lg">Shipping assurance — on every product</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.shipping_assurance}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ListBlock title="Not covered" icon={ShieldX} items={lines(c.warranty_exclusions)} tone="no" />
          <ListBlock title="Warranty is void if" icon={AlertTriangle} items={lines(c.warranty_void_conditions)} tone="no" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ListBlock title="How to claim" icon={ShieldCheck} items={lines(c.warranty_claim_steps)} />
          <ListBlock title="Terms" icon={FileText} items={lines(c.warranty_terms)} tone="info" />
        </div>

        <p className="text-sm text-muted-foreground">
          Bought from us already? <Link to="/warranty" className="underline font-semibold text-foreground">Check your warranty</Link> with your phone number.
          See also our <Link to="/returns-refund-policy" className="underline">return & refund policy</Link>.
        </p>
      </section>
    </>
  );
};

export default WarrantyPolicyPage;
