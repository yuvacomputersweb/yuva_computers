//productcard
import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Laptop, BadgeCheck, ArrowRight } from "lucide-react";
import { type ApiProduct, getCardPrice, getPrimaryVariant } from "@/types/product";
import { normalizeProcessor, normalizeSize } from "@/lib/specs";

const conditionStyles: Record<string, string> = {
  like_new: "bg-brand-leaf text-white",
  excellent: "bg-primary text-primary-foreground",
  good: "bg-brand-sky text-white",
  value: "bg-brand-navy text-white",
};

/** Product image with a neutral laptop fallback when the file is missing. */
export const ProductImage = ({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`grid place-items-center text-muted-foreground/40 ${className}`} aria-label={alt} role="img">
        <Laptop className="w-1/3 h-1/3" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
};

const ProductCard = ({ product }: { product: ApiProduct }) => {
  const primaryImage = product.images?.find((i) => i.is_primary)?.image || product.images?.[0]?.image;

  // ── Price: cheapest in-stock variant ────────────────────────────────────
  const { price, originalPrice } = getCardPrice(product);
  const hasDiscount = !!originalPrice && originalPrice > price;
  const discount = product.discount_percentage
    || (hasDiscount ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0);

  // ── Spec chips for the cheapest variant (processor / RAM / storage) ─────
  // Variants are the single source of truth; products without variants
  // fall back to their display size only.
  const primary = getPrimaryVariant(product);
  const specs = primary
    ? [
        primary.processor && normalizeProcessor(primary.processor),
        primary.ram && `${normalizeSize(primary.ram)} RAM`,
        primary.storage && normalizeSize(primary.storage),
      ].filter(Boolean) as string[]
    : [];
  const variantCount = product.variants?.length ?? 0;
  const chips = specs.length > 0 ? specs : [product.display].filter(Boolean) as string[];

  return (
    <div className="group relative bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full overflow-hidden">
      <Link to={`/product/${product.slug}`} className="block" aria-label={product.title}>
        <div className="relative bg-gradient-to-b from-muted/80 to-muted/30 aspect-[4/3] overflow-hidden">
          <span
            className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              conditionStyles[product.condition] || "bg-muted text-foreground"
            }`}
          >
            {product.condition_display || product.condition}
          </span>
          {discount > 0 && (
            <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold bg-white text-brand-leaf-dark shadow-sm">
              {discount}% OFF
            </span>
          )}
          <ProductImage
            src={primaryImage}
            alt={product.title}
            className="w-full h-full p-6 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
            {product.brand_name}
            {product.usage_tags?.[0] && <span className="text-primary"> · {product.usage_tags[0].name}</span>}
          </p>
          {(product.review_count ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.average_rating}
              <span className="text-muted-foreground font-normal">({product.review_count})</span>
            </span>
          )}
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display font-bold text-foreground text-sm sm:text-[15px] leading-snug line-clamp-2 min-h-[2.6em] hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {chips.map((label) => (
              <span key={label} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                {label}
              </span>
            ))}
            {variantCount > 1 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                {variantCount} configs
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          <p className="text-[11px] text-muted-foreground">{variantCount > 1 ? "Starting from" : "Price"}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display font-extrabold text-lg sm:text-xl text-foreground">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{originalPrice!.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <p className="hidden sm:flex items-center gap-1 mt-1 text-[11px] font-medium text-brand-leaf-dark">
            <BadgeCheck className="w-3.5 h-3.5" /> 50-point quality checked
          </p>

          <Link
            to={`/product/${product.slug}`}
            className="mt-3 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-brand-navy text-white text-sm font-semibold group-hover:bg-primary transition-colors"
          >
            View details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
