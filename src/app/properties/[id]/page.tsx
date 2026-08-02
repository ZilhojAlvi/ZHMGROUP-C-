"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BedDouble,
  Bath,
  Ruler,
  ParkingSquare,
  MapPin,
  CalendarDays,
  Wifi,
  Dumbbell,
  Waves,
  ShieldCheck,
  Sofa,
  PawPrint,
  ArrowUpDown,
  Heart,
  Share2,
  Building2,
  Star,
  Receipt,
  Calculator,
  Scale,
} from "lucide-react";
import { Property } from "@/types";
import { PropertyService } from "@/services/PropertyService";
import { UserService } from "@/services/UserService";
import { AgentRecord } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { MapPlaceholder } from "@/features/property/MapPlaceholder";
import { PropertyCarousel } from "@/features/property/PropertyCarousel";
import { formatCurrency, formatDate, initials } from "@/utils/formatters";
import { PROPERTY_STATUS_COLORS } from "@/utils/constants";
import { createPropertyModel } from "@/lib/oop/Property";
import { useAuthStore } from "@/store/authStore";

const AMENITY_ICONS: Record<string, { icon: typeof Wifi; label: string }> = {
  internet: { icon: Wifi, label: "High-speed internet" },
  gym: { icon: Dumbbell, label: "Gym access" },
  pool: { icon: Waves, label: "Swimming pool" },
  security: { icon: ShieldCheck, label: "24/7 security" },
  furnished: { icon: Sofa, label: "Furnished" },
  petFriendly: { icon: PawPrint, label: "Pet friendly" },
  elevator: { icon: ArrowUpDown, label: "Elevator" },
};

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [related, setRelated] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const found = await PropertyService.getById(id);
      if (found) {
        setProperty(found);
        const agentRecord = await UserService.getById(found.agentId);
        if (agentRecord && agentRecord.role === "agent") setAgent(agentRecord as AgentRecord);
        const all = await PropertyService.list();
        setRelated(
          all.filter((p) => p.propertyId !== found.propertyId && p.type === found.type).slice(0, 6)
        );
        if (session?.role === "customer") {
          const { FavoriteService } = await import("@/services/FavoriteService");
          const { propertyIds } = await FavoriteService.list().catch(() => ({ propertyIds: [] as string[] }));
          setSaved(propertyIds.includes(found.propertyId));
        }
      }
      setIsLoading(false);
    })();
  }, [id, session?.role]);

  if (isLoading) return <PageLoader label="Loading property..." />;

  if (!property) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Building2 className="mx-auto mb-4 text-navy-300" size={40} />
        <h1 className="font-display text-xl font-bold text-navy-900 dark:text-white">
          Property not found
        </h1>
        <p className="mt-2 text-sm text-navy-400">
          This listing may have been removed or the link is incorrect.
        </p>
        <Link href="/properties">
          <Button className="mt-5">Back to listings</Button>
        </Link>
      </div>
    );
  }

  const model = createPropertyModel(property);
  const tax = model.calculateTax();
  const isResidential = property.type === "residential";
  const isLand = property.type === "land";
  const activeAmenities = Object.entries(property.amenities).filter(
    ([key, value]) => value === true && AMENITY_ICONS[key]
  );

  const handleBook = () => {
    if (!session) {
      toast.error("Please sign in to book a property.");
      router.push("/login");
      return;
    }
    if (session.role !== "customer") {
      toast.error("Only customer accounts can create bookings.");
      return;
    }
    router.push(`/booking/${property.propertyId}`);
  };

  const handleToggleSave = async () => {
    if (!session) {
      toast.error("Sign in as a customer to save properties.");
      return;
    }
    if (session.role !== "customer") {
      toast.error("Only customer accounts can save properties.");
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      const { FavoriteService } = await import("@/services/FavoriteService");
      if (next) await FavoriteService.add(property.propertyId);
      else await FavoriteService.remove(property.propertyId);
    } catch (err) {
      setSaved(!next);
      toast.error(err instanceof Error ? err.message : "Could not update favorites.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Gallery */}
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr] animate-fade-up">
        <div className="relative h-72 overflow-hidden rounded-2xl sm:h-[420px]">
          <Image
            src={property.images[activeImage]}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge color={PROPERTY_STATUS_COLORS[property.status] as never} className="capitalize shadow">
              {property.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={handleToggleSave}
              className={`flex h-9 w-9 items-center justify-center rounded-full glass-strong ${saved ? "text-rose-500" : "text-white"}`}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full glass-strong text-white"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:h-[420px]">
          {property.images.slice(0, 3).map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveImage(i)}
              className={`relative h-24 overflow-hidden rounded-xl sm:h-full ${activeImage === i ? "ring-2 ring-brand-500" : ""}`}
            >
              <Image src={img} alt="" fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <div className="space-y-8">
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="brand" className="capitalize">{property.type}</Badge>
              <Badge color="slate" className="capitalize">{property.purpose}</Badge>
              {isResidential && (
                <Badge color="sky" className="capitalize">{property.propertySubType}</Badge>
              )}
              {isLand && (
                <Badge color="sky" className="capitalize">{property.propertySubType}</Badge>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-400">
              <MapPin size={14} /> {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {isResidential ? (
                <>
                  <StatPill icon={BedDouble} label="Bedrooms" value={property.bedrooms} />
                  <StatPill icon={Bath} label="Bathrooms" value={property.bathrooms} />
                </>
              ) : isLand ? (
                <>
                  <StatPill icon={Building2} label="Facing" value={property.facing} />
                  <StatPill icon={Building2} label="Road width" value={`${property.roadWidthFt} ft`} />
                </>
              ) : (
                <>
                  <StatPill icon={Building2} label="Floors" value={property.floors} />
                  <StatPill icon={Building2} label="Rooms" value={property.officeRooms} />
                </>
              )}
              <StatPill icon={Ruler} label="Sqft" value={property.squareFeet.toLocaleString()} />
              <StatPill icon={ParkingSquare} label="Parking" value={property.parkingSpace} />
            </div>
          </div>

          <Card className="p-6 animate-fade-up">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
              About this property
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500 dark:text-slate-300">
              {property.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-navy-400">
              <CalendarDays size={13} /> Built in {property.yearBuilt} · Listed {formatDate(property.createdAt)}
            </div>
          </Card>

          {activeAmenities.length > 0 && (
            <Card className="p-6 animate-fade-up">
              <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                Amenities
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activeAmenities.map(([key]) => {
                  const meta = AMENITY_ICONS[key];
                  return (
                    <div key={key} className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-navy-600 dark:text-slate-300">
                      <meta.icon size={16} className="text-brand-500" /> {meta.label}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-6 animate-fade-up">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900 dark:text-white">
              <Receipt size={18} /> Estimated tax breakdown
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-navy-500">
                <span>Listed price</span>
                <span className="font-medium text-navy-800 dark:text-white">{formatCurrency(property.price)}</span>
              </div>
              <div className="flex justify-between text-navy-500">
                <span>Base tax rate</span>
                <span className="font-medium text-navy-800 dark:text-white">{property.taxRate}%</span>
              </div>
              <div className="flex justify-between text-navy-500">
                <span>{isResidential ? "Homeowner relief (-10%)" : isLand ? "Flat land tax" : "Commercial levy (+5%)"}</span>
                <span className="font-medium text-navy-800 dark:text-white">Applied</span>
              </div>
              <div className="flex justify-between border-t border-black/5 dark:border-white/10 pt-2 text-base font-semibold text-navy-900 dark:text-white">
                <span>Estimated annual tax</span>
                <span className="text-brand-600 dark:text-brand-300">{formatCurrency(tax)}</span>
              </div>
            </div>
          </Card>

          <div className="animate-fade-up">
            <h2 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">
              Location
            </h2>
            <MapPlaceholder property={property} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="glass" className="sticky top-24 p-6 animate-fade-up">
            <p className="font-display text-3xl font-bold text-navy-900 dark:text-white">
              {formatCurrency(property.price)}
              {property.purpose === "rent" && <span className="text-sm font-normal text-navy-400"> /month</span>}
            </p>
            <Button
              fullWidth
              size="lg"
              className="mt-5"
              disabled={property.status !== "available"}
              onClick={handleBook}
            >
              {property.status === "available" ? "Book this property" : "Currently unavailable"}
            </Button>
            <p className="mt-3 text-center text-xs text-navy-400">
              You won&apos;t be charged yet — review dates on the next step.
            </p>
            {property.purpose === "sale" && (
              <Link
                href={`/tools/emi-calculator?price=${property.price}`}
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                <Calculator size={13} /> Calculate EMI for this property
              </Link>
            )}
          </Card>

          {agent && (
            <Card className="p-6 animate-fade-up">
              <h3 className="mb-3 text-sm font-semibold text-navy-800 dark:text-white">Listed by</h3>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-sm font-bold text-white">
                  {initials(agent.fname, agent.lname)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-800 dark:text-white">
                    {agent.fname} {agent.lname}
                  </p>
                  <p className="text-xs text-navy-400">{agent.agency}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star size={13} fill="currentColor" /> {agent.rating.toFixed(1)} rating
                </span>
                <Badge color={agent.verificationStatus === "verified" ? "emerald" : "amber"} className="capitalize">
                  {agent.verificationStatus}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-xl font-bold text-navy-900 dark:text-white">
            Similar properties
          </h2>
          <PropertyCarousel properties={related} />
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-3 text-center">
      <Icon size={17} className="mx-auto mb-1 text-brand-500" />
      <p className="text-sm font-bold text-navy-800 dark:text-white">{value}</p>
      <p className="text-[10px] text-navy-400">{label}</p>
    </div>
  );
}
