import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  addBlackoutDate,
  listAdminBookings,
  listBlackoutDates,
  removeBlackoutDate,
  updateAdminBooking,
} from "../../api/admin";
import { Badge, Button, Input, Toast } from "../../components/ui";
import { addCalendarDays, bookingWindow, formatBookingDate } from "../../lib/bookingDates";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { Booking } from "../../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthGrid(year: number, month: number): (string | null)[] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => iso(year, month, i + 1)),
  ];
}

export function AdminBookingsPage() {
  const { describeError } = useAdminAuth();
  const today = addCalendarDays(bookingWindow().start, -1);
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blackouts, setBlackouts] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const days = useMemo(() => monthGrid(year, month), [year, month]);
  const monthStart = iso(year, month, 1);
  const monthEnd = days[days.length - 1] as string;

  const refresh = useCallback(() => {
    Promise.all([
      listAdminBookings({ start: monthStart, end: monthEnd }),
      listBlackoutDates(),
    ])
      .then(([monthBookings, blocked]) => {
        setBookings(monthBookings);
        setBlackouts(new Set(blocked.map((b) => b.date)));
        setError("");
      })
      .catch((err) => setError(describeError(err)));
  }, [monthStart, monthEnd, describeError]);

  useEffect(refresh, [refresh]);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const list = map.get(booking.booking_date) ?? [];
      list.push(booking);
      map.set(booking.booking_date, list);
    }
    return map;
  }, [bookings]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month + delta, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth());
    setSelectedDay(null);
  }

  async function toggleBlackout(day: string) {
    try {
      if (blackouts.has(day)) {
        await removeBlackoutDate(day);
        notify(`Unblocked ${day}`);
      } else {
        await addBlackoutDate({ date: day, reason: "Blocked from admin" });
        notify(`Blocked ${day} — no new bookings`);
      }
      refresh();
    } catch (err) {
      notify(describeError(err));
    }
  }

  async function act(booking: Booking, patch: Parameters<typeof updateAdminBooking>[1]) {
    try {
      await updateAdminBooking(booking.id, patch);
      refresh();
      notify("Booking updated");
    } catch (err) {
      notify(describeError(err));
    }
  }

  const selectedBookings = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div>
      <AdminPageHeader title={monthLabel}>
        <Button variant="ghost" size="sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setYear(Number(today.slice(0, 4)));
            setMonth(Number(today.slice(5, 7)) - 1);
          }}
        >
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={() => shiftMonth(1)} aria-label="Next month">
          <ChevronRight size={16} />
        </Button>
      </AdminPageHeader>

      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="pb-1 text-center font-condensed text-[10px] font-semibold uppercase tracking-caps text-ink-400"
          >
            {weekday}
          </div>
        ))}
        {days.map((day, index) =>
          day === null ? (
            <div key={`blank-${index}`} />
          ) : (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`min-h-[64px] rounded-sm border p-1.5 text-left align-top text-xs transition ${
                blackouts.has(day)
                  ? "border-red-100 bg-red-50"
                  : "border-cream-200 bg-white hover:border-navy-600"
              } ${day === today ? "outline outline-2 outline-navy-800" : ""} ${
                selectedDay === day ? "ring-2 ring-red-700" : ""
              }`}
            >
              <span className="font-semibold tabular-nums text-ink-900">{Number(day.slice(8))}</span>
              {(byDay.get(day)?.filter((b) => b.status === "active").length ?? 0) > 0 && (
                <span className="mt-1 block w-fit rounded-sm bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-800">
                  {byDay.get(day)!.filter((b) => b.status === "active").length} booked
                </span>
              )}
              {blackouts.has(day) && (
                <span className="mt-1 block font-condensed text-[9px] font-bold uppercase tracking-caps text-red-700">
                  Blocked
                </span>
              )}
            </button>
          ),
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-ink-600">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-navy-100" /> Has bookings
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-red-50 outline outline-1 outline-red-100" />{" "}
          Blocked
        </span>
        <span className="ml-auto">Click a day to manage it</span>
      </div>

      {selectedDay && (
        <section className="mt-5 rounded-md border border-cream-200 bg-white p-4 shadow-card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg text-navy-800">
              {formatBookingDate(selectedDay, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <Button
              variant={blackouts.has(selectedDay) ? "secondary" : "primary"}
              size="sm"
              onClick={() => toggleBlackout(selectedDay)}
            >
              <Ban size={14} aria-hidden />
              {blackouts.has(selectedDay) ? "Unblock this day" : "Block this day"}
            </Button>
          </div>
          {selectedBookings.length === 0 ? (
            <p className="text-sm text-ink-600">No bookings on this day.</p>
          ) : (
            <ul className="divide-y divide-cream-100">
              {selectedBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onCancel={() => act(booking, { status: "cancelled" })}
                  onReinstate={() => act(booking, { status: "active" })}
                  onReschedule={(date) => act(booking, { booking_date: date })}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Toast tone="info">{toast}</Toast>
        </div>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
  onReinstate,
  onReschedule,
}: {
  booking: Booking;
  onCancel: () => void;
  onReinstate: () => void;
  onReschedule: (date: string) => void;
}) {
  const [newDate, setNewDate] = useState("");
  const cancelled = booking.status === "cancelled";
  return (
    <li className="flex flex-wrap items-center gap-3 py-3 text-sm">
      <Badge tone={cancelled ? "neutral" : "success"}>{booking.status}</Badge>
      <div className="min-w-0">
        <div className="font-semibold text-ink-900">{booking.customer_name}</div>
        <div className="text-xs text-ink-600">
          <a href={`mailto:${booking.customer_email}`} className="hover:text-red-700">
            {booking.customer_email}
          </a>{" "}
          · {booking.customer_phone}
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {!cancelled && (
          <>
            <Input
              aria-label="New date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!newDate || newDate === booking.booking_date}
              onClick={() => onReschedule(newDate)}
            >
              Reschedule
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel booking
            </Button>
          </>
        )}
        {cancelled && (
          <Button variant="secondary" size="sm" onClick={onReinstate}>
            <RotateCcw size={14} aria-hidden />
            Reinstate
          </Button>
        )}
      </div>
    </li>
  );
}
