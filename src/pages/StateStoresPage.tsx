import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  ArrowLeft,
  Store,
} from "lucide-react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";

const StateStoresPage = () => {
  const { state } = useParams();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService.getStoresContent().then((data) => {
      const filtered = data.stores.filter(
        (s: any) =>
          s.state?.toLowerCase() === state?.toLowerCase()
      );
      setStores(filtered);
      setLoading(false);
    });
  }, [state]);

  const stateTitle = state ? state.charAt(0).toUpperCase() + state.slice(1) : "State";

  return (
    <>
      <SEO
        title={`Yuva Computers Stores in ${stateTitle} | Experience Centers`}
        description={`Find Yuva Computers physical stores in ${stateTitle}. Get store addresses, contact phone numbers, and direct location directions.`}
        canonical={`/stores/${state}`}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <Link
            to="/stores"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to States
          </Link>

          <h1 className="text-3xl font-bold mt-4 flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            {stateTitle} Stores
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Visit our physical stores for best service and support
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          {loading ? (
            <p className="text-gray-500 text-center">Loading stores...</p>
          ) : stores.length === 0 ? (
            <p className="text-center text-gray-400">
              No stores found
            </p>
          ) : (
            stores.map((store) => (
              <div
                key={store.id}
                className="flex flex-col lg:flex-row gap-8 py-10 border-b"
              >
                <div className="lg:w-1/2 space-y-4">
                  <h2 className="text-2xl font-semibold">
                    {store.name}
                  </h2>

                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">
                      {store.address}
                    </span>
                  </div>

                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center gap-2 text-blue-600 font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    {store.phone}
                  </a>

                  <div className="flex gap-3 pt-2">
                    <a
                      href={`tel:${store.phone}`}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Call Store
                    </a>

                    {store.maps_url && (
                      <a
                        href={store.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="border px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:w-1/2 h-72 rounded-xl overflow-hidden border bg-gray-100">
                  <iframe
                    className="w-full h-full"
                    loading="lazy"
                    title={store.name}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      store.address || store.name
                    )}&output=embed`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default StateStoresPage;