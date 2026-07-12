// Generates public/sitemap.xml before each build. Runs as a plain Node script (not through
// Vite), so it reads VITE_SITE_URL / VITE_API_BASE_URL from .env / .env.local itself rather
// than relying on Vite's env loading. Never fails the build: if the API is unreachable, it
// falls back to the static routes only and logs a warning.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const fileEnv = { ...loadEnvFile(join(rootDir, ".env")), ...loadEnvFile(join(rootDir, ".env.local")) };
const env = (key) => process.env[key] ?? fileEnv[key];

const SITE_URL = (env("VITE_SITE_URL") ?? "https://www.heardtastic.example").replace(/\/$/, "");
const DEFAULT_API_BASE_URL =
  "https://ecommerce-api-dev-1063728289659.us-central1.run.app/api/v1";
const configuredApiBaseUrl = env("VITE_API_BASE_URL");
// Relative browser URLs rely on the Vercel/Vite proxy, which is not running during a build.
// Use the direct API URL for sitemap generation in that case.
const API_BASE_URL =
  configuredApiBaseUrl?.startsWith("http://") || configuredApiBaseUrl?.startsWith("https://")
    ? configuredApiBaseUrl.replace(/\/$/, "")
    : DEFAULT_API_BASE_URL;

// Cart, checkout, and order-lookup are noindexed (see AGENTS.md) and intentionally excluded —
// listing noindexed/disallowed URLs in a sitemap is a known anti-pattern.
const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/catalog", changefreq: "daily", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

function urlEntry({ path, changefreq, priority, lastmod }) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchProductRoutes() {
  if (!API_BASE_URL) {
    console.warn("[sitemap] VITE_API_BASE_URL not set — skipping product URLs.");
    return [];
  }
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) {
      console.warn(`[sitemap] GET /products returned ${res.status} — skipping product URLs.`);
      return [];
    }
    const products = await res.json();
    if (!Array.isArray(products)) {
      console.warn("[sitemap] /products response was not an array — skipping product URLs.");
      return [];
    }
    return products.map((p) => ({
      path: `/products/${p.slug}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: p.updated_at ? p.updated_at.slice(0, 10) : undefined,
    }));
  } catch (err) {
    console.warn(`[sitemap] Could not reach the API (${err.message}) — skipping product URLs.`);
    return [];
  }
}

const productRoutes = await fetchProductRoutes();
const today = new Date().toISOString().slice(0, 10);
const entries = [...STATIC_ROUTES.map((r) => ({ ...r, lastmod: today })), ...productRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>
`;

writeFileSync(join(rootDir, "public", "sitemap.xml"), xml);
console.log(`[sitemap] Wrote public/sitemap.xml with ${entries.length} URLs (${productRoutes.length} products).`);

const robotsTxt = `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout/
Disallow: /orders/lookup
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(rootDir, "public", "robots.txt"), robotsTxt);
console.log(`[sitemap] Wrote public/robots.txt (Sitemap: ${SITE_URL}/sitemap.xml).`);
