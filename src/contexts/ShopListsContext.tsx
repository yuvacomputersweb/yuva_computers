// Wishlist and compare lists, kept in the visitor's browser.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ApiProduct } from "@/types/product";

export const MAX_COMPARE = 3;

interface ShopListsContextType {
  wishlist: ApiProduct[];
  compare: ApiProduct[];
  isWishlisted: (id: number) => boolean;
  isCompared: (id: number) => boolean;
  toggleWishlist: (product: ApiProduct) => void;
  toggleCompare: (product: ApiProduct) => void;
  clearCompare: () => void;
}

const ShopListsContext = createContext<ShopListsContextType | undefined>(undefined);

const load = (key: string): ApiProduct[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (key: string, value: ApiProduct[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the lists still work for this visit.
  }
};

export const ShopListsProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<ApiProduct[]>(() => load("wishlist"));
  const [compare, setCompare] = useState<ApiProduct[]>(() => load("compare"));

  useEffect(() => save("wishlist", wishlist), [wishlist]);
  useEffect(() => save("compare", compare), [compare]);

  const toggleWishlist = useCallback((product: ApiProduct) => {
    setWishlist((list) => {
      if (list.some((p) => p.id === product.id)) return list.filter((p) => p.id !== product.id);
      toast.success("Saved to your wishlist");
      return [product, ...list];
    });
  }, []);

  const toggleCompare = useCallback((product: ApiProduct) => {
    setCompare((list) => {
      if (list.some((p) => p.id === product.id)) return list.filter((p) => p.id !== product.id);
      if (list.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} products`);
        return list;
      }
      return [...list, product];
    });
  }, []);

  return (
    <ShopListsContext.Provider
      value={{
        wishlist,
        compare,
        isWishlisted: (id) => wishlist.some((p) => p.id === id),
        isCompared: (id) => compare.some((p) => p.id === id),
        toggleWishlist,
        toggleCompare,
        clearCompare: () => setCompare([]),
      }}
    >
      {children}
    </ShopListsContext.Provider>
  );
};

export const useShopLists = () => {
  const ctx = useContext(ShopListsContext);
  if (!ctx) throw new Error("useShopLists must be used inside ShopListsProvider");
  return ctx;
};
