import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { useShopLists } from "@/contexts/ShopListsContext";

const WishlistPage = () => {
  const { wishlist } = useShopLists();

  return (
    <>
      <SEO title="My Wishlist | Yuva Computers" noindex={true} />
      <PageHero eyebrow="Saved for later" title="Your wishlist" crumbs={[{ label: "Wishlist" }]} />
      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <span className="mx-auto w-14 h-14 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
              <Heart className="w-7 h-7" />
            </span>
            <h2 className="mt-5 font-display font-bold text-xl">No saved laptops yet</h2>
            <p className="mt-2 text-muted-foreground">Tap the heart on any product to save it here.</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-brand-navy text-white font-semibold">
              Browse laptops <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
};

export default WishlistPage;
