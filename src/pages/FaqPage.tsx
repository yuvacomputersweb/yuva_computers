import { useMemo, useState } from "react";
import { Phone, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { FAQ_SECTIONS } from "@/data/faqs";
import PageHero from "@/components/PageHero";
import { SITE, whatsappLink } from "@/lib/site";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const faqSchema = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.yuvacomputers.in/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: "https://www.yuvacomputers.in/faq",
      },
    ],
  },
];

const FaqPage = () => {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_SECTIONS;
    return FAQ_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((i) => `${i.question} ${i.answer}`.toLowerCase().includes(q)),
    })).filter((sec) => sec.items.length > 0);
  }, [query]);

  return (
    <>
      <SEO
        title="FAQs | Yuva Computers - Refurbished Laptops & Apple Devices"
        description="Frequently asked questions about certified refurbished laptops, desktops, and Apple devices at Yuva Computers — warranty, delivery, returns, and more."
        canonical="/faq"
        jsonLd={faqSchema}
      />

      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        text="Everything about our refurbished laptops, desktops and Apple devices — condition grades, warranty, delivery and returns."
        crumbs={[{ label: "FAQ" }]}
      >
        <label className="relative block max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, e.g. warranty, battery, COD"
            aria-label="Search FAQs"
            className="w-full h-14 pl-14 pr-5 rounded-full bg-white text-foreground text-base outline-none focus:ring-4 focus:ring-brand-leaf/30"
          />
        </label>
      </PageHero>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-16">
          {/* Section nav */}
          <nav className="lg:sticky lg:top-40 self-start flex lg:flex-col gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0" aria-label="FAQ topics">
            {sections.map((section) => (
              <a
                key={section.title}
                href={`#${slug(section.title)}`}
                className="shrink-0 lg:shrink h-10 lg:h-auto px-4 lg:px-3 lg:py-2 inline-flex items-center rounded-full lg:rounded-xl border lg:border-0 border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {section.title}
              </a>
            ))}
          </nav>

          <div className="max-w-3xl space-y-12">
            {sections.length === 0 && (
              <p className="text-muted-foreground">No questions match “{query}”. Try another word, or ask us on WhatsApp.</p>
            )}
            {sections.map((section) => (
              <div key={section.title} id={slug(section.title)} className="scroll-mt-40">
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground tracking-tight mb-2">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible defaultValue={query ? `${section.title}-0` : undefined}>
                  {section.items.map((item, i) => (
                    <AccordionItem key={item.question} value={`${section.title}-${i}`}>
                      <AccordionTrigger className="text-left font-display font-semibold text-foreground text-base hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {/* CTA */}
            <div className="rounded-3xl bg-brand-navy text-white p-8 md:p-10">
              <h2 className="font-display font-extrabold text-2xl">Still have a question?</h2>
              <p className="text-white/70 mt-2">Call our sales team or message us on WhatsApp and we will get back to you.</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href={`tel:+91${SITE.phone}`} className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/25 font-semibold text-sm hover:bg-white/10">
                  <Phone className="w-4 h-4" /> {SITE.phoneDisplay}
                </a>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-leaf font-semibold text-sm">
                  <MessageCircle className="w-4 h-4" /> WhatsApp us
                </a>
              </div>
              <p className="text-sm text-white/60 mt-6">
                See also our <Link to="/returns-refund-policy" className="underline hover:text-white">return & refund policy</Link> and{" "}
                <Link to="/shipping-policy" className="underline hover:text-white">shipping policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqPage;
