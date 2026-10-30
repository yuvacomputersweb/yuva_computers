// Floating WhatsApp button and the compare tray, shown on every page.
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Scale, X } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { useShopLists } from "@/contexts/ShopListsContext";

const FloatingActions = () => {
  const { pathname } = useLocation();
  const { compare, clearCompare } = useShopLists();
  // The product page has its own sticky buy bar on phones; sit above it.
  const raised = pathname.startsWith("/product/");
  const showTray = compare.length > 0 && pathname !== "/compare";

  return (
    <>
      {showTray && (
        <div className={`fixed left-1/2 -translate-x-1/2 z-40 ${raised ? "bottom-24 lg:bottom-6" : "bottom-6"} flex items-center gap-1 rounded-full bg-brand-navy text-white shadow-2xl pl-2 pr-1 py-1`}>
          <Link to="/compare" className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full text-sm font-semibold hover:bg-white/10">
            <Scale className="w-4 h-4 text-brand-leaf" /> Compare ({compare.length})
          </Link>
          <button onClick={clearCompare} aria-label="Clear compare list" className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Yuva Computers on WhatsApp"
        className={`fixed right-4 md:right-6 z-40 ${raised ? "bottom-24 lg:bottom-6" : "bottom-5 md:bottom-6"} w-14 h-14 grid place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 hover:scale-105 transition-transform`}
      >
        <MessageCircle className="w-7 h-7" fill="currentColor" strokeWidth={0} />
        <span className="sr-only">WhatsApp</span>
      </a>
    </>
  );
};

export default FloatingActions;
