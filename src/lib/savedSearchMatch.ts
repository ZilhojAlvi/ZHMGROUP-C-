import type { Property as DbProperty } from "@prisma/client";
import type { PropertyFilters } from "@/types";

/**
 * Mirrors the WHERE-clause logic in GET /api/properties, but runs in-memory
 * against a single newly created property so we can decide which saved
 * searches to notify without an extra DB round trip.
 */
export function propertyMatchesFilters(property: DbProperty, filters: PropertyFilters): boolean {
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase();
    const haystack = `${property.title} ${property.city} ${property.address} ${property.description}`.toLowerCase();
    if (!haystack.includes(k)) return false;
  }
  if (filters.type && filters.type !== "all" && property.type !== filters.type) return false;
  if (filters.purpose && filters.purpose !== "all" && property.purpose !== filters.purpose) return false;
  if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.status && filters.status !== "all" && property.status !== filters.status) return false;
  if (typeof filters.minPrice === "number" && property.price < filters.minPrice) return false;
  if (typeof filters.maxPrice === "number" && property.price > filters.maxPrice) return false;
  if (typeof filters.minSquareFeet === "number" && property.squareFeet < filters.minSquareFeet) return false;
  if (typeof filters.minBeds === "number" && (property.bedrooms ?? 0) < filters.minBeds) return false;
  if (typeof filters.minBaths === "number" && (property.bathrooms ?? 0) < filters.minBaths) return false;
  return true;
}
