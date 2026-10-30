import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Search } from "lucide-react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO title="Page Not Found | Yuva Computers" noindex={true} />
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
        <p className="font-display font-extrabold text-7xl md:text-8xl text-brand-leaf tracking-tight">404</p>
        <h1 className="mt-4 font-display font-extrabold text-3xl md:text-4xl tracking-tight">This page has moved or doesn’t exist</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          The laptop you were looking for may have just been sold. Try searching, or start from one of these.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/products" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand-navy text-white font-semibold">
            <Search className="w-4 h-4" /> Browse laptops
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-border font-semibold hover:bg-muted">
            Go to homepage <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
