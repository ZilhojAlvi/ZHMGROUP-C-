"use client";

import { useRouter } from "next/navigation";
import { Scale, X } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { Button } from "@/components/ui/Button";

export function CompareBar() {
  const router = useRouter();
  const { propertyIds, clear } = useCompareStore();

  if (propertyIds.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="glass-strong flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-lg animate-fade-up">
        <div className="flex items-center gap-2 text-sm text-navy-800 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white">
            <Scale size={14} />
          </span>
          <span className="font-medium">
            {propertyIds.length} {propertyIds.length === 1 ? "property" : "properties"} selected to compare
          </span>
          <button
            onClick={clear}
            className="ml-1 text-xs text-navy-400 hover:text-rose-500"
            aria-label="Clear compare list"
          >
            <X size={14} />
          </button>
        </div>
        <Button
          size="sm"
          disabled={propertyIds.length < 2}
          onClick={() => router.push("/compare")}
        >
          {propertyIds.length < 2 ? "Pick 1 more" : "Compare now"}
        </Button>
      </div>
    </div>
  );
}
