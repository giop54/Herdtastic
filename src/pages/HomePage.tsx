import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, Award, Truck } from "lucide-react";
import { listProductsCached } from "../api/products";
import type { Product } from "../types";
import { Button } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Seo } from "../components/Seo";

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

const VALUE_PROPS = [
  {
    icon: Snowflake,
    title: "Cryo-Shipped",
    body: "Liquid-nitrogen dry shippers, monitored door to door.",
  },
  {
    icon: Award,
    title: "Proven Sires",
    body: "Registered bulls with published genetics you can count on.",
  },
  {
    icon: Truck,
    title: "All 50 States",
    body: "From our Texas facility to your chute, ready to ship nationwide.",
  },
];

function StarRule() {
  return (
    <div className="mx-auto flex max-w-xs items-center gap-3.5">
      <div className="h-0.5 flex-1 bg-navy-800" />
      <span className="text-base text-red-700">&#9733;</span>
      <div className="h-0.5 flex-1 bg-navy-800" />
    </div>
  );
}

export function HomePage() {
  const [featured, setFeatured] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listProductsCached()
      .then((data) => {
        if (!cancelled) setFeatured(data.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Seo
        title="Heardtastic — Proven Texas Genetics, Shipped Nationwide"
        appendSiteName={false}
        description="Registered Texas sires and cryo-shipped semen straws for cattle breeding. Proven genetics, published details, and nationwide shipping from our Texas facility."
        path="/"
        jsonLd={HOME_JSON_LD}
      />
      <section className="-mx-4 -mt-9 bg-navy-800 px-4 py-16 text-center text-cream-50 sm:-mx-10 sm:px-10 sm:py-[72px]">
        <div className="mb-3.5 font-condensed text-[13px] font-semibold uppercase tracking-wide2 text-red-600">
          Texas All-American Cattle Co.
        </div>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-normal leading-tight sm:text-5xl">
          Proven Texas Genetics.
          <br />
          Shipped Nationwide.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-navy-100">
          Registered sires and cryo-shipped straws, ready to build your herd on the best.
        </p>
        <Link to="/catalog" className="mt-7 inline-block">
          <Button size="lg">Shop Sires</Button>
        </Link>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-6 py-10 sm:flex-row sm:justify-center">
        {VALUE_PROPS.map(({ icon: IconComp, title, body }) => (
          <div
            key={title}
            className="flex flex-1 flex-col items-start gap-2.5 rounded-md border border-cream-200 bg-white p-6 shadow-card sm:max-w-[340px]"
          >
            <span className="text-red-700">
              <IconComp size={26} strokeWidth={1.75} />
            </span>
            <div className="font-condensed text-[15px] font-semibold uppercase tracking-caps text-navy-800">
              {title}
            </div>
            <div className="text-sm leading-relaxed text-ink-600">{body}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl py-6 text-center">
        <StarRule />
        <h2 className="mt-5 font-display text-3xl font-normal text-navy-800">Featured Sires</h2>
        <p className="mb-7 mt-1.5 text-ink-600">The sires ranchers keep coming back for.</p>

        {featured === null && <p className="text-ink-600">Loading&hellip;</p>}

        {featured !== null && featured.length === 0 && (
          <p className="text-ink-600">No sires are available right now.</p>
        )}

        {featured !== null && featured.length > 0 && (
          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
