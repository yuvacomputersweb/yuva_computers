import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Scale, ArrowRight } from "lucide-react";
import { storeService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { ProductImage } from "@/components/ProductCard";
import { useShopLists } from "@/contexts/ShopListsContext";
import { getCardPrice } from "@/types/product";
import { isPlaceholderSpec } from "@/lib/specs";

const ROWS: { label: string; key: string }[] = [
  { label: "Condition", key: "condition_display" },
  { label: "Processor", key: "processor" },
  { label: "RAM", key: "ram" },
  { label: "Storage", key: "storage" },
  { label: "Display", key: "display" },
  { label: "Graphics", key: "graphics" },
  { label: "Operating system", key: "operating_system" },
  { label: "Ports", key: "ports" },
  { label: "Battery", key: "battery" },
  { label: "Weight", key: "weight" },
  { label: "Warranty", key: "warranty_period" },
  { label: "Returns", key: "return_policy" },
];

const ComparePage = () => {
  const { compare, toggleCompare, clearCompare } = useShopLists();
  // Saved cards hold list data only; fetch full specs for the table.
  const [details, setDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    compare.forEach((p) => {
      if (details[p.slug]) return;
      storeService
        .getProductBySlug(p.slug)
        .then((d) => setDetails((prev) => ({ ...prev, [p.slug]: d })))
        .catch(() => undefined);
    });
  }, [compare, details]);

  const rows = ROWS.filter((r) => compare.some((p) => !isPlaceholderSpec((details[p.slug] || p)[r.key])));

  return (
    <>
      <SEO title="Compare Laptops | Yuva Computers" noindex={true} />
      <PageHero eyebrow="Compare" title="Compare side by side" crumbs={[{ label: "Compare" }]} />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        {compare.length === 0 ? (
          <div className="text-center py-16">
            <span className="mx-auto w-14 h-14 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
              <Scale className="w-7 h-7" />
            </span>
            <h2 className="mt-5 font-display font-bold text-xl">Nothing to compare yet</h2>
            <p className="mt-2 text-muted-foreground">Tap “Compare” on up to 3 products to see them side by side.</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-brand-navy text-white font-semibold">
              Browse laptops <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={clearCompare} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                Clear all
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="w-40 text-left align-bottom pb-4" />
                    {compare.map((p) => {
                      const { price } = getCardPrice(p);
                      return (
                        <th key={p.id} className="text-left align-top pb-4 px-3 font-normal">
                          <div className="relative rounded-2xl border border-border p-4">
                            <button
                              onClick={() => toggleCompare(p)}
                              aria-label={`Remove ${p.title}`}
                              className="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full hover:bg-muted"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="aspect-[4/3] rounded-xl bg-muted overflow-hidden">
                              <ProductImage src={p.images?.[0]?.image} alt={p.title} className="w-full h-full p-3" />
                            </div>
                            <Link to={`/product/${p.slug}`} className="mt-3 block font-display font-bold leading-snug hover:text-primary">
                              {p.title}
                            </Link>
                            <p className="mt-1 font-display font-extrabold text-lg">₹{price.toLocaleString("en-IN")}</p>
                            <Link
                              to={`/product/${p.slug}`}
                              className="mt-3 flex items-center justify-center h-10 rounded-full bg-brand-navy text-white text-sm font-semibold"
                            >
                              View details
                            </Link>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.key} className={i % 2 ? "" : "bg-muted/50"}>
                      <th className="text-left font-medium text-muted-foreground py-3 px-3 rounded-l-xl">{r.label}</th>
                      {compare.map((p, j) => {
                        const v = (details[p.slug] || p)[r.key];
                        return (
                          <td key={p.id} className={`py-3 px-3 font-semibold ${j === compare.length - 1 ? "rounded-r-xl" : ""}`}>
                            {isPlaceholderSpec(v) ? "—" : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ComparePage;
