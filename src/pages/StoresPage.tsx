import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Navigation, Search, MessageCircle, Clock } from "lucide-react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { whatsappLink } from "@/lib/site";

interface StoreItem {
  id: number;
  name: string;
  state: string;
  phone?: string;
  maps_url?: string;
  address?: string;
}

const toSlug = (s: string) => s.toLowerCase().trim().replace(/[\s_]+/g, "-");
const shortName = (name: string) => name.replace(/^Yuva Computers\s*[–-]\s*/i, "");

/** All stores, filterable by state; also serves /stores/:state. */
const StoresPage = () => {
  const { state: stateParam } = useParams();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    contentService
      .getStoresContent()
      .then((data) => setStores(data.stores || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const states = useMemo(() => Array.from(new Set(stores.map((s) => s.state))).sort(), [stores]);
  const activeState = states.find((s) => toSlug(s) === toSlug(decodeURIComponent(stateParam || ""))) || null;

  const visible = useMemo(
    () =>
      stores.filter(
        (s) =>
          (!activeState || s.state === activeState) &&
          (!query || `${s.name} ${s.address || ""}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [stores, activeState, query]
  );

  const selected = visible.find((s) => s.id === selectedId) || visible[0];
  const title = activeState ? `Yuva Computers stores in ${activeState}` : "Find a Yuva store near you";

  return (
    <>
      <SEO
        title={`${title} | Yuva Computers`}
        description={`Visit ${stores.length || "our"} Yuva Computers stores${activeState ? ` in ${activeState}` : " across Telangana and Andhra Pradesh"} to see and test certified refurbished laptops in person. Phone numbers and directions for every branch.`}
        canonical={activeState ? `/stores/${toSlug(activeState)}` : "/stores"}
      />

      <PageHero
        eyebrow="Store locator"
        title={activeState ? <>Stores in {activeState}</> : <>{stores.length || ""} stores. Try before you buy.</>}
        text="See the exact laptop in person, get expert advice and take it home the same day. Online orders can be picked up free at any branch."
        crumbs={activeState ? [{ label: "Stores", to: "/stores" }, { label: activeState }] : [{ label: "Stores" }]}
      />

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[null, ...states].map((s) => {
              const active = s === activeState;
              const count = s ? stores.filter((x) => x.state === s).length : stores.length;
              return (
                <button
                  key={s ?? "all"}
                  onClick={() => { setSelectedId(null); navigate(s ? `/stores/${toSlug(s)}` : "/stores"); }}
                  className={`shrink-0 h-10 px-4 rounded-full text-sm font-semibold border transition-colors ${
                    active ? "bg-brand-navy border-brand-navy text-white" : "bg-card border-border hover:border-foreground/40"
                  }`}
                >
                  {s ?? "All states"} <span className={active ? "text-white/60" : "text-muted-foreground"}>({count})</span>
                </button>
              );
            })}
          </div>
          <label className="relative md:ml-auto md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your city"
              aria-label="Search stores by city"
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
            <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}</div>
            <div className="h-[480px] rounded-3xl bg-muted animate-pulse" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No stores match “{query}”. Try another city.</p>
        ) : (
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:max-h-[640px] lg:overflow-y-auto lg:pr-2">
              {visible.map((store) => {
                const active = selected?.id === store.id;
                return (
                  <li key={store.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(store.id)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedId(store.id)}
                      className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                        active ? "border-brand-navy ring-2 ring-brand-navy/10 bg-card" : "border-border bg-card hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf-dark">{store.state}</p>
                          <h2 className="font-display font-bold text-lg">{shortName(store.name)}</h2>
                        </div>
                        <MapPin className={`w-5 h-5 shrink-0 ${active ? "text-brand-leaf-dark" : "text-muted-foreground"}`} />
                      </div>
                      {store.address && <p className="mt-2 text-sm text-muted-foreground">{store.address}</p>}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {store.phone && (
                          <a
                            href={`tel:+91${store.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-brand-navy text-white text-xs font-semibold"
                          >
                            <Phone className="w-3.5 h-3.5" /> {store.phone}
                          </a>
                        )}
                        {store.maps_url && (
                          <a
                            href={store.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-xs font-semibold hover:bg-muted"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Directions
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {selected && (
              <div className="lg:sticky lg:top-40 rounded-3xl overflow-hidden border border-border bg-card">
                <div className="h-72 md:h-[420px] bg-muted">
                  <iframe
                    className="w-full h-full"
                    loading="lazy"
                    title={`Map of ${selected.name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selected.address || selected.name)}&output=embed`}
                  />
                </div>
                <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl">{shortName(selected.name)}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4" /> Call ahead to check today’s stock
                    </p>
                  </div>
                  <a
                    href={whatsappLink(`Hi, I'd like to visit the ${shortName(selected.name)} store. What laptops do you have in stock?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-brand-leaf text-white text-sm font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" /> Check stock on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StoresPage;
