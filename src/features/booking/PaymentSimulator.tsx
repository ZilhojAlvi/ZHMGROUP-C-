"use client";

import { FormEvent, useState } from "react";
import { CreditCard, Landmark, Smartphone, Wallet, ShieldCheck } from "lucide-react";
import { PaymentMethod } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/utils/formatters";

interface PaymentSimulatorProps {
  amount: number;
  isProcessing: boolean;
  onSubmit: (method: PaymentMethod) => void;
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { id: "mobile_wallet", label: "Mobile Wallet", icon: Smartphone },
  { id: "cash", label: "Cash on Visit", icon: Wallet },
];

export function PaymentSimulator({ amount, isProcessing, onSubmit }: PaymentSimulatorProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (method === "card") {
      const newErrors: Record<string, string> = {};
      if (cardNumber.replace(/\s/g, "").length < 16) newErrors.cardNumber = "Enter a valid 16-digit card number.";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Use MM/YY format.";
      if (cvv.length < 3) newErrors.cvv = "Enter a valid CVV.";
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    onSubmit(method);
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

      {method !== "card" && (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-navy-400 animate-fade-in">
          You&apos;ll be guided to complete your {method.replace("_", " ")} payment. This demo
          instantly simulates a successful gateway response.
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
        <span className="text-sm text-navy-500">Total due now</span>
        <span className="font-display text-lg font-bold text-navy-900 dark:text-white">
          {formatCurrency(amount)}
        </span>
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isProcessing}>
        {isProcessing ? "Processing payment..." : `Pay ${formatCurrency(amount)}`}
      </Button>
    </form>
  );
}
