"use client";

import { useMemo, useState } from "react";
import { Scale3D, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/utils/formatters";

interface RentVsBuyProps {
  initialPrice?: number;
  initialRent?: number;
  className?: string;
}

interface YearPoint {
  year: number;
  buyEquity: number;
  rentInvestment: number;
}

/**
 * Month-by-month simulation.
 *
 * Both scenarios assume the same monthly housing budget: whenever buying
 * costs more that month than renting, the renter is assumed to invest the
 * difference (and vice versa, they draw it down). At the end of the horizon
 * we simply compare: the buyer's home equity (property value − remaining
 * loan) vs. the renter's investment portfolio (down payment + invested
 * differences, compounded). Whichever is larger "wins".
 */
function simulate(params: {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTenureYears: number;
  appreciationRate: number;
  monthlyRent: number;
  rentIncreaseRate: number;
  investmentReturn: number;
  maintenancePercent: number;
  horizonYears: number;
}) {
  const {
    price,
    downPaymentPercent,
    interestRate,
    loanTenureYears,
    appreciationRate,
    monthlyRent,
    rentIncreaseRate,
    investmentReturn,
    maintenancePercent,
    horizonYears,
  } = params;

  const downPayment = (price * downPaymentPercent) / 100;
  const principal = price - downPayment;
  const monthlyRate = interestRate / 12 / 100;
  const totalLoanMonths = loanTenureYears * 12;
  const emi =
    monthlyRate === 0
      ? principal / totalLoanMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalLoanMonths)) /
        (Math.pow(1 + monthlyRate, totalLoanMonths) - 1);

  const monthlyAppreciation = Math.pow(1 + appreciationRate / 100, 1 / 12) - 1;
  const monthlyInvestReturn = Math.pow(1 + investmentReturn / 100, 1 / 12) - 1;

  let loanBalance = principal;
  let propertyValue = price;
  let rent = monthlyRent;
  let investmentPool = downPayment; // renter keeps + invests what the buyer put down

  const points: YearPoint[] = [
    { year: 0, buyEquity: downPayment, rentInvestment: downPayment },
  ];

  const totalMonths = horizonYears * 12;
  for (let month = 1; month <= totalMonths; month++) {
    propertyValue *= 1 + monthlyAppreciation;

    if (month > 1 && (month - 1) % 12 === 0) {
      rent *= 1 + rentIncreaseRate / 100;
    }

    const stillPaying = loanBalance > 0.01;
    const interestPortion = stillPaying ? loanBalance * monthlyRate : 0;
    const principalPortion = stillPaying ? Math.min(emi - interestPortion, loanBalance) : 0;
    if (stillPaying) loanBalance = Math.max(0, loanBalance - principalPortion);

    const maintenanceThisMonth = (propertyValue * maintenancePercent) / 100 / 12;
    const buyMonthlyCost = (stillPaying ? emi : 0) + maintenanceThisMonth;

    investmentPool *= 1 + monthlyInvestReturn;
    investmentPool += buyMonthlyCost - rent;

    if (month % 12 === 0) {
      points.push({
        year: month / 12,
        buyEquity: Math.round(propertyValue - loanBalance),
        rentInvestment: Math.round(Math.max(0, investmentPool)),
      });
    }
  }

  const final = points[points.length - 1];
  return { points, emi, downPayment, finalBuyEquity: final.buyEquity, finalRentInvestment: final.rentInvestment };
}

export function RentVsBuyCalculator({ initialPrice, initialRent, className }: RentVsBuyProps) {
  const [price, setPrice] = useState(initialPrice ?? 6_000_000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(9.5);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [appreciationRate, setAppreciationRate] = useState(6);
  const [monthlyRent, setMonthlyRent] = useState(initialRent ?? 18000);
  const [rentIncreaseRate, setRentIncreaseRate] = useState(7);
  const [investmentReturn, setInvestmentReturn] = useState(8);
  const [maintenancePercent, setMaintenancePercent] = useState(1);
  const [horizonYears, setHorizonYears] = useState(10);

  const result = useMemo(
    () =>
      simulate({
        price,
        downPaymentPercent,
        interestRate,
        loanTenureYears,
        appreciationRate,
        monthlyRent,
        rentIncreaseRate,
        investmentReturn,
        maintenancePercent,
        horizonYears,
      }),
    [
      price,
      downPaymentPercent,
      interestRate,
      loanTenureYears,
      appreciationRate,
      monthlyRent,
      rentIncreaseRate,
      investmentReturn,
      maintenancePercent,
      horizonYears,
    ]
  );

  const diff = result.finalBuyEquity - result.finalRentInvestment;
  const buyWins = diff >= 0;

  return (
    <Card className={`space-y-6 p-6 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
          <Scale3D size={17} />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
            Rent vs Buy Calculator
          </h3>
          <p className="text-xs text-navy-400">Which builds more wealth over {horizonYears} years?</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>
          <strong>This is an educational estimate, not financial advice.</strong> It's based on the
          assumptions you set below (interest rate, appreciation, rent growth, investment return) and a
          simplified model — real outcomes depend on market conditions, taxes, fees, and your personal
          finances. Please consult a licensed financial advisor before making a decision.
        </span>
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
          label="Comparable monthly rent (BDT)"
          type="number"
          min={0}
          value={monthlyRent}
          onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
        />
        <Input
          label="Loan tenure (years)"
          type="number"
          min={1}
          max={30}
          value={loanTenureYears}
          onChange={(e) => setLoanTenureYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
        />
        <Input
          label="Comparison horizon (years)"
          type="number"
          min={1}
          max={30}
          value={horizonYears}
          onChange={(e) => setHorizonYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Down payment", value: downPaymentPercent, set: setDownPaymentPercent, min: 0, max: 90, step: 5 },
          { label: "Loan interest rate", value: interestRate, set: setInterestRate, min: 5, max: 18, step: 0.25 },
          { label: "Property appreciation / yr", value: appreciationRate, set: setAppreciationRate, min: 0, max: 15, step: 0.5 },
          { label: "Rent increase / yr", value: rentIncreaseRate, set: setRentIncreaseRate, min: 0, max: 15, step: 0.5 },
          { label: "Alt. investment return / yr", value: investmentReturn, set: setInvestmentReturn, min: 0, max: 20, step: 0.5 },
          { label: "Maintenance & tax / yr", value: maintenancePercent, set: setMaintenancePercent, min: 0, max: 5, step: 0.25 },
        ].map((s) => (
          <div key={s.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <label className="font-medium text-navy-800 dark:text-brand-100">{s.label}</label>
              <span className="font-semibold text-navy-700 dark:text-brand-100">{s.value}%</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.points}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="y" />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
              tickFormatter={(v: number) => `${Math.round(v / 100000) / 10}L`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
             formatter={(v) => formatCurrency(Number(v))}
              labelFormatter={(y) => `Year ${y}`}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="buyEquity" name="Buy — home equity" stroke="#5f8746" strokeWidth={2.5} dot={false} />
            <Line
              type="monotone"
              dataKey="rentInvestment"
              name="Rent — investment portfolio"
              stroke="#c8a248"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        className={`rounded-2xl p-5 text-center ${
          buyWins
            ? "bg-emerald-50 dark:bg-emerald-500/10"
            : "bg-amber-50 dark:bg-amber-500/10"
        }`}
      >
        <p className={`font-display text-lg font-bold ${buyWins ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
          {buyWins ? "Buying" : "Renting"} looks better by {formatCurrency(Math.abs(diff))} after {horizonYears} years
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-navy-400">Buy → home equity</p>
            <p className="font-semibold text-navy-800 dark:text-white">{formatCurrency(result.finalBuyEquity)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Rent → investment value</p>
            <p className="font-semibold text-navy-800 dark:text-white">{formatCurrency(result.finalRentInvestment)}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-navy-400">
        Monthly EMI at these terms: <strong>{formatCurrency(Math.round(result.emi))}</strong>. Model
        assumption: whenever buying costs more than renting in a given month, we assume the renter
        invests that difference (and vice versa).
      </p>
    </Card>
  );
}
