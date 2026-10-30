import { useEffect, useState } from "react";
import { storeService } from "@/services/api";

/** Store-wide settings from Admin → Site Configuration. */
export interface SiteConfig {
  in_the_box?: string;
  testing_warranty_days?: number;
  parts_warranty_months?: number;
  warranty_summary?: string;
  warranty_points?: string;
  warranty_exclusions?: string;
  warranty_claim_steps?: string;
  refurbishment_summary?: string;
  refurbishment_points?: string;
  service_summary?: string;
}

// Defaults match the backend defaults, so pages read correctly before the
// config loads or if the API is older.
export const DEFAULT_CONFIG: Required<SiteConfig> = {
  in_the_box: "Original charger\nFree laptop bag\nFree wireless mouse",
  testing_warranty_days: 15,
  parts_warranty_months: 12,
  warranty_summary: "1-Year Parts Warranty + 15-Day Testing Warranty",
  warranty_points:
    "15-day testing warranty: replacement for any damage or problem found in the first 15 days\n" +
    "RAM and hard disk / SSD: 1-year replacement warranty\n" +
    "Motherboard: 1-year repair warranty (if repairable)\n" +
    "Battery and charger: covered by the 15-day testing warranty\n" +
    "Lifetime service support at every Yuva store",
  warranty_exclusions:
    "Physical damage, cracks, dents or a broken screen after delivery\n" +
    "Liquid or water damage, burnt parts or power-surge damage\n" +
    "Warranty sticker removed or repairs done outside Yuva\n" +
    "Software, virus or data issues (we can reinstall the OS for you)",
  warranty_claim_steps:
    "WhatsApp us your order number or serial number and a short video of the problem\n" +
    "Our technician checks it, usually the same day\n" +
    "Bring it to any Yuva store, or ship it back with Delhivery\n" +
    "We replace or repair it and return it to you",
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
