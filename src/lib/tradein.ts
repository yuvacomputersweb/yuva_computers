// Rough buy-back prices for the "Sell your old laptop" estimate.
// Adjust these numbers to match what the shop actually pays.

export const BRANDS = ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Microsoft", "Other"];

export const PROCESSORS: { label: string; base: number; apple?: boolean }[] = [
  { label: "Intel Core i3", base: 5000 },
  { label: "Intel Core i5", base: 8000 },
  { label: "Intel Core i7", base: 11500 },
  { label: "Intel Core i9", base: 16000 },
  { label: "AMD Ryzen 3", base: 5500 },
  { label: "AMD Ryzen 5", base: 9000 },
  { label: "AMD Ryzen 7", base: 12500 },
  { label: "Celeron / Pentium / Athlon", base: 2500 },
  { label: "Apple Intel (2015–2020)", base: 14000, apple: true },
  { label: "Apple M1", base: 30000, apple: true },
  { label: "Apple M1 Pro / Max", base: 52000, apple: true },
  { label: "Apple M2", base: 42000, apple: true },
  { label: "Apple M2 Pro / Max", base: 68000, apple: true },
  { label: "Apple M3 or newer", base: 60000, apple: true },
];

/** Multiplier by processor generation (Intel/AMD only). */
export const GENERATIONS: { label: string; factor: number }[] = [
  { label: "12th gen or newer / Ryzen 6000+", factor: 1.7 },
  { label: "11th gen / Ryzen 5000", factor: 1.4 },
  { label: "10th gen / Ryzen 4000", factor: 1.15 },
  { label: "8th–9th gen / Ryzen 3000", factor: 1.0 },
  { label: "6th–7th gen / Ryzen 2000", factor: 0.7 },
  { label: "5th gen or older", factor: 0.45 },
  { label: "Not sure", factor: 0.85 },
];

export const RAM_OPTIONS = [
  { label: "4 GB", add: -800 },
  { label: "8 GB", add: 0 },
  { label: "16 GB", add: 1500 },
  { label: "32 GB or more", add: 3500 },
];

export const STORAGE_OPTIONS = [
  { label: "HDD only", add: -1200 },
  { label: "128 GB SSD", add: -500 },
  { label: "256 GB SSD", add: 0 },
  { label: "512 GB SSD", add: 1200 },
  { label: "1 TB SSD or more", add: 2800 },
];

export const CONDITIONS = [
  { value: "excellent", label: "Excellent", hint: "Like new, no marks", factor: 1.0 },
  { value: "good", label: "Good", hint: "Minor scratches, all working", factor: 0.85 },
  { value: "fair", label: "Fair", hint: "Visible wear or small issues", factor: 0.65 },
  { value: "faulty", label: "Not working", hint: "Needs repair / dead", factor: 0.3 },
];

export interface TradeInInput {
  processor: string;
  generation: string;
  ram: string;
  storage: string;
  condition: string;
  hasCharger: boolean;
}

const round = (n: number) => Math.max(500, Math.round(n / 500) * 500);

export function estimateTradeIn(i: TradeInInput): { low: number; high: number } | null {
  const proc = PROCESSORS.find((p) => p.label === i.processor);
  const cond = CONDITIONS.find((c) => c.value === i.condition);
  if (!proc || !cond) return null;

  const gen = proc.apple ? 1 : GENERATIONS.find((g) => g.label === i.generation)?.factor ?? 0.85;
  const ram = RAM_OPTIONS.find((r) => r.label === i.ram)?.add ?? 0;
  const storage = STORAGE_OPTIONS.find((s) => s.label === i.storage)?.add ?? 0;

  let value = (proc.base * gen + ram + storage) * cond.factor;
  if (!i.hasCharger) value -= proc.apple ? 2500 : 800;

  return { low: round(value * 0.88), high: round(value * 1.1) };
}
