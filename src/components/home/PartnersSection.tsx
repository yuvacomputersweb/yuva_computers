// Shop by brand and by processor — the shortcuts most refurbished-laptop buyers search by.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cpu, ArrowRight } from "lucide-react";
import { storeService } from "@/services/api";
import { SectionHeading } from "./ShopSections";

const PROCESSORS = [
  { label: "Intel Core i5", hint: "Everyday & office", q: "i5" },
  { label: "Intel Core i7", hint: "Power & multitasking", q: "i7" },
  { label: "AMD Ryzen", hint: "Great value", q: "ryzen" },
  { label: "Apple Silicon", hint: "M1 Pro & M2 Pro", q: "apple m" },
];

export const PartnersSection = () => {
  const [brands, setBrands] = useState<{ id: number; name: string; slug: string }[]>([]);

  useEffect(() => {
    storeService.getBrands().then(setBrands).catch(() => undefined);
  }, []);

  return (
    <section className="py-14 md:py-20 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12">
        <div>
          <SectionHeading eyebrow="Shop by brand" title="Top business brands" />
          <div className="grid grid-cols-2 gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                to={`/products?brand=${b.slug}`}
                className="group h-20 rounded-2xl border border-border bg-card px-5 flex items-center justify-between hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <span className="font-display font-extrabold text-xl tracking-wide uppercase">{b.name}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Shop by processor" title="Pick your performance" />
          <div className="grid grid-cols-2 gap-3">
            {PROCESSORS.map((p) => (
              <Link
                key={p.q}
                to={`/products?processor=${encodeURIComponent(p.q)}`}
                className="group h-20 rounded-2xl border border-border bg-card px-5 flex items-center gap-3 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-brand-navy text-brand-leaf grid place-items-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-display font-bold">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">{p.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
