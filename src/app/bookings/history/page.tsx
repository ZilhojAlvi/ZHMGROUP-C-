"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Home, ClipboardList, Search, User2, CalendarClock, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { useBookings } from "@/hooks/useBookings";
import { BookingService } from "@/services/BookingService";
import { PropertyService } from "@/services/PropertyService";
import { BookingRecord, Property } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import { BOOKING_STATUS_COLORS } from "@/utils/constants";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/customer", icon: Home },
  { label: "Booking History", href: "/bookings/history", icon: ClipboardList },
  { label: "Browse Properties", href: "/properties", icon: Search },
  { label: "My Profile", href: "/profile", icon: User2 },
];

function BookingHistoryInner() {
  const { session } = useAuthStore();
  const { bookings, isLoading, refetch } = useBookings({ customerId: session?.userId });
  const [propertyMap, setPropertyMap] = useState<Record<string, Property>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cancelTarget, setCancelTarget] = useState<BookingRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await PropertyService.list();
      const map: Record<string, Property> = {};
      all.forEach((p) => (map[p.propertyId] = p));
      setPropertyMap(map);
    })();
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
    if (statusFilter === "all") return sorted;
    return sorted.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await BookingService.cancelBooking(cancelTarget.bookingId);
      toast.success("Booking cancelled");
      setCancelTarget(null);
      refetch();
    } catch {
      toast.error("Could not cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardShell links={links} title="Booking History" subtitle="Every booking you've made, in one place.">
      <Card className="p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy-400">
            {isLoading ? "Loading..." : `${filtered.length} booking${filtered.length === 1 ? "" : "s"}`}
          </p>
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All statuses", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={22} />}
            title="No bookings found"
            description="Try a different status filter, or start browsing properties to make your first booking."
            action={
              <Link href="/properties">
                <Button size="sm">Browse properties</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const property = propertyMap[b.propertyId];
              const canCancel = b.status === "pending" || b.status === "confirmed";
              return (
                <div
                  key={b.bookingId}
                  className="flex flex-col gap-3 rounded-xl border border-black/5 dark:border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${b.propertyId}`}
                        className="truncate text-sm font-semibold text-navy-800 dark:text-white hover:text-brand-500"
                      >
                        {property?.title ?? "Property"}
                      </Link>
                      <Badge color={BOOKING_STATUS_COLORS[b.status] as never} className="capitalize shrink-0">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-navy-400">
                      Booking #{b.bookingId} · Booked {formatDateTime(b.bookingDate)}
                    </p>
                    <p className="text-xs text-navy-400">
                      Move-in {formatDate(b.moveInDate)} · {formatCurrency(b.totalAmount)}
                    </p>
                  </div>
                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 !text-rose-500 !border-rose-300"
                      onClick={() => setCancelTarget(b)}
                    >
                      <XCircle size={14} /> Cancel
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>
              Keep booking
            </Button>
            <Button variant="danger" isLoading={isCancelling} onClick={handleCancel}>
              Yes, cancel it
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-500 dark:text-slate-300">
          This will mark booking <b>#{cancelTarget?.bookingId}</b> as cancelled. This action cannot be undone.
        </p>
      </Modal>
    </DashboardShell>
  );
}

export default function BookingHistoryPage() {
  return (
    <ProtectedRoute allow={["customer"]}>
      <BookingHistoryInner />
    </ProtectedRoute>
  );
}
