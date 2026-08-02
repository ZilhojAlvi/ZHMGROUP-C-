"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { PropertyService } from "@/services/PropertyService";
import { Property } from "@/types";
import { PageLoader } from "@/components/ui/Spinner";

// Leaflet touches `window`, so it must never render on the server.
const PropertiesMap = dynamic(
  () => import("@/features/property/PropertiesMap").then((m) => m.PropertiesMap),
  { ssr: false, loading: () => <PageLoader /> }
);

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState("all");

  useEffect(() => {
    PropertyService.list()
      .then(setProperties)
      .finally(() => setIsLoading(false));
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))).sort(),
    [properties]
  );

  const filtered = useMemo(
    () => (city === "all" ? properties : properties.filter((p) => p.city === city)),
    [properties, city]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
            Properties map
          </h1>
          <p className="mt-1 text-sm text-navy-400">
            {isLoading ? "Loading..." : `${filtered.length} properties shown`}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-900">
          <MapPin size={15} className="text-navy-400" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-sm text-navy-800 outline-none dark:text-white"
          >
            <option value="all">All areas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
          <PropertiesMap properties={filtered} />
        </div>
      )}
    </div>
  );
}
