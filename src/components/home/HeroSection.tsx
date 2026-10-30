// src/components/home/HeroSection.tsx
import { Link } from "react-router-dom";
import { ArrowRight, Star, MapPin } from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.jpg";
import { type ApiProduct, getCardPrice } from "@/types/product";
import { SITE, TRUST_POINTS } from "@/lib/site";
import { ProductImage } from "@/components/ProductCard";

const DEFAULT_STATS = [
  { label: "Products sold", value: "10,000+" },
  { label: "Happy customers", value: "7,000+" },
  { label: "Quality checks", value: "50+" },
  { label: "Trusted since", value: String(SITE.since) },
];

interface Props {
  stats?: { label: string; value: string }[];
  /** Optional product to feature on the hero card; hidden when the store is empty. */
  featured?: ApiProduct;
  storeCount?: number;
}

export const HeroSection = ({ stats, featured, storeCount }: Props) => {
  // The CMS currently returns a partial stats list; only use it when it is complete.
  const data = stats && stats.length >= 4 ? stats.slice(0, 4) : DEFAULT_STATS;
  const featuredPrice = featured ? getCardPrice(featured) : null;

  return (
    <section className="relative bg-hero text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-faint [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative container mx-auto px-4 md:px-6 pt-12 pb-10 md:pt-20 md:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        {/* Copy */}
        <div className="animate-fade-in">
          <a
            href={SITE.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
          >
            <span className="flex">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
            </span>
            Rated {SITE.googleRating} on Google · since {SITE.since}
          </a>

          <h1 className="mt-6 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Certified refurbished laptops.
            <span className="block text-brand-leaf">Smarter prices.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-white/70 leading-relaxed">
            Business-grade HP, Dell, Lenovo and Apple machines — inspected through a 50-point
            check and backed by Yuva’s warranty and stores across Telangana and Andhra Pradesh.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand-leaf text-white font-semibold shadow-lg shadow-brand-leaf/25 hover:brightness-110 transition"
            >
              Shop laptops <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/bulk-orders"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/25 font-semibold hover:bg-white/10 transition"
            >
              Bulk orders for business
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 max-w-lg">
            {TRUST_POINTS.map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-2 text-sm text-white/80">
                <Icon className="w-4 h-4 text-brand-leaf shrink-0" /> {title}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-[5/4]">
            <img src={heroLaptop} alt="Refurbished laptop" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
          </div>

          {featured && featuredPrice ? (
            <Link
              to={`/product/${featured.slug}`}
              className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:-left-8 sm:right-auto sm:w-80 flex items-center gap-3 rounded-2xl bg-white text-foreground p-3 pr-4 shadow-2xl hover:-translate-y-0.5 transition-transform"
            >
              <div className="w-20 h-16 rounded-xl bg-muted shrink-0 overflow-hidden">
                <ProductImage src={featured.images?.[0]?.image} alt={featured.title} className="w-full h-full p-1" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-leaf-dark">Deal of the day</p>
                <p className="text-sm font-semibold truncate">{featured.title}</p>
                <p className="text-sm">
                  <span className="font-extrabold">₹{featuredPrice.price.toLocaleString("en-IN")}</span>
                  {featuredPrice.originalPrice && featuredPrice.originalPrice > featuredPrice.price && (
                    <span className="ml-2 text-xs text-muted-foreground line-through">
                      ₹{featuredPrice.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ) : (
            <Link
              to="/stores"
              className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:-left-8 sm:right-auto sm:w-72 flex items-center gap-3 rounded-2xl bg-white text-foreground p-4 shadow-2xl hover:-translate-y-0.5 transition-transform"
            >
              <span className="w-11 h-11 rounded-xl bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">
                  {storeCount ? `${storeCount} stores near you` : "Visit a store near you"}
                </span>
                <span className="block text-xs text-muted-foreground">Try before you buy →</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="relative border-t border-white/10 bg-white/[0.03]">
        <dl className="container mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4">
          {data.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-6 md:py-8 text-center ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-white/10" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">{stat.value}</dd>
              <dd className="text-xs md:text-sm text-white/60 mt-1">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
