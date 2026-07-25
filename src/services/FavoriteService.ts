import { Property } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

export const FavoriteService = {
  async list(): Promise<{ properties: Property[]; propertyIds: string[] }> {
    return apiGet<{ properties: Property[]; propertyIds: string[] }>("/api/favorites");
  },

  async add(propertyId: string): Promise<void> {
    await apiPost("/api/favorites", { propertyId });
  },

  async remove(propertyId: string): Promise<void> {
    await apiDelete(`/api/favorites/${propertyId}`);
  },
};
