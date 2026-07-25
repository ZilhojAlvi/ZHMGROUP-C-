"use client";

import { MapPin, Navigation } from "lucide-react";
import { Property } from "@/types";

export function MapPlaceholder({ property }: { property: Property }) {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f2247" />
            <stop offset="100%" stopColor="#4f7238" />
          </linearGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#mapGrad)" />
        <rect width="400" height="300" fill="url(#grid)" />
        <path d="M0,120 C100,90 150,180 250,140 C320,110 360,160 400,130" stroke="rgba(255,255,255,0.25)" strokeWidth="6" fill="none" />
        <path d="M0,220 C120,200 180,260 400,230" stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
        <circle cx="200" cy="150" r="7" fill="#38bdf8" opacity="0.5" className="animate-ping" />
        <circle cx="200" cy="150" r="5" fill="#ffffff" />
        <circle cx="200" cy="150" r="9" fill="none" stroke="#38bdf8" strokeWidth="2" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-950/10 text-center text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-strong text-white">
          <MapPin size={22} />
        </div>
        <p className="glass-strong rounded-xl px-4 py-2 text-sm font-medium">
          {property.address}, {property.city}
        </p>
      </div>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="glass absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy-800 dark:text-white hover:bg-white/80 transition-colors"
      >
        <Navigation size={13} /> Get directions
      </a>
    </div>
  );
}
