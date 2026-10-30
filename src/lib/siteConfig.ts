import { useEffect, useState } from "react";
import { storeService } from "@/services/api";

/** Store-wide settings from Admin → Site Configuration. */
export interface SiteConfig {
  in_the_box?: string;
  shipping_assurance?: string;
  warranty_exclusions?: string;
  warranty_void_conditions?: string;
  warranty_terms?: string;
  warranty_claim_steps?: string;
  refurbishment_summary?: string;
  refurbishment_points?: string;
  service_summary?: string;
}

/** A product's warranty plan (Admin → Warranty plans), from the product API. */
export interface WarrantyPlan {
  code: string;
  name: string;
  badge: string;
  summary: string;
  testing_days: number;
  parts_months: number;
  free_service: boolean;
  service_months: number;
  battery_hours: number;
  points: string[];
}

// Defaults match the backend defaults, so pages read correctly before the
// config loads or if the API is older.
export const DEFAULT_CONFIG: Required<SiteConfig> = {
  in_the_box: "Original charger\nFree laptop bag\nFree wireless mouse",
  shipping_assurance:
    "Damaged in transit? It's on us. Record a clear, uncut video while opening the sealed package — we need it to approve a transit-damage claim.",
  warranty_exclusions:
    "Burn and physical damage: cracks, dents, broken body or hinges\n" +
    "Keyboard, speakers and screen\n" +
    "Liquid or water damage of any kind\n" +
    "Battery, beyond the minimum backup guaranteed for the product\n" +
    "Spare parts not listed in the product's warranty",
  warranty_void_conditions:
    "Warranty sticker or seal broken, removed or tampered with\n" +
    "Device opened or repaired outside Yuva Service Lab\n" +
    "Serial number removed or not matching our records\n" +
    "Original invoice not produced at the time of claim",
  warranty_terms:
    "Once goods are sold they cannot be taken back as a return. Exchange or replacement within the testing period only if the device is undamaged and in the same condition as delivered.\n" +
    "No free part replacement other than what the product's warranty lists. Other parts are chargeable.\n" +
    "Repairs at Yuva Service Lab carry a 15-day warranty on the same repair, from the date of delivery.\n" +
    "Transit-damage claims need an unboxing video recorded while opening the sealed package.\n" +
    "Data backup is the customer's responsibility.\n" +
    "Yuva Computers' decision on warranty eligibility is final.",
  warranty_claim_steps:
    "WhatsApp our service team on 9347145456 with your invoice or order number and a short video of the problem\n" +
    "Our technician checks it, usually the same day\n" +
    "Bring it to any Yuva store, or ship it back with Delhivery\n" +
    "We repair or replace it as per your warranty and return it to you",
  refurbishment_summary: "50-point quality check",
  refurbishment_points:
    "Every component inspected individually, not in batches\n" +
    "Faulty parts replaced in our in-house refurbishment lab\n" +
    "Display checked for dead pixels, spots and backlight bleed\n" +
    "Battery health tested and backup verified\n" +
    "Keyboard, touchpad, ports, speakers, webcam and Wi-Fi tested\n" +
    "Stress-tested for performance and heating\n" +
    "Fresh, genuine OS installed with drivers and updates\n" +
    "Deep-cleaned, sanitised and sealed with a Yuva warranty sticker",
  service_summary: "Service at 17+ Yuva stores",
};

/** How long the main cover lasts, e.g. "1 year" or "6 months". */
export const coverLength = (months: number) =>
  months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months`;

let pending: Promise<Required<SiteConfig>> | null = null;

export const loadSiteConfig = () =>
  (pending ??= storeService
    .getSiteConfig()
    .then((c: SiteConfig) => {
      const merged = { ...DEFAULT_CONFIG };
      for (const [k, v] of Object.entries(c || {})) {
        if (k in merged && v !== null && v !== undefined && v !== "") (merged as any)[k] = v;
      }
      return merged;
    })
    .catch(() => {
      pending = null;
      return DEFAULT_CONFIG;
    }));

export function useSiteConfig() {
  const [config, setConfig] = useState<Required<SiteConfig>>(DEFAULT_CONFIG);
  useEffect(() => {
    let alive = true;
    loadSiteConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

export const lines = (text?: string) => String(text ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
