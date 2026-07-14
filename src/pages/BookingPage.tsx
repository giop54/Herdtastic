import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { cancelBooking, getBooking } from "../api/bookings";
import { ApiError } from "../api/client";
import type { Booking } from "../types";
import { Button, DetailPageSkeleton, Dialog } from "../components/ui";
import { Seo } from "../components/Seo";
import { formatBookingDate } from "../lib/bookingDates";

export function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const initialBooking = (location.state as { booking?: Booking } | null)?.booking ?? null;
  const [booking, setBooking] = useState<Booking | null>(initialBooking);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancellation, setConfirmingCancellation] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    if (booking?.id === bookingId) return;
    getBooking(bookingId)
      .then(setBooking)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load this booking."),
      );
  }, [booking, bookingId]);

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      setBooking(await cancelBooking(booking.id));
      setConfirmingCancellation(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel this booking.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl py-12">
      <Seo title="Your Booking" description="View your Herdtastic booking." noindex />
      {error && <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]">{error}</p>}
      {!error && !booking && <DetailPageSkeleton />}
      {booking && (
        <div className="rounded-lg border border-cream-200 bg-white p-6">
          {booking.status === "active" && (
            <div className="mb-5 flex items-center gap-3 rounded-md bg-[var(--status-success-bg)] px-4 py-3 text-[var(--status-success)]" role="status">
              <CheckCircle2 aria-hidden="true" size={24} />
              <div>
                <p className="font-condensed text-sm font-semibold uppercase tracking-caps">Booking confirmed</p>
                <p className="mt-0.5 text-sm">Your selected day is reserved.</p>
              </div>
            </div>
          )}
          {booking.status === "cancelled" && (
            <p className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">Booking cancelled</p>
          )}
          <h1 className="mt-2 font-display text-3xl font-normal text-navy-800">{formatBookingDate(booking.booking_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h1>
          <p className="mt-3 text-ink-600">We’ll contact {booking.customer_name} at {booking.customer_email} or {booking.customer_phone}.</p>
          {booking.status === "active" ? (
            <Button className="mt-6" variant="secondary" onClick={() => setConfirmingCancellation(true)}>Cancel booking</Button>
          ) : (
            <p className="mt-6 rounded-sm bg-cream-100 px-3 py-2 text-sm text-ink-600">This booking has been cancelled and the day is available again.</p>
          )}
          <Link to="/catalog" className="mt-6 block font-condensed text-sm uppercase tracking-caps text-navy-700">Browse catalog</Link>
        </div>
      )}
      <Dialog
        open={confirmingCancellation}
        title="Cancel this booking?"
        onClose={() => !cancelling && setConfirmingCancellation(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmingCancellation(false)} disabled={cancelling}>Keep booking</Button>
            <Button onClick={handleCancel} disabled={cancelling}>{cancelling ? "Cancelling…" : "Cancel booking"}</Button>
          </>
        }
      >
        This releases the selected day for another customer. This action cannot be undone.
      </Dialog>
    </div>
  );
}
