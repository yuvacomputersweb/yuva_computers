//cartdrawer
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Store } from "lucide-react";
import { ProductImage } from "./ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, isDrawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={() => setDrawerOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-card z-[70] shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-leaf-dark" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Your cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="w-10 h-10 grid place-items-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="w-16 h-16 rounded-2xl bg-muted grid place-items-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
              </span>
              <p className="font-display font-bold text-lg text-foreground">Your cart is empty</p>
              <p className="text-muted-foreground text-sm mt-1">Find a certified laptop that fits your budget.</p>
              <button
                onClick={() => { setDrawerOpen(false); navigate('/products'); }}
                className="mt-5 h-11 px-6 rounded-full bg-brand-navy text-white text-sm font-semibold"
              >
                Browse laptops
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-border p-3">
                <div className="w-20 h-20 rounded-xl bg-muted shrink-0 overflow-hidden">
                  <ProductImage src={item.image} alt={item.name} className="w-full h-full p-1.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                    {item.name}
                  </p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.variant}
                    </p>
                  )}
                  <p className="font-display font-extrabold text-foreground mt-1.5">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) removeFromCart(item.id);
                        else updateQuantity(item.id, item.quantity - 1);
                      }}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      {item.quantity === 1
                        ? <Trash2 className="w-3 h-3 text-destructive" />
                        : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto p-1.5 text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-border space-y-4 bg-card">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="font-display font-extrabold text-xl text-foreground">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-leaf-dark" /> 50-point checked</span>
              <span className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-brand-leaf-dark" /> Free store pickup</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery charges, if any, are shown at checkout.</p>
            <button
              onClick={() => { setDrawerOpen(false); navigate('/checkout'); }}
              className="w-full h-13 py-4 rounded-full bg-brand-leaf text-white font-bold hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              Checkout securely <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;