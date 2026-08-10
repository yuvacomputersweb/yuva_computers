import { Globe, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";

const DEFAULT_TIMELINE = [
  { year: "2009", title: "Founding", description: "Started with a simple belief: high-end technology shouldn't be a luxury. It should be a standard." },
  { year: "2018", title: "100k Customers", description: "A major milestone reached, proving that the market for certified, high-end refurbished instruments was global and growing." },
  { year: "2022", title: "Store Expansion", description: "Opening physical Experience Centers to allow users to touch, feel, and test precision instruments before acquisition." },
];

const CompanyPage = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    contentService.getCompanyContent().then(setData).catch(console.error);
  }, []);

  const c = data?.content || {};
  const timeline = data?.timeline?.length > 0 ? data.timeline : DEFAULT_TIMELINE;
  const investors = data?.investors?.length > 0 ? data.investors : [
    { name: "Nexus Ventures", type: "Early Stage Growth" },
    { name: "Green Earth Cap", type: "ESG Focused Funding" },
    { name: "Luxe Partners", type: "Premium Retail Strategy" },
    { name: "Global Tech Hub", type: "Strategic Scaling" },
  ];
  const certifications = data?.certifications?.length > 0
    ? data.certifications.map((c: any) => c.name)
    : ["Certified E-Recycler", "Authorized Refurbisher", "ISO 9001 Compliant"];
  const partners = data?.partners?.length > 0 ? data.partners : [
    { name: "DELL" }, { name: "HP" }, { name: "LENOVO" },
    { name: "APPLE" }, { name: "ASUS" }, { name: "ACER" },
  ];

  const companySchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Yuva Computers",
      "url": "https://www.yuvacomputers.in/company",
      "foundingDate": "2009",
      "description": c.story_text || "Democratizing technology by delivering certified high-end refurbished laptops and enterprise IT hardware.",
      "logo": "https://www.yuvacomputers.in/favicon-32x32.png"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.yuvacomputers.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About Us",
          "item": "https://www.yuvacomputers.in/company"
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="About Us | Yuva Computers - Democratizing Technology"
        description="Learn about Yuva Computers' journey since 2009. We provide top-grade, certified refurbished laptops, enterprise desktops, and IT solutions across India."
        canonical="/company"
        jsonLd={companySchema}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {c.hero_image
          ? <img src={c.hero_image} alt="Yuva Computers facility" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 bg-foreground" />
        }
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="relative container mx-auto px-6 py-24 lg:py-32 text-center">
          <span className="text-xs font-display font-semibold text-primary-foreground/60 uppercase tracking-[0.2em]">
            {c.hero_subtitle || "Yuva Computers"}
          </span>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-primary-foreground mt-4 tracking-tight">
            {c.hero_title || "Democratizing Technology Since 2009."}
          </h1>
        </div>
      </section>

      {/* Story + Timeline */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-foreground tracking-tight">
                {c.story_heading || "Our Journey Through Precision."}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                {c.story_text || "We started with a simple belief: high-end technology shouldn't be a luxury."}
              </p>
            </div>
            <div className="space-y-8">
              {timeline.map((t: any, i: number) => (
                <div key={t.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <span className="font-display font-bold text-primary text-sm">{t.year}</span>
                    <div className="w-3 h-3 rounded-full gradient-primary mt-2" />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border/30 mt-2" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-display font-bold text-foreground text-lg">{t.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision + Mission */}
      <section className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-8 shadow-ambient">
              <h3 className="font-display font-bold text-lg text-foreground italic mb-3">Our Vision</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.vision_text || ""}</p>
            </div>
            <div className="bg-card rounded-xl p-8 shadow-ambient">
              <h3 className="font-display font-bold text-lg text-foreground italic mb-3">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.mission_text || ""}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fueling the Future — Investors */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display font-extrabold text-3xl text-foreground tracking-tight">
            {c.fueling_heading || "Fueling the Future."}
          </h2>
          <p className="text-muted-foreground mt-2">
            {c.fueling_subtext || "Backed by leaders in sustainable tech and venture capital."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {investors.map((inv: any) => (
              <div key={inv.name} className="bg-card rounded-xl p-6 shadow-ambient text-center">
                <div className="w-12 h-12 mx-auto gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="font-display font-bold text-foreground text-sm">{inv.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{inv.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrity — Certifications */}
      <section className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-foreground tracking-tight">
                {c.integrity_heading || "Integrity in Every Interaction."}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                {c.integrity_text || "We partner with global leaders in electronics recycling and hardware certification."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              {certifications.map((name: string) => (
                <span key={name} className="inline-flex items-center gap-2 bg-success-soft text-success px-4 py-2.5 rounded-lg font-display font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" /> {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 border-y border-border/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
            {c.partners_label || "Our Partners"}
          </p>
          <div className="flex flex-wrap justify-center gap-12">
            {partners.map((p: any) => (
              <span key={p.name} className="font-display font-bold text-xl text-muted-foreground/40 tracking-wider">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display font-extrabold text-4xl text-primary-foreground tracking-tight">
            {c.cta_heading || "Experience it before you buy."}
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-md mx-auto">
            {c.cta_text || "Visit our premium experience centers."}
          </p>
          <Link to="/stores" className="inline-block mt-8 bg-background text-foreground px-8 py-3.5 rounded-lg font-display font-semibold text-sm hover:bg-white transition-colors">
            Find a Store Near You
          </Link>
        </div>
      </section>
    </>
  );
};

export default CompanyPage;