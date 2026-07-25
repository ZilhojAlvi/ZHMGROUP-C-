"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  CalendarCheck,
  CreditCard,
  KeyRound,
  Home as HomeIcon,
  Trees,
  Landmark,
  FileCheck2,
  Headphones,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PropertyCarousel } from "@/features/property/PropertyCarousel";
import { PropertyService } from "@/services/PropertyService";
import { Property } from "@/types";
import { formatNumber } from "@/utils/formatters";
import { CITIES } from "@/utils/constants";

const STEPS = [
  {
    icon: Search,
    title: "Search & compare",
    description: "Filter by type, price, beds, and city to shortlist properties that fit your brief.",
  },
  {
    icon: CalendarCheck,
    title: "Check availability",
    description: "Pick a move-in date on the live booking calendar — no double-bookings, ever.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    description: "Complete a simulated payment and get an instant digital receipt.",
  },
  {
    icon: KeyRound,
    title: "Move in",
    description: "Track your booking status from pending to confirmed, right from your dashboard.",
  },
];

const SERVICES = [
  {
    icon: HomeIcon,
    title: "Buy a Home",
    description: "Apartments, villas, and townhouses across Dhaka and Narayanganj, verified before listing.",
  },
  {
    icon: KeyRound,
    title: "Rent Properties",
    description: "Flexible rentals with transparent pricing and instant booking confirmation.",
  },
  {
    icon: Trees,
    title: "Land & Plots",
    description: "Clear-titled land and subdivided plots, with facing, road width, and use-type on every listing.",
  },
  {
    icon: Building2,
    title: "List Your Property",
    description: "Agents publish, price, and manage listings from one dashboard — no spreadsheets.",
  },
];

const TRUST_POINTS = [
  {
    icon: FileCheck2,
    title: "Verified Listings",
    description: "Every property is checked by our team before it goes live.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Bookings and payments are tracked end-to-end, with instant receipts.",
  },
  {
    icon: Landmark,
    title: "Licensed Agents",
    description: "Agent credentials are reviewed and status-tracked by our admin team.",
  },
  {
    icon: Headphones,
    title: "Real Support",
    description: "Questions about a listing or booking reach a real person, fast.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I compared a dozen apartments in Dhanmondi over a weekend without ever leaving my desk. The booking calendar meant no awkward back-and-forth about viewing times.",
    name: "Rafiul K.",
    role: "Tenant, Dhanmondi",
  },
  {
    quote:
      "Listing our family land in Sonargaon took ten minutes, and the facing and road-width fields meant buyers stopped asking questions we'd already answered.",
    name: "Farzana B.",
    role: "Property owner, Narayanganj",
  },
  {
    quote:
      "As an agent, having bookings, payments, and my listings in one dashboard cut my admin time in half. I finally spend the freed-up hours actually meeting clients.",
    name: "Tariq I.",
    role: "Agent, Prime Realty Group",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ properties: 0, cities: CITIES.length, agents: 0 });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const all = await PropertyService.list();
      setFeatured(all.slice(0, 8));
      setStats({
        properties: all.length,
        cities: new Set(all.map((p) => p.city)).size,
        agents: new Set(all.map((p) => p.agentId)).size,
      });
      setIsLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80"
            alt="Modern home surrounded by greenery"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/70 to-navy-950/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white animate-fade-up">
              <Sparkles size={13} className="text-gold-400" /> Homes, land & plots — one platform
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl animate-fade-up [animation-delay:100ms]">
              Finding home,
              <br />
              made <span className="italic text-brand-300">honest</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-brand-100/90 sm:text-lg animate-fade-up [animation-delay:200ms]">
              SRMS connects customers, agents, and administrators on one clean
              platform — search, book, and manage residential, commercial,
              and land listings with nothing hidden along the way.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up [animation-delay:300ms]">
              <Link href="/properties">
                <Button size="lg">
                  <Search size={17} /> Explore listings
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="glass" size="lg" className="!text-white">
                  List your property
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 animate-fade-up [animation-delay:400ms]">
            {[
              { label: "Listings", value: `${formatNumber(stats.properties)}+`, icon: Building2 },
              { label: "Cities covered", value: stats.cities, icon: TrendingUp },
              { label: "Verified agents", value: stats.agents, icon: ShieldCheck },
            ].map((s) => (
              <div key={s.label} className="glass-strong rounded-2xl p-4 text-center text-white">
                <s.icon size={18} className="mx-auto mb-2 text-gold-400" />
                <p className="font-display text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-brand-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Featured properties ---------------- */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-20 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              Handpicked
            </p>
            <h2 className="font-display text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">
              Our Featured Listings
            </h2>
          </div>
          <Link href="/properties">
            <Button variant="outline">
              View all listings <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
        <PropertyCarousel properties={featured} isLoading={isLoading} />
      </section>

      {/* ---------------- Category split ---------------- */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <Link href="/properties?type=residential">
            <Card
              hover
              className="group relative flex h-52 items-end overflow-hidden p-6 bg-gradient-to-br from-navy-800 to-navy-950"
            >
              <HomeIcon className="absolute -right-4 -top-4 text-white/10 transition-transform group-hover:scale-110" size={140} />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
                  For living
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">Residential</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-brand-100">
                  Apartments, villas, houses <ArrowRight size={14} />
                </p>
              </div>
            </Card>
          </Link>
          <Link href="/properties?type=commercial">
            <Card
              hover
              className="group relative flex h-52 items-end overflow-hidden p-6 bg-gradient-to-br from-brand-700 to-brand-500"
            >
              <Building2 className="absolute -right-4 -top-4 text-white/10 transition-transform group-hover:scale-110" size={140} />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
                  For business
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">Commercial</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-brand-100">
                  Offices, retail, warehouses <ArrowRight size={14} />
                </p>
              </div>
            </Card>
          </Link>
          <Link href="/properties?type=land">
            <Card
              hover
              className="group relative flex h-52 items-end overflow-hidden p-6 bg-gradient-to-br from-navy-700 to-brand-700"
            >
              <Trees className="absolute -right-4 -top-4 text-white/10 transition-transform group-hover:scale-110" size={140} />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
                  For building
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">Land & Plots</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-brand-100">
                  Clear-titled land, subdivided plots <ArrowRight size={14} />
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* ---------------- Our Promise ---------------- */}
      <section className="bg-surface-muted/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              Our promise
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">
              At SRMS, trust is at the heart of every listing.
            </h2>
            <p className="mt-4 max-w-md text-sm text-navy-500 dark:text-slate-300">
              We&apos;re committed to verified data, transparent pricing, and
              secure transactions — no fine print, no surprise fees, and no
              listings you can&apos;t trust.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {TRUST_POINTS.map((point) => (
                <div key={point.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                    <point.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{point.title}</p>
                    <p className="mt-0.5 text-xs text-navy-400">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80"
              alt="Pathway to a modern house"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              The booking flow
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">
              From search to move-in, four steps
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Card key={step.title} hover className="relative p-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="font-display text-4xl font-semibold text-brand-100 dark:text-white/10">
                  0{i + 1}
                </span>
                <div className="-mt-6 mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-navy-700 text-white shadow-md">
                  <step.icon size={19} />
                </div>
                <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-navy-400">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
              What our clients say
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
              Trusted by tenants, owners, and agents
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl border border-white/10 p-6">
                <Quote className="text-brand-300" size={22} />
                <p className="mt-4 text-sm leading-relaxed text-brand-100/90">{t.quote}</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-brand-100/70">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              What we offer
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">
              Our services
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <div key={service.title} className="rounded-2xl border border-black/5 p-6 dark:border-white/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                  <service.icon size={19} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-navy-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-sm text-navy-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Card className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80"
              alt="Modern house exterior at dusk"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-navy-950/80" />
          </div>
          <Users className="pointer-events-none absolute -bottom-8 -left-8 text-white/10" size={180} />
          <h2 className="relative font-display text-2xl font-semibold text-white sm:text-3xl">
            Let&apos;s build your next chapter, together.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-brand-100">
            Join as a customer to book your next home, or as an agent to list
            and manage your portfolio — all in one dashboard.
          </p>
          <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-navy-900 hover:bg-brand-100">
                Create free account <ArrowUpRight size={16} />
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="glass" size="lg" className="!text-white">
                Explore listings
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
