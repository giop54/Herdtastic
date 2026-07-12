import { useEffect } from "react";

const SITE_NAME = "Heardtastic";

type OgType = "website" | "product";

interface SeoProps {
  /** Page title. Rendered as "{title} | Heardtastic" unless it already equals the site name. */
  title: string;
  description: string;
  /** Canonical path, e.g. "/products/bravos-legacy". Defaults to the current path (no query string). */
  path?: string;
  /** Keep this page out of search results — use for cart, checkout, order lookup, 404. */
  noindex?: boolean;
  image?: string;
  type?: OgType;
  /** One or more schema.org objects to emit as a JSON-LD <script> tag. */
  jsonLd?: object | object[];
  /** Pass false to use `title` verbatim instead of appending " | Heardtastic" — for the homepage. */
  appendSiteName?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(jsonLd: object | object[] | undefined) {
  const id = "seo-jsonld";
  const existing = document.getElementById(id);
  if (!jsonLd) {
    existing?.remove();
    return;
  }
  const script = (existing as HTMLScriptElement | null) ?? document.createElement("script");
  script.id = id;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(jsonLd);
  if (!existing) document.head.appendChild(script);
}

export function Seo({
  title,
  description,
  path,
  noindex = false,
  image,
  type = "website",
  jsonLd,
  appendSiteName = true,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const canonicalUrl = `${window.location.origin}${path ?? window.location.pathname}`;
    upsertLink("canonical", canonicalUrl);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    if (image) upsertMeta("property", "og:image", image);

    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    if (image) upsertMeta("name", "twitter:image", image);

    upsertJsonLd(jsonLd);
  }, [title, description, path, noindex, image, type, jsonLd, appendSiteName]);

  return null;
}
