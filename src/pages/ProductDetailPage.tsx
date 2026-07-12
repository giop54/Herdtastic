import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { titleCase } from "../lib/text";
import { Badge, Button, PriceTag, QuantityStepper, Select, Toast } from "../components/ui";

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

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-2xl font-normal text-navy-800">Sire not found</h1>
        <p className="mt-2 text-ink-600">This sire may no longer be available.</p>
        <Link to="/" className="mt-6 inline-block font-condensed text-sm uppercase tracking-caps text-navy-700 hover:text-red-700">
          &larr; Back to catalog
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]" role="alert">
        {error}
      </p>
    );
  }

  if (!product) {
    return <p className="text-ink-600">Loading&hellip;</p>;
  }

  const category = product.category_ids[0];

  return (
    <div>
      <Link
        to="/"
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
          <Badge tone={inStock ? "success" : "warning"}>{inStock ? "In Stock" : "Sold Out"}</Badge>

          <div>
            {category && (
              <div className="font-condensed text-[13px] font-semibold uppercase tracking-caps text-ink-600">
                {titleCase(category)}
              </div>
            )}
            <h1 className="mt-1 font-display text-4xl font-normal text-navy-800">{product.name}</h1>
          </div>

          <p className="max-w-lg text-base leading-relaxed text-ink-900">{product.description}</p>

          {product.variants.length > 1 && (
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

          <div className="flex flex-wrap items-center gap-5 border-t border-cream-200 pt-4">
            {selectedVariant && <PriceTag cents={selectedVariant.price_cents} size="lg" />}
            <QuantityStepper value={quantity} min={1} max={maxQuantity} onChange={setQuantity} />
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || adding || !selectedVariant}
            >
              {adding ? "Adding…" : inStock ? "Add to Cart" : "Sold Out"}
            </Button>
          </div>

          {addError && <p className="text-sm text-[var(--status-danger)]">{addError}</p>}
          {added && !addError && (
            <Toast tone="success" action="View Cart" onAction={() => navigate("/cart")}>
              Added to cart.
            </Toast>
          )}
        </div>
      </div>
    </div>
  );
}
