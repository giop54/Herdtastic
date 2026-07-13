import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMetricsSummary, listAdminBookings, listAdminOrders } from "../../api/admin";
import { StatCard } from "../../components/admin/StatCard";
import { formatCents } from "../../lib/money";
import { bookingWindow, addCalendarDays, formatBookingDate } from "../../lib/bookingDates";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { AdminOrder, Booking, MetricsSummary } from "../../types";
import { DataPageSkeleton } from "../../components/ui";

function todayInBookingTz(): string {
  // bookingWindow() starts tomorrow in the booking timezone; step back one day.
  return addCalendarDays(bookingWindow().start, -1);
}

export function AdminDashboardPage() {
  const { describeError } = useAdminAuth();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [openOrders, setOpenOrders] = useState<AdminOrder[]>([]);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const today = todayInBookingTz();
    Promise.all([
      getMetricsSummary(),
      listAdminOrders({ limit: 200 }),
      listAdminBookings({ status: "active", start: today, end: today }),
    ])
      .then(([summary, orders, bookings]) => {
        if (cancelled) return;
        setMetrics(summary);
        setOpenOrders(
          orders.filter((o) => o.status === "paid" || o.status === "fulfillment_pending"),
        );
        setTodaysBookings(bookings);
      })
      .catch((err) => !cancelled && setError(describeError(err)));
    return () => {
      cancelled = true;
    };
  }, [describeError]);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!metrics) return <DataPageSkeleton />;

  const maxRevenue = Math.max(1, ...metrics.revenue_by_day.map((d) => d.total_cents));
  const attention = [
    ...openOrders.map((order) => ({
      key: `order-${order.id}`,
      chip: "Ship",
      chipClass: "bg-red-100 text-red-700",
      text: `Order ${order.order_number} — ${order.status.replace(/_/g, " ")}`,
      to: `/admin/orders/${order.id}`,
      action: "Add tracking",
    })),
    ...metrics.low_stock.map((v) => ({
      key: `stock-${v.variant_id}`,
      chip: "Stock",
      chipClass: "bg-[var(--status-warning-bg)] text-[var(--status-warning)]",
      text: `${v.product_name} — ${v.variant_name} · ${v.inventory_quantity} left`,
      to: `/admin/products/${v.product_id}`,
      action: "Restock",
    })),
    ...todaysBookings.map((b) => ({
      key: `booking-${b.id}`,
      chip: "Booking",
      chipClass: "bg-navy-100 text-navy-800",
      text: `${b.customer_name}, today`,
      to: "/admin/bookings",
      action: "Open",
    })),
  ];

  return (
    <div>
      <AdminPageHeader
        title={formatBookingDate(todayInBookingTz(), {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue · 7 days"
          value={formatCents(metrics.revenue_7d_cents)}
        />
        <StatCard
          label="Open orders"
          value={String(metrics.open_orders)}
          sub="awaiting shipment"
          tone={metrics.open_orders > 0 ? "alert" : "default"}
        />
        <StatCard label="Bookings today" value={String(metrics.bookings_today)} />
        <StatCard
          label="Low stock"
          value={String(metrics.low_stock.length)}
          sub={`variants at ≤ ${metrics.low_stock_threshold}`}
          tone={metrics.low_stock.length > 0 ? "alert" : "default"}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-md border border-cream-200 bg-white p-4 shadow-card lg:col-span-3">
          <h2 className="mb-3 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
            Needs attention
          </h2>
          {attention.length === 0 ? (
            <p className="text-sm text-ink-600">All caught up. Nothing needs you right now.</p>
          ) : (
            <ul className="divide-y divide-cream-100">
              {attention.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 font-condensed text-[10px] font-semibold uppercase tracking-caps ${item.chipClass}`}
                  >
                    {item.chip}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-900">{item.text}</span>
                  <Link
                    to={item.to}
                    className="whitespace-nowrap text-xs font-semibold text-navy-700 hover:text-red-700"
                  >
                    {item.action} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-md border border-cream-200 bg-white p-4 shadow-card lg:col-span-2">
          <h2 className="mb-3 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
            Revenue · last 14 days
          </h2>
          <div className="flex h-28 items-end gap-1" role="img" aria-label="Daily revenue bars">
            {metrics.revenue_by_day.map((day, index) => (
              <div
                key={day.date}
                title={`${day.date}: ${formatCents(day.total_cents)}`}
                className={`flex-1 rounded-t-sm ${
                  index === metrics.revenue_by_day.length - 1 ? "bg-red-700" : "bg-navy-100"
                }`}
                style={{ height: `${Math.max(4, (day.total_cents / maxRevenue) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-ink-400">
            <span>{metrics.revenue_by_day[0]?.date}</span>
            <span>{metrics.revenue_by_day[metrics.revenue_by_day.length - 1]?.date}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
