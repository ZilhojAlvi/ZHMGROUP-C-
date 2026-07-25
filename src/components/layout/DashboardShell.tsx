"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function DashboardShell({
  links,
  title,
  subtitle,
  children,
}: {
  links: SidebarLink[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-brand-600 to-navy-700 text-white shadow-md shadow-brand-600/25"
                    : "text-navy-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-1 lg:hidden">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-surface-muted text-navy-600 dark:text-slate-300"
                )}
              >
                <link.icon size={13} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mb-6 animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-navy-400">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
