import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clipboard,
  CreditCard,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { Order, OrderStatus } from "../types";
import { formatCents } from "../lib/money";
import { Badge } from "./ui";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order pending",
  checkout_created: "Checkout started",
  payment_processing: "Payment processing",
  paid: "Payment confirmed",
  fulfillment_pending: "Preparing shipment",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  disputed: "Payment disputed",
};

const STATUS_TONE: Record<OrderStatus, "navy" | "red" | "success" | "warning" | "neutral"> = {
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

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Your order has been created and is waiting for checkout to continue.",
  checkout_created: "Checkout has started, but payment has not been confirmed yet.",
  payment_processing: "Stripe is processing your payment. No action is needed right now.",
  paid: "Payment is confirmed. Your order will move into fulfillment next.",
  fulfillment_pending: "Your order is being prepared for cryogenic shipment.",
  shipped: "Your order has left the facility. Use the tracking number below for carrier updates.",
  delivered: "The carrier reports that your order has been delivered.",
  cancelled: "This order was cancelled and will not be fulfilled.",
  payment_failed: "Payment could not be completed. Please contact us if you need help placing a new order.",
  partially_refunded: "Part of this order total has been refunded.",
  refunded: "This order has been refunded.",
  disputed: "The payment for this order is currently disputed. Contact us for assistance.",
};

interface Stage {
  label: string;
  description: string;
  icon: LucideIcon;
}

const STAGES: Stage[] = [
  { label: "Order received", description: "Checkout details saved", icon: ReceiptText },
  { label: "Payment confirmed", description: "Payment accepted", icon: CreditCard },
  { label: "Preparing shipment", description: "Order in fulfillment", icon: PackageOpen },
  { label: "Shipped", description: "With the carrier", icon: Truck },
  { label: "Delivered", description: "Shipment completed", icon: PackageCheck },
];

const PROGRESS_INDEX: Partial<Record<OrderStatus, number>> = {
  pending: 0,
  checkout_created: 0,
  payment_processing: 0,
  paid: 1,
  fulfillment_pending: 2,
  shipped: 3,
  delivered: 4,
};

const EXCEPTIONAL_STATUSES = new Set<OrderStatus>([
  "cancelled",
  "payment_failed",
  "partially_refunded",
  "refunded",
  "disputed",
]);

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OrderSummary({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false);
  const currentStage = PROGRESS_INDEX[order.status] ?? 0;
  const exceptional = EXCEPTIONAL_STATUSES.has(order.status);

  async function copyTrackingNumber() {
    if (!order.tracking_number) return;
    await navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-raised" aria-labelledby="order-result-title">
      <header className="bg-navy-900 p-5 text-cream-50 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-navy-100">
              Tracking result
            </p>
            <h2 id="order-result-title" className="mt-1 font-display text-3xl sm:text-4xl">
              {order.order_number}
            </h2>
            <p className="mt-2 text-sm text-navy-100">Placed {formatDateTime(order.created_at)}</p>
          </div>
          <Badge tone={STATUS_TONE[order.status]} className="w-fit">
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <div className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${exceptional ? "border-red-600/40 bg-red-900/30" : "border-white/10 bg-white/[0.06]"}`}>
          <CheckCircle2 className={`mt-0.5 h-5 w-5 flex-none ${exceptional ? "text-red-100" : "text-cream-100"}`} aria-hidden="true" />
          <div>
            <p className="font-condensed text-sm font-semibold uppercase tracking-caps text-cream-50">
              {STATUS_LABELS[order.status]}
            </p>
            <p className="mt-1 text-sm leading-6 text-navy-100">{STATUS_MESSAGES[order.status]}</p>
          </div>
        </div>
      </header>

      {!exceptional && (
        <section className="border-b border-cream-200 p-5 sm:p-7" aria-labelledby="progress-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="progress-title" className="font-display text-2xl text-navy-900">Fulfillment progress</h3>
            <p className="text-xs text-ink-400">Last updated {formatDateTime(order.updated_at)}</p>
          </div>
          <ol className="mt-7 grid gap-0 sm:grid-cols-5">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const complete = index < currentStage;
              const current = index === currentStage;
              return (
                <li key={stage.label} className="relative flex min-h-[76px] gap-4 pb-5 sm:block sm:min-h-0 sm:pb-0 sm:text-center">
                  {index < STAGES.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[19px] top-10 h-[calc(100%-40px)] w-0.5 sm:left-1/2 sm:top-5 sm:h-0.5 sm:w-full ${index < currentStage ? "bg-red-700" : "bg-cream-200"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 grid h-10 w-10 flex-none place-items-center rounded-full border-2 sm:mx-auto ${
                      complete
                        ? "border-red-700 bg-red-700 text-white"
                        : current
                          ? "border-red-700 bg-white text-red-700 ring-4 ring-red-50"
                          : "border-cream-200 bg-white text-ink-400"
                    }`}
                    aria-current={current ? "step" : undefined}
                  >
                    {complete ? <Check className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <div className="pt-1 sm:pt-3">
                    <p className={`font-condensed text-xs font-semibold uppercase tracking-caps ${current || complete ? "text-navy-900" : "text-ink-400"}`}>
                      {stage.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink-400">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="grid lg:grid-cols-[1fr_21rem]">
        <section className="p-5 sm:p-7" aria-labelledby="items-title">
          <h3 id="items-title" className="font-display text-2xl text-navy-900">Order items</h3>
          <div className="mt-4 divide-y divide-cream-200 border-y border-cream-200">
            {order.line_items.map((item, idx) => (
              <div key={`${item.product_id}-${item.variant_id}-${idx}`} className="flex items-start justify-between gap-5 py-4">
                <div>
                  <p className="font-display text-lg text-navy-800">{item.name}</p>
                  <p className="mt-1 font-condensed text-xs uppercase tracking-caps text-ink-600">
                    {item.sku} &middot; Quantity {item.quantity}
                  </p>
                </div>
                <p className="flex-none font-medium tabular-nums text-ink-900">
                  {formatCents(item.unit_price_cents * item.quantity, order.currency)}
                </p>
              </div>
            ))}
          </div>

          {order.tracking_number && (
            <div className="mt-6 rounded-xl border border-tan-300 bg-cream-100 p-4">
              <div className="flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
                <Truck className="h-4 w-4" aria-hidden="true" /> Tracking number
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-mono text-sm font-semibold text-ink-900">{order.tracking_number}</span>
                <button
                  type="button"
                  onClick={copyTrackingNumber}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-navy-800 px-4 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800 transition-colors hover:bg-navy-800 hover:text-white"
                  aria-live="polite"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Clipboard className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy number"}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="border-t border-cream-200 bg-cream-50 p-5 sm:p-7 lg:border-l lg:border-t-0" aria-labelledby="totals-title">
          <h3 id="totals-title" className="font-display text-2xl text-navy-900">Order total</h3>
          <dl className="mt-4 space-y-3 text-sm text-ink-600">
            <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd className="tabular-nums">{formatCents(order.subtotal_cents, order.currency)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Shipping</dt><dd className="tabular-nums">{formatCents(order.shipping_cents, order.currency)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Tax</dt><dd className="tabular-nums">{formatCents(order.tax_cents, order.currency)}</dd></div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between gap-4"><dt>Discount</dt><dd className="tabular-nums">-{formatCents(order.discount_cents, order.currency)}</dd></div>
            )}
            <div className="flex items-baseline justify-between gap-4 border-t border-tan-300 pt-4 font-condensed font-semibold uppercase tracking-caps text-navy-900">
              <dt>Total</dt>
              <dd className="font-display text-2xl normal-case tracking-normal text-red-700">{formatCents(order.total_cents, order.currency)}</dd>
            </div>
          </dl>
          {order.paid_at && (
            <p className="mt-5 border-t border-cream-200 pt-4 text-xs leading-5 text-ink-400">
              Payment confirmed {formatDateTime(order.paid_at)}
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
