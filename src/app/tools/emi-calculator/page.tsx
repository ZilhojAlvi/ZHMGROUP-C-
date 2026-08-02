"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EMICalculator } from "@/features/tools/EMICalculator";

function EMICalculatorInner() {
  const searchParams = useSearchParams();
  const priceParam = searchParams.get("price");
  const initialPrice = priceParam ? Number(priceParam) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
          EMI / Loan Calculator
        </h1>
        <p className="mt-1 text-sm text-navy-400">
          Estimate your monthly installment before booking a property.
        </p>
      </div>
      <EMICalculator initialPrice={initialPrice} />
    </div>
  );
}

export default function EMICalculatorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-navy-400">Loading...</div>}>
      <EMICalculatorInner />
    </Suspense>
  );
}
