import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: "brand" | "emerald" | "amber" | "rose" | "sky";
}

const accentClasses = {
  brand: "from-brand-600 to-navy-700",
  emerald: "from-emerald-500 to-emerald-700",
  amber: "from-amber-400 to-amber-600",
  rose: "from-rose-500 to-rose-700",
  sky: "from-sky-400 to-sky-600",
};

export function StatCard({ label, value, icon: Icon, trend, accent = "brand" }: StatCardProps) {
  return (
    <Card hover className="animate-fade-up p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-navy-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-semibold",
                trend.positive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend.value}% vs last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            accentClasses[accent]
          )}
        >
          <Icon size={19} />
        </div>
      </div>
    </Card>
  );
}
