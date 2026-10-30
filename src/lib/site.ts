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
};

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
    title: "7-day easy returns",
    text: "Defective, damaged or wrong item on an online order? Send it back.",
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
