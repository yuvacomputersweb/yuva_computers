// src/components/home/BrandSections.tsx
// "Why Yuva", store network and bulk-order call to action.
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Building2, CheckCircle2 } from "lucide-react";
import workshopImg from "/about.png";
import { SITE, TRUST_POINTS } from "@/lib/site";
import { SectionHeading, ViewAllLink } from "./ShopSections";

interface AboutContent {
  heading?: string;
  mission_text?: string;
  about_image_1?: string;
}

export const WhyYuva = ({ about }: { about?: AboutContent | null }) => (
  <section className="py-14 md:py-24">
    <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="relative order-last lg:order-first">
        <div className="rounded-[2rem] overflow-hidden aspect-[4/3] bg-muted">
          <img
            src={about?.about_image_1 || workshopImg}
            onError={(e) => { e.currentTarget.src = workshopImg; }}
            alt="Technician testing a refurbished laptop at the Yuva workshop"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-6 right-4 md:-right-6 rounded-2xl bg-brand-navy text-white px-6 py-5 shadow-2xl">
          <p className="font-display font-extrabold text-4xl">{new Date().getFullYear() - SITE.since}+</p>
          <p className="text-sm text-white/70">years refurbishing laptops</p>
        </div>
      </div>

      <div>
        <SectionHeading
          eyebrow="Why Yuva Computers"
          title={about?.heading || `Every laptop inspected. Every price honest.`}
          text={
            about?.mission_text ||
            "We source business-grade machines, then test, repair and clean every one in our own workshop before it reaches you."
          }
        />
        <div className="grid sm:grid-cols-2 gap-4">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border p-5 bg-card">
              <span className="w-10 h-10 rounded-xl bg-brand-leaf/15 text-brand-leaf-dark grid place-items-center">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-display font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <Link to="/company" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          More about our process <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

interface StoreItem {
  id: number;
  name: string;
  state: string;
  phone?: string;
  maps_url?: string;
}

const shortName = (name: string) => name.replace(/^Yuva Computers\s*[–-]\s*/i, "");

export const StoresSection = ({ stores }: { stores: StoreItem[] }) => {
  const byState = stores.reduce<Record<string, StoreItem[]>>((acc, s) => {
    (acc[s.state] ||= []).push(s);
    return acc;
  }, {});
  const states = Object.keys(byState);

  return (
    <section className="py-14 md:py-20 bg-muted/60">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          eyebrow="Visit us"
          title={stores.length ? `${stores.length} stores. Try before you buy.` : "Try before you buy at a Yuva store"}
          text="See the exact laptop in person, get expert advice and walk out with it the same day. Online orders can be picked up free at any branch."
          action={<ViewAllLink to="/stores" label="All stores" />}
        />

        {states.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {states.map((state) => (
              <div key={state} className="rounded-2xl bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg">{state}</h3>
                  <span className="text-xs font-semibold text-muted-foreground">{byState[state].length} stores</span>
                </div>
                <ul className="grid grid-cols-2 gap-2">
                  {byState[state].map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.maps_url || `/stores/${state.toLowerCase()}`}
                        target={s.maps_url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/70 hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors"
                      >
                        <MapPin className="w-4 h-4 shrink-0 text-brand-leaf-dark" />
                        <span className="truncate">{shortName(s.name)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <Link to="/stores" className="inline-flex items-center gap-2 text-primary font-semibold">
            <MapPin className="w-4 h-4" /> Find your nearest store
          </Link>
        )}
      </div>
    </section>
  );
};

export const BulkOrderCta = () => (
  <section className="py-14 md:py-20">
    <div className="container mx-auto px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-hero text-white p-8 md:p-14 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div className="absolute inset-0 bg-grid-faint" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf mb-3">For businesses, institutes & startups</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
            Equip your whole team for less.
          </h2>
          <p className="mt-4 text-white/70 max-w-xl">
            We supply tested laptops and desktops in volume to startups, training institutes, BPOs
            and enterprises — with RAM and SSD upgrades on request.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-white/80">
            {["Volume pricing", "RAM & SSD upgrades", "Warranty on every unit", "Corporate laptop rentals"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-leaf" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="relative flex flex-col gap-3">
          <Link
            to="/bulk-orders"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-brand-leaf text-white font-semibold hover:brightness-110"
          >
            <Building2 className="w-4 h-4" /> Request a bulk quote
          </Link>
          <a
            href={`tel:+91${SITE.phone}`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-white/25 font-semibold hover:bg-white/10"
          >
            <Phone className="w-4 h-4" /> Call {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  </section>
);
