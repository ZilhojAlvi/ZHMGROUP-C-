"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SearchX } from "lucide-react";
import { PropertyFiltersPanel } from "@/features/property/PropertyFilters";
import { PropertyCard } from "@/features/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { FavoriteService } from "@/services/FavoriteService";
import { PropertyFilters } from "@/types";

function PropertiesListingInner() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as PropertyFilters["type"]) ?? "all";
  const { session } = useAuthStore();

  const { properties, filters, setFilters, isLoading } = useProperties({
    type: initialType,
    sortBy: "newest",
  });

  const [keywordInput, setKeywordInput] = useState(filters.keyword ?? "");
  const debouncedKeyword = useDebounce(keywordInput, 350);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (session?.role !== "customer") {
      setSavedIds([]);
      return;
    }
    FavoriteService.list()
      .then(({ propertyIds }) => setSavedIds(propertyIds))
      .catch(() => undefined);
  }, [session]);

  const handleToggleSave = async (propertyId: string) => {
    if (!session) {
      toast.error("Sign in as a customer to save properties.");
      return;
    }
    const isSaved = savedIds.includes(propertyId);
    setSavedIds((ids) => (isSaved ? ids.filter((id) => id !== propertyId) : [...ids, propertyId]));
    try {
      if (isSaved) await FavoriteService.remove(propertyId);
      else await FavoriteService.add(propertyId);
    } catch (err) {
      // Roll back on failure.
      setSavedIds((ids) => (isSaved ? [...ids, propertyId] : ids.filter((id) => id !== propertyId)));
      toast.error(err instanceof Error ? err.message : "Could not update favorites.");
    }
  };

  useEffect(() => {
    setFilters((f) => ({ ...f, keyword: debouncedKeyword }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
          Explore properties
        </h1>
        <p className="mt-1 text-sm text-navy-400">
          {isLoading ? "Searching..." : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PropertyFiltersPanel
            filters={{ ...filters, keyword: keywordInput }}
            onChange={(f) => {
              setKeywordInput(f.keyword ?? "");
              setFilters(f);
            }}
          />
        </div>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              icon={<SearchX size={22} />}
              title="No properties match your filters"
              description="Try widening your price range or clearing a few filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((p, i) => (
                <div key={p.propertyId} style={{ animationDelay: `${(i % 6) * 60}ms` }}>
                  <PropertyCard
                    property={p}
                    saved={savedIds.includes(p.propertyId)}
                    onToggleSave={session?.role === "customer" ? handleToggleSave : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesListingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-navy-400">Loading...</div>}>
      <PropertiesListingInner />
    </Suspense>
  );
}
