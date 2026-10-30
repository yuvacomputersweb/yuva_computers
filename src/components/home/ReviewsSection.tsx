import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { engageService } from "@/services/api";
import { SITE } from "@/lib/site";

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  googleUrl?: string;
  photo?: string;
  when?: string;
}

interface LiveReviews {
  available: boolean;
  rating?: number;
  total?: number;
  url?: string;
  reviews?: { author: string; photo: string; rating: number; text: string; when: string }[];
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Manideep Kumar",
    rating: 5,
    text: "I bought i7 7th gen dell lap for 22,00 .As mentioned in video even spin wheel and student id Card offer is Also there. Best laptop store for Students to buy in low price refurbished laptops",
    googleUrl: "https://share.google/LwgmvVjPdKekWMiwH",
  },
  {
    id: 2,
    name: "Ashok Kumar Duggi",
    rating: 5,
    text: "Yuva computers located Dilshik nagar Hyderabad giving best service and refurbished laptops. Very reasonable prizes and all with high quality to meet the present customer (students, businesses person, employees) needs. Nice offers also there like spinning wheel discount. Latops range starts from 15000 and i5, i7 processors. Low cost and best service. What we seen youtube and face book videos it's true and it's very reasonable and affordable prices.",
    googleUrl: "https://share.google/RPmNz7ZD39H5WMwhH",
  },
  {
    id: 3,
    name: "Venu Ponnoji",
    rating: 5,
    text: "Very good positive response from the team of Yuva…. We bought 3 laptops couple of days back and noticed few minor issues but they take full responsibility and rectified the issue very quickly. Overall my experience is awesome service and got best premium laptops in reasonable price.. thanks to Yuva computers for providing affordable laptops",
    googleUrl: "https://share.google/bHpYEAk24xtAd67F2",
  },
];

const GoogleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
  </svg>
);

export const ReviewsSection = () => {
  // Live reviews from the Google Business profile when the API key is set up.
  const [live, setLive] = useState<LiveReviews | null>(null);
  useEffect(() => {
    engageService.getGoogleReviews().then(setLive).catch(() => setLive(null));
  }, []);

  const liveReviews: Review[] =
    live?.available && live.reviews?.length
      ? live.reviews.map((r, i) => ({ id: i, name: r.author, rating: r.rating, text: r.text, photo: r.photo, when: r.when, googleUrl: live.url }))
      : [];
  const data = liveReviews.length >= 3 ? liveReviews : DEFAULT_REVIEWS;
  const rating = live?.available && live.rating ? live.rating.toFixed(1) : SITE.googleRating;
  const ratingNum = Number(rating);
  const reviewsUrl = (live?.available && live.url) || SITE.googleReviewsUrl;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 md:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-brand-leaf-dark">Customer reviews</p>
          <h2 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight">Trusted by 7,000+ customers</h2>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
          {/* Rating summary */}
          <div className="rounded-2xl bg-brand-navy text-white p-7 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <GoogleLogo className="w-5 h-5" /> Google rating
              </div>
              <p className="mt-4 font-display font-extrabold text-6xl">{rating}</p>
              <div className="flex mt-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(ratingNum) ? "fill-amber-400 text-amber-400" : "fill-amber-400/40 text-amber-400/40"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm text-white/60">
                {live?.available && live.total ? `From ${live.total.toLocaleString("en-IN")} Google reviews.` : "From verified Google reviews across our stores."}
              </p>
            </div>
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 rounded-full bg-white text-brand-navy text-sm font-semibold hover:bg-white/90"
            >
              Read all reviews
            </a>
          </div>

          {/* Review cards */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
            {data.slice(0, 3).map((r) => (
              <a
                key={r.id}
                href={r.googleUrl || reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 w-[85%] md:w-auto flex flex-col rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <GoogleLogo className="w-5 h-5 text-muted-foreground/60" />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-6">“{r.text}”</p>
                <div className="mt-auto pt-5 flex items-center gap-3">
                  {r.photo ? (
                    <img src={r.photo} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 grid place-items-center text-primary text-sm font-bold">
                      {r.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">Google review{r.when ? ` · ${r.when}` : ""}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
