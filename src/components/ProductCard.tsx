import { Link } from "react-router-dom";
import type { Product } from "../types";
import { LinkButton, PriceTag } from "./ui";
import { titleCase } from "../lib/text";

export function ProductCard({ product }: { product: Product }) {
  const isBookable = product.fulfillment_type === "booking";
  const activeVariants = product.variants.filter((v) => v.active);
  const prices = activeVariants.map((v) => v.price_cents);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const inStock = isBookable || activeVariants.some((v) => !v.track_inventory || v.inventory_quantity > 0);
  const category = product.category_ids[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-cream-200 bg-white shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:border-tan-300 hover:shadow-lift">
      <Link
        to={`/products/${product.slug}`}
        className="relative flex aspect-[280/170] items-center justify-center overflow-hidden bg-cream-200"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="font-condensed text-xs uppercase tracking-wide2 text-ink-400">
            Sire photo
          </span>
        )}
        {isBookable && (
          <span className="absolute left-3 top-3 rounded-full bg-red-700/90 px-2.5 py-1 font-condensed text-[11px] font-semibold uppercase tracking-caps text-white backdrop-blur-sm">
            Book by day
          </span>
        )}
        {!isBookable && !inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-navy-900/85 px-2.5 py-1 font-condensed text-[11px] font-semibold uppercase tracking-caps text-cream-50 backdrop-blur-sm">
            Sold Out
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
          className="font-display text-lg leading-snug text-navy-800 no-underline transition-colors duration-200 hover:text-red-700"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          {isBookable ? (
            <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-ink-600">
              Daily availability
            </span>
          ) : minPrice !== null ? (
            <PriceTag cents={minPrice} size="sm" />
          ) : null}
          {inStock ? (
            <LinkButton to={`/products/${product.slug}`} size="sm" tabIndex={-1} aria-hidden="true">
              {isBookable ? "Book" : inStock ? "Shop" : "Sold Out"}
            </LinkButton>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-sm bg-cream-200 px-3.5 py-2 font-condensed text-xs font-semibold uppercase tracking-caps text-ink-400">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
