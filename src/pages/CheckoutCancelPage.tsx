import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Seo } from "../components/Seo";

export function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl py-14 text-center">
      <Seo
        title="Checkout Cancelled"
        description="Your checkout was cancelled and no payment was made."
        path="/checkout/cancel"
        noindex
      />
      <h1 className="font-display text-3xl font-normal text-navy-800">Checkout cancelled</h1>
      <p className="mt-3 text-ink-600">
        No payment was made. Your cart is still saved if you&rsquo;d like to try again.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/cart">
          <Button>Return to Cart</Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
