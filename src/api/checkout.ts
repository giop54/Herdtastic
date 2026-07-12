import { apiFetch } from "./client";
import type { CheckoutSessionResponse, CheckoutSessionStatus } from "../types";

export function createCheckoutSession(): Promise<CheckoutSessionResponse> {
  return apiFetch<CheckoutSessionResponse>("/checkout/sessions", { method: "POST" });
}

export function getCheckoutSessionStatus(sessionId: string): Promise<CheckoutSessionStatus> {
  return apiFetch<CheckoutSessionStatus>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}
