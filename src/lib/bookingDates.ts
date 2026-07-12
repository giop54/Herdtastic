const BOOKING_TIMEZONE = "America/Chicago";

function dateInTimeZone(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addCalendarDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function bookingWindow(): { start: string; end: string } {
  const today = dateInTimeZone(new Date(), BOOKING_TIMEZONE);
  return { start: addCalendarDays(today, 1), end: addCalendarDays(today, 90) };
}

export function formatBookingDate(
  date: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options);
}
