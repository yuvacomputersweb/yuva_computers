import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react"; // Added X icon
import { useNavigate } from "react-router-dom";
import { authService, storeService } from "@/services/api";
import { toast } from "sonner";

export default function ReviewSection({ product, activeVariant }: { product: any; activeVariant: any }) {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      setUser(authService.getStoredUser());
    }
  }, []);

  const sortedReviews = product.reviews 
    ? [...product.reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 320 + 24; 
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      // Ensure the backend receives the variant info
      formData.append("variant_info", `${activeVariant?.ram || ''} | ${activeVariant?.storage || ''}`);
      
      await storeService.addReview(product.slug, formData);
      toast.success("Review submitted!");
      window.location.reload(); 
    } catch { toast.error("Failed to submit review"); }
  };

  return (
    <section className="relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">Customer reviews</h2>
        {/* Toggle Form Open directly */}
        <button 
          onClick={() => authService.isLoggedIn() ? setIsFormOpen(!isFormOpen) : navigate("/login")} 
          className="h-10 px-5 rounded-full bg-brand-navy text-white text-sm font-semibold"
        >
          {isFormOpen ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {isFormOpen && user && (
        <div className="mb-8 p-6 border rounded-xl bg-card shadow-lg max-w-2xl relative animate-in fade-in">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
             <X size={20} />
          </button>
          
          <h3 className="font-bold text-xl mb-1">Reviewing: {product.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{activeVariant?.ram} | {activeVariant?.storage}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
               <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                 {user.first_name?.charAt(0).toUpperCase()}
               </div>
               <div>
                  <p className="font-bold">{user.first_name} {user.last_name}</p>
               </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} onClick={() => setRating(s)} className={`cursor-pointer w-8 h-8 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
              ))}
            </div>
            <textarea className="w-full p-4 border rounded-lg mb-4 min-h-[120px]" placeholder="Share your experience..." onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold">Post Review</button>
          </form>
        </div>
      )}

      {/* Reviews List with Arrows */}
      <div className="relative group">
        <button onClick={() => scroll("left")} className="absolute -left-4 top-1/2 z-10 p-2 bg-card border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft />
        </button>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {sortedReviews.map((r: any) => (
            <div key={r.id} className="min-w-[300px] p-6 border border-border rounded-2xl bg-card flex flex-col gap-3">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-xl">
                    {r.user_name?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <p className="font-bold">{r.user_name}</p>
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < r.rating ? "fill-current" : "text-muted"} />)}
                    </div>
                 </div>
               </div>
               <div className="text-xs bg-muted p-2 rounded text-muted-foreground font-medium">
                  {product.title} <br/> {r.variant_info || "Standard Variant"}
               </div>
               <p className="text-muted-foreground text-sm leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>

        <button onClick={() => scroll("right")} className="absolute -right-4 top-1/2 z-10 p-2 bg-card border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}