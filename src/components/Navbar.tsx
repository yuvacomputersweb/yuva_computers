import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Search, User, Menu, X,
  ChevronDown, Package, LogOut, Loader2, Phone, MessageCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { storeService } from "@/services/api";
import { SITE, TRUST_POINTS, whatsappLink } from "@/lib/site";
import MegaMenu from "./MegaMenu";
import BrandLogo from "./BrandLogo";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  sku: string;
  price: number;
  original_price?: number;
  image?: string;
  category_name: string;
  brand_name: string;
  discount_percentage: number;
}

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/products", hasMega: true },
  { label: "Bulk Orders", path: "/bulk-orders" },
  { label: "Stores", path: "/stores" },
  { label: "Company", path: "/company" },
  { label: "Contact", path: "/contact" },
];

/** Thin navy strip with the store's guarantees, scrolling on small screens. */
const TrustStrip = () => {
  const items = [...TRUST_POINTS, ...TRUST_POINTS];
  return (
    <div className="bg-brand-navy text-white/80 text-xs">
      <div className="container mx-auto px-4 md:px-6 h-9 flex items-center justify-between gap-6">
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee lg:animate-none gap-10">
            {items.map(({ icon: Icon, title }, i) => (
              <span
                key={i}
                aria-hidden={i >= TRUST_POINTS.length}
                className={`flex items-center gap-1.5 whitespace-nowrap ${i >= TRUST_POINTS.length ? "lg:hidden" : ""}`}
              >
                <Icon className="w-3.5 h-3.5 text-brand-leaf" />
                {title}
              </span>
            ))}
          </div>
        </div>
        <a href={`tel:+91${SITE.phone}`} className="hidden lg:flex items-center gap-1.5 shrink-0 hover:text-white">
          <Phone className="w-3.5 h-3.5" /> {SITE.phoneDisplay}
        </a>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuData, setMenuData] = useState<{ categories: any[]; usageTags: any[]; brands: any[] }>({
    categories: [],
    usageTags: [],
    brands: []
  });

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ products: SearchResult[] }>({ products: [] });
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { totalItems, setDrawerOpen } = useCart();

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [categories, usageTags, brands] = await Promise.all([
          storeService.getCategories(),
          storeService.getUsageTags(),
          storeService.getBrands()
        ]);
        setMenuData({ categories, usageTags, brands });
      } catch (e) {
        console.error("Failed to load menu data", e);
      }
    };
    fetchMenuData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          const results = await storeService.searchProducts(searchQuery);
          setSearchResults(results);
        } catch (error) {
          setSearchResults({ products: [] });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ products: [] });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close the search dropdown when clicking anywhere else
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!searchRef.current?.contains(target) && !mobileSearchRef.current?.contains(target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const resetSearch = () => {
    setSearchFocused(false);
    setSearchQuery("");
    setSearchResults({ products: [] });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      resetSearch();
    }
  };

  const showResults = searchFocused && searchQuery.length > 0;

  const renderSearch = (ref: React.RefObject<HTMLFormElement>, className: string) => (
    <form ref={ref} onSubmit={handleSearchSubmit} role="search" className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        placeholder="Search laptops & brands…"
        aria-label="Search products"
        className="w-full h-11 pl-11 pr-24 rounded-full bg-muted border border-transparent focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none text-sm transition"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
      >
        Search
      </button>

      {showResults && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : searchResults.products.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No products match “{searchQuery}”.</p>
            ) : (
              searchResults.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={resetSearch}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted border-b border-border last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                    {product.image && <img src={product.image} alt="" className="w-full h-full object-contain" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.brand_name} · <span className="text-foreground font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
          {searchResults.products.length > 0 && (
            <button type="submit" className="w-full px-4 py-3 text-sm font-semibold text-primary bg-muted/60 hover:bg-muted text-left">
              See all results for “{searchQuery}”
            </button>
          )}
        </div>
      )}
    </form>
  );

  const iconButton = "relative w-10 h-10 grid place-items-center rounded-full hover:bg-muted transition-colors";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-border">
        <TrustStrip />

        {/* MAIN ROW */}
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-4 lg:gap-8 h-16 md:h-[72px]">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden -ml-2 w-10 h-10 grid place-items-center rounded-full hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="shrink-0" aria-label="Yuva Computers home">
            <BrandLogo />
          </Link>

          {renderSearch(searchRef, "hidden md:block flex-1 max-w-2xl")}

          <div className="flex items-center gap-1 ml-auto shrink-0">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 h-10 px-4 mr-1 rounded-full border border-border text-sm font-semibold hover:border-brand-leaf hover:text-brand-leaf-dark transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-brand-leaf" /> Help me choose
            </a>

            <button onClick={() => setDrawerOpen(true)} aria-label="Open cart" className={iconButton}>
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center text-[10px] font-bold bg-brand-leaf text-white rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setProfileOpen((prev) => !prev)} aria-label="Account" className={iconButton}>
                  <User className="w-5 h-5" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-border shadow-xl rounded-xl p-1.5 z-50">
                    <button
                      onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-muted"
                    >
                      <Package size={16} /> My orders & profile
                    </button>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); navigate("/"); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-red-600 text-left hover:bg-muted"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden sm:flex items-center gap-2 h-10 px-4 ml-1 rounded-full bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-soft"
              >
                <User className="w-4 h-4" /> Login
              </button>
            )}
            {!isLoggedIn && (
              <button onClick={() => navigate("/login")} aria-label="Login" className={`sm:hidden ${iconButton}`}>
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden container mx-auto px-4 pb-3">
          {renderSearch(mobileSearchRef, "w-full")}
        </div>

        {/* DESKTOP NAV ROW */}
        <nav className="relative hidden lg:block border-t border-border" onMouseLeave={() => setMegaOpen(false)}>
          <div className="container mx-auto px-6 flex items-center gap-1 h-11">
            {navLinks.map((link) => (
              <div key={link.label} onMouseEnter={() => setMegaOpen(!!link.hasMega)}>
                <NavLink
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 h-11 text-sm font-medium border-b-2 transition-colors ${
                      isActive ? "border-brand-leaf text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {link.label} {link.hasMega && <ChevronDown className="w-3.5 h-3.5" />}
                </NavLink>
              </div>
            ))}
            <Link
              to="/products?is_best_deal=true"
              className="ml-auto text-sm font-semibold text-brand-leaf-dark hover:underline"
            >
              Today’s best deals →
            </Link>
          </div>
          {megaOpen && (
            <div className="absolute left-0 right-0 top-full">
              <MegaMenu onClose={() => setMegaOpen(false)} categories={menuData.categories} usageTags={menuData.usageTags} brands={menuData.brands} />
            </div>
          )}
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[100] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <BrandLogo />
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-3 px-3 font-bold text-lg border-b border-border">
                Home
              </Link>
              <div className="py-2 border-b border-border">
                <MegaMenu
                  onClose={() => setMobileOpen(false)}
                  categories={menuData.categories}
                  usageTags={menuData.usageTags}
                  isMobile={true}
                />
              </div>
              <div className="pt-1">
                {navLinks.filter((l) => !["/", "/products"].includes(l.path)).map((l) => (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-3 font-semibold text-sm border-b border-border last:border-b-0 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-4 border-t grid grid-cols-2 gap-2 shrink-0">
              <a href={`tel:+91${SITE.phone}`} className="flex items-center justify-center gap-2 h-11 rounded-full border border-border text-sm font-semibold">
                <Phone className="w-4 h-4" /> Call
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-11 rounded-full bg-brand-leaf text-white text-sm font-semibold">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
