"use client";

import { FormEvent, useState } from "react";
import { CreditCard, Landmark, Smartphone, Wallet, ShieldCheck, CalendarClock } from "lucide-react";
import { PaymentMethod } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/utils/formatters";

interface PaymentSimulatorProps {
  amount: number;
  isProcessing: boolean;
  onSubmit: (method: PaymentMethod, extra?: { agreementDate?: string; depositPercent?: number }) => void;
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { id: "mobile_wallet", label: "Mobile Wallet", icon: Smartphone },
  { id: "cash", label: "Cash on Visit", icon: Wallet },
];

const MIN_DEPOSIT_PERCENT = 1;
const MAX_DEPOSIT_PERCENT = 10;
const DEFAULT_DEPOSIT_PERCENT = 10;
const CASH_HOLD_DAYS = 7;
const MIN_AGREEMENT_DAYS = 3;
const DEFAULT_AGREEMENT_DAYS = 14;
const MAX_AGREEMENT_DAYS = 90;

function daysFromNow(days: number) {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function PaymentSimulator({ amount, isProcessing, onSubmit }: PaymentSimulatorProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreementDate, setAgreementDate] = useState(daysFromNow(DEFAULT_AGREEMENT_DAYS));
  const [depositPercent, setDepositPercent] = useState(DEFAULT_DEPOSIT_PERCENT);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDeposit = method !== "cash";
  const depositAmount = Math.round((amount * depositPercent) / 100);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) newErrors.cardNumber = "Enter a valid 16-digit card number.";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Use MM/YY format.";
      if (cvv.length < 3) newErrors.cvv = "Enter a valid CVV.";
    }

    if (isDeposit) {
      if (!agreementDate) {
        newErrors.agreementDate = "Choose an agreement completion date.";
      } else {
        const chosen = new Date(agreementDate).getTime();
        const min = Date.now() + MIN_AGREEMENT_DAYS * 24 * 60 * 60 * 1000;
        const max = Date.now() + MAX_AGREEMENT_DAYS * 24 * 60 * 60 * 1000;
        if (chosen < min || chosen > max) {
          newErrors.agreementDate = `Pick a date ${MIN_AGREEMENT_DAYS}\u2013${MAX_AGREEMENT_DAYS} days from today.`;
        }
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(method, isDeposit ? { agreementDate, depositPercent } : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-navy-800 dark:text-white">Payment method</h4>
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <ShieldCheck size={13} /> Simulated & secure
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {methods.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all",
                active
                  ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 shadow-sm"
                  : "border-black/10 dark:border-white/10 text-navy-500 hover:border-brand-300"
              )}
            >
              <Icon size={18} />
              {m.label}
            </button>
          );
        })}
      </div>

      {method === "card" && (
        <div className="space-y-4 animate-fade-in">
          <Input
            label="Card number"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            value={cardNumber}
            error={errors.cardNumber}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
              setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiry"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              error={errors.expiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                setExpiry(v);
              }}
            />
            <Input
              label="CVV"
              placeholder="123"
              maxLength={4}
              type="password"
              value={cvv}
              error={errors.cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
        </div>
      )}

      {method === "bank_transfer" && (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-navy-400 animate-fade-in">
          You&apos;ll be guided to complete your bank transfer. This demo instantly simulates a
          successful gateway response.
        </p>
      )}

      {method === "mobile_wallet" && (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-navy-400 animate-fade-in">
          You&apos;ll be guided to complete your mobile wallet payment. This demo instantly
          simulates a successful gateway response.
        </p>
      )}

      {isDeposit && (
        <div className="space-y-3 animate-fade-in">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            The full amount can&apos;t be charged online, so only a <strong>booking deposit</strong>{" "}
            is taken now. The remaining {100 - depositPercent}% and the signed agreement must be
            completed by the date you choose below.
          </p>

          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <div className="flex items-center justify-between">
              <label htmlFor="depositPercent" className="text-xs font-medium text-navy-500">
                Deposit percentage
              </label>
              <span className="font-display text-sm font-bold text-navy-900 dark:text-white">
                {depositPercent}%
              </span>
            </div>
            <input
              id="depositPercent"
              type="range"
              min={MIN_DEPOSIT_PERCENT}
              max={MAX_DEPOSIT_PERCENT}
              step={1}
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="mt-2 w-full accent-brand-500"
            />
            <div className="mt-1 flex justify-between text-[10px] text-navy-400">
              <span>{MIN_DEPOSIT_PERCENT}%</span>
              <span>{MAX_DEPOSIT_PERCENT}%</span>
            </div>
          </div>

          <Input
            label="Agreement completion date"
            type="date"
            min={daysFromNow(MIN_AGREEMENT_DAYS)}
            max={daysFromNow(MAX_AGREEMENT_DAYS)}
            value={agreementDate}
            error={errors.agreementDate}
            onChange={(e) => setAgreementDate(e.target.value)}
          />
        </div>
      )}

      {method === "cash" && (
        <p className="flex items-start gap-2 rounded-xl bg-surface-muted px-4 py-3 text-xs text-navy-400 animate-fade-in">
          <CalendarClock size={28} className="mt-0.5 shrink-0" />
          <span>
            No payment is taken online. The property will be held for you for{" "}
            <strong>{CASH_HOLD_DAYS} days</strong> — visit or contact the agent to pay in cash and
            finalize. If nobody follows up within {CASH_HOLD_DAYS} days, this booking is
            automatically cancelled and the property becomes available again.
          </span>
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
        <span className="text-sm text-navy-500">
          {method === "cash" ? "Due now" : `Booking deposit (${depositPercent}%)`}
        </span>
        <span className="font-display text-lg font-bold text-navy-900 dark:text-white">
          {method === "cash" ? formatCurrency(0) : formatCurrency(depositAmount)}
        </span>
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isProcessing}>
        {isProcessing
          ? "Processing..."
          : method === "cash"
          ? `Reserve for ${CASH_HOLD_DAYS} days`
          : `Pay deposit ${formatCurrency(depositAmount)}`}
      </Button>
    </form>
  );
}
