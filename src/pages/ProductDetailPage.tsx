import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import { createBooking, getBookingAvailability } from "../api/bookings";
import { ApiError } from "../api/client";
import type { BookingAvailability, Product } from "../types";
import { useCart } from "../context/CartContext";
import { formatDetailValue, titleCase } from "../lib/text";
import { Badge, Button, Input, PriceTag, QuantityStepper, Select, Toast } from "../components/ui";
import { Seo } from "../components/Seo";
import { BookingCalendar } from "../components/BookingCalendar";
import { bookingWindow, formatBookingDate } from "../lib/bookingDates";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Truck,
} from "lucide-react";

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
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        setSelectedImageIndex(0);
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

  const loadAvailability = useCallback(async () => {
    if (!product || product.fulfillment_type !== "booking") return;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    try {
      const { start, end } = bookingWindow();
      const data = await getBookingAvailability(product.slug, start, end);
      setAvailability(data);
      setSelectedDate((current) =>
        current && data.days.some((day) => day.date === current && day.available)
          ? current
          : (data.days.find((day) => day.available)?.date ?? null),
      );
    } catch (err) {
      setAvailabilityError(
        err instanceof ApiError ? err.message : "Could not load availability.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }, [product]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

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
      navigate(`/bookings/${created.id}`, { state: { booking: created } });
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : "Could not create your booking.");
      if (err instanceof ApiError && err.code === "BOOKING_DATE_UNAVAILABLE") {
        await loadAvailability();
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
    <div className="mx-auto max-w-7xl">
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
        className="inline-flex min-h-11 items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800 no-underline transition-colors hover:text-red-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to catalog
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-12">
        <section aria-label={`${product.name} images`}>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-cream-200 bg-cream-200 shadow-card">
            {product.images[selectedImageIndex] ? (
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                loading="eager"
                decoding="async"
                {...{ fetchpriority: "high" }}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-condensed text-xs uppercase tracking-wide2 text-ink-400">
                Sire photo &mdash; awaiting real imagery
              </span>
            )}
            <div className="absolute left-4 top-4">
              <Badge tone={isBookable || inStock ? "success" : "warning"}>
                {isBookable ? "Book by day" : inStock ? "Available to ship" : "Sold out"}
              </Badge>
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View ${product.name} image ${index + 1}`}
                  aria-pressed={selectedImageIndex === index}
                  className={`aspect-square min-h-11 overflow-hidden rounded-lg border-2 bg-cream-200 transition-colors ${
                    selectedImageIndex === index ? "border-red-700" : "border-transparent hover:border-tan-300"
                  }`}
                >
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(isBookable
              ? [
                  [CalendarDays, "90-day calendar"],
                  [ShieldCheck, "Private booking"],
                  [CheckCircle2, "Instant confirmation"],
                ]
              : [
                  [Snowflake, "Cryo-shipped"],
                  [Truck, "All 50 states"],
                  [ShieldCheck, "Secure checkout"],
                ]
            ).map(([Icon, label]) => {
              const TrustIcon = Icon as typeof Truck;
              return (
                <div key={label as string} className="flex flex-col items-center gap-2 rounded-lg bg-cream-100 px-2 py-3 text-center">
                  <TrustIcon className="h-5 w-5 text-red-700" aria-hidden="true" />
                  <span className="font-condensed text-[10px] font-semibold uppercase tracking-caps text-navy-800">{label as string}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col lg:pt-2">
          <div>
            {category && (
              <div className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
                {titleCase(category)}
              </div>
            )}
            <h1 className="mt-2 font-display text-4xl leading-tight text-navy-900 sm:text-5xl">{product.name}</h1>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-600 sm:text-lg">{product.description}</p>

          {isBookable ? (
            <form className="mt-7 rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-7" onSubmit={handleBooking}>
              <div className="flex items-start gap-3 border-b border-cream-200 pb-5">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-red-50 text-red-700"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <h2 className="font-display text-2xl text-navy-900">Reserve your day</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-600">Choose an available date, then tell us who the booking is for.</p>
                </div>
              </div>
              <div className="my-5 rounded-xl border border-cream-200 bg-cream-50 p-4 sm:p-5">
                {availabilityLoading && !availability && (
                  <p className="text-sm text-ink-600">Loading available days…</p>
                )}
                {availabilityError && (
                  <div role="alert">
                    <p className="text-sm text-[var(--status-danger)]">{availabilityError}</p>
                    <Button className="mt-3" type="button" size="sm" variant="secondary" onClick={() => void loadAvailability()}>
                      Try again
                    </Button>
                  </div>
                )}
                {availability && !availabilityError && (
                  <BookingCalendar days={availability.days} selectedDate={selectedDate} onSelect={setSelectedDate} />
                )}
              </div>
              {selectedDate && (
                <div className="mb-5 flex items-center gap-3 rounded-lg bg-navy-900 px-4 py-3 text-cream-50">
                  <CheckCircle2 className="h-5 w-5 flex-none text-cream-100" aria-hidden="true" />
                  <p className="text-sm"><span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-100">Selected date</span><br /><strong>{formatBookingDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong></p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Full name" autoComplete="name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                <Input label="Email" type="email" inputMode="email" autoComplete="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                <Input className="sm:col-span-2" label="Phone" type="tel" inputMode="tel" autoComplete="tel" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <Button className="mt-5 w-full" size="lg" type="submit" disabled={!selectedDate || booking || availabilityLoading || Boolean(availabilityError)}>
                {booking ? "Confirming your booking…" : selectedDate ? "Confirm this booking" : "Select an available date"}
              </Button>
              {bookingError && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-[var(--status-danger)]" role="alert">{bookingError}</p>}
            </form>
          ) : (
            <div className="mt-7 rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-7">
              <div className="flex items-end justify-between gap-4 border-b border-cream-200 pb-5">
                <div>
                  <p className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">Price</p>
                  {selectedVariant && <PriceTag cents={selectedVariant.price_cents} size="lg" />}
                </div>
                <Badge tone={inStock ? "success" : "warning"}>{inStock ? "In stock" : "Unavailable"}</Badge>
              </div>
              {product.variants.length > 1 && (
                <Select
                  label="Select option"
                  className="mt-5"
                  value={selectedVariantId ?? ""}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  options={product.variants.map((v) => ({ value: v.variant_id, label: v.active ? v.name : `${v.name} (unavailable)`, disabled: !v.active }))}
                />
              )}
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">Quantity</p>
                  <QuantityStepper value={quantity} min={1} max={maxQuantity} onChange={setQuantity} />
                </div>
                <Button className="w-full sm:flex-1" size="lg" onClick={handleAddToCart} disabled={!inStock || adding || !selectedVariant}>
                  {adding ? "Adding to cart…" : inStock ? "Add to cart" : "Sold out"}
                </Button>
              </div>
              {addError && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-[var(--status-danger)]" role="alert">{addError}</p>}
              {added && !addError && <Toast tone="success" action="View Cart" onAction={() => navigate("/cart")}>Added to cart.</Toast>}
              <p className="mt-5 flex items-start gap-2 border-t border-cream-200 pt-4 text-xs leading-5 text-ink-600"><PackageCheck className="mt-0.5 h-4 w-4 flex-none text-navy-700" aria-hidden="true" /> Shipping and tax are calculated securely at checkout.</p>
            </div>
          )}
        </section>
      </div>

      {Object.keys(product.details).length > 0 && (
        <section className="mt-12 rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:p-8" aria-labelledby="product-details-title">
          <p className="font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">At a glance</p>
          <h2 id="product-details-title" className="mt-2 font-display text-3xl text-navy-900">Product details</h2>
          <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-cream-200 bg-cream-200 sm:grid-cols-2">
            {Object.entries(product.details).map(([key, value]) => (
              <div key={key} className="bg-cream-50 p-4 sm:p-5">
                <dt className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">{titleCase(key)}</dt>
                <dd className="mt-1 text-sm leading-6 text-ink-900">{formatDetailValue(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
