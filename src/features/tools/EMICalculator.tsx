"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/utils/formatters";

interface EMICalculatorProps {
  /** Pre-fill the loan amount from a property's price, if known. */
  initialPrice?: number;
  className?: string;
}

/** Standard reducing-balance EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1) */
function calculateEMI(principal: number, annualRatePercent: number, tenureYears: number) {
  const r = annualRatePercent / 12 / 100;
  const n = tenureYears * 12;
  if (principal <= 0 || n <= 0) return { emi: 0, totalPayment: 0, totalInterest: 0 };
  if (r === 0) {
    const emi = principal / n;
    return { emi, totalPayment: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, n);
  const emi = (principal * r * factor) / (factor - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

export function EMICalculator({ initialPrice, className }: EMICalculatorProps) {
  const [price, setPrice] = useState(initialPrice ?? 5_000_000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenureYears, setTenureYears] = useState(15);

  const downPayment = Math.round((price * downPaymentPercent) / 100);
  const principal = Math.max(0, price - downPayment);

  const { emi, totalPayment, totalInterest } = useMemo(
    () => calculateEMI(principal, interestRate, tenureYears),
    [principal, interestRate, tenureYears]
  );

  return (
    <Card className={`space-y-5 p-6 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
          <Calculator size={17} />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
            EMI / Loan Calculator
          </h3>
          <p className="text-xs text-navy-400">Estimate your monthly installment</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Property price (BDT)"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
        />
        <Input
          label="Loan tenure (years)"
          type="number"
          min={1}
          max={30}
          value={tenureYears}
          onChange={(e) => setTenureYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-navy-800 dark:text-brand-100">Down payment</label>
          <span className="font-semibold text-navy-700 dark:text-brand-100">
            {downPaymentPercent}% — {formatCurrency(downPayment)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-navy-800 dark:text-brand-100">Interest rate (annual)</label>
          <span className="font-semibold text-navy-700 dark:text-brand-100">{interestRate}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={18}
          step={0.25}
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
      </div>

      <div className="grid gap-3 rounded-2xl bg-surface-muted p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-navy-400">Loan amount</p>
          <p className="font-display text-base font-bold text-navy-900 dark:text-white">
            {formatCurrency(principal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Monthly EMI</p>
          <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-300">
            {formatCurrency(Math.round(emi))}
          </p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Total interest</p>
          <p className="font-display text-base font-bold text-navy-900 dark:text-white">
            {formatCurrency(Math.round(totalInterest))}
          </p>
        </div>
      </div>

      <p className="text-xs text-navy-400">
        Total repayment over {tenureYears} years: <strong>{formatCurrency(Math.round(totalPayment))}</strong>.
        This is an estimate — actual bank/loan terms may vary.
      </p>
    </Card>
  );
}
