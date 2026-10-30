// src/lib/specs.ts
// ── Spec normalisation ─────────────────────────────────────────────────────
// Variant specs are typed by hand in the admin ("16GB", "16GB DDR4", "16"),
// so filters group them by their canonical size / processor family.

export const normalizeSize = (raw: string): string => {
  const m = raw.match(/(\d+(?:\.\d+)?)\s*(tb|gb)?/i);
  if (!m) return raw.trim();
  return `${m[1]}${(m[2] || "GB").toUpperCase()}`;
};

export const normalizeProcessor = (raw: string): string => {
  const s = raw.toLowerCase();
  const intel = s.match(/\bi([3579])\b/);
  if (intel) return `Intel Core i${intel[1]}`;
  const ryzen = s.match(/ryzen\s*([3579])/);
  if (ryzen) return `AMD Ryzen ${ryzen[1]}`;
  const apple = s.match(/\bm([1-4])(\s*(pro|max|ultra))?\b/);
  if (apple) return `Apple M${apple[1]}${apple[3] ? " " + apple[3][0].toUpperCase() + apple[3].slice(1) : ""}`;
  if (s.includes("celeron")) return "Intel Celeron";
  if (s.includes("pentium")) return "Intel Pentium";
  return raw.trim();
};


/** Placeholder spec values (e.g. monitors have no RAM/storage) that should never be shown. */
export const isPlaceholderSpec = (v?: string | null) =>
  !v || /^(n\/?a|na|-+|none|not applicable)$/i.test(v.trim());
