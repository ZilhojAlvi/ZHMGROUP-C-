import { Property, PropertyFilters } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import { createPropertyModel } from "@/lib/oop/Property";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const PropertyService = {
  async list(): Promise<Property[]> {
    const { properties } = await apiGet<{ properties: Property[] }>("/api/properties");
    return properties;
  },

  async getById(id: string): Promise<Property | undefined> {
    try {
      const { property } = await apiGet<{ property: Property }>(`/api/properties/${id}`);
      return property;
    } catch {
      return undefined;
    }
  },

  async listByAgent(agentId: string): Promise<Property[]> {
    const { properties } = await apiGet<{ properties: Property[] }>(
      `/api/properties${buildQuery({ agentId })}`
    );
    return properties;
  },

  /** Applies the full PropertyFilters object (keyword, type, price range, etc.) via query params. */
  async search(filters: PropertyFilters): Promise<Property[]> {
    const qs = buildQuery({
      keyword: filters.keyword,
      type: filters.type,
      purpose: filters.purpose,
      city: filters.city,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      minBaths: filters.minBaths,
      minSquareFeet: filters.minSquareFeet,
      status: filters.status,
      sortBy: filters.sortBy,
    });
    const { properties } = await apiGet<{ properties: Property[] }>(`/api/properties${qs}`);
    return properties;
  },

  async create(data: Omit<Property, "propertyId" | "createdAt" | "updatedAt">): Promise<Property> {
    const { property } = await apiPost<{ property: Property }>("/api/properties", data);
    return property;
  },

  async update(id: string, updates: Partial<Property>): Promise<Property> {
    const { property } = await apiPut<{ property: Property }>(`/api/properties/${id}`, updates);
    return property;
  },

  async remove(id: string): Promise<void> {
    await apiDelete(`/api/properties/${id}`);
  },

  /** Computes tax for a given property using the polymorphic OOP model (pure client-side calc, no API needed). */
  calculateTax(property: Property): number {
    return createPropertyModel(property).calculateTax();
  },
};
