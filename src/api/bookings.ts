import { apiFetch, setGuestToken } from "./client";
import type { Booking, BookingAvailability, BookingCreateResponse } from "../types";

export function getBookingAvailability(
  slug: string,
  start: string,
  end: string,
): Promise<BookingAvailability> {
  const params = new URLSearchParams({ start, end });
  return apiFetch<BookingAvailability>(`/products/${encodeURIComponent(slug)}/booking-availability?${params}`);
}

export async function createBooking(payload: {
  product_id: string;
  booking_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}): Promise<Booking> {
  const response = await apiFetch<BookingCreateResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.guest_token) setGuestToken(response.guest_token);
  return response.booking;
}

export function getBooking(bookingId: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${encodeURIComponent(bookingId)}`);
}

export function cancelBooking(bookingId: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${encodeURIComponent(bookingId)}`, { method: "DELETE" });
}
