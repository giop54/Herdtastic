import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { downloadOrdersCsv, listAdminOrders } from "../../api/admin";
import { StatusPill, orderStatusLabel } from "../../components/admin/StatusPill";
import { Button, Input, Select } from "../../components/ui";
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

export function AdminOrdersPage() {
  const { describeError } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listAdminOrders({ status, q: search })
      .then((result) => !cancelled && setOrders(result))
      .catch((err) => !cancelled && setError(describeError(err)));
    return () => {
      cancelled = true;
    };
  }, [status, search, describeError]);

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div>
      <AdminPageHeader title="Orders">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Order # or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search orders"
          />
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
            options={[
              { value: "", label: "All statuses" },
              ...ALL_STATUSES.map((s) => ({ value: s, label: orderStatusLabel(s) })),
            ]}
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            downloadOrdersCsv({ status, q: search }).catch((err) => setError(describeError(err)))
          }
        >
          <Download size={14} aria-hidden />
          CSV
        </Button>
      </AdminPageHeader>

      {!orders ? (
        <p className="text-ink-600">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-ink-600">No orders match.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-cream-200 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-tan-300 bg-cream-100 text-left font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
                <th className="px-4 py-2.5">Order</th>
                <th className="px-4 py-2.5">Placed</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-semibold text-navy-800 hover:text-red-700"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-ink-900">{order.customer_email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCents(order.total_cents, order.currency)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-600">
                    {order.tracking_number ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
