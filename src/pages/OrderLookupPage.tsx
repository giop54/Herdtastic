import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await getOrder(orderId.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setError("We couldn't find an order matching that ID and email.");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not look up that order.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Seo
        title="Track an Order"
        description="Look up the status of your Heardtastic order."
        path="/orders/lookup"
        noindex
      />
      <div className="mb-1.5 font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
        Order Status
      </div>
      <h1 className="font-display text-3xl font-normal text-navy-800">Track an Order</h1>
      <p className="mt-2 text-ink-600">
        Enter your order ID and the email you used at checkout to see its status.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Order ID"
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="self-start">
          {loading ? "Checking…" : "Check Status"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-[var(--status-danger)]">{error}</p>}

      {order && (
        <div className="mt-8">
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  );
}
