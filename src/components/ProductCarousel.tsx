import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

// 'any' is used here to safely accept the API response structure 
// that contains nested images, variants, and usage_tags arrays.
interface ProductCarouselProps {
  products: any[]; 
  title?: string;
}

const ProductCarousel = ({ products, title }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ 
      left: dir === "left" ? -amount : amount, 
      behavior: "smooth" 
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group/carousel w-full">
      {title && <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-6">{title}</h2>}
      
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg border border-border/30 items-center justify-center text-foreground hover:bg-muted transition-opacity opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[260px] shrink-0">
            {/* The 'p' object passed here matches the structure of your ProductListSerializer */}
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg border border-border/30 items-center justify-center text-foreground hover:bg-muted transition-opacity opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ProductCarousel;