import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, Award, Truck, ArrowRight } from "lucide-react";
import { listProductsCached } from "../api/products";
import type { Product } from "../types";
import { LinkButton, Skeleton } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { titleCase } from "../lib/text";
import { formatCents } from "../lib/money";
import { BrandMedallion } from "../components/BrandMedallion";

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
const MARQUEE_ITEMS = [
  "Cryo-Shipped Nationwide",
  "Registered Genetics",
  "Family-Owned in Texas",
  "Ships to All 50 States",
];

function HeroSeal() {
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <div className="absolute h-[82%] w-[82%] rounded-full bg-red-700/25 blur-3xl" />
      <div className="relative flex min-h-[310px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl sm:min-h-[400px]">
        <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <BrandMedallion className="w-full max-w-[340px] border-4 border-white shadow-2xl ring-8 ring-white/10" decorative priority />
      </div>
    </div>
  );
}

function TrustMarquee() {
  return (
    <div className="-mx-4 border-b border-cream-200 bg-white px-4 py-4 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-2">
        {MARQUEE_ITEMS.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 whitespace-nowrap font-condensed text-xs font-semibold uppercase tracking-caps text-navy-700"
          >
            <span className="text-red-600">&#9733;</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Large image-led tile that anchors the bento grid. */
function FeaturedTile({ product }: { product: Product }) {
  const isBookable = product.fulfillment_type === "booking";
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
          {isBookable ? "Book by Day" : "Featured Sire"}
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
          {!isBookable && Number.isFinite(minPrice) && (
            <span className="font-display text-xl text-cream-50">{formatCents(minPrice)}</span>
          )}
          <span className="inline-flex items-center gap-1.5 font-condensed text-xs font-semibold uppercase tracking-caps text-cream-50 transition-transform duration-200 group-hover:translate-x-1">
            {isBookable ? "Check dates" : "View sire"} <ArrowRight size={14} strokeWidth={2.25} />
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
      className={`relative flex flex-col justify-between gap-3 overflow-hidden rounded-2xl border p-6 shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift ${
        navy ? "border-navy-800 bg-navy-800 text-cream-50" : "border-cream-200 bg-white"
      } ${className}`}
    >
      {navy && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 select-none font-display text-8xl leading-none text-white/10"
        >
          &#9733;
        </span>
      )}
      <span
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl ${
          navy ? "bg-navy-700 text-cream-50" : "bg-red-50 text-red-700"
        }`}
      >
        <IconComp size={22} strokeWidth={1.75} />
      </span>
      <div className="relative">
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

  const featured = products?.find((product) => product.fulfillment_type === "booking") ?? products?.[0] ?? null;
  const rest = products?.filter((product) => product.id !== featured?.id).slice(0, 3) ?? [];

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
      <section className="relative -mx-4 -mt-9 overflow-hidden bg-navy-800 px-4 pb-12 pt-14 text-cream-50 sm:-mx-8 sm:px-8 sm:pb-16 sm:pt-20 lg:-mx-10 lg:px-10">
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
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl animate-fade-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-900/40 px-3 py-1 font-condensed text-[12px] font-semibold uppercase tracking-wide2 text-red-600">
              <span aria-hidden="true">★</span> Texas All-American Cattle Co.
            </div>
            <h1 className="font-display text-4xl leading-[1.05] text-cream-50 sm:text-5xl lg:text-6xl">
              Proven Texas Genetics.
              <br />
              Shipped or Booked.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-100">
              Shop registered genetics or reserve a breeding day with trusted Texas sires—all from one dependable cattle operation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton to="/catalog" size="lg">Browse Sires</LinkButton>
              <LinkButton to="/catalog" size="lg" variant="ghost" className="!text-cream-50 hover:!bg-navy-700">
                Book a Bull
              </LinkButton>
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

          <HeroSeal />
        </div>

      </section>

      <TrustMarquee />

      {/* Bento grid: value props + featured sire */}
      <Reveal className="mx-auto max-w-6xl py-12">
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
      </Reveal>

      {/* Featured sires row */}
      <Reveal className="mx-auto max-w-6xl pb-6">
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
          <LinkButton to="/catalog" variant="secondary">View All Sires</LinkButton>
        </div>
      </Reveal>
    </div>
  );
}
