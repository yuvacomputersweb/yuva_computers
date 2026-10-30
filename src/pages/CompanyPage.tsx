import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight, Search, Wrench, HardDrive, Gauge, BadgeCheck, Store, Apple, Building2,
  ShieldCheck, Recycle,
} from "lucide-react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import workshopImg from "/about.png";
import { SITE } from "@/lib/site";

// The refurbishment steps described in the site FAQ.
const PROCESS = [
  { icon: Search, title: "Inspect", text: "Every component is checked individually — not in batches." },
  { icon: Wrench, title: "Repair", text: "Faulty parts are replaced in our in-house refurbishment facility." },
  { icon: HardDrive, title: "Reinstall", text: "A clean, fresh operating system installation on every machine." },
  { icon: Gauge, title: "Stress-test", text: "Performance, battery, ports, keyboard, display and thermals." },
  { icon: BadgeCheck, title: "Certify", text: "Sealed with a Yuva warranty sticker and sold with a written warranty." },
];

const DIVISIONS = [
  {
    icon: Store,
    title: "Yuva Computers stores",
    text: "Certified refurbished laptops and desktops across Telangana and Andhra Pradesh.",
    to: "/stores",
    cta: "Find a store",
  },
  {
    icon: Apple,
    title: "Yuva iStore, Ameerpet",
    text: "Our Apple-exclusive store for certified pre-owned MacBooks, reset and ready to set up.",
    to: "/products?brand=apple",
    cta: "Shop Apple",
  },
  {
    icon: Wrench,
    title: "Yuva Service Lab, Dilsukhnagar",
    text: "Repairs for all brands, wherever the device was bought — with a 15-day repair warranty.",
    to: "/contact",
    cta: "Book a repair",
  },
  {
    icon: Building2,
    title: "Business & rentals",
    text: "Volume orders for startups, institutes, BPOs and enterprises, plus corporate laptop rentals.",
    to: "/bulk-orders",
    cta: "Get a quote",
  },
];

// Only show CMS timeline / certification entries that are actually filled in.
const isFilled = (t?: string, min = 15) => !!t && t.trim().length >= min;

const CompanyPage = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    contentService.getCompanyContent().then(setData).catch(console.error);
  }, []);

  const c = data?.content || {};
  const timeline = (data?.timeline || []).filter((t: any) => isFilled(t.description));
  const certifications: string[] = (data?.certifications || []).map((x: any) => x.name).filter((n: string) => isFilled(n, 4));
  const years = new Date().getFullYear() - SITE.since;

  const companySchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Yuva Computers",
      "url": "https://www.yuvacomputers.in/company",
      "foundingDate": "2009",
      "description": c.story_text || "Certified refurbished laptops and desktops, tested in our own workshop and sold with warranty since 2009.",
      "logo": "https://www.yuvacomputers.in/favicon-32x32.png",
      "telephone": `+91${SITE.phone}`,
      "email": SITE.email,
      "taxID": SITE.gstin,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.yuvacomputers.in/" },
        { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://www.yuvacomputers.in/company" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="About Us | Yuva Computers — Refurbished Laptops Since 2009"
        description="Yuva Computers has refurbished and sold business-grade laptops since 2009, with stores across Telangana and Andhra Pradesh, an Apple iStore and an in-house service lab."
        canonical="/company"
        jsonLd={companySchema}
      />

      <PageHero
        eyebrow={`About Yuva Computers · since ${SITE.since}`}
        title={c.hero_title || <>Good computers shouldn’t cost a fortune.</>}
        text={
          c.story_text ||
          "For over " + years + " years we’ve given business-grade laptops a second life — inspected, repaired and tested in our own workshop, then sold with a written warranty and real stores behind it."
        }
        crumbs={[{ label: "About us" }]}
      />

      {/* Numbers */}
      <section className="border-b border-border">
        <dl className="container mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4">
          {[
            { v: `${years}+`, l: "Years in business" },
            { v: "10,000+", l: "Products sold" },
            { v: "7,000+", l: "Happy customers" },
            { v: SITE.googleRating, l: "Google rating" },
          ].map((s, i) => (
            <div key={s.l} className={`py-8 text-center ${i % 2 ? "border-l border-border" : ""} ${i === 2 ? "lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-border" : ""}`}>
              <dt className="sr-only">{s.l}</dt>
              <dd className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">{s.v}</dd>
              <dd className="text-sm text-muted-foreground mt-1">{s.l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Story */}
      <section className="py-14 md:py-24">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-[2rem] overflow-hidden aspect-[4/3] bg-muted">
            <img src={workshopImg} alt="Technician repairing a laptop motherboard at the Yuva workshop" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-3">Why refurbished</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
              Enterprise-grade machines, priced for everyone
            </h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Most of our stock is business laptops — Dell Latitude, HP EliteBook and ProBook, Lenovo ThinkPad and
                Apple MacBook — built to a far higher durability standard than entry-level consumer models.
              </p>
              <p>
                A second-hand laptop is sold as-is. A Yuva laptop is technically restored, quality-checked, given a
                fresh OS installation and backed by our warranty and free service — and every one we put back into use
                is one less in a landfill.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-leaf/15 text-brand-leaf-dark px-4 h-9"><ShieldCheck className="w-4 h-4" /> Written warranty</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-leaf/15 text-brand-leaf-dark px-4 h-9"><Recycle className="w-4 h-4" /> Less e-waste</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 md:py-20 bg-brand-navy text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf mb-3">How we refurbish</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight max-w-2xl">
            Every laptop goes through our 50-point check
          </h2>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-brand-leaf/20 text-brand-leaf grid place-items-center"><Icon className="w-5 h-5" /></span>
                  <span className="font-display font-extrabold text-2xl text-white/15">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
                <p className="mt-1 text-sm text-white/65 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Divisions */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-leaf-dark mb-3">The Yuva family</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">More than a laptop shop</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIVISIONS.map(({ icon: Icon, title, text, to, cta }) => (
              <Link key={title} to={to} className="group rounded-2xl border border-border p-6 bg-card hover:border-primary/30 hover:shadow-lg transition-all flex flex-col">
                <span className="w-11 h-11 rounded-xl bg-muted grid place-items-center"><Icon className="w-5 h-5 text-primary" /></span>
                <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed flex-1">{text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Optional CMS timeline */}
      {timeline.length > 0 && (
        <section className="py-14 md:py-20 bg-muted/60">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Our journey</h2>
            <ol className="mt-10 grid md:grid-cols-3 gap-4">
              {timeline.map((t: any) => (
                <li key={t.year + t.title} className="rounded-2xl bg-card border border-border p-6">
                  <p className="font-display font-extrabold text-3xl text-brand-leaf-dark">{t.year}</p>
                  <h3 className="mt-2 font-display font-bold text-lg">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Optional CMS certifications */}
      {certifications.length > 0 && (
        <section className="py-10 border-y border-border">
          <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium mr-2">Certifications</span>
            {certifications.map((name) => (
              <span key={name} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-brand-leaf/15 text-brand-leaf-dark text-sm font-semibold">
                <BadgeCheck className="w-4 h-4" /> {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-[2rem] bg-hero text-white p-8 md:p-14 text-center">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">Find your next laptop</h2>
            <p className="mt-3 text-white/70 max-w-xl mx-auto">Browse certified refurbished laptops online, or come see them in person at a store near you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand-leaf text-white font-semibold">
                Shop laptops <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/stores" className="inline-flex items-center h-12 px-6 rounded-full border border-white/25 font-semibold hover:bg-white/10">
                Visit a store
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CompanyPage;
