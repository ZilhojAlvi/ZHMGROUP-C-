"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/types";
import { formatCurrency } from "@/utils/formatters";

// Leaflet's default marker icons reference image files by relative path,
// which breaks under Next.js/webpack bundling. Point them at the CDN instead.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DHAKA_CENTER: [number, number] = [23.78, 90.42];

/** Re-fits the map bounds whenever the visible property set changes. */
function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [properties, map]);
  return null;
}

export function PropertiesMap({ properties }: { properties: Property[] }) {
  return (
    <MapContainer
      center={DHAKA_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-[70vh] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={properties} />
      {properties.map((p) => (
        <Marker key={p.propertyId} position={[p.latitude, p.longitude]} icon={markerIcon}>
          <Popup minWidth={200}>
            <div className="space-y-1.5">
              <div className="relative h-24 w-full overflow-hidden rounded-lg">
                <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="200px" />
              </div>
              <p className="line-clamp-1 text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-navy-500">
                {formatCurrency(p.price)}
                {p.purpose === "rent" ? "/mo" : ""} • {p.city}
              </p>
              <Link
                href={`/properties/${p.propertyId}`}
                className="inline-block text-xs font-semibold text-brand-600 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
