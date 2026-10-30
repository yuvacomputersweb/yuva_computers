import { Wrench, ShieldCheck, RotateCcw, BadgeCheck, Truck } from "lucide-react";
import { useSiteConfig, type WarrantyPlan } from "@/lib/siteConfig";

/** The product's warranty plan plus the promises every product gets. */
export default function TrustBadges({ product }: { product: any }) {
  const c = useSiteConfig();
  if (!product) return null;
  const plan: WarrantyPlan | undefined = product.warranty;

  const items = [
    { icon: BadgeCheck, text: c.refurbishment_summary },
    { icon: ShieldCheck, text: plan?.badge || product.warranty_badge || "Warranty included" },
    plan && plan.testing_days > 0
      ? { icon: RotateCcw, text: `${plan.testing_days}-day testing warranty` }
      : { icon: Wrench, text: c.service_summary },
    { icon: Truck, text: "Transit damage covered" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ icon: Icon, text }) => (
        <a
          key={text}
          href="#details"
          className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-semibold hover:border-foreground/30"
        >
          <span className="w-8 h-8 shrink-0 rounded-lg bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center">
            <Icon size={16} />
          </span>
          {text}
        </a>
      ))}
    </div>
  );
}
