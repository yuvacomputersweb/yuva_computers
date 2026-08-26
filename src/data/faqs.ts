export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "About Refurbished Products",
    items: [
      {
        question: "What does \"refurbished\" actually mean at Yuva Computers?",
        answer:
          "A refurbished laptop is a pre-owned device that has been fully inspected, cleaned, repaired where needed, and tested before resale. Every unit that reaches our shelves passes through our in-house refurbishment facility, where components are checked, faulty parts are replaced, the system is reinstalled, and the machine is stress-tested for performance, battery, ports, keyboard, display, and thermals.",
      },
      {
        question: "Are refurbished laptops reliable?",
        answer:
          "Yes. Most of our stock consists of enterprise-grade business laptops (Dell Latitude, HP EliteBook/ProBook, Lenovo ThinkPad, and Apple MacBooks) that were built to a far higher durability standard than entry-level consumer models. They are tested individually, not in batches, and every unit is sold with a written warranty.",
      },
      {
        question: "Is a refurbished laptop the same as a used or second-hand laptop?",
        answer:
          "No. A second-hand laptop is sold as-is by its previous owner with no testing and no warranty. A refurbished laptop from Yuva has been technically restored, quality-checked, given a fresh OS installation, and backed by our warranty and free service.",
      },
      {
        question: "What condition grades do you use?",
        answer:
          "Grade A — Excellent. Minimal to no visible cosmetic marks. Looks close to new. Grade B — Good. Light scuffs or minor scratches on the body or lid. No functional impact. Grade C — Fair. Visible cosmetic wear such as scratches, dents on the palm rest or lid. Fully functional and fully warranted. Cosmetic grade never affects the warranty. A Grade C machine carries exactly the same warranty as a Grade A machine.",
      },
      {
        question: "Will the laptop I receive look exactly like the photos?",
        answer:
          "Product photos are representative of the model and configuration. Because each refurbished unit is individually sourced, minor cosmetic differences are normal and are reflected in the condition grade listed on the product page.",
      },
      {
        question: "Do you sell brand-new laptops as well?",
        answer:
          "Our core business is certified refurbished. Accessories, chargers, RAM, SSDs, and select peripherals are sold new.",
      },
    ],
  },
  {
    title: "Specifications, Software & Configuration",
    items: [
      {
        question: "What operating system comes installed?",
        answer:
          "Windows laptops ship with a fresh Windows installation. MacBooks from Yuva iStore ship with a clean macOS installation, signed out of any previous Apple ID and reset to setup screen.",
      },
      {
        question: "Can I upgrade the RAM or storage before delivery?",
        answer:
          "Yes. Most business-class models support RAM and SSD upgrades. Tell us the configuration you want before you place the order and we will quote and fit it in-house before dispatch.",
      },
      {
        question: "Is a battery included, and how long does it last?",
        answer:
          "Every laptop ships with a working battery. Our standard is a minimum of 1 hour backup on Windows laptops and a minimum of 2 hours backup on Apple laptops from Yuva iStore. Battery backup varies with usage, screen brightness, and the applications you run.",
      },
      {
        question: "Is the charger included?",
        answer: "Yes. A compatible charger/adapter is supplied with every laptop.",
      },
      {
        question: "Will I get the original box and accessories?",
        answer:
          "Refurbished devices are supplied in secure protective packaging with the charger. Original manufacturer boxes and bundled accessories are generally not available.",
      },
      {
        question: "Can you install specific software for me?",
        answer:
          "We install the operating system and essential drivers. Licensed third-party software (MS Office, design suites, etc.) can be discussed at the time of purchase.",
      },
    ],
  },
  {
    title: "Warranty & Service",
    items: [
      {
        question: "What warranty do I get?",
        answer:
          "Coverage / Term — Testing warranty (as printed on invoice): 15 days. RAM — free replacement: 1 year. Hard disk / SSD — free replacement: 1 year. Motherboard — repairable warranty: 1 year. Free service on all laptops purchased from Yuva: Lifetime of ownership. Apple laptops (Yuva iStore) — free service warranty: 6 months. Yuva Service Lab repair warranty (on repairs done by us): 15 days.\n\n\"Repairable warranty\" on the motherboard means we repair the board free of charge within the warranty term. It does not include free replacement of the motherboard or of individual components other than RAM and hard disk.",
      },
      {
        question: "What is not covered by warranty?",
        answer:
          "Physical damage, drops, cracks, dents, or pressure marks. Burn damage, liquid damage, or damage from power surges. Screen and speakers (warranty not applicable). Battery beyond the stated minimum backup at the time of delivery. Software issues, virus infections, and data loss. Damage caused by unauthorised repair, opening, or third-party service.",
      },
      {
        question: "What voids the warranty?",
        answer:
          "Every laptop we sell carries a Yuva warranty sticker/seal. If the seal or sticker is broken, tampered with, or removed, the warranty is void immediately. Please do not open the device or allow any outside technician to open it during the warranty period.",
      },
      {
        question: "How do I claim warranty?",
        answer:
          "Contact our service team on 9347145456 or walk into any Yuva branch with the device and your invoice. Devices can also be brought directly to Yuva Service Lab, Dilsukhnagar. Carry the original invoice — it is your warranty document.",
      },
      {
        question: "Do you service laptops that were not bought from Yuva?",
        answer:
          "Yes. Yuva Service Lab handles repairs for all brands regardless of where the device was purchased. Repairs carry a 15-day repair warranty on the work performed.",
      },
      {
        question: "Is service free?",
        answer:
          "Free service is provided for all laptops purchased from Yuva Computers. Spare parts, if required outside warranty coverage, are chargeable.",
      },
    ],
  },
  {
    title: "Buying, Payment & Bulk Orders",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Order through yuvacomputers.in, call our sales team, or visit any of our stores across Telangana, Andhra Pradesh and Karnataka.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "UPI, debit and credit cards, net banking, and cash or card payment in store. EMI options may be available on select cards — please confirm with the sales team.",
      },
      {
        question: "Do you offer Cash on Delivery?",
        answer:
          "COD availability depends on the pin code and the order value. Please confirm with our sales team before placing the order.",
      },
      {
        question: "Do you provide a GST invoice?",
        answer:
          "Yes. Share your GSTIN and registered business name before we generate the invoice. GST invoices cannot be amended after issue.",
      },
      {
        question: "Do you handle bulk and corporate orders?",
        answer:
          "Yes — this is a major part of our business. We supply refurbished laptops in volume to startups, training institutes, BPOs, and enterprises, and we also offer corporate laptop rental. For bulk enquiries call 9030539456.",
      },
      {
        question: "Can I rent laptops instead of buying?",
        answer:
          "Yes. We run a dedicated corporate laptop rental vertical with flexible tenures and on-site support. Contact the bulk orders team for a quote.",
      },
      {
        question: "Do you buy old laptops or offer exchange?",
        answer:
          "Yes, we purchase working and non-working laptops and offer exchange value against a new purchase, subject to inspection at our branch.",
      },
    ],
  },
  {
    title: "Delivery & Shipping",
    items: [
      {
        question: "Do you ship across India?",
        answer:
          "Yes, we ship pan-India through reputed courier partners.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Hyderabad and local Telangana deliveries typically arrive in 1–3 business days. Other metro and Tier-2 cities take 3–5 business days. Remote pin codes may take 5–7 business days.",
      },
      {
        question: "Can I collect my order from a store?",
        answer:
          "Yes. Store pickup is free at any of our branches. Choose store pickup at checkout or tell the sales team which branch you prefer.",
      },
      {
        question: "How will my laptop be packed?",
        answer:
          "Devices are packed with anti-static wrapping and shock-absorbing padding inside a rigid carton, sealed with tamper-evident tape.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        question: "Can I return the laptop if I change my mind?",
        answer:
          "Online orders carry a 7-day return window from the date of delivery for defective, damaged, or incorrect items. Returns purely for change of mind are not accepted, as each refurbished unit is individually sourced and configured.",
      },
      {
        question: "What if the laptop is faulty on arrival?",
        answer:
          "Report it within 48 hours of delivery with an unboxing video and photographs. We will arrange a replacement or a repair, or issue a refund if a replacement is unavailable. Full details are in our Return & Refund Policy.",
      },
      {
        question: "Are in-store purchases returnable?",
        answer:
          "No. As printed on the invoice, goods sold in store are not returnable. In-store purchases are covered by the 15-day testing warranty, which provides repair or replacement — not a refund.",
      },
      {
        question: "How long does a refund take?",
        answer:
          "Approved refunds are processed within 3 business days of the returned unit passing inspection, and typically reflect in your account within 5–7 business days.",
      },
    ],
  },
  {
    title: "Data & Privacy",
    items: [
      {
        question: "Was the previous owner's data removed?",
        answer:
          "Yes. Every storage drive is either securely wiped using data-sanitisation tools or replaced entirely before a device is refurbished and reinstalled.",
      },
      {
        question: "What happens to my data when I give a device for service?",
        answer:
          "Please back up your data before handing over any device. We are not responsible for data loss during repair, reinstallation, or component replacement.",
      },
    ],
  },
  {
    title: "Stores & Contact",
    items: [
      {
        question: "Where are your stores?",
        answer:
          "Yuva Computers operates 17 stores across Telangana, Andhra Pradesh and Karnataka, with our head office in Dilsukhnagar, Hyderabad. We also run Yuva iStore in Ameerpet — our Apple-exclusive certified pre-owned store — and Yuva Service Lab in Dilsukhnagar.",
      },
      {
        question: "How do I reach the right team?",
        answer:
          "Sales: 9709888456 / 6304234456. Bulk & Corporate Orders: 9030539456. Service: 9347145456. Yuva iStore (Apple): 9456619456.",
      },
      {
        question: "What are your working hours?",
        answer:
          "Stores are open through the week during standard retail hours. Please call your nearest branch to confirm timings before visiting.",
      },
    ],
  },
];