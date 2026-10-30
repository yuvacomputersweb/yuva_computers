import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck, CheckCircle, Cpu, FileText, HardDrive, Monitor, RefreshCw, Search, ShieldCheck,
  Sparkles, Wifi, Wrench, Gauge, Battery, MessageCircle, Truck,
} from "lucide-react";
import { isPlaceholderSpec } from "@/lib/specs";
import { coverLength, lines, useSiteConfig, type WarrantyPlan } from "@/lib/siteConfig";
import { whatsappLink } from "@/lib/site";

interface ProductTabsProps {
  product: any;
  slug: string;
  variant?: any;
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "specs", label: "Specifications" },
  { key: "refurbishment", label: "Refurbishment" },
  { key: "warranty", label: "Warranty" },
] as const;

const PROCESS = [
  { icon: Search, title: "Inspect", text: "Every part checked one by one" },
  { icon: Wrench, title: "Repair", text: "Faulty parts replaced in our lab" },
  { icon: HardDrive, title: "Reinstall", text: "Fresh, genuine OS and drivers" },
  { icon: Gauge, title: "Stress-test", text: "Performance, heat and battery" },
  { icon: BadgeCheck, title: "Certify", text: "Cleaned and warranty-sealed" },
];

// Warranty lines live in the store-wide policy; keep them out of per-product highlights.
const isWarrantyLine = (h: string) => /warrant|guarantee|lifetime service/i.test(h);

export default function ProductTabs({ product, variant }: ProductTabsProps) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("overview");
  const c = useSiteConfig();

  const spec = (key: string) => variant?.[key] || product[key];
  const highlights: string[] = (product.highlights_list || []).filter((h: string) => !isWarrantyLine(h));
  const usage: { name: string; slug: string }[] = product.usage_tags || [];
  const plan: WarrantyPlan | undefined = product.warranty;

  const groups = [
    {
      title: "Performance",
      icon: Cpu,
      rows: [
        ["Processor", spec("processor")],
        ["RAM", spec("ram")],
        ["Storage", spec("storage")],
        ["Graphics", product.graphics],
      ],
    },
    { title: "Display", icon: Monitor, rows: [["Screen", product.display]] },
    {
      title: "Connectivity",
      icon: Wifi,
      rows: [
        ["Wi-Fi", product.wifi],
        ["Bluetooth", product.bluetooth],
        ["Ports", product.ports],
      ],
    },
    {
      title: "Software & build",
      icon: Battery,
      rows: [
        ["Operating system", product.operating_system],
        ["Battery", product.battery],
        ["Weight", product.weight],
      ],
    },
    {
      title: "Condition & cover",
      icon: ShieldCheck,
      rows: [
        ["Condition", product.condition_display],
        ["Quality check", c.refurbishment_summary],
        ["Warranty", plan?.name],
        ["In the box", lines(c.in_the_box).join(", ")],
      ],
    },
  ]
    .map((g) => ({ ...g, rows: g.rows.filter(([, v]) => !isPlaceholderSpec(v)) }))
    .filter((g) => g.rows.length);

  return (
    <div id="details" className="scroll-mt-40 rounded-3xl border border-border p-5 md:p-8">
      <div role="tablist" className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`h-10 px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              active === tab.key ? "bg-brand-navy text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div>
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" /> About this laptop
              </h3>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{product.description}</p>
              {usage.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold mb-2">Best for</p>
                  <div className="flex flex-wrap gap-2">
                    {usage.map((u) => (
                      <Link
                        key={u.slug}
                        to={`/products?usage=${u.slug}`}
                        className="h-8 px-3 inline-flex items-center rounded-full bg-brand-sky/10 text-sky-800 text-xs font-semibold hover:bg-brand-sky/20"
                      >
                        {u.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-brand-navy text-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-leaf">Every Yuva laptop</p>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex gap-3"><BadgeCheck className="w-5 h-5 text-brand-leaf shrink-0" /> {c.refurbishment_summary}</li>
                {plan && <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-brand-leaf shrink-0" /> {plan.summary}</li>}
                <li className="flex gap-3"><RefreshCw className="w-5 h-5 text-brand-leaf shrink-0" /> Transit damage covered (unboxing video needed)</li>
                <li className="flex gap-3"><Wrench className="w-5 h-5 text-brand-leaf shrink-0" /> {c.service_summary}</li>
              </ul>
            </div>
          </div>

          {highlights.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Highlights
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/60 p-4 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-brand-leaf-dark shrink-0" />
                    <span className="text-sm">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {active === "specs" && (
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 animate-in fade-in duration-300">
          {groups.map(({ title, icon: Icon, rows }) => (
            <section key={title}>
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <Icon className="w-4 h-4 text-primary" /> {title}
              </h3>
              <dl>
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 border-b border-border py-3 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-semibold text-foreground">
                      {label === "Condition" ? (
                        <Link to={`/condition-guide#${product.condition}`} className="underline underline-offset-2">{value}</Link>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <p className="md:col-span-2 text-xs text-muted-foreground">
            Specifications are for the configuration selected above. Need more RAM or storage? We can upgrade it before delivery.
          </p>
        </div>
      )}

      {active === "refurbishment" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <ol className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PROCESS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-display font-extrabold text-xl text-foreground/15">0{i + 1}</span>
                </div>
                <p className="mt-3 font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-3">
              <BadgeCheck className="w-5 h-5 text-primary" /> {c.refurbishment_summary}
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2.5">
              {lines(c.refurbishment_points).map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-brand-leaf-dark shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {active === "warranty" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {plan && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-leaf-dark">Warranty for this product</p>
              <h3 className="font-display font-extrabold text-2xl mt-1">{plan.name}</h3>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {plan.testing_days > 0 && (
                  <div className="rounded-2xl bg-brand-leaf/10 border border-brand-leaf/30 p-5">
                    <p className="font-display font-extrabold text-3xl text-brand-leaf-dark">{plan.testing_days} days</p>
                    <p className="font-semibold">Testing warranty</p>
                    <p className="mt-1 text-sm text-muted-foreground">From the date of purchase.</p>
                  </div>
                )}
                {plan.parts_months > 0 ? (
                  <div className="rounded-2xl bg-brand-sky/10 border border-brand-sky/30 p-5">
                    <p className="font-display font-extrabold text-3xl text-sky-800">{coverLength(plan.parts_months)}</p>
                    <p className="font-semibold">RAM, SSD & motherboard</p>
                    <p className="mt-1 text-sm text-muted-foreground">RAM and hard disk replacement, motherboard repair.</p>
                  </div>
                ) : plan.free_service && plan.service_months > 0 ? (
                  <div className="rounded-2xl bg-brand-sky/10 border border-brand-sky/30 p-5">
                    <p className="font-display font-extrabold text-3xl text-sky-800">{coverLength(plan.service_months)}</p>
                    <p className="font-semibold">Free service</p>
                    <p className="mt-1 text-sm text-muted-foreground">Service at Yuva Service Lab; parts are chargeable.</p>
                  </div>
                ) : null}
                {plan.battery_hours > 0 && (
                  <div className="rounded-2xl bg-muted/70 border border-border p-5">
                    <p className="font-display font-extrabold text-3xl">{plan.battery_hours}+ hr</p>
                    <p className="font-semibold">Battery backup</p>
                    <p className="mt-1 text-sm text-muted-foreground">Minimum backup guaranteed.</p>
                  </div>
                )}
              </div>
              <ul className="mt-6 grid md:grid-cols-2 gap-x-8 gap-y-2.5">
                {plan.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-brand-leaf-dark shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 rounded-2xl border border-brand-leaf/40 bg-brand-leaf/5 p-4">
            <Truck className="w-5 h-5 text-brand-leaf-dark shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Shipping assurance</p>
              <p className="text-muted-foreground">{c.shipping_assurance}</p>
            </div>
          </div>

          {lines(c.warranty_claim_steps).length > 0 && (
            <div className="rounded-2xl bg-muted/60 p-5">
              <h3 className="font-display font-bold text-lg mb-3">How to claim</h3>
              <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {lines(c.warranty_claim_steps).map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-brand-navy text-white grid place-items-center text-xs font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Conditions apply.{" "}
                <Link to="/warranty-policy" className="underline font-semibold text-foreground">
                  Read the full warranty policy
                </Link>{" "}
                for what isn’t covered.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/warranty" className="inline-flex items-center h-10 px-4 rounded-full bg-brand-navy text-white text-sm font-semibold">
                  Check my warranty
                </Link>
                <a
                  href={whatsappLink(`Hi, I have a warranty question about ${product.title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border bg-white text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4 text-brand-leaf-dark" /> Ask on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
