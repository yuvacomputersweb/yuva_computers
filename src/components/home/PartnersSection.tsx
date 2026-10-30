import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { contentService } from "@/services/api";

const FALLBACK_PARTNERS = [
  { name: "DELL", color: "#254fa0" },
  { name: "HP", color: "#34a1da" },
  { name: "LENOVO", color: "#1c6a0e" },
  { name: "APPLE", color: "#7fc140" },
  { name: "ASUS", color: "#d62828" },
  { name: "ACER", color: "#f77f00" },
];

export const PartnersSection = () => {
  const [partners, setPartners] = useState(FALLBACK_PARTNERS);

  useEffect(() => {
    contentService.getHomeContent()
      .then(data => {
        if (data.partners?.length > 0) {
          setPartners(data.partners.map((p: any, i: number) => ({
            name: p.name,
            color: p.color || FALLBACK_PARTNERS[i % FALLBACK_PARTNERS.length]?.color || '#888',
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 md:py-14 border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-8">
        <p className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Brands we sell & service
        </p>
      </div>
      <div className="relative flex overflow-hidden whitespace-nowrap w-full group">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          className="flex gap-16 lg:gap-24 items-center shrink-0 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {[...partners, ...partners].map((p, i) => (
            <span
              key={i}
              className="font-display font-extrabold text-2xl tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {p.name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};