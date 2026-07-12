import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminOrder, updateAdminOrder } from "../../api/admin";
import { StatusPill, orderStatusLabel } from "../../components/admin/StatusPill";
import { Button, Input, Select, Toast } from "../../components/ui";
import { formatCents } from "../../lib/money";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { AdminOrder, OrderStatus } from "../../types";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "checkout_created",
  "payment_processing",
  "paid",
  "fulfillment_pending",
  "shipped",
  "delivered",
  "cancelled",
  "payment_failed",
  "partially_refunded",
  "refunded",
  "disputed",
];

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const { describeError } = useAdminAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getAdminOrder(orderId)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setTracking(o.tracking_number ?? "");
      })
      .catch((err) => setError(describeError(err)));
  }, [orderId, describeError]);

  async function save() {
    if (!order || busy) return;
    setBusy(true);
    setSaveError("");
    try {
      const patch: { status?: OrderStatus; tracking_number?: string } = {};
      if (status && status !== order.status) patch.status = status;
      if (tracking.trim() !== (order.tracking_number ?? "")) {
        patch.tracking_number = tracking.trim();
      }
      if (Object.keys(patch).length === 0) return;
      const updated = await updateAdminOrder(order.id, patch);
      setOrder(updated);
      setStatus(updated.status);
      setTracking(updated.tracking_number ?? "");
      setToast("Order updated");
      window.setTimeout(() => setToast(""), 3500);
    } catch (err) {
      setSaveError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-red-700">{error}</p>;
  if (!order) return <p className="text-ink-600">Loading order…</p>;

  const money: [string, number][] = [
    ["Subtotal", order.subtotal_cents],
    ["Shipping", order.shipping_cents],
    ["Tax", order.tax_cents],
    ["Discount", -order.discount_cents],
  ];

  return (
    <div className="max-w-4xl">
      <AdminPageHeader title={`Order ${order.order_number}`}>
        <StatusPill status={order.status} />
      </AdminPageHeader>
      <p className="mb-4 text-sm text-ink-600">
        Placed {new Date(order.created_at).toLocaleString()} ·{" "}
        {order.customer_email ? (
          <a href={`mailto:${order.customer_email}`} className="text-navy-700 hover:text-red-700">
            {order.customer_email}
          </a>
        ) : (
          "guest"
        )}{" "}
        · <Link to="/admin/orders" className="text-navy-700 hover:text-red-700">← All orders</Link>
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="grid gap-4 lg:col-span-3">
          <section className="rounded-md border border-cream-200 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tan-300 bg-cream-100 text-left font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5 text-right">Qty</th>
                  <th className="px-4 py-2.5 text-right">Unit</th>
                  <th className="px-4 py-2.5 text-right">Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {order.line_items.map((item) => (
                  <tr key={`${item.variant_id}-${item.sku}`}>
                    <td className="px-4 py-2.5 text-ink-900">{item.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-600">{item.sku}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatCents(item.unit_price_cents, order.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatCents(item.unit_price_cents * item.quantity, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {money.map(([label, cents]) =>
                  cents !== 0 || label === "Subtotal" ? (
                    <tr key={label} className="text-ink-600">
                      <td colSpan={4} className="px-4 py-1.5 text-right">
                        {label}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums">
                        {formatCents(cents, order.currency)}
                      </td>
                    </tr>
                  ) : null,
                )}
                <tr className="border-t border-tan-300 font-semibold text-ink-900">
                  <td colSpan={4} className="px-4 py-2.5 text-right">
                    Total
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCents(order.total_cents, order.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="rounded-md border border-cream-200 bg-white p-4 shadow-card">
            <h2 className="mb-3 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
              Timeline
            </h2>
            {order.status_history.length === 0 ? (
              <p className="text-sm text-ink-600">No status changes recorded yet.</p>
            ) : (
              <ol className="grid gap-2">
                {[...order.status_history].reverse().map((entry, index) => (
                  <li key={index} className="flex items-baseline gap-3 text-sm">
                    <span className="whitespace-nowrap text-xs tabular-nums text-ink-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="text-ink-900">
                      {entry.previous_status
                        ? `${orderStatusLabel(entry.previous_status)} → `
                        : ""}
                      <strong>{orderStatusLabel(entry.new_status)}</strong>
                      <span className="text-ink-600"> · {entry.reason} ({entry.source})</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <section className="h-fit rounded-md border border-cream-200 bg-white p-4 shadow-card lg:col-span-2">
          <h2 className="mb-3 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
            Fulfillment
          </h2>
          <div className="grid gap-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              options={ALL_STATUSES.map((s) => ({ value: s, label: orderStatusLabel(s) }))}
            />
            <Input
              label="Tracking number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              hint="Adding tracking to a paid order marks it shipped."
            />
            {saveError && <p className="text-sm text-red-700">{saveError}</p>}
            <Button onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
            <p className="text-xs text-ink-400">
              Refunds are issued in the Stripe dashboard; record the outcome here by setting the
              status.
            </p>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Toast tone="success">{toast}</Toast>
        </div>
      )}
    </div>
  );
}
