import { API_BASE_URL, apiFetch } from "./client";
import type {
  AdminBookingPatch,
  AdminOrder,
  AdminOrderPatch,
  AdminProduct,
  AdminProductInput,
  AdminProductPatch,
  AdminVariantInput,
  AdminVariantPatch,
  AuditEntry,
  BlackoutDate,
  Booking,
  MetricsSummary,
  OrderStatus,
  StockUpdate,
} from "../types";

// The admin key is the backend's ADMIN_API_KEY, entered on /admin/login. Session-scoped on
// purpose: closing the tab signs the admin out. When Firebase admin sign-in lands, this file
// keeps its exports and swaps the header for the bearer token via setFirebaseIdTokenProvider.
const ADMIN_KEY_STORAGE = "herdtastic_admin_key";

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE);
}

function adminHeaders(key?: string): Record<string, string> {
  const adminKey = key ?? getAdminKey();
  return adminKey ? { "X-Admin-Key": adminKey } : {};
}

function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(`/admin${path}`, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers as Record<string, string> | undefined) },
  });
}

/** Throws ApiError (401) when the key is wrong; resolves when it works. */
export async function verifyAdminKey(key: string): Promise<void> {
  await apiFetch<AdminProduct[]>("/admin/products", { headers: adminHeaders(key) });
}

// ---- products ----

export function listAdminProducts(): Promise<AdminProduct[]> {
  return adminFetch<AdminProduct[]>("/products");
}

export function createAdminProduct(payload: AdminProductInput): Promise<AdminProduct> {
  return adminFetch<AdminProduct>("/products", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAdminProduct(
  productId: string,
  payload: AdminProductPatch,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function archiveAdminProduct(productId: string): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export function addAdminVariant(
  productId: string,
  payload: AdminVariantInput,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/products/${encodeURIComponent(productId)}/variants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminVariant(
  productId: string,
  variantId: string,
  payload: AdminVariantPatch,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export function adjustAdminStock(
  productId: string,
  variantId: string,
  payload: StockUpdate,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/stock`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

// ---- bookings ----

export function listAdminBookings(params: {
  status?: "active" | "cancelled";
  start?: string;
  end?: string;
  q?: string;
}): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);
  if (params.q) query.set("q", params.q);
  const suffix = query.size ? `?${query}` : "";
  return adminFetch<Booking[]>(`/bookings${suffix}`);
}

export function updateAdminBooking(
  bookingId: string,
  payload: AdminBookingPatch,
): Promise<Booking> {
  return adminFetch<Booking>(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listBlackoutDates(): Promise<BlackoutDate[]> {
  return adminFetch<BlackoutDate[]>("/blackout-dates");
}

export function addBlackoutDate(payload: BlackoutDate): Promise<BlackoutDate> {
  return adminFetch<BlackoutDate>("/blackout-dates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeBlackoutDate(date: string): Promise<void> {
  return adminFetch<void>(`/blackout-dates/${encodeURIComponent(date)}`, { method: "DELETE" });
}

// ---- orders ----

export interface AdminOrderFilters {
  status?: OrderStatus | "";
  q?: string;
  limit?: number;
}

function orderQuery(filters: AdminOrderFilters): URLSearchParams {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.q) query.set("q", filters.q);
  if (filters.limit) query.set("limit", String(filters.limit));
  return query;
}

export function listAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrder[]> {
  const query = orderQuery(filters);
  const suffix = query.size ? `?${query}` : "";
  return adminFetch<AdminOrder[]>(`/orders${suffix}`);
}

export function getAdminOrder(orderId: string): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

export function updateAdminOrder(orderId: string, payload: AdminOrderPatch): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** CSV needs the raw body, so this one call bypasses apiFetch's JSON parsing. */
export async function downloadOrdersCsv(filters: AdminOrderFilters = {}): Promise<void> {
  const query = orderQuery(filters);
  query.set("format", "csv");
  const res = await fetch(`${API_BASE_URL}/admin/orders?${query}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(`CSV export failed with status ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "orders.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ---- metrics & audit ----

export function getMetricsSummary(): Promise<MetricsSummary> {
  return adminFetch<MetricsSummary>("/metrics/summary");
}

export function listAuditLog(limit = 100): Promise<AuditEntry[]> {
  return adminFetch<AuditEntry[]>(`/audit-log?limit=${limit}`);
}
