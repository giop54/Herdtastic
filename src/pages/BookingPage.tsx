import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelBooking, getBooking } from "../api/bookings";
import { ApiError } from "../api/client";
import type { Booking } from "../types";
import { Button } from "../components/ui";
import { Seo } from "../components/Seo";

export function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    getBooking(bookingId).then(setBooking).catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this booking."));
  }, [bookingId]);

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      setBooking(await cancelBooking(booking.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel this booking.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl py-12">
      <Seo title="Your Booking" description="View your Heardtastic booking." noindex />
      {error && <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]">{error}</p>}
      {!error && !booking && <p className="text-ink-600">Loading your booking…</p>}
      {booking && (
        <div className="rounded-lg border border-cream-200 bg-white p-6">
          <p className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">Booking {booking.status}</p>
          <h1 className="mt-2 font-display text-3xl font-normal text-navy-800">{new Date(`${booking.booking_date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h1>
          <p className="mt-3 text-ink-600">We’ll contact {booking.customer_name} at {booking.customer_email} or {booking.customer_phone}.</p>
          {booking.status === "active" && <Button className="mt-6" variant="secondary" onClick={handleCancel} disabled={cancelling}>{cancelling ? "Cancelling…" : "Cancel booking"}</Button>}
          <Link to="/catalog" className="mt-6 block font-condensed text-sm uppercase tracking-caps text-navy-700">Browse catalog</Link>
        </div>
      )}
    </div>
  );
}
