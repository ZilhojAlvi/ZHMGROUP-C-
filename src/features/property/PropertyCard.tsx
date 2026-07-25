"use client";

import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Ruler, MapPin, ParkingSquare, Heart } from "lucide-react";
import { Property } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/formatters";
import { PROPERTY_STATUS_COLORS } from "@/utils/constants";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
}

export function PropertyCard({ property, saved, onToggleSave, compact }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const isResidential = property.type === "residential";

  return (
    <Card
      hover
      className="group overflow-hidden animate-fade-up"
    >
      <Link href={`/properties/${property.propertyId}`} className="block">
        <div className={cn("relative w-full overflow-hidden", compact ? "h-40" : "h-52")}>
          {!imgError ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-muted text-navy-300">
              <MapPin size={28} />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <Badge color={PROPERTY_STATUS_COLORS[property.status] as never} className="capitalize shadow">
              {property.status.replace("_", " ")}
            </Badge>
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave(property.propertyId);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full glass transition-colors",
                  saved ? "text-rose-500" : "text-white"
                )}
                aria-label="Save property"
              >
                <Heart size={15} fill={saved ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-3">
            <span className="font-display text-lg font-bold text-white">
              {formatCurrency(property.price)}
              {property.purpose === "rent" && <span className="text-xs font-normal">/mo</span>}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center gap-2">
            <Badge color="brand" className="capitalize">{property.type}</Badge>
            <Badge color="slate" className="capitalize">{property.purpose}</Badge>
          </div>
          <h3 className="truncate font-display text-base font-semibold text-navy-900 dark:text-white">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-navy-400">
            <MapPin size={12} /> {property.address}, {property.city}
          </p>

          <div className="mt-3 flex items-center gap-4 border-t border-black/5 dark:border-white/10 pt-3 text-xs text-navy-500 dark:text-slate-300">
            {isResidential ? (
              <>
                <span className="flex items-center gap-1"><BedDouble size={14} /> {property.bedrooms}</span>
                <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
              </>
            ) : (
              <span className="flex items-center gap-1 capitalize">{property.propertySubType}</span>
            )}
            <span className="flex items-center gap-1"><Ruler size={14} /> {property.squareFeet.toLocaleString()} sqft</span>
            <span className="flex items-center gap-1"><ParkingSquare size={14} /> {property.parkingSpace}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
