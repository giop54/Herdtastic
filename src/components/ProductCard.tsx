import { Link } from "react-router-dom";
import type { Product } from "../types";
import { Button, PriceTag } from "./ui";
import { titleCase } from "../lib/text";

export function ProductCard({ product }: { product: Product }) {
  const activeVariants = product.variants.filter((v) => v.active);
  const prices = activeVariants.map((v) => v.price_cents);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const inStock = activeVariants.some((v) => !v.track_inventory || v.inventory_quantity > 0);
  const category = product.category_ids[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-cream-200 bg-white shadow-card transition-shadow duration-200 ease-out hover:shadow-raised">
      <Link
        to={`/products/${product.slug}`}
        className="flex aspect-[280/170] items-center justify-center overflow-hidden bg-cream-200"
      >
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-condensed text-xs uppercase tracking-wide2 text-ink-400">
            Sire photo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && (
          <div className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">
            {titleCase(category)}
          </div>
        )}
        <Link
          to={`/products/${product.slug}`}
          className="font-display text-lg leading-snug text-navy-800 no-underline hover:text-red-700"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          {minPrice !== null && <PriceTag cents={minPrice} size="sm" />}
          <Link to={`/products/${product.slug}`}>
            <Button size="sm" disabled={!inStock}>
              {inStock ? "Shop" : "Sold Out"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
