import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-surface-muted/50 px-6 py-16 text-center animate-fade-in",
        className
      )}
    >
      {icon && (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-navy-800 dark:text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-navy-400">{description}</p>}
      {action}
    </div>
  );
}
