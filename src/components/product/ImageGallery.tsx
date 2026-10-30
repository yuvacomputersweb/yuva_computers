//reference product image gallery section
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ProductCard";

export default function ImageGallery({ product }: { product: any }) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const images = product.images || [];
  const count = images.length;

  const go = (dir: -1 | 1) => setCurrent((prev) => (prev + dir + count) % count);

  const handleShare = async () => {
    // 1) Professional Native Share (WhatsApp, Instagram, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this product: ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback if user cancels or sharing fails
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const roundButton = "w-10 h-10 grid place-items-center rounded-full bg-white shadow-md border border-border hover:bg-muted";

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails */}
      {count > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[560px] scrollbar-hide">
          {images.map((img: any, i: number) => (
            <button
              key={img.id ?? i}
              onClick={() => setCurrent(i)}
              aria-label={`Show image ${i + 1}`}
              className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-muted overflow-hidden border-2 transition-colors ${
                current === i ? "border-brand-navy" : "border-transparent hover:border-border"
              }`}
            >
              <ProductImage src={img.image} alt="" className="w-full h-full p-1.5" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-square rounded-3xl bg-gradient-to-b from-muted to-muted/40 overflow-hidden">
        <button
          onClick={() => count && setZoomed(true)}
          className="w-full h-full cursor-zoom-in"
          aria-label="Zoom image"
        >
          <ProductImage src={images[current]?.image} alt={product.title} className="w-full h-full p-8" />
        </button>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button onClick={handleShare} aria-label="Share" className={roundButton}>
            <Share2 size={16} />
          </button>
          {count > 0 && (
            <button onClick={() => setZoomed(true)} aria-label="Zoom" className={roundButton}>
              <ZoomIn size={16} />
            </button>
          )}
        </div>

        {count > 1 && (
          <>
            <button className={`absolute left-3 top-1/2 -translate-y-1/2 ${roundButton}`} onClick={() => go(-1)} aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button className={`absolute right-3 top-1/2 -translate-y-1/2 ${roundButton}`} onClick={() => go(1)} aria-label="Next image">
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Fullscreen zoom */}
      {zoomed && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
          <button className="absolute top-4 right-4 z-10 w-12 h-12 grid place-items-center rounded-full bg-brand-navy text-white" onClick={() => setZoomed(false)} aria-label="Close">
            <X size={24} />
          </button>
          {count > 1 && (
            <>
              <button className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${roundButton}`} onClick={() => go(-1)} aria-label="Previous image">
                <ChevronLeft size={18} />
              </button>
              <button className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 ${roundButton}`} onClick={() => go(1)} aria-label="Next image">
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <img src={images[current]?.image} alt={product.title} className="w-full h-full object-contain p-4" />
        </div>
      )}
    </div>
  );
}
