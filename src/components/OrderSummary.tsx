import { Truck } from "lucide-react";
import type { Order } from "../types";
import { formatCents } from "../lib/money";
import { Badge } from "./ui";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  checkout_created: "Checkout started",
  payment_processing: "Payment processing",
  paid: "Paid",
  fulfillment_pending: "Preparing for shipment",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  disputed: "Disputed",
};

const STATUS_TONE: Record<string, "navy" | "red" | "success" | "warning" | "neutral"> = {
  paid: "success",
  delivered: "success",
  shipped: "success",
  fulfillment_pending: "navy",
  checkout_created: "navy",
  payment_processing: "warning",
  pending: "neutral",
  cancelled: "red",
  payment_failed: "red",
  disputed: "red",
  refunded: "neutral",
  partially_refunded: "neutral",
};

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="rounded-lg border border-cream-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-condensed text-xs uppercase tracking-caps text-ink-600">Order</p>
          <p className="font-display text-xl text-navy-800">{order.order_number}</p>
        </div>
        <Badge tone={STATUS_TONE[order.status] ?? "navy"}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="mt-6 divide-y divide-cream-200">
        {order.line_items.map((item, idx) => (
          <div key={`${item.product_id}-${item.variant_id}-${idx}`} className="flex justify-between py-3">
            <div>
              <p className="font-display text-base text-navy-800">{item.name}</p>
              <p className="font-condensed text-xs uppercase tracking-caps text-ink-600">
                {item.sku} &middot; Qty {item.quantity}
              </p>
            </div>
            <p className="font-medium text-ink-900">
              {formatCents(item.unit_price_cents * item.quantity, order.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 border-t border-cream-200 pt-4 text-sm text-ink-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCents(order.subtotal_cents, order.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatCents(order.shipping_cents, order.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCents(order.tax_cents, order.currency)}</span>
        </div>
        {order.discount_cents > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCents(order.discount_cents, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-cream-200 pt-2 font-condensed text-sm font-semibold uppercase tracking-caps text-navy-800">
          <span>Total</span>
          <span className="font-display text-lg normal-case tracking-normal text-red-700">
            {formatCents(order.total_cents, order.currency)}
          </span>
        </div>
      </div>

      {order.tracking_number && (
        <div className="mt-4 flex items-center gap-2.5 rounded-md border border-cream-200 bg-cream-100 px-4 py-3">
          <Truck size={18} className="flex-shrink-0 text-navy-700" strokeWidth={1.75} />
          <div className="text-sm">
            <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">
              Tracking Number:{" "}
            </span>
            <span className="font-mono text-ink-900">{order.tracking_number}</span>
          </div>
        </div>
      )}
    </div>
  );
}
