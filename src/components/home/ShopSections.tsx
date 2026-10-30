// src/components/home/ShopSections.tsx
// Category tiles, budget tiles and the tabbed product showcase.
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Laptop, MessageCircle, PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { ApiProduct } from "@/types/product";
import { BUDGET_RANGES, budgetHref, whatsappLink } from "@/lib/site";

export const SectionHeading = ({
  eyebrow, title, text, action, dark = false,
}: { eyebrow?: string; title: string; text?: string; action?: React.ReactNode; dark?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-[0.18em] mb-3 ${dark ? "text-brand-leaf" : "text-brand-leaf-dark"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display font-extrabold text-2xl md:text-4xl tracking-tight ${dark ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      {text && <p className={`mt-3 text-sm md:text-base ${dark ? "text-white/60" : "text-muted-foreground"}`}>{text}</p>}
    </div>
    {action}
  </div>
);

export const ViewAllLink = ({ to, label = "View all", dark = false }: { to: string; label?: string; dark?: boolean }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border text-sm font-semibold shrink-0 transition-colors ${
      dark ? "border-white/20 text-white hover:bg-white/10" : "border-border hover:border-foreground"
    }`}
  >
    {label} <ArrowRight className="w-4 h-4" />
  </Link>
);

// ── Categories ─────────────────────────────────────────────────────────────

export const CategoryGrid = ({ categories }: { categories: { id: number; name: string; slug: string; image?: string | null }[] }) => {
  if (!categories?.length) return null;
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find the right machine"
          action={<ViewAllLink to="/products" label="All products" />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group rounded-2xl border border-border bg-card p-3 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="aspect-square rounded-xl bg-muted overflow-hidden grid place-items-center">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Laptop className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.25} />
                )}
              </div>
              <p className="mt-3 px-1 flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="truncate">{cat.name}</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Budgets ────────────────────────────────────────────────────────────────

export const BudgetSection = () => (
  <section className="py-14 md:py-20 bg-muted/60">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeading eyebrow="Shop by budget" title="Great laptops at every price" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {BUDGET_RANGES.map((b, i) => (
          <Link
            key={b.value}
            to={budgetHref(b.min, b.max)}
            className={`group relative overflow-hidden rounded-2xl p-5 md:p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${
              i === BUDGET_RANGES.length - 1 ? "bg-brand-navy text-white" : "bg-card border border-border"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${i === BUDGET_RANGES.length - 1 ? "text-white/60" : "text-muted-foreground"}`}>
              {b.label}
            </p>
            <p className="mt-1 font-display font-extrabold text-2xl md:text-3xl tracking-tight">{b.value}</p>
            <p className={`mt-2 text-sm ${i === BUDGET_RANGES.length - 1 ? "text-white/70" : "text-muted-foreground"}`}>{b.hint}</p>
            <span className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${i === BUDGET_RANGES.length - 1 ? "text-brand-leaf" : "text-primary"}`}>
              Browse <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// ── Product showcase ───────────────────────────────────────────────────────

interface ShowcaseTab {
  key: string;
  label: string;
  products: ApiProduct[];
  link: string;
}

export const ProductShowcase = ({ tabs, loading }: { tabs: ShowcaseTab[]; loading: boolean }) => {
  const available = useMemo(() => tabs.filter((t) => t.products?.length), [tabs]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = available.find((t) => t.key === activeKey) ?? available[0];

  const scroll = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-20 bg-brand-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative container mx-auto px-4 md:px-6">
        <SectionHeading
          dark
          eyebrow="In stock now"
          title="Popular refurbished laptops & desktops"
          action={active && <ViewAllLink dark to={active.link} />}
        />

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : !active ? (
          <EmptyStock />
        ) : (
          <>
            {available.length > 1 && (
              <div role="tablist" className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
                {available.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={t.key === active.key}
                    onClick={() => { setActiveKey(t.key); scrollRef.current?.scrollTo({ left: 0 }); }}
                    className={`h-10 px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      t.key === active.key ? "bg-white text-brand-navy" : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {active.products.map((p) => (
                  <div key={p.id} className="snap-start shrink-0 w-[75%] sm:w-[45%] lg:w-[calc(25%-12px)] text-foreground">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              {active.products.length > 4 && (
                <div className="hidden lg:flex absolute -top-[4.5rem] right-0 gap-2">
                  <button onClick={() => scroll(-1)} aria-label="Previous" className="w-10 h-10 grid place-items-center rounded-full border border-white/20 hover:bg-white/10">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => scroll(1)} aria-label="Next" className="w-10 h-10 grid place-items-center rounded-full border border-white/20 hover:bg-white/10">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/** Shown while the catalogue is empty, so the section still sells something. */
const EmptyStock = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6">
    <span className="w-14 h-14 rounded-2xl bg-brand-leaf/15 text-brand-leaf grid place-items-center shrink-0">
      <PackageOpen className="w-7 h-7" />
    </span>
    <div className="flex-1">
      <h3 className="font-display font-bold text-xl md:text-2xl">Fresh stock is being listed</h3>
      <p className="mt-2 text-white/70 max-w-xl">
        New laptops and desktops are added every week. Tell us your budget and use, and our team will
        send you what’s available today — or walk into any Yuva store.
      </p>
    </div>
    <div className="flex flex-wrap gap-3">
      <a
        href={whatsappLink("Hi Yuva Computers, I'm looking for a laptop. My budget is ")}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-leaf text-white font-semibold hover:brightness-110"
      >
        <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
      </a>
      <Link to="/stores" className="inline-flex items-center h-11 px-5 rounded-full border border-white/20 font-semibold hover:bg-white/10">
        Find a store
      </Link>
    </div>
  </div>
);
