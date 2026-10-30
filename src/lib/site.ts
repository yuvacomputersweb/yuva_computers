// src/lib/site.ts
// Shared business facts used across the header, homepage and footer.
// Every claim here is taken from the site's own policy and FAQ pages —
// update this file (not the components) when a policy changes.
import { ShieldCheck, RotateCcw, Store, BadgeCheck, type LucideIcon } from "lucide-react";

export const SITE = {
  phone: "9709888456",
  phoneDisplay: "97098 88456",
  whatsapp: "919709888456",
  email: "info@yuvacomputers.in",
  since: 2009,
  googleRating: "4.4",
  googleReviewsUrl: "https://share.google/W5RdRfHaAWY1fKw1C",
  gstin: "36AHLPJ3987B3Z4",
  headOffice: "Dilsukhnagar, Hyderabad, Telangana",
  headOfficeAddress: "Sai Towers, 204, 2nd Floor, Metro Pillar No. 1519, Dilsukhnagar, Hyderabad, Telangana 500060",
  hours: "Open daily, 10:00 AM – 8:30 PM",
};

/** Seasonal offer shown above the header until `endsAt` (IST). Set to null when there's no sale. */
export const SALE: { title: string; text: string; endsAt: string; href: string } | null = {
  title: "Dussehra Sale",
  text: "Up to ₹8,000 off select business laptops with spin-wheel, festival and student coupons in store",
  endsAt: "2026-11-11T23:59:59+05:30",
  href: "/products?is_trending=true",
};

export const isSaleLive = () => !!SALE && Date.now() < new Date(SALE.endsAt).getTime();

export const SOCIAL_LINKS = [
  { label: "Instagram", handle: "@yuva.computers", href: "https://www.instagram.com/yuva.computers" },
  { label: "YouTube", handle: "@yuvacomputers", href: "https://youtube.com/@yuvacomputers" },
  { label: "Facebook", handle: "Yuva Computers", href: "https://www.facebook.com/share/1ZcCzs87wv/" },
] as const;

export const whatsappLink = (text = "Hi Yuva Computers, I'd like to know more about your laptops.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export interface TrustPoint {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    icon: BadgeCheck,
    title: "50-point quality check",
    text: "Every device is inspected, tested and cleaned before it is listed.",
  },
  {
    icon: ShieldCheck,
    title: "1-year RAM & storage cover",
    text: "Free RAM and hard-disk replacement for a year after purchase.",
  },
  {
    icon: RotateCcw,
    title: "15-day replacement",
    text: "Any damage or problem within 15 days of delivery? We replace it.",
  },
  {
    icon: Store,
    title: "Free store pickup",
    text: "Order online, then inspect and collect at a branch near you.",
  },
];

export const BUDGET_RANGES = [
  { label: "Under", value: "₹20K", hint: "Students & everyday use", min: undefined, max: 20000 },
  { label: "Between", value: "₹20K – 35K", hint: "Best value for work", min: 20000, max: 35000 },
  { label: "Between", value: "₹35K – 60K", hint: "Power users & coding", min: 35000, max: 60000 },
  { label: "Above", value: "₹60K", hint: "Premium & MacBooks", min: 60000, max: undefined },
] as const;

export const budgetHref = (min?: number, max?: number) => {
  const params = new URLSearchParams();
  if (min) params.set("min_price", String(min));
  if (max) params.set("max_price", String(max));
  return `/products?${params.toString()}`;
};
