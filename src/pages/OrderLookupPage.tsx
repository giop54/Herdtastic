import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, LockKeyhole, PackageSearch, Search, ShieldCheck } from "lucide-react";
import { getOrder } from "../api/orders";
import { ApiError } from "../api/client";
import type { Order } from "../types";
import { OrderSummary } from "../components/OrderSummary";
import { Button, Input } from "../components/ui";
import { Seo } from "../components/Seo";

export function OrderLookupPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order_id") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await getOrder(orderId.trim(), email.trim());
      setOrder(result);
      window.setTimeout(() => resultRef.current?.focus(), 0);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setError(
          "We couldn't match that order ID and email. Check your confirmation email and try again.",
        );
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "We couldn't check your order right now. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl py-1 sm:py-6">
      <Seo
        title="Track an Order"
        description="Look up the current status and shipment progress of your Heardtastic order."
        path="/orders/lookup"
        noindex
      />

      <section className="relative overflow-hidden rounded-2xl bg-navy-900 px-5 py-10 text-cream-50 shadow-raised sm:px-10 sm:py-14 lg:px-14">
        <PackageSearch
          className="absolute -right-10 -top-10 h-56 w-56 text-white/[0.04]"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-600">
            Order tracking
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            See where your order stands.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
            Enter the details from your confirmation to view payment status, fulfillment progress,
            order totals, and any available tracking number.
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-5 grid max-w-5xl items-start gap-6 px-2 sm:-mt-7 sm:px-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-7" aria-labelledby="lookup-title">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-red-50 text-red-700">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="lookup-title" className="font-display text-2xl text-navy-900">
                Find your order
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink-600">
                Both fields must match the information used at checkout.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" aria-busy={loading}>
            <Input
              label="Order ID"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              hint="Found in your order confirmation"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <Input
              label="Checkout email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              hint="The email used to place the order"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                <Search className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                {loading ? "Looking up order…" : "Track my order"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4" role="alert">
              <p className="font-semibold text-red-800">Order not found</p>
              <p className="mt-1 text-sm leading-6 text-red-800">{error}</p>
              <Link
                to="/contact"
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-caps text-red-800"
              >
                Get order help <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-cream-200 bg-cream-100 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-navy-700" aria-hidden="true" />
            <h2 className="font-condensed text-sm font-semibold uppercase tracking-caps text-navy-900">
              Private guest lookup
            </h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-600">
            Your order ID and checkout email work together to keep guest order details private.
          </p>
          <div className="mt-4 flex items-start gap-2 border-t border-tan-300 pt-4 text-xs leading-5 text-ink-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-red-700" aria-hidden="true" />
            We only use these details to retrieve the matching order.
          </div>
        </aside>
      </div>

      {order && (
        <div ref={resultRef} tabIndex={-1} className="mx-auto mt-10 max-w-5xl focus:outline-none" aria-live="polite">
          <OrderSummary order={order} />
        </div>
      )}

      {!order && (
        <section className="mx-auto mt-10 grid max-w-5xl gap-4 border-t border-cream-200 pt-8 sm:grid-cols-3" aria-label="Order tracking guidance">
          {[
            ["1", "Find your confirmation", "Locate the order ID sent after checkout."],
            ["2", "Enter matching details", "Use the same email address used to purchase."],
            ["3", "View live status", "See fulfillment progress and tracking details."],
          ].map(([number, title, body]) => (
            <div key={number} className="flex gap-3 p-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-navy-900 font-condensed text-sm font-semibold text-white">
                {number}
              </span>
              <div>
                <h2 className="font-display text-lg text-navy-900">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-600">{body}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
