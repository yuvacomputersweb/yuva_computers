// Promotional banners from Admin → Content → Hero slides.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PromoSlide {
  id: number;
  image: string;
  mobile_image?: string | null;
  title?: string;
  link?: string;
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

export const PromoCarousel = ({ slides }: { slides: PromoSlide[] }) => {
  const [index, setIndex] = useState(0);
  const count = slides?.length || 0;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count]);

  if (!count) return null;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section className="container mx-auto px-4 md:px-6 pt-8 md:pt-12" aria-roledescription="carousel" aria-label="Offers">
      <div className="relative overflow-hidden rounded-3xl bg-muted">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => {
            const picture = (
              <picture>
                {s.mobile_image && <source media="(max-width: 640px)" srcSet={s.mobile_image} />}
                <img
                  src={s.image}
                  alt={s.title || "Yuva Computers offer"}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`w-full object-cover ${s.mobile_image ? "aspect-square sm:aspect-[3/1]" : "aspect-[3/1]"}`}
                />
              </picture>
            );
            const wrap = "block w-full shrink-0";
            if (!s.link) return <div key={s.id} className={wrap} aria-hidden={i !== index}>{picture}</div>;
            return isExternal(s.link) ? (
              <a key={s.id} href={s.link} target="_blank" rel="noopener noreferrer" className={wrap} aria-hidden={i !== index} tabIndex={i === index ? 0 : -1}>{picture}</a>
            ) : (
              <Link key={s.id} to={s.link} className={wrap} aria-hidden={i !== index} tabIndex={i === index ? 0 : -1}>{picture}</Link>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous offer" className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next offer" className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show offer ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
