import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, Award, Truck, ArrowRight } from "lucide-react";
import { listProductsCached } from "../api/products";
import type { Product } from "../types";
import { Button, Skeleton } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { titleCase } from "../lib/text";
import { formatCents } from "../lib/money";

const HOME_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Heardtastic",
    alternateName: "Heardtastic Texas All-American Cattle Co.",
    url: window.location.origin,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Heardtastic",
    url: window.location.origin,
  },
];

const TRUST_SIGNALS = ["Cryo-shipped", "Registered genetics", "Ships to all 50 states"];

/** Large image-led tile that anchors the bento grid. */
function FeaturedTile({ product }: { product: Product }) {
  const minPrice = Math.min(...product.variants.filter((v) => v.active).map((v) => v.price_cents));
  const category = product.category_ids[0];
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-navy-900 shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift sm:col-span-2 sm:row-span-2 sm:min-h-full"
    >
      {product.images[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
      <div className="relative flex flex-col gap-2 p-6">
        <span className="w-fit rounded-full bg-red-700 px-2.5 py-1 font-condensed text-[11px] font-semibold uppercase tracking-caps text-white">
          Featured Sire
        </span>
        {category && (
          <span className="font-condensed text-xs uppercase tracking-caps text-cream-200">
            {titleCase(category)}
          </span>
        )}
        <h3 className="font-display text-2xl leading-tight text-cream-50 sm:text-3xl">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-4">
          {Number.isFinite(minPrice) && (
            <span className="font-display text-xl text-cream-50">{formatCents(minPrice)}</span>
          )}
          <span className="inline-flex items-center gap-1.5 font-condensed text-xs font-semibold uppercase tracking-caps text-cream-50 transition-transform duration-200 group-hover:translate-x-1">
            View Sire <ArrowRight size={14} strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </Link>
  );
}

interface ValueTileProps {
  icon: typeof Snowflake;
  title: string;
  body: string;
  className?: string;
  tone?: "light" | "navy";
}

function ValueTile({ icon: IconComp, title, body, className = "", tone = "light" }: ValueTileProps) {
  const navy = tone === "navy";
  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-2xl border p-6 shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift ${
        navy ? "border-navy-800 bg-navy-800 text-cream-50" : "border-cream-200 bg-white"
      } ${className}`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
          navy ? "bg-navy-700 text-cream-50" : "bg-red-50 text-red-700"
        }`}
      >
        <IconComp size={22} strokeWidth={1.75} />
      </span>
      <div>
        <div
          className={`font-condensed text-[15px] font-semibold uppercase tracking-caps ${
            navy ? "text-cream-50" : "text-navy-800"
          }`}
        >
          {title}
        </div>
        <p className={`mt-1 text-sm leading-relaxed ${navy ? "text-navy-100" : "text-ink-600"}`}>
          {body}
        </p>
      </div>
    </div>
  );
}

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listProductsCached()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products?.[0] ?? null;
  const rest = products?.slice(1, 4) ?? [];

  return (
    <div>
      <Seo
        title="Heardtastic — Proven Texas Genetics, Shipped Nationwide"
        appendSiteName={false}
        description="Registered Texas sires and cryo-shipped semen straws for cattle breeding. Proven genetics, published details, and nationwide shipping from our Texas facility."
        path="/"
        jsonLd={HOME_JSON_LD}
      />

      {/* Hero band */}
      <section className="relative -mx-4 -mt-9 overflow-hidden bg-navy-800 px-4 py-16 text-cream-50 sm:-mx-10 sm:px-10 sm:py-20">
        {/* subtle poster-star texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--cream-50) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl animate-fade-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-900/40 px-3 py-1 font-condensed text-[12px] font-semibold uppercase tracking-wide2 text-red-600">
              <span aria-hidden="true">★</span> Texas All-American Cattle Co.
            </div>
            <h1 className="font-display text-4xl leading-[1.05] text-cream-50 sm:text-5xl lg:text-6xl">
              Proven Texas Genetics.
              <br />
              Shipped Nationwide.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-100">
              Registered sires and cryo-shipped straws, ready to build your herd on the best in the
              business.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/catalog">
                <Button size="lg">Shop Sires</Button>
              </Link>
              <Link to="/orders/lookup">
                <Button size="lg" variant="ghost" className="!text-cream-50 hover:!bg-navy-700">
                  Track an Order
                </Button>
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_SIGNALS.map((signal) => (
                <li
                  key={signal}
                  className="inline-flex items-center gap-2 font-condensed text-xs uppercase tracking-caps text-navy-100"
                >
                  <span className="text-red-600" aria-hidden="true">
                    ★
                  </span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bento grid: value props + featured sire */}
      <section className="mx-auto max-w-6xl py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(168px,1fr)]">
          {featured ? (
            <FeaturedTile product={featured} />
          ) : (
            <Skeleton className="min-h-[280px] rounded-2xl sm:col-span-2 sm:row-span-2 sm:min-h-full" />
          )}

          <ValueTile
            icon={Snowflake}
            title="Cryo-Shipped"
            body="Liquid-nitrogen dry shippers, monitored door to door."
          />
          <ValueTile
            icon={Award}
            title="Proven Sires"
            body="Registered genetics with published, verifiable details."
          />
          <ValueTile
            icon={Truck}
            title="All 50 States"
            body="From our Texas facility to your chute — nationwide."
            tone="navy"
            className="sm:col-span-2"
          />
        </div>
      </section>

      {/* Featured sires row */}
      <section className="mx-auto max-w-6xl pb-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 font-condensed text-xs font-semibold uppercase tracking-wide2 text-red-700">
              From the Catalog
            </div>
            <h2 className="font-display text-3xl font-normal text-navy-800">Featured Sires</h2>
          </div>
          <Link
            to="/catalog"
            className="hidden shrink-0 items-center gap-1.5 font-condensed text-sm font-semibold uppercase tracking-caps text-navy-800 no-underline transition-colors hover:text-red-700 sm:inline-flex"
          >
            View all <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        </div>

        {products === null && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        )}

        {products !== null && rest.length === 0 && (
          <p className="text-ink-600">No sires are available right now.</p>
        )}

        {rest.length > 0 && (
          <div className="stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/catalog">
            <Button variant="secondary">View All Sires</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
