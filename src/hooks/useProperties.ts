"use client";

import { useCallback, useEffect, useState } from "react";
import { Property, PropertyFilters } from "@/types";
import { PropertyService } from "@/services/PropertyService";

export function useProperties(initialFilters: PropertyFilters = {}) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: PropertyFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await PropertyService.search(f);
      setProperties(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(filters);
  }, [filters, load]);

  return { properties, filters, setFilters, isLoading, error, refetch: () => load(filters) };
}
