"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Home,
  Building2,
  ClipboardCheck,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { StatCard } from "@/features/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useBookings } from "@/hooks/useBookings";
import { PropertyService } from "@/services/PropertyService";
import { BookingService } from "@/services/BookingService";
import { AgentRecord, Property } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { UserService } from "@/services/UserService";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/agent", icon: Home },
  { label: "Manage Properties", href: "/agent/properties", icon: Building2 },
  { label: "My Profile", href: "/profile", icon: ShieldCheck },
];

function AgentDashboardInner() {
  const { session } = useAuthStore();
  const { bookings, isLoading: bookingsLoading, refetch } = useBookings({ agentId: session?.userId });
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!session) return;
      setPropertiesLoading(true);
      const [list, record] = await Promise.all([
        PropertyService.listByAgent(session.userId),
        UserService.getById(session.userId),
      ]);
      setProperties(list);
      if (record && record.role === "agent") setAgent(record);
      setPropertiesLoading(false);
    })();
  }, [session]);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const propertyMap: Record<string, Property> = {};
  properties.forEach((p) => (propertyMap[p.propertyId] = p));

  const handleApproval = async (bookingId: string, approve: boolean) => {
    setActingId(bookingId);
    try {
      await BookingService.updateStatus(bookingId, approve ? "confirmed" : "rejected");
      toast.success(approve ? "Booking approved" : "Booking rejected");
      refetch();
    } catch {
      toast.error("Could not update booking.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardShell
      links={links}
      title={`Hello, ${session?.fname ?? "Agent"}`}
      subtitle="Manage your listings and respond to booking requests."
    >
      {agent && agent.verificationStatus !== "verified" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 animate-fade-up">
          <ShieldAlert size={18} className="shrink-0" />
          Your agent licence is <b className="mx-1 capitalize">{agent.verificationStatus}</b> review by an
          administrator. Some actions may be limited until verified.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Properties Listed" value={String(properties.length)} icon={Building2} accent="brand" />
        <StatCard label="Pending Approvals" value={String(pendingBookings.length)} icon={ClipboardCheck} accent="amber" />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={Wallet} accent="emerald" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
              Pending Booking Requests
            </h3>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={22} />}
              title="No pending requests"
              description="New booking requests from customers will appear here."
            />
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => {
                const property = propertyMap[b.propertyId];
                return (
                  <div
                    key={b.bookingId}
                    className="flex flex-col gap-3 rounded-xl border border-black/5 dark:border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-800 dark:text-white">
                        {property?.title ?? "Property"}
                      </p>
                      <p className="text-xs text-navy-400">
                        Requested move-in {formatDate(b.moveInDate)} · {formatCurrency(b.totalAmount)}
                      </p>
                      {b.notes && <p className="mt-1 text-xs italic text-navy-400">&ldquo;{b.notes}&rdquo;</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actingId === b.bookingId}
                        onClick={() => handleApproval(b.bookingId, false)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        isLoading={actingId === b.bookingId}
                        onClick={() => handleApproval(b.bookingId, true)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900 dark:text-white">
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <Link href="/agent/properties">
              <Button fullWidth className="justify-start">
                <PlusCircle size={15} /> Add new property
              </Button>
            </Link>
            <Link href="/agent/properties">
              <Button variant="outline" fullWidth className="justify-start">
                <Building2 size={15} /> Manage listings
              </Button>
            </Link>
          </div>

          <div className="mt-6 border-t border-black/5 dark:border-white/10 pt-4">
            <p className="text-xs font-semibold text-navy-400">Licence</p>
            <p className="mt-1 text-sm font-medium text-navy-800 dark:text-white">
              {agent?.licenceNumber ?? "—"}
            </p>
            <p className="text-xs text-navy-400">{agent?.agency}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
            My Listings
          </h3>
          <Link href="/agent/properties">
            <Button variant="ghost" size="sm">
              Manage all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        {propertiesLoading ? (
          <div className="skeleton h-40 w-full rounded-2xl" />
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<Building2 size={22} />}
            title="No properties listed yet"
            description="Add your first property to start receiving bookings."
            action={
              <Link href="/agent/properties">
                <Button size="sm">Add property</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-navy-400">
                <tr>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {properties.slice(0, 6).map((p) => (
                  <tr key={p.propertyId}>
                    <td className="px-4 py-3">
                      <Link href={`/properties/${p.propertyId}`} className="font-medium text-navy-800 dark:text-white hover:text-brand-500">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy-500">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <Badge color="brand" className="capitalize">{p.status.replace("_", " ")}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute allow={["agent"]}>
      <AgentDashboardInner />
    </ProtectedRoute>
  );
}
