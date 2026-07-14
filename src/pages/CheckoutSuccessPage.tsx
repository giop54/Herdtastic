import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { LAST_ORDER_ID_KEY } from "../lib/constants";
import { Button } from "../components/ui";
import { Seo } from "../components/Seo";

export function CheckoutSuccessPage() {
  const { refresh } = useCart();
  const orderId = sessionStorage.getItem(LAST_ORDER_ID_KEY);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-xl py-14 text-center">
      <Seo
        title="Order Confirmed"
        description="Your Herdtastic order is confirmed."
        path="/checkout/success"
        noindex
      />
      <h1 className="font-display text-3xl font-normal text-navy-800">Thank you for your order</h1>
      <p className="mt-3 text-ink-600">
        Your payment is being confirmed. You&rsquo;ll receive an email receipt once it&rsquo;s processed.
      </p>

      {orderId && (
        <p className="mt-4 font-condensed text-xs uppercase tracking-caps text-ink-400">
          Order reference: <span className="font-mono normal-case tracking-normal">{orderId}</span>
        </p>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/catalog">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
        {orderId && (
          <Link to={`/orders/lookup?order_id=${encodeURIComponent(orderId)}`}>
            <Button>Track This Order</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
