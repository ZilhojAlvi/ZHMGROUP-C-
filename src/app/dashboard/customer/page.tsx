"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Heart, CalendarClock, Search, ArrowRight, ClipboardList, Building2, User2 } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { StatCard } from "@/features/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCard } from "@/features/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { useBookings } from "@/hooks/useBookings";
import { PropertyService } from "@/services/PropertyService";
import { BookingRecord, Property } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BOOKING_STATUS_COLORS } from "@/utils/constants";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/customer", icon: Home },
  { label: "Booking History", href: "/bookings/history", icon: ClipboardList },
  { label: "Browse Properties", href: "/properties", icon: Search },
  { label: "My Profile", href: "/profile", icon: User2 },
];

function CustomerDashboardInner() {
  const { session } = useAuthStore();
  const { bookings, isLoading: bookingsLoading } = useBookings({ customerId: session?.userId });
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertyMap, setPropertyMap] = useState<Record<string, Property>>({});

  useEffect(() => {
    (async () => {
      setPropertiesLoading(true);
      const all = await PropertyService.list();
      const map: Record<string, Property> = {};
      all.forEach((p) => (map[p.propertyId] = p));
      setPropertyMap(map);

      const { properties: favProperties, propertyIds: ids } = await import(
        "@/services/FavoriteService"
      ).then((m) => m.FavoriteService.list());
      setSavedIds(ids);
      setSavedProperties(favProperties.slice(0, 4));
      setPropertiesLoading(false);
    })();
  }, [session]);

  const activeBookings = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const totalSpent = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    .slice(0, 5);

  return (
    <DashboardShell
      links={links}
      title={`Welcome back, ${session?.fname ?? "there"}`}
      subtitle="Here's what's happening with your bookings and saved homes."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Active Bookings" value={String(activeBookings.length)} icon={CalendarClock} accent="brand" />
        <StatCard label="Saved Properties" value={String(savedIds.length)} icon={Heart} accent="rose" />
        <StatCard label="Total Spent" value={formatCurrency(totalSpent)} icon={Building2} accent="emerald" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
              Recent Bookings
            </h3>
            <Link href="/bookings/history">
              <Button variant="ghost" size="sm">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={22} />}
              title="No bookings yet"
              description="Once you book a property, it'll show up here."
              action={
                <Link href="/properties">
                  <Button size="sm">Browse properties</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b: BookingRecord) => {
                const property = propertyMap[b.propertyId];
                return (
                  <Link
                    key={b.bookingId}
                    href={`/properties/${b.propertyId}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/5 dark:border-white/10 p-3.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-800 dark:text-white">
                        {property?.title ?? "Property"}
                      </p>
                      <p className="text-xs text-navy-400">
                        Move-in {formatDate(b.moveInDate)} · {formatCurrency(b.totalAmount)}
                      </p>
                    </div>
                    <Badge color={BOOKING_STATUS_COLORS[b.status] as never} className="capitalize shrink-0">
                      {b.status}
                    </Badge>
                  </Link>
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
            <Link href="/properties">
              <Button variant="outline" fullWidth className="justify-start">
                <Search size={15} /> Search properties
              </Button>
            </Link>
            <Link href="/bookings/history">
              <Button variant="outline" fullWidth className="justify-start">
                <ClipboardList size={15} /> View booking history
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" fullWidth className="justify-start">
                <User2 size={15} /> Edit profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
            Saved Properties
          </h3>
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              Browse more <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        {propertiesLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : savedProperties.length === 0 ? (
          <EmptyState
            icon={<Heart size={22} />}
            title="No saved properties"
            description="Tap the heart icon on any listing to save it here for later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {savedProperties.map((p) => (
              <PropertyCard key={p.propertyId} property={p} saved />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allow={["customer"]}>
      <CustomerDashboardInner />
    </ProtectedRoute>
  );
}
