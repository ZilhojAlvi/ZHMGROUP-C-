"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Menu, X, Moon, Sun, Bell, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Button } from "@/components/ui/Button";
import { initials } from "@/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { ROLE_LABELS } from "@/utils/constants";

export function Navbar() {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useUIStore();
  const { notifications, dismiss, clearAll } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
  ];

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-white/40 dark:border-white/5 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-brand-600/30">
              <Building2 size={19} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">
              SR<span className="brand-gradient-text">MS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                    : "text-navy-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                href={`/dashboard/${session.role}`}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
                  pathname.startsWith("/dashboard")
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                    : "text-navy-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-navy-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {session && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-xl p-2.5 text-navy-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="glass-strong absolute right-0 mt-2 w-80 rounded-2xl p-2 animate-scale-in">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-sm font-semibold text-navy-800 dark:text-white">
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs text-brand-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-2 py-6 text-center text-xs text-navy-400">
                          You&apos;re all caught up.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="group relative rounded-xl px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <p className="text-xs font-semibold text-navy-800 dark:text-white">
                              {n.title}
                            </p>
                            <p className="text-xs text-navy-400 pr-4">{n.message}</p>
                            <button
                              onClick={() => dismiss(n.id)}
                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-navy-400 hover:text-rose-500"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-xs font-bold text-white">
                    {initials(session.fname, session.lname)}
                  </span>
                  <span className="hidden lg:block text-left">
                    <span className="block text-xs font-semibold text-navy-800 dark:text-white leading-tight">
                      {session.fname}
                    </span>
                    <span className="block text-[10px] text-navy-400 leading-tight">
                      {ROLE_LABELS[session.role]}
                    </span>
                  </span>
                </button>
                {profileOpen && (
                  <div className="glass-strong absolute right-0 mt-2 w-52 rounded-2xl p-1.5 animate-scale-in">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-navy-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <UserIcon size={15} /> My Profile
                    </Link>
                    <Link
                      href={`/dashboard/${session.role}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-navy-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden rounded-xl p-2.5 text-navy-500 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass md:hidden border-b border-white/40 dark:border-white/5 px-4 py-3 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href={`/dashboard/${session.role}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-500 hover:bg-rose-500/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="primary" size="sm" fullWidth>
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
