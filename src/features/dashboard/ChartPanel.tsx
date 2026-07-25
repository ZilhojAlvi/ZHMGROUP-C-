"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart3 } from "lucide-react";

const COLORS = ["#5f8746", "#9db98a", "#c8a248", "#456136", "#a4622f", "#8a8073"];

function ChartShell({
  title,
  subtitle,
  isEmpty,
  children,
}: {
  title: string;
  subtitle?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <h3 className="font-display text-base font-semibold text-navy-900 dark:text-white">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-navy-400">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState icon={<BarChart3 size={22} />} title="No data yet" description="Data will appear here once activity is recorded." />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueAreaChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ChartShell title="Revenue Trend" subtitle="Successful payments over time" isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5f8746" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5f8746" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 8px 24px rgba(10,22,48,0.15)" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#5f8746" strokeWidth={2.5} fill="url(#revFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function BookingsStatusBarChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ChartShell title="Bookings by Status" subtitle="Distribution across the booking lifecycle" isEmpty={data.every((d) => d.count === 0)}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="status" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="capitalize" />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PropertyTypePieChart({ data }: { data: { type: string; count: number }[] }) {
  return (
    <ChartShell title="Property Mix" subtitle="Residential vs commercial listings" isEmpty={data.every((d) => d.count === 0)}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function SimpleLineChart({
  data,
  dataKey,
  xKey,
  color = "#5f8746",
  title,
  subtitle,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
  color?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <ChartShell title={title} subtitle={subtitle} isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
