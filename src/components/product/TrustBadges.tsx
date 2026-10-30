import { Wrench, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";

export default function TrustBadges({ product }: { product: any }) {
  if (!product) return null;

  // Per-product values come from the admin; fall back to store-wide policy.
  const items = [
    { icon: BadgeCheck, text: product.refurbishment_summary || "50-point quality check" },
    { icon: ShieldCheck, text: product.warranty_period || "Warranty included" },
    { icon: RotateCcw, text: product.return_policy || "7-day returns on online orders" },
    { icon: Wrench, text: product.service_centers || "Service at every Yuva store" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold">
          <span className="w-8 h-8 shrink-0 rounded-lg bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center">
            <Icon size={16} />
          </span>
          {text}
        </div>
      ))}
    </div>
  );
}
