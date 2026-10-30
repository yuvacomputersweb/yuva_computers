// src/components/PageHero.tsx
// Shared navy header band for content pages.
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  /** Breadcrumb trail after "Home"; the last item is the current page. */
  crumbs?: { label: string; to?: string }[];
  children?: React.ReactNode;
  image?: string;
}

const PageHero = ({ eyebrow, title, text, crumbs = [], children, image }: Props) => (
  <section className="relative bg-hero text-white overflow-hidden">
    <div className="absolute inset-0 bg-grid-faint [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    {image && (
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" />
    )}
    <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-20">
      {crumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {c.to ? <Link to={c.to} className="hover:text-white">{c.label}</Link> : <span className="text-white/80">{c.label}</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf mb-3">{eyebrow}</p>}
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1]">{title}</h1>
      {text && <p className="mt-4 text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">{text}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>
);

export default PageHero;
