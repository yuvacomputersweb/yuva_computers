// src/components/BrandLogo.tsx
// Logo symbol plus a text wordmark, so the name stays legible at header size.
const BrandLogo = ({ dark = false, className = "" }: { dark?: boolean; className?: string }) => (
  <span className={`flex items-center gap-2.5 ${className}`}>
    <img src="/logo-symbol.png" alt="" className="h-9 md:h-11 w-auto" />
    <span className="leading-none">
      <span className={`block font-display font-extrabold text-xl md:text-2xl tracking-tight ${dark ? "text-white" : "text-brand-navy"}`}>
        YUVA
      </span>
      <span className="block text-[9px] md:text-[10px] font-bold tracking-[0.32em] text-brand-leaf mt-0.5">
        COMPUTERS
      </span>
    </span>
  </span>
);

export default BrandLogo;
