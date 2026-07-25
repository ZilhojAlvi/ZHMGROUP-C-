"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Property } from "@/types";
import { PropertyCard } from "./PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";

export function PropertyCarousel({
  properties,
  isLoading,
}: {
  properties: Property[];
  isLoading?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 sm:flex">
        <button
          onClick={() => scroll("left")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-surface text-navy-600 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-surface text-navy-600 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[300px] shrink-0 sm:w-[340px]">
                <PropertyCardSkeleton />
              </div>
            ))
          : properties.map((p) => (
              <div key={p.propertyId} className="w-[300px] shrink-0 sm:w-[340px]">
                <PropertyCard property={p} />
              </div>
            ))}
      </div>
    </div>
  );
}
