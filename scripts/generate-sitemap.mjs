// Builds public/sitemap.xml before each build: static pages, store pages and
// every active product. If the API can't be reached, the static pages are
// still written so the build never fails because of it.
import { writeFileSync } from "node:fs";

const SITE = "https://www.yuvacomputers.in";
const API = process.env.VITE_API_URL || "https://api.yuvacomputers.in/api";

const STATIC = [
  ["/", "daily", "1.0"],
  ["/products", "daily", "0.9"],
  ["/sell-your-laptop", "monthly", "0.8"],
  ["/stores", "monthly", "0.8"],
  ["/bulk-orders", "monthly", "0.7"],
  ["/company", "monthly", "0.6"],
  ["/condition-guide", "monthly", "0.6"],
  ["/warranty", "monthly", "0.5"],
  ["/track-order", "monthly", "0.4"],
  ["/faq", "monthly", "0.6"],
  ["/blogs", "weekly", "0.6"],
  ["/contact", "monthly", "0.5"],
  ["/returns-refund-policy", "yearly", "0.3"],
  ["/shipping-policy", "yearly", "0.3"],
];

const storeSlug = (name) =>
  name.replace(/^Yuva Computers\s*[–-]\s*/i, "").trim().toLowerCase()
    .replace(/[()]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const getJson = async (path) => {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};

const urls = STATIC.map(([path, freq, prio]) => ({ loc: SITE + path, freq, prio }));

try {
  const { stores = [] } = await getJson("/content/stores/");
  for (const s of stores) urls.push({ loc: `${SITE}/refurbished-laptops-in/${storeSlug(s.name)}`, freq: "monthly", prio: "0.7" });
} catch (e) {
  console.warn("[sitemap] stores skipped:", e.message);
}
try {
  const data = await getJson("/store/products/");
  const products = Array.isArray(data) ? data : data.products || data.results || [];
  for (const p of products) if (p.slug) urls.push({ loc: `${SITE}/product/${p.slug}`, freq: "weekly", prio: "0.8" });
} catch (e) {
  console.warn("[sitemap] products skipped:", e.message);
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.prio}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`[sitemap] ${urls.length} URLs written`);
