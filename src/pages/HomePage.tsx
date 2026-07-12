import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, Award, Truck, ArrowRight, ChevronDown } from "lucide-react";
import { listProductsCached } from "../api/products";
import type { Product } from "../types";
import { Button, Skeleton } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
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
const MARQUEE_ITEMS = [
  "Cryo-Shipped Nationwide",
  "Registered Genetics",
  "Family-Owned in Texas",
  "Ships to All 50 States",
];

/** Asymmetric visual panel: gradient-mesh blobs behind a rotating brand-seal medallion —
 * a circular badge with the brand name curved along the ring, echoing the real Heardtastic
 * logo's own seal/shield concept. Chosen over live product photography (the catalog's
 * placeholder bakery/seafood test data would look out of place anchoring the brand hero)
 * and over floating UI chips (felt too generic-SaaS and disconnected from the brand). The
 * only motion is a slow, ambient rotation — not attention-grabbing, just alive. */
function HeroSeal() {
  return (
    <div className="relative hidden lg:flex items-center justify-center" aria-hidden="true">
      <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-navy-500/30 blur-3xl" />

      <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--cream-50) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute h-64 w-64 rounded-full bg-red-600/20 blur-2xl" />

        <div className="relative h-80 w-80">
          <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full animate-spin-slow">
            <defs>
              <path id="sealRingPath" d="M160,30 a130,130 0 1 1 -0.1,0" fill="none" />
            </defs>
            <circle
              cx="160"
              cy="160"
              r="130"
              fill="none"
              stroke="rgba(253,251,246,0.18)"
              strokeWidth="1"
              strokeDasharray="1 7"
              strokeLinecap="round"
            />
            <text className="font-condensed" fill="rgba(253,251,246,0.55)" fontSize="11" letterSpacing="3">
              <textPath href="#sealRingPath" startOffset="0%">
                TEXAS ALL-AMERICAN CATTLE CO. &#9733; EST. HEARDTASTIC &#9733;
              </textPath>
            </text>
          </svg>

          <div className="absolute inset-0 m-auto h-52 w-52 rounded-full border border-white/15">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-red-500">
              &#9733;
            </span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-500">
              &#9733;
            </span>
            <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs text-red-500">
              &#9733;
            </span>
            <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-xs text-red-500">
              &#9733;
            </span>
          </div>

          <div className="absolute inset-0 m-auto flex h-32 w-32 items-center justify-center rounded-full bg-navy-900 shadow-lift ring-1 ring-white/10">
            <span className="font-display text-5xl text-cream-50">H</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Auto-scrolling strip restating trust signals for visual rhythm between hero and bento grid. */
function TrustMarquee() {
  const loop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div
      aria-hidden="true"
      className="-mx-4 overflow-hidden border-b border-cream-200 bg-white py-3 sm:-mx-10"
    >
      <div className="flex w-max animate-marquee gap-10">
        {loop.map((item, i) => (
          <span
            key={i}
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
      <section className="relative -mx-4 -mt-9 overflow-hidden bg-navy-800 px-4 pb-12 pt-16 text-cream-50 sm:-mx-10 sm:px-10 sm:pb-14 sm:pt-20">
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
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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

          <HeroSeal />
        </div>

        <div className="relative mx-auto mt-14 hidden max-w-6xl justify-center sm:flex">
          <ChevronDown className="animate-bounce text-navy-300" size={22} aria-hidden="true" />
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
          <Link to="/catalog">
            <Button variant="secondary">View All Sires</Button>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
