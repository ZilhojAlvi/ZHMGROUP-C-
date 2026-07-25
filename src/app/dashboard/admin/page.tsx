"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Building2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  FileBarChart,
  UserCog,
} from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { StatCard } from "@/features/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { RevenueAreaChart, BookingsStatusBarChart, PropertyTypePieChart } from "@/features/dashboard/ChartPanel";
import { ReportService } from "@/services/ReportService";
import { SystemReport } from "@/types";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/admin", icon: Home },
  { label: "User Management", href: "/admin/users", icon: UserCog },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "My Profile", href: "/profile", icon: ShieldCheck },
];

function AdminDashboardInner() {
  const [report, setReport] = useState<SystemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const r = await ReportService.generate();
      setReport(r);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading || !report) return <PageLoader label="Compiling system metrics..." />;

  return (
    <DashboardShell
      links={links}
      title="Platform Overview"
      subtitle="A real-time snapshot of users, listings, and revenue across SRMS."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(report.totalUsers)} icon={Users} accent="brand" />
        <StatCard label="Total Properties" value={formatNumber(report.totalProperties)} icon={Building2} accent="sky" />
        <StatCard
          label="Verified Agents"
          value={`${report.verifiedAgents}/${report.totalAgents}`}
          icon={ShieldCheck}
          accent="emerald"
        />
        <StatCard label="Total Revenue" value={formatCurrency(report.totalRevenue)} icon={Wallet} accent="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RevenueAreaChart data={report.monthlyRevenue} />
        <BookingsStatusBarChart data={report.bookingsByStatus} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PropertyTypePieChart data={report.propertiesByType} />
        </div>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900 dark:text-white">
            Administrative Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/users">
              <Card variant="outline" hover className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <UserCog size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-800 dark:text-white">Manage Users</p>
                  <p className="text-xs text-navy-400">Activate, deactivate, verify agents</p>
                </div>
                <ArrowRight size={15} className="ml-auto text-navy-300" />
              </Card>
            </Link>
            <Link href="/admin/reports">
              <Card variant="outline" hover className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <FileBarChart size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-800 dark:text-white">System Reports</p>
                  <p className="text-xs text-navy-400">Full analytics & exportable summary</p>
                </div>
                <ArrowRight size={15} className="ml-auto text-navy-300" />
              </Card>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-navy-400">Customers</p>
              <p className="font-display text-lg font-bold text-navy-800 dark:text-white">{report.totalCustomers}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Agents</p>
              <p className="font-display text-lg font-bold text-navy-800 dark:text-white">{report.totalAgents}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Pending Bookings</p>
              <p className="font-display text-lg font-bold text-navy-800 dark:text-white">{report.pendingBookings}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Available Units</p>
              <p className="font-display text-lg font-bold text-navy-800 dark:text-white">{report.availableProperties}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allow={["admin"]}>
      <AdminDashboardInner />
    </ProtectedRoute>
  );
}
