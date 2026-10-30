//product info component
import { useState, useMemo, useEffect, useRef } from "react";
import { ShoppingCart, Zap, Star, Minus, Plus, MessageCircle, Store, Cpu, MemoryStick, HardDrive, Monitor, Heart, Scale } from "lucide-react";
import { useShopLists } from "@/contexts/ShopListsContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { whatsappLink } from "@/lib/site";
import { isPlaceholderSpec } from "@/lib/specs";
import { Link } from "react-router-dom";
import { EmiLine, OffersList, InTheBox, DeliveryEstimate, NotifyMe } from "./ProductExtras";

const conditionStyles: Record<string, string> = {
  like_new: "bg-brand-leaf/15 text-brand-leaf-dark",
  excellent: "bg-primary/10 text-primary",
  good: "bg-brand-sky/15 text-sky-700",
  value: "bg-muted text-foreground",
};

const OptionGroup = ({
  label,
  options,
  selected,
  onSelect,
  isAvailable = () => true,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  isAvailable?: (v: string) => boolean;
}) => (
  <div>
    <p className="text-sm text-muted-foreground mb-2">
      {label}: <span className="font-semibold text-foreground">{selected}</span>
    </p>
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const available = isAvailable(opt);
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => available && onSelect(opt)}
            disabled={!available}
            aria-pressed={active}
            className={`min-h-10 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              active
                ? "border-brand-navy bg-brand-navy text-white"
                : !available
                ? "border-dashed border-border text-muted-foreground/60 line-through cursor-not-allowed"
                : "border-border bg-card hover:border-foreground/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export default function ProductInfo({
  product,
  onVariantChange,
}: {
  product: any;
  onVariantChange: (v: any) => void;
}) {
  const { addToCart } = useCart();
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } = useShopLists();
  const saved = isWishlisted(product.id);
  const comparing = isCompared(product.id);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);


  const variants: any[] = product.variants || [];


  // ── SORT helper (ensures consistent ordering everywhere) ───────
  const sortValues = (arr: string[]) =>
    [...new Set(arr)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));


  // ── Determine whether variants use processor field ─────────────
  const hasProcessorVariants = useMemo(
    () => variants.some((v) => v.processor && v.processor.trim() !== ""),
    [variants]
  );


  // ── Step 1: Processor options (SORTED) ─────────────────────────
  const processorOptions = useMemo(() => {
    if (!hasProcessorVariants) return [];
    return sortValues(variants.map((v) => v.processor).filter(Boolean));
  }, [variants, hasProcessorVariants]);


  const [selectedProcessor, setSelectedProcessor] = useState<string>(
    processorOptions[0] || ""
  );


  // ── Step 2: RAM options (SORTED) ───────────────────────────────
  const ramOptions = useMemo(() => {
    const source = hasProcessorVariants
      ? variants.filter((v) => v.processor === selectedProcessor)
      : variants;

    return sortValues(source.map((v) => v.ram));
  }, [variants, selectedProcessor, hasProcessorVariants]);


  const [selectedRam, setSelectedRam] = useState<string>(
    ramOptions[0] || ""
  );


  // ── Step 3: Storage options (SORTED) ───────────────────────────
  const storageOptions = useMemo(() => {
    const source = hasProcessorVariants
      ? variants.filter(
          (v) => v.processor === selectedProcessor && v.ram === selectedRam
        )
      : variants.filter((v) => v.ram === selectedRam);

    return sortValues(source.map((v) => v.storage));
  }, [variants, selectedProcessor, selectedRam, hasProcessorVariants]);


  const [selectedStorage, setSelectedStorage] = useState<string>(
    storageOptions[0] || ""
  );


  // ── Cascade fixes ───────────────────────────────────────────────
  useEffect(() => {
    if (ramOptions.length > 0 && !ramOptions.includes(selectedRam)) {
      setSelectedRam(ramOptions[0]);
    }
  }, [selectedProcessor, ramOptions]);


  useEffect(() => {
    if (storageOptions.length > 0 && !storageOptions.includes(selectedStorage)) {
      setSelectedStorage(storageOptions[0]);
    }
  }, [selectedRam, storageOptions]);


  // ── Active variant ──────────────────────────────────────────────
  const activeVariant = useMemo(() => {
    if (hasProcessorVariants) {
      return variants.find(
        (v) =>
          v.processor === selectedProcessor &&
          v.ram === selectedRam &&
          v.storage === selectedStorage
      );
    }
    return variants.find(
      (v) => v.ram === selectedRam && v.storage === selectedStorage
    );
  }, [variants, selectedProcessor, selectedRam, selectedStorage, hasProcessorVariants]);


  useEffect(() => {
    onVariantChange(activeVariant);
    setQuantity(1);
  }, [activeVariant, onVariantChange]);


  // Show the mobile buy bar once the main buttons scroll out of view
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);


  const currentStock = activeVariant ? activeVariant.stock : product.stock || 0;


  const handleAddToCart = () => {
    const success = addToCart(product, quantity, activeVariant);
    if (success) toast.success("Added to cart!");
    else toast.error("Not enough stock available.");
  };


  const handleBuyNow = () => {
    const success = addToCart(product, quantity, activeVariant);
    if (success) navigate("/checkout");
    else toast.error("Product out of stock.");
  };


  // ── PRICE FIX (BASE PRICE FIRST ALWAYS) ─────────────────────────
  const basePrice = Number(product.price);

  const displayPrice = activeVariant
    ? Number(activeVariant.final_price)
    : basePrice;

  const originalPrice = activeVariant
    ? Number(activeVariant.final_original_price)
    : Number(product.original_price);

  const savings = originalPrice > displayPrice ? originalPrice - displayPrice : 0;
  const discount = savings ? Math.round((savings / originalPrice) * 100) : 0;


  const isStorageAvailable = (storage: string) =>
    variants.length === 0 || storageOptions.includes(storage);


  const allStorages = useMemo(
    () => sortValues(variants.map((v) => v.storage)),
    [variants]
  );

  // Windows laptops can be upgraded before delivery (per the store's FAQ).
  // Only offered when the listing itself has no upgraded configurations to pick.
  const isUpgradeable =
    /laptop/i.test(String(product.category_name)) &&
    product.brand_name?.toLowerCase() !== "apple" &&
    new Set(variants.map((v) => `${v.ram}|${v.storage}`)).size < 2;

  const isLaptop = /laptop|macbook|notebook|workstation|chromebook/i.test(`${product.category_name} ${product.title}`);

  const keySpecs = [
    { icon: Cpu, label: "Processor", value: activeVariant?.processor || product.processor },
    { icon: MemoryStick, label: "RAM", value: activeVariant?.ram || product.ram },
    { icon: HardDrive, label: "Storage", value: activeVariant?.storage || product.storage },
    { icon: Monitor, label: "Display", value: product.display },
  ].filter((s) => !isPlaceholderSpec(s.value));

  const stockLabel =
    currentStock === 0 ? "Out of stock" : currentStock <= 3 ? `Only ${currentStock} left` : "In stock";
  const stockClass =
    currentStock === 0 ? "text-destructive" : currentStock <= 3 ? "text-orange-600" : "text-brand-leaf-dark";

  const askText = `Hi Yuva Computers, I'm interested in ${product.title}${
    activeVariant ? ` (${[activeVariant.processor, activeVariant.ram, activeVariant.storage].filter(Boolean).join(" / ")})` : ""
  }. Is it available?`;


  return (
    <div className="space-y-6">
      {/* Title + Rating */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            to={`/condition-guide#${product.condition}`}
            title="What does this condition mean?"
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider hover:underline ${conditionStyles[product.condition] || "bg-muted"}`}
          >
            {product.condition_display || product.condition} ⓘ
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand_name} · {product.category_name}
          </span>
        </div>
        <h1 className={`font-display font-extrabold text-foreground tracking-tight leading-tight ${
          String(product.title).length > 60 ? "text-xl md:text-[1.75rem]" : "text-2xl md:text-4xl"
        }`}>
          {product.title}
        </h1>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => toggleWishlist(product)}
            aria-pressed={saved}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-xs font-semibold hover:border-foreground/40"
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} /> {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => toggleCompare(product)}
            aria-pressed={comparing}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold ${
              comparing ? "bg-brand-leaf border-brand-leaf text-white" : "border-border hover:border-foreground/40"
            }`}
          >
            <Scale className="w-4 h-4" /> {comparing ? "Comparing" : "Compare"}
          </button>
        </div>
        {product.review_count > 0 && (
          <a href="#reviews" className="inline-flex items-center gap-2 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.average_rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-sm">{product.average_rating || 0}</span>
            <span className="text-sm text-muted-foreground underline underline-offset-2">
              {product.review_count} reviews
            </span>
          </a>
        )}
      </div>


      {/* Key specs */}
      {keySpecs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {keySpecs.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5 rounded-xl bg-muted/70 p-3">
              <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold leading-snug">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Price */}
      <div className="rounded-2xl border border-border p-5">
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
          <span className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {savings > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-bold text-white bg-brand-leaf px-2 py-1 rounded-full">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="mt-1 text-sm font-semibold text-brand-leaf-dark">
            You save ₹{savings.toLocaleString("en-IN")} vs. the original price
          </p>
        )}
        <EmiLine price={displayPrice} />
      </div>


      <OffersList price={displayPrice} />


      {/* Variant selectors — only show if variants exist */}
      {variants.length > 0 && (
        <div className="space-y-5">
          {hasProcessorVariants && processorOptions.length > 1 && (
            <OptionGroup label="Processor" options={processorOptions} selected={selectedProcessor} onSelect={setSelectedProcessor} />
          )}
          {!(ramOptions.length === 1 && isPlaceholderSpec(ramOptions[0])) && (
            <OptionGroup label="RAM" options={ramOptions} selected={selectedRam} onSelect={setSelectedRam} />
          )}
          {!(allStorages.length === 1 && isPlaceholderSpec(allStorages[0])) && (
            <OptionGroup
              label="Storage"
              options={allStorages}
              selected={selectedStorage}
              onSelect={setSelectedStorage}
              isAvailable={isStorageAvailable}
            />
          )}
          {isUpgradeable && (
            <a
              href={whatsappLink(`Hi, I'd like a RAM/SSD upgrade quote for ${product.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Need more RAM or storage? Get an upgrade quote →
            </a>
          )}
        </div>
      )}


      {/* Quantity + stock */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Qty</span>
          <div className="flex items-center rounded-full border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              aria-label="Increase quantity"
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted disabled:opacity-40"
              disabled={currentStock === 0 || quantity >= currentStock}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <p className={`text-sm font-semibold flex items-center gap-1.5 ${stockClass}`}>
          <span className="w-2 h-2 rounded-full bg-current" /> {stockLabel}
        </p>
      </div>


      {currentStock === 0 && (
        <NotifyMe
          key={activeVariant?.id ?? "product"}
          productId={product.id}
          variantId={activeVariant?.id}
          label={activeVariant ? [activeVariant.processor, activeVariant.ram, activeVariant.storage].filter(Boolean).join(" / ") : undefined}
        />
      )}


      {/* CTA buttons */}
      <div ref={ctaRef} className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={handleAddToCart}
          disabled={currentStock === 0}
          className="h-13 py-3.5 rounded-full border-2 border-brand-navy text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ShoppingCart size={18} /> Add to cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={currentStock === 0}
          className="py-3.5 rounded-full bg-brand-leaf text-white font-bold shadow-lg shadow-brand-leaf/25 hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Zap size={18} /> Buy now
        </button>
        <a
          href={whatsappLink(askText)}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:col-span-2 py-3 rounded-full bg-muted text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted/70"
        >
          <MessageCircle size={16} className="text-brand-leaf-dark" />
          {currentStock === 0 ? "Ask when it’s back in stock" : "Questions? Chat with us on WhatsApp"}
        </a>
      </div>


      {/* Delivery */}
      <div className="rounded-2xl bg-muted/60 divide-y divide-border">
        <DeliveryEstimate />
        <div className="flex gap-3 p-4">
          <Store className="w-5 h-5 text-primary shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Free store pickup</p>
            <p className="text-muted-foreground">Choose pickup at checkout and inspect it before you take it home.</p>
          </div>
        </div>
      </div>


      {isLaptop && <InTheBox />}


      {/* Mobile sticky buy bar */}
      {!ctaVisible && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{product.title}</p>
            <p className="font-display font-extrabold text-lg leading-tight">₹{displayPrice.toLocaleString("en-IN")}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            aria-label="Add to cart"
            className="w-12 h-12 grid place-items-center rounded-full border-2 border-brand-navy text-brand-navy disabled:opacity-40"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={currentStock === 0}
            className="h-12 px-6 rounded-full bg-brand-leaf text-white font-bold disabled:opacity-40"
          >
            Buy now
          </button>
        </div>
      )}
    </div>
  );
}
