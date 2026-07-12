import { useEffect, useMemo, useState } from "react";
import { listProductsCached } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { Tag } from "../components/ui";
import { titleCase } from "../lib/text";
import { Seo } from "../components/Seo";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");

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

  const categories = useMemo(() => {
    const unique = new Set<string>();
    products?.forEach((p) => p.category_ids.forEach((c) => unique.add(c)));
    return ["All", ...Array.from(unique)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    if (category === "All") return products;
    return products.filter((p) => p.category_ids.includes(category));
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
          Semen Catalog
        </div>
        <h1 className="font-display text-4xl font-normal text-navy-800">Shop Sires</h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Registered sires, published genetics, and straws ready to ship to your operation.
        </p>
      </div>

      {categories.length > 2 && (
        <div className="mb-7 flex flex-wrap items-center gap-2.5">
          {categories.map((c) => (
            <Tag key={c} selected={category === c} onClick={() => setCategory(c)}>
              {c === "All" ? "All" : titleCase(c)}
            </Tag>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger)]" role="alert">
          {error}
        </p>
      )}

      {!error && products === null && <p className="text-ink-600">Loading sires&hellip;</p>}

      {!error && products !== null && visibleProducts.length === 0 && (
        <p className="text-ink-600">No sires match those filters.</p>
      )}

      {!error && visibleProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
