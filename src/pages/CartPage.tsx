import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { listProductsCached } from "../api/products";
import { createCheckoutSession } from "../api/checkout";
import { ApiError } from "../api/client";
import type { Cart, Product } from "../types";
import { LAST_ORDER_ID_KEY } from "../lib/constants";
import { formatCents } from "../lib/money";
import { Button, DetailPageSkeleton, Dialog, PriceTag, QuantityStepper } from "../components/ui";
import { Seo } from "../components/Seo";

export function CartPage() {
  const { cart, loading, error, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<Cart["items"][number] | null>(null);

  useEffect(() => {
    listProductsCached()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  function lookupVariant(productId: string, variantId: string) {
    const product = products?.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.variant_id === variantId);
    return { product, variant };
  }

  const currency = cart?.currency ?? "usd";
  const subtotalCents =
    cart?.items.reduce((sum, item) => {
      const { variant } = lookupVariant(item.product_id, item.variant_id);
      return sum + (variant?.price_cents ?? 0) * item.quantity;
    }, 0) ?? 0;

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const { order_id, checkout_url } = await createCheckoutSession();
      sessionStorage.setItem(LAST_ORDER_ID_KEY, order_id);
      window.location.assign(checkout_url);
    } catch (err) {
      if (err instanceof ApiError && err.code === "PAYMENTS_NOT_CONFIGURED") {
        setCheckoutError("Checkout is not available in this environment yet. Please try again later.");
      } else {
        setCheckoutError(err instanceof ApiError ? err.message : "Could not start checkout.");
      }
      setCheckingOut(false);
    }
  }

  const seo = <Seo title="Your Cart" description="Review your Herdtastic cart." path="/cart" noindex />;

  if (loading && !cart) {
    return (
      <>
        {seo}
        <DetailPageSkeleton split />
      </>
    );
  }

  if (error) {
    return (
      <>
        {seo}
        <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]" role="alert">
          {error}
        </p>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        {seo}
        <ShoppingCart className="mx-auto text-ink-400" size={40} />
        <h1 className="mt-4 font-display text-3xl font-normal text-navy-800">Your cart is empty</h1>
        <p className="mt-2 text-ink-600">Straws from proven Texas sires are a click away.</p>
        <Link to="/catalog" className="mt-6 inline-block">
          <Button>Shop Sires</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-10 lg:flex-row">
      {seo}
      <div className="w-full flex-1">
        <h1 className="mb-6 font-display text-4xl font-normal text-navy-800">Your Cart</h1>

        <div className="flex flex-col gap-3.5">
          {cart.items.map((item) => {
            const { product, variant } = lookupVariant(item.product_id, item.variant_id);
            return (
              <div
                key={item.item_id}
                className="flex flex-col gap-3 rounded-md border border-cream-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:gap-4"
              >
                {/* On sm+ this wrapper becomes `contents` (no box of its own), so its
                    children join the outer flex row directly — reproducing the single-row
                    desktop layout. Below sm it stays a normal row, so this and the next
                    group stack as two compact rows instead of squeezing into one and
                    overlapping the stepper. */}
                <div className="flex items-center gap-4 sm:contents">
                  {product ? (
                    <Link
                      to={`/products/${product.slug}`}
                      aria-label={`View ${product.name}`}
                      className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-cream-200 no-underline ring-red-700 transition-shadow duration-200 hover:ring-2"
                    >
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                      )}
                    </Link>
                  ) : (
                    <div className="h-16 w-20 flex-shrink-0 rounded-sm bg-cream-200" />
                  )}

                  <div className="min-w-0 flex-1">
                    {product ? (
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-display text-lg text-navy-800 no-underline transition-colors duration-200 hover:text-red-700 hover:underline"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <p className="font-display text-lg text-navy-800">Unknown product</p>
                    )}
                    {variant && (
                      <p className="mt-0.5 font-condensed text-xs uppercase tracking-caps text-ink-600">
                        {variant.name} &middot; {formatCents(variant.price_cents, currency)} each
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:contents">
                  <QuantityStepper
                    value={item.quantity}
                    min={1}
                    max={100}
                    onChange={(quantity) =>
                      updateQuantity(item.item_id, item.product_id, item.variant_id, quantity)
                    }
                  />

                  <div className="text-right sm:w-24">
                    {variant && <PriceTag cents={variant.price_cents * item.quantity} size="sm" />}
                  </div>

                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setConfirmItem(item)}
                    className="inline-flex text-ink-400 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full rounded-lg border-2 border-navy-800 bg-white p-6 shadow-hard lg:w-[340px]">
        <div className="mb-4 font-condensed text-sm font-semibold uppercase tracking-caps text-navy-800">
          Order Summary
        </div>

        <div className="flex items-baseline justify-between">
          <span className="font-condensed text-[13px] font-semibold uppercase tracking-caps text-navy-800">
            Subtotal
          </span>
          <PriceTag cents={subtotalCents} currency={currency} />
        </div>
        <p className="mt-2 text-xs text-ink-400">Tax and shipping calculated at checkout.</p>

        <div className="mt-5 flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? "Redirecting…" : "Checkout"}
          </Button>
          {checkoutError && <p className="text-sm text-[var(--status-danger)]">{checkoutError}</p>}
          <Link
            to="/catalog"
            className="text-center font-condensed text-xs uppercase tracking-caps text-navy-700 no-underline hover:text-red-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      <Dialog
        open={!!confirmItem}
        title="Remove from cart?"
        onClose={() => setConfirmItem(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmItem(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (confirmItem) removeItem(confirmItem.item_id);
                setConfirmItem(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        {confirmItem && (
          <>This removes {confirmItem.quantity}× from your order.</>
        )}
      </Dialog>
    </div>
  );
}
