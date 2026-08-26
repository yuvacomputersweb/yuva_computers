import { Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { FAQ_SECTIONS } from "@/data/faqs";

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
  return (
    <>
      <SEO
        title="FAQs | Yuva Computers - Refurbished Laptops & Apple Devices"
        description="Frequently asked questions about certified refurbished laptops, desktops, and Apple devices at Yuva Computers — warranty, delivery, returns, and more."
        canonical="/faq"
        jsonLd={faqSchema}
      />

      {/* Hero */}
      <section className="py-16 lg:py-24 bg-surface-low">
        <div className="container mx-auto px-6">
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-foreground tracking-tight max-w-3xl">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Everything you need to know about our refurbished laptops, desktops
            & Apple devices — from condition grades and warranties to delivery
            and returns.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-12">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display font-extrabold text-2xl text-foreground tracking-tight mb-4">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible>
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={item.question}
                      value={`${section.title}-${i}`}
                    >
                      <AccordionTrigger className="text-left font-display font-semibold text-foreground">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-surface-low rounded-xl p-8 text-center">
            <h2 className="font-display font-bold text-lg text-foreground">
              Still have a question?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Call our sales team or message us on WhatsApp and we will get back
              to you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <a
                href="tel:9709888456"
                className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Phone className="w-4 h-4" /> 9709888456
              </a>
              <a
                href="https://wa.me/919709888456"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-success text-success-foreground px-6 py-2.5 rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Read our{" "}
              <Link to="/returns-refund-policy" className="text-primary hover:underline">
                Return & Refund Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqPage;