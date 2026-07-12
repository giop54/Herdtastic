import { useMemo } from "react";
import type { BookingDay } from "../types";
import { formatBookingDate } from "../lib/bookingDates";

interface BookingCalendarProps {
  days: BookingDay[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingCalendar({ days, selectedDate, onSelect }: BookingCalendarProps) {
  const months = useMemo(() => {
    const grouped = new Map<string, BookingDay[]>();
    for (const day of days) {
      const month = day.date.slice(0, 7);
      grouped.set(month, [...(grouped.get(month) ?? []), day]);
    }
    return [...grouped.entries()];
  }, [days]);

  return (
    <div className="space-y-5" aria-label="Booking availability">
      {months.map(([month, monthDays]) => {
        const firstDay = new Date(`${monthDays[0].date}T12:00:00`).getDay();
        return (
          <section key={month}>
            <h3 className="mb-2 font-condensed text-sm font-semibold uppercase tracking-caps text-navy-800">
              {formatBookingDate(`${month}-01`, { month: "long", year: "numeric" })}
            </h3>
            <div className="grid grid-cols-7 gap-1" role="grid">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="py-1 text-center font-condensed text-[10px] uppercase tracking-wide text-ink-400"
                  role="columnheader"
                >
                  {weekday}
                </div>
              ))}
              {Array.from({ length: firstDay }, (_, index) => (
                <span key={`offset-${index}`} aria-hidden="true" />
              ))}
              {monthDays.map((day) => {
                const selected = day.date === selectedDate;
                const label = formatBookingDate(day.date, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <button
                    key={day.date}
                    type="button"
                    role="gridcell"
                    aria-label={`${label}${day.available ? "" : ", unavailable"}`}
                    aria-pressed={selected}
                    disabled={!day.available}
                    onClick={() => onSelect(day.date)}
                    className={`aspect-square rounded-sm border text-sm transition-colors ${
                      selected
                        ? "border-navy-800 bg-navy-800 font-semibold text-white"
                        : day.available
                          ? "border-tan-300 bg-white text-ink-900 hover:border-red-700 hover:text-red-700"
                          : "border-cream-200 bg-cream-100 text-ink-400 line-through"
                    } disabled:cursor-not-allowed`}
                  >
                    {Number(day.date.slice(8, 10))}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <div className="flex gap-4 font-condensed text-xs uppercase tracking-wide text-ink-600">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-tan-300 bg-white" />Available</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-cream-200" />Unavailable</span>
      </div>
    </div>
  );
}
