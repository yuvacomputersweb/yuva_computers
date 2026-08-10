import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { storeService } from "@/services/api";
import HorizontalProductCard from "@/components/home/HorizontalProductCard";
import { type ApiProduct, collectVariantValues } from "@/types/product";
import { SEO } from "@/components/SEO";

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
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full font-bold mb-2 uppercase text-xs text-foreground"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="space-y-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="accent-primary"
              />
              {opt}
            </label>
          ))}
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
    if (searchParams.get("search")) return `Search: "${searchParams.get("search")}"`;
    if (searchParams.get("brand"))
      return `${searchParams.get("brand")} ${searchParams.get("category") || ""}`;
    if (searchParams.get("category")) return searchParams.get("category");
    if (searchParams.get("usage")) return `Used for ${searchParams.get("usage")}`;
    return "All Products";
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

    const processors = collectVariantValues(products, "processor");
    if (processors.length > 0) filters["Processor"] = processors;

    const rams = collectVariantValues(products, "ram");
    if (rams.length > 0) filters["RAM"] = rams;

    const storages = collectVariantValues(products, "storage");
    if (storages.length > 0) filters["Storage"] = storages;

    return filters;
  }, [products, searchParams]);

  const filteredAndSorted = useMemo(() => {
    const activeProcessors = selectedFilters["Processor"] || [];
    const activeRams = selectedFilters["RAM"] || [];
    const activeStorages = selectedFilters["Storage"] || [];
    const hasVariantFilter =
      activeProcessors.length > 0 || activeRams.length > 0 || activeStorages.length > 0;

    let result = products.filter((p) => {
      const variants = p.variants || [];
      const cardPrice =
        variants.length > 0
          ? Math.min(...variants.map((v) => v.final_price))
          : Number(p.price);
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
            activeProcessors.some((ap) =>
              (v.processor || "").toLowerCase().includes(ap.toLowerCase())
            );
          const okRam =
            activeRams.length === 0 ||
            activeRams.some((ar) => (v.ram || "").toLowerCase().includes(ar.toLowerCase()));
          const okStorage =
            activeStorages.length === 0 ||
            activeStorages.some((as_) =>
              (v.storage || "").toLowerCase().includes(as_.toLowerCase())
            );
          return okProc && okRam && okStorage;
        });
        if (!matchesVariant) return false;
      }

      return true;
    });

    if (sortBy === "price-low") result.sort((a, b) => {
      const aPrice = (a.variants || []).length > 0
        ? Math.min(...a.variants!.map((v) => v.final_price))
        : Number(a.price);
      const bPrice = (b.variants || []).length > 0
        ? Math.min(...b.variants!.map((v) => v.final_price))
        : Number(b.price);
      return aPrice - bPrice;
    });
    if (sortBy === "price-high") result.sort((a, b) => {
      const aPrice = (a.variants || []).length > 0
        ? Math.min(...a.variants!.map((v) => v.final_price))
        : Number(a.price);
      const bPrice = (b.variants || []).length > 0
        ? Math.min(...b.variants!.map((v) => v.final_price))
        : Number(b.price);
      return bPrice - aPrice;
    });

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

  const SidebarContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold mb-3 uppercase text-xs text-foreground">
          Price (₹{priceBounds.min.toLocaleString("en-IN")} –{" "}
          ₹{priceRange.toLocaleString("en-IN")})
        </h4>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {Object.entries(availableFilters).map(([cat, options]) => (
        <FilterSection
          key={cat}
          title={cat}
          options={options}
          selected={selectedFilters[cat] || []}
          onToggle={(val) => toggleFilter(cat, val)}
        />
      ))}

      {activeFilterCount > 0 && (
        <button
          onClick={() => setSelectedFilters({})}
          className="text-xs text-destructive font-semibold hover:underline"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  const cleanTitle = String(pageTitle).replace(/-/g, " ");
  
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

  return (
    <>
      <SEO
        title={`${cleanTitle} | Yuva Computers`}
        description={`Browse our store collection of ${cleanTitle}. High quality tested refurbished laptops, desktops, and accessories at low prices.`}
        canonical="/products"
        jsonLd={productsBreadcrumbSchema}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {cleanTitle}
        </h1>

        <div className="flex justify-between items-center mb-8 bg-muted/40 p-4 rounded-lg">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 lg:hidden font-bold text-sm"
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="hidden lg:block font-medium text-sm text-muted-foreground">
            {filteredAndSorted.length} Products
          </div>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
            className="bg-transparent font-bold text-sm outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <SidebarContent />
          </aside>

          {mobileFiltersOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-2xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <SidebarContent />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm"
                >
                  Show {filteredAndSorted.length} Results
                </button>
              </div>
            </>
          )}

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-10 h-10" />
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSorted.map((p) => (
                  <HorizontalProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
  <div className="py-20 text-center text-muted-foreground">
    <p className="font-semibold mb-2 text-foreground text-lg">
      No products found for this selection
    </p>
    <p className="text-sm mb-6 max-w-md mx-auto">
      We regularly restock our certified refurbished inventory. Try clearing your active filters or explore our main categories below:
    </p>

    <div className="flex flex-wrap justify-center gap-3 text-sm font-bold">
      {activeFilterCount > 0 && (
        <button
          onClick={() => setSelectedFilters({})}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
      <a
        href="/products"
        className="border border-border/40 bg-card px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        Browse All Products
      </a>
      <a
        href="/stores"
        className="border border-border/40 bg-card px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        Visit Experience Stores
      </a>
      <a
        href="/bulk-orders"
        className="border border-border/40 bg-card px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        Corporate Bulk Orders
      </a>
    </div>
  </div>
)}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;