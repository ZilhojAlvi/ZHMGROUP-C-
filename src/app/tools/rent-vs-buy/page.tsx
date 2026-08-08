"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RentVsBuyCalculator } from "@/features/tools/RentVsBuyCalculator";

function RentVsBuyInner() {
  const searchParams = useSearchParams();
  const priceParam = searchParams.get("price");
  const rentParam = searchParams.get("rent");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
          Rent vs Buy Calculator
        </h1>
        <p className="mt-1 text-sm text-navy-400">
          Compare building home equity against investing what you&apos;d otherwise spend, over time.
        </p>
      </div>
      <RentVsBuyCalculator
        initialPrice={priceParam ? Number(priceParam) : undefined}
        initialRent={rentParam ? Number(rentParam) : undefined}
      />
    </div>
  );
}

export default function RentVsBuyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-navy-400">Loading...</div>}>
      <RentVsBuyInner />
    </Suspense>
  );
}
