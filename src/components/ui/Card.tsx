import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass" | "outline";
  hover?: boolean;
}

export function Card({ className, variant = "solid", hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variant === "solid" &&
          "bg-surface border border-black/5 dark:border-white/5 shadow-sm shadow-navy-900/5",
        variant === "glass" && "glass",
        variant === "outline" && "border-2 border-brand-100 dark:border-white/10 bg-transparent",
        hover && "hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
