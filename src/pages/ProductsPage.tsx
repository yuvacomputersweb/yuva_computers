import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X, SlidersHorizontal, ChevronDown, ChevronRight, PackageSearch, MessageCircle } from "lucide-react";
import { storeService } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import { type ApiProduct, collectVariantValues } from "@/types/product";
import { SEO } from "@/components/SEO";
import { BUDGET_RANGES, budgetHref, whatsappLink } from "@/lib/site";
import { normalizeProcessor, normalizeSize, isPlaceholderSpec } from "@/lib/specs";


const NORMALIZERS: Record<string, (v: string) => string> = {
  Processor: normalizeProcessor,
  RAM: normalizeSize,
  Storage: normalizeSize,
};

const sizeOrder = (v: string) => {
  const m = v.match(/([\d.]+)(TB|GB)/);
  return m ? Number(m[1]) * (m[2] === "TB" ? 1024 : 1) : 0;
};

const uniqueSorted = (values: string[], normalize: (v: string) => string, bySize = false) => {
  const set = Array.from(new Set(values.filter((v) => !isPlaceholderSpec(v)).map(normalize).filter(Boolean)));
  return bySize ? set.sort((a, b) => sizeOrder(a) - sizeOrder(b)) : set.sort();
};

const cardPriceOf = (p: ApiProduct) =>
  (p.variants || []).length > 0 ? Math.min(...p.variants!.map((v) => v.final_price)) : Number(p.price);

const prettify = (slug: string) =>
  slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  if (options.length === 0) return null;
  return (
    <div className="border-b border-border pb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full font-semibold text-sm text-foreground"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                aria-pressed={active}
                className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-brand-navy border-brand-navy text-white"
                    : "bg-card border-border text-foreground hover:border-foreground/40"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000000 });
  const [priceRange, setPriceRange] = useState(1000000);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const paramsObj = Object.fromEntries(searchParams);

        if (paramsObj.srsltid) {
          delete paramsObj.srsltid;
          
          if (paramsObj.is_best_seller === 'true') {
            delete paramsObj.is_best_seller;
          }
        }

        const data = await storeService.getProducts(paramsObj);
        const prodList: ApiProduct[] = Array.isArray(data) ? data : data.products || [];
        setProducts(prodList);

        if (prodList.length > 0) {
          const prices = prodList.map((p) => {
            const variants = p.variants || [];
            if (variants.length > 0) {
              return Math.min(...variants.map((v) => v.final_price));
            }
            return Number(p.price);
          });
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceBounds({ min, max });
          setPriceRange(max);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    setSelectedFilters({});
  }, [searchParams]);

  const pageTitle = useMemo(() => {
    const min = searchParams.get("min_price");
    const max = searchParams.get("max_price");
    const k = (v: string) => `₹${Math.round(Number(v) / 1000)}K`;
    if (searchParams.get("search")) return `Results for “${searchParams.get("search")}”`;
    if (searchParams.get("brand"))
      return `${prettify(searchParams.get("brand")!)} ${prettify(searchParams.get("category") || "")}`.trim();
    if (searchParams.get("category")) return prettify(searchParams.get("category")!);
    if (searchParams.get("usage")) return `Laptops for ${prettify(searchParams.get("usage")!)}`;
    if (searchParams.get("processor")) return `${prettify(searchParams.get("processor")!)} laptops`;
    if (searchParams.get("is_best_deal")) return "Best deals";
    if (searchParams.get("is_best_seller")) return "Best sellers";
    if (searchParams.get("is_trending")) return "Trending now";
    if (searchParams.get("is_new_arrival")) return "New arrivals";
    if (min && max) return `Laptops ${k(min)} – ${k(max)}`;
    if (max) return `Laptops under ${k(max)}`;
    if (min) return `Laptops above ${k(min)}`;
    return "All refurbished laptops & desktops";
  }, [searchParams]);

  const availableFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};

    const conditions = Array.from(
      new Set(products.map((p) => p.condition_display).filter(Boolean))
    ) as string[];
    if (conditions.length > 1) filters["Condition"] = conditions;

    if (!searchParams.get("brand")) {
      const brands = Array.from(
        new Set(products.map((p) => p.brand_name).filter(Boolean))
      ) as string[];
      if (brands.length > 1) filters["Brand"] = brands;
    }

    if (!searchParams.get("category")) {
      const cats = Array.from(
        new Set(products.map((p) => p.category_name).filter(Boolean))
      ) as string[];
      if (cats.length > 1) filters["Category"] = cats;
    }

    const processors = uniqueSorted(collectVariantValues(products, "processor"), normalizeProcessor);
    if (processors.length > 0) filters["Processor"] = processors;

    const rams = uniqueSorted(collectVariantValues(products, "ram"), normalizeSize, true);
    if (rams.length > 0) filters["RAM"] = rams;

    const storages = uniqueSorted(collectVariantValues(products, "storage"), normalizeSize, true);
    if (storages.length > 0) filters["Storage"] = storages;

    return filters;
  }, [products, searchParams]);

  const filteredAndSorted = useMemo(() => {
    const activeProcessors = selectedFilters["Processor"] || [];
    const activeRams = selectedFilters["RAM"] || [];
    const activeStorages = selectedFilters["Storage"] || [];
    const hasVariantFilter =
      activeProcessors.length > 0 || activeRams.length > 0 || activeStorages.length > 0;

    const result = products.filter((p) => {
      const variants = p.variants || [];
      const cardPrice = cardPriceOf(p);
      if (cardPrice > priceRange || cardPrice < priceBounds.min) return false;

      if (
        selectedFilters["Brand"]?.length &&
        !selectedFilters["Brand"].includes(p.brand_name)
      )
        return false;
      if (
        selectedFilters["Condition"]?.length &&
        !selectedFilters["Condition"].includes(p.condition_display ?? "")
      )
        return false;
      if (
        selectedFilters["Category"]?.length &&
        !selectedFilters["Category"].includes(p.category_name)
      )
        return false;

      if (hasVariantFilter) {
        const matchesVariant = variants.some((v) => {
          const okProc =
            activeProcessors.length === 0 ||
            activeProcessors.includes(NORMALIZERS.Processor(v.processor || ""));
          const okRam =
            activeRams.length === 0 || activeRams.includes(NORMALIZERS.RAM(v.ram || ""));
          const okStorage =
            activeStorages.length === 0 ||
            activeStorages.includes(NORMALIZERS.Storage(v.storage || ""));
          return okProc && okRam && okStorage;
        });
        if (!matchesVariant) return false;
      }

      return true;
    });

    if (sortBy === "price-low") result.sort((a, b) => cardPriceOf(a) - cardPriceOf(b));
    if (sortBy === "price-high") result.sort((a, b) => cardPriceOf(b) - cardPriceOf(a));
    if (sortBy === "discount") result.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));

    return result;
  }, [products, selectedFilters, priceRange, priceBounds.min, sortBy]);

  const toggleFilter = useCallback((category: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category]?.includes(value)
        ? prev[category].filter((i) => i !== value)
        : [...(prev[category] || []), value],
    }));
  }, []);

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  const priceFiltered = priceRange < priceBounds.max;
  const clearAll = () => {
    setSelectedFilters({});
    setPriceRange(priceBounds.max);
  };

  // Rendered as a function (not a component) so filter sections keep their open state.
  const renderFilters = () => (
    <div className="space-y-5">
      {priceBounds.max > priceBounds.min && (
        <div className="border-b border-border pb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Max price</span>
            <span className="font-semibold text-primary">₹{priceRange.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={500}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full mt-3 accent-[hsl(var(--brand-navy))]"
            aria-label="Maximum price"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>₹{priceBounds.min.toLocaleString("en-IN")}</span>
            <span>₹{priceBounds.max.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {Object.entries(availableFilters).map(([cat, options]) => (
        <FilterSection
          key={cat}
          title={cat}
          options={options}
          selected={selectedFilters[cat] || []}
          onToggle={(val) => toggleFilter(cat, val)}
        />
      ))}
    </div>
  );

  const cleanTitle = String(pageTitle);

  const productsBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.yuvacomputers.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": cleanTitle,
        "item": "https://www.yuvacomputers.in/products"
      }
    ]
  };

  const activeChips = [
    ...Object.entries(selectedFilters).flatMap(([cat, vals]) => vals.map((v) => ({ cat, v }))),
  ];

  return (
    <>
      <SEO
        title={`${cleanTitle} | Yuva Computers`}
        description={`Shop ${cleanTitle.toLowerCase()} at Yuva Computers. Certified refurbished laptops and desktops, 50-point quality checked, with warranty and free store pickup.`}
        canonical="/products"
        jsonLd={productsBreadcrumbSchema}
      />

      {/* Header band */}
      <section className="bg-muted/60 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-foreground">Shop</Link>
          </nav>
          <h1 className="mt-3 font-display font-extrabold text-3xl md:text-4xl tracking-tight">{cleanTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Loading products…" : `${filteredAndSorted.length} of ${products.length} products`} · 50-point checked · free store pickup
          </p>

          <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {BUDGET_RANGES.map((b) => {
              const href = budgetHref(b.min, b.max);
              const active =
                (searchParams.get("min_price") || "") === (b.min ? String(b.min) : "") &&
                (searchParams.get("max_price") || "") === (b.max ? String(b.max) : "");
              return (
                <Link
                  key={b.value}
                  to={active ? "/products" : href}
                  className={`shrink-0 h-9 px-4 inline-flex items-center rounded-full text-sm font-medium border transition-colors ${
                    active ? "bg-brand-navy border-brand-navy text-white" : "bg-card border-border hover:border-foreground/40"
                  }`}
                >
                  {b.label === "Between" ? b.value : `${b.label} ${b.value}`}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-40">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg">Filters</h2>
                {(activeFilterCount > 0 || priceFiltered) && (
                  <button onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              {renderFilters()}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border font-semibold text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1 grid place-items-center bg-brand-navy text-white text-[10px] font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex flex-wrap gap-2 min-w-0">
                {activeChips.map(({ cat, v }) => (
                  <button
                    key={cat + v}
                    onClick={() => toggleFilter(cat, v)}
                    className="inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                  >
                    {v} <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              <label className="relative ml-auto shrink-0">
                <span className="sr-only">Sort products</span>
                <select
                  onChange={(e) => setSortBy(e.target.value)}
                  value={sortBy}
                  className="appearance-none h-10 pl-4 pr-10 rounded-full border border-border bg-card text-sm font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="discount">Biggest discount</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </label>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[26rem] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-5">
                {filteredAndSorted.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border py-16 px-6 text-center">
                <span className="mx-auto w-14 h-14 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
                  <PackageSearch className="w-7 h-7" />
                </span>
                <h2 className="mt-5 font-display font-bold text-xl">
                  {products.length === 0 ? "New stock is on its way" : "No products match these filters"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  {products.length === 0
                    ? "We list fresh refurbished laptops every week. Tell us what you need and we’ll share what’s available today."
                    : "Try removing a filter or widening your price range."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
                  {(activeFilterCount > 0 || priceFiltered) && (
                    <button onClick={clearAll} className="h-11 px-5 rounded-full bg-brand-navy text-white">
                      Clear all filters
                    </button>
                  )}
                  <a
                    href={whatsappLink("Hi Yuva Computers, I'm looking for a laptop. My budget is ")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-leaf text-white"
                  >
                    <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
                  </a>
                  <Link to="/stores" className="inline-flex items-center h-11 px-5 rounded-full border border-border">
                    Visit a store
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{renderFilters()}</div>
            <div className="grid grid-cols-[auto_1fr] gap-3 p-4 border-t border-border">
              <button onClick={clearAll} className="h-12 px-5 rounded-full border border-border text-sm font-semibold">
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 rounded-full bg-brand-navy text-white text-sm font-semibold"
              >
                Show {filteredAndSorted.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;
