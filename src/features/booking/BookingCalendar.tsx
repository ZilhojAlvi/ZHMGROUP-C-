"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
  /** Dates that are already reserved and cannot be picked, format YYYY-MM-DD */
  disabledDates?: string[];
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function BookingCalendar({ selectedDate, onSelect, disabledDates = [] }: BookingCalendarProps) {
  const today = useMemo(() => new Date(new Date().toDateString()), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startWeekday = viewDate.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-navy-800 dark:text-white">
          <CalendarDays size={16} /> {monthLabel}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-navy-500"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-navy-500"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-[11px] font-semibold text-navy-400">
            {w}
          </span>
        ))}
        {cells.map((date, idx) => {
          if (!date) return <span key={idx} />;
          const iso = toISO(date);
          const isPast = date < today;
          const isDisabled = isPast || disabledDates.includes(iso);
          const isSelected = selectedDate === iso;
          const isToday = toISO(today) === iso;

          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => onSelect(iso)}
              className={cn(
                "aspect-square rounded-lg text-xs font-medium transition-all",
                isDisabled && "cursor-not-allowed text-navy-200 dark:text-slate-700",
                !isDisabled && !isSelected && "text-navy-700 dark:text-slate-200 hover:bg-brand-500/10",
                isSelected && "bg-gradient-to-br from-brand-600 to-navy-700 text-white shadow-md",
                isToday && !isSelected && "ring-1 ring-brand-400"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
