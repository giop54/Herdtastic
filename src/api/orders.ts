import { apiFetch } from "./client";
import type { Order } from "../types";

export function listOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export function getOrder(orderId: string, guestEmail?: string): Promise<Order> {
  const headers: Record<string, string> = {};
  if (guestEmail) {
    headers["X-Order-Email"] = guestEmail;
  }

  return apiFetch<Order>(`/orders/${encodeURIComponent(orderId)}`, { headers });
}
