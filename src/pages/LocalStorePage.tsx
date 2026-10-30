import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, Clock, MapPin, MessageCircle, Navigation, Phone, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { contentService, storeService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import NotFound from "./NotFound";
import { SITE, whatsappLink } from "@/lib/site";

interface StoreItem {
  id: number;
  name: string;
  state: string;
  phone?: string;
  maps_url?: string;
  address?: string;
}

export const storeShortName = (name: string) => name.replace(/^Yuva Computers\s*[–-]\s*/i, "").trim();
export const storeSlug = (name: string) =>
  storeShortName(name).toLowerCase().replace(/[()]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const HYDERABAD_AREAS = /dilsh?u?kh?nagar|kphb|kukatpally|ameerpet|istore/i;

const LocalStorePage = () => {
  const { city = "" } = useParams();
  const [stores, setStores] = useState<StoreItem[] | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    contentService.getStoresContent().then((d) => setStores(d.stores || [])).catch(() => setStores([]));
    storeService
      .getProducts({ is_best_seller: "true" })
      .then((d: any) => setProducts((Array.isArray(d) ? d : d.products || []).slice(0, 8)))
      .catch(() => setProducts([]));
  }, []);

  const store = useMemo(() => stores?.find((s) => storeSlug(s.name) === city), [stores, city]);
  const others = useMemo(
    () => (stores || []).filter((s) => s.id !== store?.id && s.state === store?.state).slice(0, 6),
    [stores, store]
  );

  if (stores === null) {
    return <div className="container mx-auto px-4 py-20"><div className="h-64 rounded-3xl bg-muted animate-pulse" /></div>;
  }
  if (!store) return <NotFound />;

  const area = storeShortName(store.name);
  const isIStore = /istore/i.test(store.name);
  const place = HYDERABAD_AREAS.test(store.name) ? `${area}, Hyderabad` : area;
  const what = isIStore ? "MacBooks" : "laptops";
  const canonical = `/refurbished-laptops-in/${city}`;

  const faqs = [
    {
      q: `Where is the Yuva Computers store in ${area}?`,
      a: `${store.address || place}. ${store.phone ? `Call ${store.phone} before visiting to check stock.` : ""}`,
    },
    {
      q: `Can I test a refurbished ${isIStore ? "MacBook" : "laptop"} before buying in ${area}?`,
      a: "Yes. Visit the store to see and test the exact unit. Online orders can also be picked up from the store for free.",
    },
    {
      q: "Do refurbished laptops from Yuva come with warranty?",
      a: "Every laptop goes through a 50-point check and comes with a 15-day testing warranty. Laptops from ₹15,000 also get a 1-year RAM, SSD and motherboard warranty.",
    },
    {
      q: `Can I exchange my old laptop at the ${area} store?`,
      a: "Yes. Get an instant estimate on our Sell your laptop page, then bring it to the store and pay only the difference.",
    },
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "ComputerStore",
      "name": store.name,
      "url": `https://www.yuvacomputers.in${canonical}`,
      "telephone": store.phone ? `+91${store.phone.replace(/\D/g, "").slice(-10)}` : `+91${SITE.phone}`,
      "address": { "@type": "PostalAddress", "streetAddress": store.address, "addressRegion": store.state, "addressCountry": "IN" },
      "openingHours": "Mo-Su 10:00-20:30",
      "parentOrganization": { "@type": "Organization", "name": "Yuva Computers", "url": "https://www.yuvacomputers.in" },
      ...(store.maps_url ? { "hasMap": store.maps_url } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
    },
  ];

  return (
    <>
      <SEO
        title={`Refurbished ${isIStore ? "MacBooks" : "Laptops"} in ${place} | Yuva Computers`}
        description={`Buy certified refurbished ${what} in ${place} with warranty and a 15-day testing warranty. Visit Yuva Computers ${area}, test before you buy, or exchange your old laptop.`}
        canonical={canonical}
        jsonLd={schema}
      />
      <PageHero
        eyebrow={`Yuva Computers · ${store.state}`}
        title={<>Refurbished {what} in <span className="text-brand-leaf">{place}</span></>}
        text={`Test the exact ${isIStore ? "MacBook" : "laptop"} before you buy, take it home the same day, and get our warranty and 15-day testing warranty.`}
        crumbs={[{ label: "Stores", to: "/stores" }, { label: area }]}
      />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
        <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-display font-bold text-2xl">{store.name}</h2>
          {store.address && (
            <p className="flex gap-3 text-sm"><MapPin className="w-5 h-5 text-primary shrink-0" /> {store.address}</p>
          )}
          <p className="flex gap-3 text-sm"><Clock className="w-5 h-5 text-primary shrink-0" /> {SITE.hours}</p>
          <div className="flex flex-wrap gap-2">
            {store.phone && (
              <a href={`tel:+91${store.phone.replace(/\D/g, "").slice(-10)}`} className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-navy text-white text-sm font-semibold">
                <Phone className="w-4 h-4" /> {store.phone}
              </a>
            )}
            {store.maps_url && (
              <a href={store.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-sm font-semibold hover:bg-muted">
                <Navigation className="w-4 h-4" /> Directions
              </a>
            )}
            <a
              href={whatsappLink(`Hi, I'd like to visit the ${area} store. What ${what} do you have in stock?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-leaf text-white text-sm font-semibold"
            >
              <MessageCircle className="w-4 h-4" /> Check stock
            </a>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 pt-5 border-t border-border text-sm">
            <li className="flex gap-2"><BadgeCheck className="w-5 h-5 text-brand-leaf-dark shrink-0" /> 50-point quality check</li>
            <li className="flex gap-2"><ShieldCheck className="w-5 h-5 text-brand-leaf-dark shrink-0" /> Written warranty</li>
            <li className="flex gap-2"><RefreshCw className="w-5 h-5 text-brand-leaf-dark shrink-0" /> 15-day testing warranty</li>
            <li className="flex gap-2"><Wrench className="w-5 h-5 text-brand-leaf-dark shrink-0" /> RAM & SSD upgrades</li>
          </ul>
        </div>
        <div className="rounded-3xl overflow-hidden border border-border h-80 lg:h-full min-h-80 bg-muted">
          <iframe
            className="w-full h-full"
            loading="lazy"
            title={`Map of ${store.name}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(store.address || store.name)}&output=embed`}
          />
        </div>
      </section>

      {products.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 pb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">Popular laptops near {area}</h2>
            <Link to="/products" className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="bg-muted/60 py-14">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-10">
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">Questions about our {area} store</h2>
            <dl className="mt-6 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-2xl bg-card border border-border p-5">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          {others.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl">Other stores in {store.state}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {others.map((s) => (
                  <li key={s.id}>
                    <Link to={`/refurbished-laptops-in/${storeSlug(s.name)}`} className="block rounded-xl bg-card border border-border px-4 py-3 text-sm font-semibold hover:border-foreground/40">
                      {storeShortName(s.name)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/sell-your-laptop" className="mt-6 block rounded-2xl bg-brand-navy text-white p-5">
                <p className="font-display font-bold">Exchange your old laptop</p>
                <p className="text-sm text-white/70 mt-1">Get an instant estimate online →</p>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LocalStorePage;
