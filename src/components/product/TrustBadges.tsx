import { Wrench, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";
import { useSiteConfig } from "@/lib/siteConfig";

/** Same promises on every product, from Admin → Site Configuration. */
export default function TrustBadges({ product }: { product: any }) {
  const c = useSiteConfig();
  if (!product) return null;

  const years = c.parts_warranty_months % 12 === 0 ? `${c.parts_warranty_months / 12}-year` : `${c.parts_warranty_months}-month`;
  const items = [
    { icon: BadgeCheck, text: c.refurbishment_summary },
    { icon: ShieldCheck, text: `${years} parts warranty` },
    { icon: RotateCcw, text: `${c.testing_warranty_days}-day replacement` },
    { icon: Wrench, text: c.service_summary },
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
