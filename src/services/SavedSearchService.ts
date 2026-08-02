import { SavedSearchRecord, PropertyFilters } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

export type SavedSearchWithCount = SavedSearchRecord & { matchCount: number };

export const SavedSearchService = {
  async list(): Promise<SavedSearchWithCount[]> {
    const { savedSearches } = await apiGet<{ savedSearches: SavedSearchWithCount[] }>(
      "/api/saved-searches"
    );
    return savedSearches;
  },

  async create(name: string, filters: PropertyFilters): Promise<SavedSearchRecord> {
    const { savedSearch } = await apiPost<{ savedSearch: SavedSearchRecord }>(
      "/api/saved-searches",
      { name, filters }
    );
    return savedSearch;
  },

  async remove(id: string): Promise<void> {
    await apiDelete(`/api/saved-searches/${id}`);
  },
};
