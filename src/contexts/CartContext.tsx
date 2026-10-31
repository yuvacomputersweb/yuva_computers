//cartcontext
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode
} from "react";
import { engageService } from "@/services/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  /** Windows laptops share one count per model across RAM/SSD options. */
  sharedStock?: boolean;
  variant?: string;       // Display label: "i5 / 8GB / 256GB SSD"
  variantId?: number;
  productId: number;
  /** Product code; matches the ad / Shopping product feed. */
  sku?: string;
  // Individual variant fields stored for order payload / merging logic
  processor?: string;
  ram?: string;
  storage?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number, variant?: any) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [items]);

  // Logged-in customers: keep a copy on the server so we can send one
  // WhatsApp reminder if they leave without ordering.
  useEffect(() => {
    let hasToken = false;
    try {
      hasToken = !!localStorage.getItem("yuvaToken");
    } catch {
      /* storage blocked */
    }
    if (!hasToken) return;
    const timer = window.setTimeout(() => {
      engageService
        .saveCart(
          items.map((i) => ({
            product_id: i.productId,
            variant_id: i.variantId ?? undefined,
            title: i.variant ? `${i.name} (${i.variant})` : i.name,
            quantity: i.quantity,
            price: i.price,
          }))
        )
        .catch(() => undefined);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [items]);

  const addToCart = useCallback((product: any, quantity: number, variant?: any) => {
    // UPDATED: cart item ID now includes processor for proper merging isolation
    // Format: productId-processor-ram-storage  (processor may be empty string)
    const id = variant
      ? `${product.id}-${variant.processor || ""}-${variant.ram}-${variant.storage}`
      : String(product.id);

    const stock = variant ? variant.stock : product.stock || 0;
    const price = variant?.final_price ?? Number(product.price);

    const image =
      product.images?.find((i: any) => i.is_primary)?.image ||
      product.images?.[0]?.image ||
      "";

    // Build human-readable variant label
    let variantLabel: string | undefined;
    if (variant) {
      const parts: string[] = [];
      if (variant.processor) parts.push(variant.processor);
      if (variant.ram) parts.push(variant.ram);
      if (variant.storage) parts.push(variant.storage);
      variantLabel = parts.join(" / ");
    }

    let success = false;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      const shared = product.stock_mode === "model";
      // Shared model stock: count every configuration of this model already in the cart.
      const currentQty = shared
        ? prev.filter((item) => item.productId === product.id).reduce((n, item) => n + item.quantity, 0)
        : existing ? existing.quantity : 0;

      if (currentQty + quantity <= stock) {
        success = true;

        if (existing) {
          return prev.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [
          ...prev,
          {
            id,
            productId: product.id,
            sku: product.sku,
            name: product.title,
            price,
            image,
            quantity,
            stock,
            sharedStock: shared,
            variant: variantLabel,
            variantId: variant?.id ?? null,
            processor: variant?.processor ?? undefined,
            ram: variant?.ram ?? undefined,
            storage: variant?.storage ?? undefined,
          }
        ];
      }

      return prev;
    });

    return success;
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const others = item.sharedStock
        ? prev.filter((i) => i.productId === item.productId && i.id !== id).reduce((n, i) => n + i.quantity, 0)
        : 0;
      if (quantity + others > item.stock) return prev;
      if (quantity <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  }, []);

  const removeFromCart = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems: items.reduce((s, i) => s + i.quantity, 0),
        totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
        isDrawerOpen,
        setDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};