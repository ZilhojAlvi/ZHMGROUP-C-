"use client";

import { SlidersHorizontal, Search, X } from "lucide-react";
import { PropertyFilters as Filters } from "@/types";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CITIES } from "@/utils/constants";

interface PropertyFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function PropertyFiltersPanel({ filters, onChange }: PropertyFiltersProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const activeCount = [
    filters.type && filters.type !== "all",
    filters.purpose && filters.purpose !== "all",
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
  ].filter(Boolean).length;

  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-800 dark:text-white">
          <SlidersHorizontal size={16} /> Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({ keyword: filters.keyword, sortBy: filters.sortBy })}
            className="flex items-center gap-1 text-xs text-rose-500 hover:underline"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search by title, city, address..."
          leftIcon={<Search size={15} />}
          value={filters.keyword ?? ""}
          onChange={(e) => update({ keyword: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={filters.type ?? "all"}
            onChange={(e) => update({ type: e.target.value as Filters["type"] })}
            options={[
              { label: "All types", value: "all" },
              { label: "Residential", value: "residential" },
              { label: "Commercial", value: "commercial" },
              { label: "Land / Plot", value: "land" },
            ]}
          />
          <Select
            label="Purpose"
            value={filters.purpose ?? "all"}
            onChange={(e) => update({ purpose: e.target.value as Filters["purpose"] })}
            options={[
              { label: "Buy or rent", value: "all" },
              { label: "For sale", value: "sale" },
              { label: "For rent", value: "rent" },
            ]}
          />
        </div>

        <Select
          label="City"
          placeholder="Any city"
          value={filters.city ?? ""}
          onChange={(e) => update({ city: e.target.value || undefined })}
          options={CITIES.map((c) => ({ label: c, value: c }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min price"
            type="number"
            placeholder="0"
            value={filters.minPrice ?? ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            label="Max price"
            type="number"
            placeholder="Any"
            value={filters.maxPrice ?? ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Min beds"
            placeholder="Any"
            value={filters.minBeds?.toString() ?? ""}
            onChange={(e) => update({ minBeds: e.target.value ? Number(e.target.value) : undefined })}
            options={["1", "2", "3", "4", "5"].map((v) => ({ label: `${v}+`, value: v }))}
          />
          <Select
            label="Min baths"
            placeholder="Any"
            value={filters.minBaths?.toString() ?? ""}
            onChange={(e) => update({ minBaths: e.target.value ? Number(e.target.value) : undefined })}
            options={["1", "2", "3", "4"].map((v) => ({ label: `${v}+`, value: v }))}
          />
        </div>

        <Select
          label="Sort by"
          value={filters.sortBy ?? "newest"}
          onChange={(e) => update({ sortBy: e.target.value as Filters["sortBy"] })}
          options={[
            { label: "Newest first", value: "newest" },
            { label: "Price: low to high", value: "price_asc" },
            { label: "Price: high to low", value: "price_desc" },
            { label: "Largest size", value: "size_desc" },
          ]}
        />
      </div>
    </div>
  );
}

export function PropertyFiltersMobileTrigger({ onOpen, activeCount }: { onOpen: () => void; activeCount: number }) {
  return (
    <Button variant="outline" size="md" onClick={onOpen} className="lg:hidden">
      <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
    </Button>
  );
}
