import { useEffect, useMemo, useState } from "react";
import { listProductsCached } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { Tag, ProductCardSkeleton } from "../components/ui";
import { Seo } from "../components/Seo";

// The storefront sells exactly two things. Category filters are a fixed taxonomy
// rather than derived from product data, so the shop always shows these two options.
// `slugs` matches generously against product `category_ids` so items bucket correctly
// whatever exact slug the backend assigns.
const CATEGORIES = ["Book a Bull", "Frozen Semen"] as const;

const ALL = "All";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(ALL);

  useEffect(() => {
    let cancelled = false;

    listProductsCached()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load the catalog.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    if (category === ALL) return products;
    if (category === "Book a Bull") {
      return products.filter((product) => product.fulfillment_type === "booking");
    }
    if (category === "Frozen Semen") {
      return products.filter((product) => product.fulfillment_type === "shipping");
    }
    return products;
  }, [products, category]);

  return (
    <div>
      <Seo
        title="Shop Sires"
        description="Browse registered Texas sires and semen straws for cattle breeding. Filter by breed, check availability, and order straws ready to ship nationwide."
        path="/catalog"
      />
      <div className="mb-7">
        <div className="mb-1.5 font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
          Cattle Catalog
        </div>
        <h1 className="font-display text-4xl font-normal text-navy-800">Shop Sires</h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Reserve a breeding day or order proven genetics ready to ship to your operation.
        </p>
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        {[ALL, ...CATEGORIES].map((label) => (
          <Tag key={label} selected={category === label} onClick={() => setCategory(label)}>
            {label}
          </Tag>
        ))}
      </div>

      {error && (
        <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]" role="alert">
          {error}
        </p>
      )}

      {!error && products === null && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && products !== null && visibleProducts.length === 0 && (
        <p className="text-ink-600">No sires match those filters.</p>
      )}

      {!error && visibleProducts.length > 0 && (
        <div
          key={category}
          className="stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
