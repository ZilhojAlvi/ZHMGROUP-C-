"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE_ITEMS = 3;

interface CompareState {
  propertyIds: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      propertyIds: [],
      toggle: (id) => {
        const { propertyIds } = get();
        if (propertyIds.includes(id)) {
          set({ propertyIds: propertyIds.filter((p) => p !== id) });
          return;
        }
        if (propertyIds.length >= MAX_COMPARE_ITEMS) return;
        set({ propertyIds: [...propertyIds, id] });
      },
      remove: (id) => set((s) => ({ propertyIds: s.propertyIds.filter((p) => p !== id) })),
      clear: () => set({ propertyIds: [] }),
      isSelected: (id) => get().propertyIds.includes(id),
    }),
    { name: "srms-compare-list" }
  )
);
