"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BellRing, Trash2, Search } from "lucide-react";
import { SavedSearchService, SavedSearchWithCount } from "@/services/SavedSearchService";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/formatters";

function filtersToQuery(filters: SavedSearchWithCount["filters"]): string {
  const sp = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      sp.set(key, String(value));
    }
  });
  return sp.toString();
}

function filterSummary(filters: SavedSearchWithCount["filters"]): string {
  const parts: string[] = [];
  if (filters.type && filters.type !== "all") parts.push(filters.type);
  if (filters.purpose && filters.purpose !== "all") parts.push(`for ${filters.purpose}`);
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.minBeds) parts.push(`${filters.minBeds}+ beds`);
  if (filters.minPrice || filters.maxPrice) {
    parts.push(
      `${filters.minPrice ? `৳${filters.minPrice.toLocaleString()}` : "any"}–${
        filters.maxPrice ? `৳${filters.maxPrice.toLocaleString()}` : "any"
      }`
    );
  }
  if (filters.keyword) parts.push(`"${filters.keyword}"`);
  return parts.length > 0 ? parts.join(" · ") : "All properties";
}

export default function SavedSearchesPage() {
  const { session, isHydrated } = useAuth();
  const [items, setItems] = useState<SavedSearchWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session || session.role !== "customer") {
      setIsLoading(false);
      return;
    }
    SavedSearchService.list()
      .then(setItems)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
  }, [session, isHydrated]);

  const handleDelete = async (id: string) => {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.savedSearchId !== id));
    try {
      await SavedSearchService.remove(id);
      toast.success("Saved search removed.");
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    }
  };

  if (!isHydrated || isLoading) return <PageLoader />;

  if (!session || session.role !== "customer") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={<BellRing size={22} />}
          title="Sign in as a customer"
          description="Saved searches are available for customer accounts."
          action={
            <Link href="/login">
              <Button>Log in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
          Saved Searches
        </h1>
        <p className="mt-1 text-sm text-navy-400">
          We&apos;ll notify you when a new property matches one of these.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<BellRing size={22} />}
          title="No saved searches yet"
          description="Search or filter properties, then tap 'Save this search' to get alerted about new matches."
          action={
            <Link href="/properties">
              <Button>Browse properties</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s.savedSearchId} className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-base font-semibold text-navy-900 dark:text-white">
                    {s.name}
                  </h3>
                  {s.matchCount > 0 && (
                    <Badge color="emerald">{s.matchCount} match{s.matchCount === 1 ? "" : "es"}</Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-navy-400">{filterSummary(s.filters)}</p>
                <p className="mt-1 text-xs text-navy-300">Saved {formatDate(s.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/properties?${filtersToQuery(s.filters)}`}>
                  <Button variant="outline" size="sm">
                    <Search size={14} /> View
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(s.savedSearchId)}
                  aria-label="Delete saved search"
                >
                  <Trash2 size={14} className="text-rose-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
