import { Badge } from "../ui";
import type { OrderStatus } from "../../types";

type Tone = "navy" | "red" | "success" | "warning" | "neutral";

const tones: Record<OrderStatus, Tone> = {
  pending: "neutral",
  checkout_created: "neutral",
  payment_processing: "warning",
  paid: "success",
  fulfillment_pending: "warning",
  shipped: "navy",
  delivered: "success",
  cancelled: "neutral",
  payment_failed: "red",
  partially_refunded: "warning",
  refunded: "neutral",
  disputed: "red",
};

export function orderStatusLabel(status: OrderStatus): string {
  return status.replace(/_/g, " ");
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return <Badge tone={tones[status]}>{orderStatusLabel(status)}</Badge>;
}
