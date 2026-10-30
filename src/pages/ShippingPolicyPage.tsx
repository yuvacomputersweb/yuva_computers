import { Phone, Mail, Truck } from "lucide-react";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";

const POLICY_SECTIONS = [
  {
    title: "1. Where We Deliver",
    body: [
      "We ship across India through reputed courier and logistics partners. Local deliveries in Hyderabad and surrounding areas may be fulfilled by our own team or by our branch network.",
      "We currently do not ship internationally.",
      "A small number of remote pin codes are not serviceable by our courier partners. If your pin code cannot be served, our team will contact you within 1 business day of the order to arrange an alternative or cancel and refund the order in full.",
    ],
  },
  {
    title: "2. Order Processing",
    body: [
      "Orders are processed on business days (Monday to Saturday), excluding public holidays.",
      "Orders placed before 4:00 PM on a business day are generally processed the same day.",
      "Every unit goes through a final quality check, OS reinstallation verification, and packing inspection before dispatch. This normally takes 1–2 business days.",
      "Custom-configured orders (RAM or storage upgrades, specific software setup) add 1–2 business days to processing.",
      "You will receive a dispatch confirmation with tracking details once the order leaves our facility.",
    ],
  },
  {
    title: "3. Delivery Timelines",
    body: [
      "Estimated delivery after dispatch:",
      "Hyderabad & Secunderabad: 1–2 business days",
      "Rest of Telangana: 2–3 business days",
      "Andhra Pradesh & Karnataka: 2–4 business days",
      "Other metro cities: 3–5 business days",
      "Tier-2 and Tier-3 cities: 4–6 business days",
      "Remote and North-East pin codes: 5–8 business days",
      "These are estimates, not guarantees. Delivery may be delayed by weather, strikes, festival volumes, regional restrictions, or other events outside our control. We will keep you informed if a delay occurs.",
    ],
  },
  {
    title: "4. Shipping Charges",
    body: [
      "Free standard shipping on all laptop and desktop orders above Rs.[THRESHOLD].",
      "Orders below this value attract a flat shipping charge of Rs.[AMOUNT], shown at checkout before payment.",
      "Accessories and spare parts ordered on their own are charged at actual courier rates.",
      "Store pickup is always free.",
      "Bulk and corporate orders are quoted with freight included or excluded as agreed in writing for that order.",
    ],
  },
  {
    title: "5. Store Pickup",
    body: [
      "You may collect your order free of charge from any of our 17 branches across Telangana, Andhra Pradesh and Karnataka, from Yuva iStore, Ameerpet for Apple devices, or from our head office in Dilsukhnagar, Hyderabad.",
      "Select store pickup at checkout, or tell the sales team your preferred branch.",
      "We will confirm by call or message when the device is ready.",
      "Please carry a photo ID and your order reference.",
      "Orders are held at the branch for 7 days from the ready-for-pickup notification.",
      "Store pickup is the recommended option if you would like to inspect and test the device with our staff before taking it home.",
    ],
  },
  {
    title: "6. Packing",
    body: [
      "Every device is packed to survive courier handling:",
      "Anti-static wrap on the device",
      "Shock-absorbing foam or bubble padding on all sides",
      "Rigid double-walled carton",
      "Tamper-evident sealing tape",
      "Charger and accessories packed separately inside the same carton",
      "Fragile and \"handle with care\" labelling",
    ],
  },
  {
    title: "7. Receiving Your Order",
    body: [
      "Please follow these steps — they protect your right to raise a transit-damage claim:",
      "Inspect the outer carton before accepting delivery. If the box is crushed, torn, wet, or the seal is broken, refuse the delivery and inform us immediately.",
      "Record a continuous unboxing video starting before you open the packaging. This is required for any damage or dead-on-arrival claim.",
      "Check the device — model, configuration, condition, charger, and power-on — as soon as possible.",
      "Report any problem within 48 hours of delivery. See our Return & Refund Policy for the full claim process.",
    ],
  },
  {
    title: "8. Delivery Attempts & Failed Deliveries",
    body: [
      "Courier partners generally make up to 3 delivery attempts. Please keep the phone number on the order reachable.",
      "If all attempts fail, the shipment is returned to us. We will contact you to arrange re-dispatch; re-dispatch shipping charges are payable by the customer.",
      "If a shipment is returned because the address was incorrect or incomplete, or delivery was refused without valid reason, any original shipping charge is non-refundable.",
    ],
  },
  {
    title: "9. Address Changes",
    body: [
      "Address changes are only possible before dispatch.",
      "Contact the sales team immediately on 9709888456 / 6304234456. Once the shipment is handed to the courier, the delivery address cannot be modified.",
    ],
  },
  {
    title: "10. Tracking",
    body: [
      "A tracking number and courier name are shared by SMS, WhatsApp, or email at the time of dispatch.",
      "Tracking data may take up to 24 hours to become active on the courier's website.",
      "If tracking has not updated for more than 48 hours, contact our sales team and we will follow up with the courier on your behalf.",
    ],
  },
  {
    title: "11. Lost or Missing Shipments",
    body: [
      "If a shipment is confirmed lost in transit, we will send a replacement unit of the same or better specification, or issue a full refund including shipping, once the courier's investigation is complete.",
      "Courier investigations typically take 7–10 business days.",
    ],
  },
  {
    title: "12. Bulk & Corporate Deliveries",
    body: [
      "Bulk orders, corporate supply, and laptop rental deployments are scheduled separately with the client and may include:",
      "Dedicated freight or our own transport",
      "Staged or multi-location delivery",
      "On-site unboxing, setup, and imaging",
      "Contact our bulk orders team on 9030539456 to plan a deployment.",
    ],
  },
  {
    title: "13. Title & Risk",
    body: [
      "Ownership and risk in the goods pass to the customer on delivery, or on collection in the case of store pickup.",
    ],
  },
  {
    title: "14. Contact",
    body: [
      "Yuva Computers",
      "Head Office: Dilsukhnagar, Hyderabad, Telangana",
      "Sales & Order Tracking: 9709888456 / 6304234456",
      "Bulk & Corporate: 9030539456",
      "Service: 9347145456",
      "Yuva iStore (Apple): 9456619456",
      "Email: info@yuvacomputers.in",
      "Yuva Computers reserves the right to amend this policy at any time. The version published on yuvacomputers.in at the time of your order applies to that order.",
    ],
  },
];

const CONTACTS = [
  { label: "Sales / Order Tracking", number: "9709888456 / 6304234456" },
  { label: "Bulk & Corporate", number: "9030539456" },
  { label: "Service", number: "9347145456" },
  { label: "Yuva iStore (Apple)", number: "9456619456" },
];

const ShippingPolicyPage = () => {
  const policySchema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yuvacomputers.in/" },
        { "@type": "ListItem", position: 2, name: "Shipping & Delivery Policy", item: "https://www.yuvacomputers.in/shipping-policy" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Shipping & Delivery Policy | Yuva Computers"
        description="Read Yuva Computers' shipping and delivery policy for certified refurbished laptops and Apple devices. Delivery timelines, shipping charges, store pickup, and tracking information."
        canonical="/shipping-policy"
        jsonLd={policySchema}
      />

      <PageHero
        eyebrow="Policies"
        title="Shipping &amp; Delivery Policy"
        text="This policy applies to all orders placed through yuvacomputers.in, by phone, or WhatsApp. Store pickup options and bulk orders follow the terms outlined below."
        crumbs={[{ label: "Shipping policy" }]}
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
            <Truck className="w-4 h-4 text-primary" />
            <span>
              Yuva Computers reserves the right to amend this policy at any
              time. The version published on yuvacomputers.in at the time of
              your order applies to that order.
            </span>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            For returns, refunds, or transit damage claims, please refer to our
            <a href="/returns-refund-policy" className="text-primary underline hover:no-underline">
              Return & Refund Policy
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
};

export default ShippingPolicyPage;