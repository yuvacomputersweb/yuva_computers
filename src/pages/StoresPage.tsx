import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2, Store, ArrowRight } from "lucide-react";
import { contentService } from "@/services/api";
import { SEO } from "@/components/SEO";

const StoresPage = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    contentService
      .getStoresContent()
      .then((data) => setStores(data.stores || []))
      .finally(() => setLoading(false));
  }, []);

  const telangana = stores.filter((s) => s.state === "Telangana");
  const ap = stores.filter((s) => s.state === "Andhra Pradesh");

  const states = [
    {
      name: "Telangana",
      count: telangana.length,
      icon: Store,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "Andhra Pradesh",
      count: ap.length,
      icon: Building2,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <>
      <SEO
        title="Store Locations | Yuva Computers Experience Centers"
        description="Visit our experience stores in Telangana and Andhra Pradesh to test certified refurbished laptops and computing hardware in person."
        canonical="/stores"
      />
      <div className="min-h-screen bg-gray-50">
        <section className="text-center py-20">
          <h1 className="text-4xl font-bold">Our Store Locations</h1>
          <p className="text-gray-500 mt-3">
            Select a state to explore store details
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-6">
          {states.map((state) => (
            <div
              key={state.name}
              onClick={() =>
                navigate(`/stores/${state.name.toLowerCase()}`)
              }
              className="cursor-pointer group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              <div
                className={`absolute inset-0 opacity-10 bg-gradient-to-r ${state.gradient}`}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${state.gradient} text-white shadow-lg`}
                  >
                    <state.icon />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {state.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {state.count} Stores Available
                    </p>
                  </div>
                </div>

                <ArrowRight className="text-gray-400 group-hover:text-black transition" />
              </div>

              <p className="text-xs text-gray-400 mt-6">
                Tap to view store locations, contact details & maps
              </p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default StoresPage;