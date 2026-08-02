"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Scale } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { PropertyService } from "@/services/PropertyService";
import { Property } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency } from "@/utils/formatters";

interface Row {
  label: string;
  value: (p: Property) => string;
}

const rows: Row[] = [
  { label: "Price", value: (p) => formatCurrency(p.price) + (p.purpose === "rent" ? "/mo" : "") },
  { label: "Type", value: (p) => p.type },
  { label: "Purpose", value: (p) => p.purpose },
  { label: "Sub-type", value: (p) => p.propertySubType ?? "—" },
  { label: "Size", value: (p) => `${p.squareFeet.toLocaleString()} sqft` },
  {
    label: "Bedrooms",
    value: (p) => (p.type === "residential" ? String((p as { bedrooms?: number }).bedrooms ?? "—") : "—"),
  },
  {
    label: "Bathrooms",
    value: (p) => (p.type === "residential" ? String((p as { bathrooms?: number }).bathrooms ?? "—") : "—"),
  },
  { label: "Parking", value: (p) => String(p.parkingSpace) },
  { label: "Year built", value: (p) => String(p.yearBuilt) },
  { label: "City", value: (p) => p.city },
  { label: "Address", value: (p) => p.address },
  { label: "Status", value: (p) => p.status.replace("_", " ") },
];

export default function ComparePage() {
  const { propertyIds, remove, clear } = useCompareStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (propertyIds.length === 0) {
      setProperties([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all(propertyIds.map((id) => PropertyService.getById(id)))
      .then((results) => setProperties(results.filter((p): p is Property => Boolean(p))))
      .finally(() => setIsLoading(false));
  }, [propertyIds]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
            Compare properties
          </h1>
          <p className="mt-1 text-sm text-navy-400">
            Side-by-side comparison of your selected listings.
          </p>
        </div>
        {properties.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear}>
            Clear all
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Scale size={22} />}
          title="No properties selected"
          description="Tap the scale icon on any property card to add it here (up to 3 at a time)."
          action={
            <Link href="/properties">
              <Button>Browse properties</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-40 text-left text-xs font-medium text-navy-400"> </th>
                {properties.map((p) => (
                  <th key={p.propertyId} className="px-2 pb-2 text-left align-top">
                    <Card className="relative overflow-hidden p-0">
                      <button
                        onClick={() => remove(p.propertyId)}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full glass text-white"
                        aria-label="Remove from comparison"
                      >
                        <X size={13} />
                      </button>
                      <div className="relative h-32 w-full">
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <Link
                          href={`/properties/${p.propertyId}`}
                          className="line-clamp-2 text-sm font-semibold text-navy-900 hover:underline dark:text-white"
                        >
                          {p.title}
                        </Link>
                      </div>
                    </Card>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="bg-surface-muted">
                  <td className="rounded-l-xl px-4 py-3 text-xs font-semibold text-navy-500">
                    {row.label}
                  </td>
                  {properties.map((p, i) => (
                    <td
                      key={p.propertyId}
                      className={`px-4 py-3 text-sm capitalize text-navy-800 dark:text-white ${
                        i === properties.length - 1 ? "rounded-r-xl" : ""
                      }`}
                    >
                      {row.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
