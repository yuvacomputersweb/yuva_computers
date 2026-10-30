import { Phone, Mail, ShieldCheck } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";

const POLICY_SECTIONS = [
  {
    title: "1. Scope",
    body: [
      "Every product sold by Yuva Computers is a certified refurbished device that has been individually inspected, repaired where required, reinstalled, and tested. Because each unit is individually sourced and configured, our return policy is built around defect protection rather than open-ended change-of-mind returns.",
    ],
  },
  {
    title: "2. Return Window",
    body: [
      "Online and remote orders: If the device develops a functional problem, you may raise a replacement request within the 15-day testing period. Damage in transit is covered separately under Section 5 and needs an unboxing video.",
      "In-store purchases: As stated on the invoice, goods sold in store are not returnable. In-store purchases are protected instead by the 15-day testing warranty, which entitles you to repair or replacement of a defective unit — not a refund.",
    ],
  },
  {
    title: "3. What Qualifies for a Return",
    body: [
      "A return will be accepted if any of the following apply:",
      "The device is dead on arrival or develops a hardware fault within the return window.",
      "The device arrived physically damaged in transit.",
      "The wrong model, configuration, or condition grade was delivered.",
      "A declared component is missing (for example, the charger).",
      "The device does not match the specifications listed on the invoice.",
    ],
  },
  {
    title: "4. What Does Not Qualify for a Return",
    body: [
      "Change of mind, buyer's remorse, or a better price found elsewhere.",
      "Cosmetic marks that are consistent with the condition grade stated on the product page or invoice.",
      "Physical damage, cracks, dents, pressure marks, or liquid damage caused after delivery.",
      "Burn damage or damage caused by power surges or unstable electrical supply.",
      "Screen or speaker complaints — warranty and returns are not applicable to these components.",
      "Battery backup complaints where the device delivers the stated minimum backup (1 hour on Windows laptops, 2 hours on Apple laptops from Yuva iStore).",
      "Software problems, virus infections, driver issues, or data loss.",
      "Devices whose warranty seal or Yuva sticker has been broken, removed, or tampered with.",
      "Devices opened, upgraded, or repaired by anyone other than Yuva Service Lab.",
      "Made-to-order or custom-configured builds, unless the fault is ours.",
      "Bulk, corporate, and rental orders, which are governed by the separate agreement signed for that order.",
      "Software licences, consumables, and clearance or \"as-is\" items marked non-returnable.",
    ],
  },
  {
    title: "5. Damage in Transit — 48-Hour Rule",
    body: [
      "Transit damage and dead-on-arrival claims must be reported within 48 hours of delivery. To support the claim we require:",
      "A continuous unboxing video starting before the outer packaging is opened.",
      "Photographs of the outer carton, including all sides and the shipping label.",
      "Photographs of the device showing the damage.",
      "Your invoice number.",
      "Claims raised after 48 hours, or without an unboxing video, may be assessed as a warranty repair instead of a return.",
    ],
  },
  {
    title: "6. How to Raise a Return",
    body: [
      "Contact us within the return window on 9709888456 / 6304234456, or by WhatsApp or email, quoting your invoice number and the reason for return.",
      "Receive an RMA reference. Do not ship anything back before you have this reference — unauthorised shipments cannot be traced or processed.",
      "Pack the device in its original packaging with the charger and all supplied accessories, and write the RMA reference clearly on the outer carton.",
      "Ship or drop off. We will arrange a reverse pickup where our courier partners service your pin code, or you may hand the device in at any Yuva branch.",
    ],
  },
  {
    title: "7. Inspection",
    body: [
      "All returned units are inspected at Yuva Service Lab, Dilsukhnagar, normally within 3 business days of receipt.",
      "If the reported fault is confirmed, we proceed to resolution under Section 8.",
      "If the unit is found to be in working order, or the damage falls under Section 4, the return is declined and the device is returned to you. Return shipping in that case is payable by you.",
      "Missing accessories, or damage caused after delivery, may be deducted from any refund amount.",
    ],
  },
  {
    title: "8. Resolution Options",
    body: [
      "Once a return is approved, resolution follows this order:",
      "Repair — the fastest route for most hardware faults, carried out free of charge at Yuva Service Lab.",
      "Replacement — with an identical or equivalent unit in the same or better condition grade, where stock is available.",
      "Refund — issued where repair is not viable and no equivalent replacement is available.",
      "Yuva Computers reserves the right to select the appropriate resolution based on the nature of the fault and stock availability.",
    ],
  },
  {
    title: "9. Refunds",
    body: [
      "Refunds are processed within 3 business days of the returned unit passing inspection.",
      "Funds are returned to the original payment method. UPI, card, and net banking refunds typically reflect within 5–7 business days, depending on your bank.",
      "Cash on Delivery orders are refunded by NEFT/IMPS to a bank account in the name of the person on the invoice. Please provide account holder name, account number, and IFSC.",
      "Shipping charges paid on the original order are refunded only where the fault was ours (defective, damaged, or wrong item shipped).",
      "Any discount, promotional credit, or exchange value applied to the original order is adjusted proportionally.",
      "Once a refund is processed from our end, we cannot influence your bank's or payment gateway's settlement timeline.",
    ],
  },
  {
    title: "10. Return Shipping Costs",
    body: [
      "Defective, damaged, or wrong item delivered — Yuva Computers pays.",
      "Return declined after inspection — Customer pays.",
      "Return outside the stated window or reasons — Customer pays.",
    ],
  },
  {
    title: "11. Cancellations",
    body: [
      "Orders may be cancelled free of charge before dispatch. Contact the sales team as early as possible.",
      "Once the order is dispatched, it cannot be cancelled and must be handled as a return under this policy.",
      "Custom-configured orders (upgraded RAM, storage, or specific builds) cannot be cancelled once work has begun.",
      "Refunds on cancellations follow the timelines in Section 9.",
    ],
  },
  {
    title: "12. Exchange",
    body: [
      "Exchange of your old device against a purchase is available at any Yuva branch, subject to physical inspection and valuation by our team. Exchange valuations are made at the time of inspection and are not revisable afterwards.",
    ],
  },
  {
    title: "13. Relationship to Warranty",
    body: [
      "This return policy and our warranty are separate protections.",
      "The 15-day testing period covers defective or incorrect deliveries; transit damage is covered with an unboxing video (Section 5).",
      "After that, cover depends on the product: laptops from ₹15,000 get 1-year RAM and hard disk replacement and 1-year motherboard repair; Apple devices and laptops with dedicated graphics get 6 months of free service; monitors are sold without warranty. See our Warranty Policy page for full details.",
    ],
  },
];

const CONTACTS = [
  { label: "Sales / Returns", number: "9709888456 / 6304234456" },
  { label: "Bulk & Corporate", number: "9030539456" },
  { label: "Service", number: "9347145456" },
  { label: "Yuva iStore (Apple)", number: "9456619456" },
];

const ReturnRefundPolicyPage = () => {
  const policySchema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yuvacomputers.in/" },
        { "@type": "ListItem", position: 2, name: "Return & Refund Policy", item: "https://www.yuvacomputers.in/returns-refund-policy" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Return & Refund Policy | Yuva Computers"
        description="Read Yuva Computers' return and refund policy for certified refurbished laptops and Apple devices. 15-day testing period, transit-damage cover, inspection process and refund timelines."
        canonical="/returns-refund-policy"
        jsonLd={policySchema}
      />

      <PageHero
        eyebrow="Policies"
        title="Return &amp; Refund Policy"
        text="This policy applies to purchases made through yuvacomputers.in and to orders placed remotely by phone or WhatsApp. Purchases made in person at a Yuva branch are governed by the terms printed on the invoice."
        crumbs={[{ label: "Return & refund policy" }]}
      />

      {/* Sections */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="space-y-10">
            {POLICY_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight mb-3">
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.body.map((line, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed text-sm">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-16 bg-muted/60 rounded-3xl p-6 md:p-8">
            <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight mb-4">
              14. Contact
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yuva Computers. Head Office: Dilsukhnagar, Hyderabad, Telangana.
              Service: Yuva Service Lab, Dilsukhnagar.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {CONTACTS.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-3 bg-card rounded-2xl border border-border p-4"
                >
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">{c.label}</p>
                    <p className="text-primary font-display font-semibold text-sm mt-0.5">{c.number}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 mt-4 bg-card rounded-2xl border border-border p-4">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">Email</p>
                <p className="text-primary font-display font-semibold text-sm mt-0.5">info@yuvacomputers.in</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              Yuva Computers reserves the right to amend this policy at any
              time. The version published on yuvacomputers.in at the time of
              your order applies to that order.
            </span>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            This return policy and our warranty are separate protections.
          </p>
        </div>
      </section>
    </>
  );
};

export default ReturnRefundPolicyPage;