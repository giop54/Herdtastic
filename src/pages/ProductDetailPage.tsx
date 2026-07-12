import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import { createBooking, getBookingAvailability } from "../api/bookings";
import { ApiError } from "../api/client";
import type { BookingAvailability, Product } from "../types";
import { useCart } from "../context/CartContext";
import { formatDetailValue, titleCase } from "../lib/text";
import { Badge, Button, Input, PriceTag, QuantityStepper, Select, Toast } from "../components/ui";
import { Seo } from "../components/Seo";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setProduct(null);
    setNotFound(false);
    setError(null);

    getProduct(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        const firstActive = data.variants.find((v) => v.active);
        setSelectedVariantId(firstActive?.variant_id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : "Could not load this sire.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!product || product.fulfillment_type !== "booking") return;
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 89);
    const formatDate = (value: Date) => value.toISOString().slice(0, 10);
    getBookingAvailability(product.slug, formatDate(start), formatDate(end))
      .then((data) => {
        setAvailability(data);
        setSelectedDate(data.days.find((day) => day.available)?.date ?? null);
      })
      .catch((err) => setBookingError(err instanceof ApiError ? err.message : "Could not load availability."));
  }, [product]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.variant_id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );

  const maxQuantity = selectedVariant?.track_inventory
    ? Math.min(selectedVariant.inventory_quantity, 100)
    : 100;
  const inStock = selectedVariant
    ? !selectedVariant.track_inventory || selectedVariant.inventory_quantity > 0
    : false;

  async function handleAddToCart() {
    if (!product || !selectedVariant) return;
    setAdding(true);
    setAddError(null);
    setAdded(false);
    try {
      await addItem(product.id, selectedVariant.variant_id, quantity);
      setAdded(true);
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Could not add that item to your cart.");
    } finally {
      setAdding(false);
    }
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !selectedDate) return;
    setBooking(true);
    setBookingError(null);
    try {
      const created = await createBooking({
        product_id: product.id,
        booking_date: selectedDate,
        customer_name: contact.name,
        customer_email: contact.email,
        customer_phone: contact.phone,
      });
      navigate(`/bookings/${created.id}`);
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : "Could not create your booking.");
      if (err instanceof ApiError && err.code === "BOOKING_DATE_UNAVAILABLE") {
        setAvailability(null);
      }
    } finally {
      setBooking(false);
    }
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <Seo title="Sire Not Found" description="This sire may no longer be available." noindex />
        <h1 className="font-display text-2xl font-normal text-navy-800">Sire not found</h1>
        <p className="mt-2 text-ink-600">This sire may no longer be available.</p>
        <Link to="/catalog" className="mt-6 inline-block font-condensed text-sm uppercase tracking-caps text-navy-700 hover:text-red-700">
          &larr; Back to catalog
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Seo title="Sire" description="Could not load this sire." noindex />
        <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]" role="alert">
          {error}
        </p>
      </>
    );
  }

  if (!product) {
    return <p className="text-ink-600">Loading&hellip;</p>;
  }

  const category = product.category_ids[0];
  const isBookable = product.fulfillment_type === "booking";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.variants[0]?.sku,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.name,
      price: (v.price_cents / 100).toFixed(2),
      priceCurrency: "USD",
      availability:
        v.active && (!v.track_inventory || v.inventory_quantity > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${window.location.origin}/products/${product.slug}`,
    })),
  };

  return (
    <div>
      <Seo
        title={product.name}
        description={truncate(product.description, 160)}
        path={`/products/${product.slug}`}
        image={product.images[0]}
        type="product"
        jsonLd={productJsonLd}
      />
      <Link
        to="/catalog"
        className="font-condensed text-xs uppercase tracking-caps text-navy-800 no-underline hover:text-red-700"
      >
        &larr; Back to catalog
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <div className="flex aspect-[460/400] items-center justify-center rounded-lg border border-cream-200 bg-cream-200">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="eager"
                decoding="async"
                // Lowercase attr: React 18 passes it through to the DOM (LCP hint) without
                // the "unknown prop" warning the camelCase `fetchPriority` triggers.
                {...{ fetchpriority: "high" }}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span className="font-condensed text-xs uppercase tracking-wide2 text-ink-400">
                Sire photo &mdash; awaiting real imagery
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <Badge tone={isBookable || inStock ? "success" : "warning"}>
            {isBookable ? "Book by day" : inStock ? "In Stock" : "Sold Out"}
          </Badge>

          <div>
            {category && (
              <div className="font-condensed text-[13px] font-semibold uppercase tracking-caps text-ink-600">
                {titleCase(category)}
              </div>
            )}
            <h1 className="mt-1 font-display text-4xl font-normal text-navy-800">{product.name}</h1>
          </div>

          <p className="max-w-lg text-base leading-relaxed text-ink-900">{product.description}</p>

          {!isBookable && product.variants.length > 1 && (
            <Select
              label="Options"
              className="max-w-xs"
              value={selectedVariantId ?? ""}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              options={product.variants.map((v) => ({
                value: v.variant_id,
                label: v.active ? v.name : `${v.name} (unavailable)`,
                disabled: !v.active,
              }))}
            />
          )}

          {isBookable ? (
            <form className="border-t border-cream-200 pt-4" onSubmit={handleBooking}>
              <p className="mb-3 text-sm text-ink-600">Choose an available day, then provide your contact details.</p>
              {availability ? (
                <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {availability.days.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      disabled={!day.available}
                      onClick={() => setSelectedDate(day.date)}
                      className={`rounded-sm border px-2 py-2 text-xs ${selectedDate === day.date ? "border-navy-800 bg-navy-800 text-white" : "border-tan-300 bg-white text-ink-900"} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mb-4 text-sm text-ink-600">Loading available days…</p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                <Input label="Email" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                <Input label="Phone" type="tel" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <Button className="mt-4" size="lg" type="submit" disabled={!selectedDate || booking || !availability}>
                {booking ? "Booking…" : "Book this day"}
              </Button>
              {bookingError && <p className="mt-3 text-sm text-[var(--status-danger)]">{bookingError}</p>}
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-5 border-t border-cream-200 pt-4">
                {selectedVariant && <PriceTag cents={selectedVariant.price_cents} size="lg" />}
                <QuantityStepper value={quantity} min={1} max={maxQuantity} onChange={setQuantity} />
                <Button size="lg" onClick={handleAddToCart} disabled={!inStock || adding || !selectedVariant}>
                  {adding ? "Adding…" : inStock ? "Add to Cart" : "Sold Out"}
                </Button>
              </div>
              {addError && <p className="text-sm text-[var(--status-danger)]">{addError}</p>}
              {added && !addError && <Toast tone="success" action="View Cart" onAction={() => navigate("/cart")}>Added to cart.</Toast>}
            </>
          )}
        </div>
      </div>

      {Object.keys(product.details).length > 0 && (
        <div className="mt-10 max-w-2xl border-t border-cream-200 pt-6">
          <div className="mb-2 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
            Product Details
          </div>
          <dl className="divide-y divide-cream-200">
            {Object.entries(product.details).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
                <dt className="font-condensed text-xs uppercase tracking-caps text-ink-600 sm:w-48 sm:flex-shrink-0">
                  {titleCase(key)}
                </dt>
                <dd className="text-sm text-ink-900">{formatDetailValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
