"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Home, UserCog, FileBarChart, ShieldCheck, Download, RefreshCcw } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import {
  RevenueAreaChart,
  BookingsStatusBarChart,
  PropertyTypePieChart,
} from "@/features/dashboard/ChartPanel";
import { ReportService } from "@/services/ReportService";
import { SystemReport } from "@/types";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/formatters";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/admin", icon: Home },
  { label: "User Management", href: "/admin/users", icon: UserCog },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "My Profile", href: "/profile", icon: ShieldCheck },
];

function AdminReportsInner() {
  const [report, setReport] = useState<SystemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const r = await ReportService.generate();
    setReport(r);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `srems-system-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as JSON");
  };

  if (isLoading || !report) return <PageLoader label="Generating system report..." />;

  const summaryRows = [
    { label: "Total Users", value: formatNumber(report.totalUsers) },
    { label: "Customers", value: formatNumber(report.totalCustomers) },
    { label: "Agents", value: formatNumber(report.totalAgents) },
    { label: "Admins", value: formatNumber(report.totalAdmins) },
    { label: "Verified Agents", value: formatNumber(report.verifiedAgents) },
    { label: "Pending Agent Verifications", value: formatNumber(report.pendingAgents) },
    { label: "Total Properties", value: formatNumber(report.totalProperties) },
    { label: "Residential Listings", value: formatNumber(report.residentialCount) },
    { label: "Commercial Listings", value: formatNumber(report.commercialCount) },
    { label: "Land / Plot Listings", value: formatNumber(report.landCount) },
    { label: "Available Properties", value: formatNumber(report.availableProperties) },
    { label: "Booked Properties", value: formatNumber(report.bookedProperties) },
    { label: "Total Bookings", value: formatNumber(report.totalBookings) },
    { label: "Confirmed Bookings", value: formatNumber(report.confirmedBookings) },
    { label: "Pending Bookings", value: formatNumber(report.pendingBookings) },
    { label: "Cancelled Bookings", value: formatNumber(report.cancelledBookings) },
    { label: "Total Revenue", value: formatCurrency(report.totalRevenue) },
  ];

  return (
    <DashboardShell links={links} title="System Reports" subtitle={`Generated ${formatDateTime(report.generatedAt)}`}>
      <div className="mb-6 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCcw size={14} /> Refresh
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download size={14} /> Export JSON
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueAreaChart data={report.monthlyRevenue} />
        <BookingsStatusBarChart data={report.bookingsByStatus} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <PropertyTypePieChart data={report.propertiesByType} />

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900 dark:text-white">
            Full Summary
          </h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-black/5 dark:border-white/10 py-2.5 text-sm"
              >
                <span className="text-navy-400">{row.label}</span>
                <span className="font-semibold text-navy-800 dark:text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute allow={["admin"]}>
      <AdminReportsInner />
    </ProtectedRoute>
  );
}
