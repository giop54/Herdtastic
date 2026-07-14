# AGENTS.md — working with the Ecommerce API

This project is a frontend only. All product, cart, checkout, and order data comes from an
external Ecommerce API. This file is the shared reference for anyone (human or agent) touching
`src/api/*` or the pages that consume it.

## Base URL

Set via `VITE_API_BASE_URL` in `.env`:

```
VITE_API_BASE_URL=https://ecommerce-api-dev-1063728289659.us-central1.run.app/api/v1
```

OpenAPI explorer: same host, path `/docs`. Schema: `/openapi.json`.

Known issue (as of 2026-07-12): the dev Cloud Run URL above sometimes serves Cloud Run's default
"Congratulations" placeholder page on every path, including `/docs` and `/openapi.json` — that
means no revision is currently receiving traffic, not a frontend bug. If `listProducts()` fails
with a generic (non-`ApiError`) error, check the base URL is actually live with
`curl -i <base-url>/products` before debugging the frontend.

## Backend repo — check here for API changes

The API's source lives in a sibling repo on this machine:
**`/Users/giop54/heardtastic-backend`**. This project has no other link to it (no shared
package, no git submodule) — it's a separate FastAPI/Firestore/Terraform project, and the only
thing connecting the two is the HTTP contract. Before assuming this AGENTS.md or `src/types.ts`
is current, check that repo directly:

- `docs/frontend-api.md` in that repo is the same integration guide this file is based on — diff
  it against what's documented here to spot drift. It has lagged actual code before, so don't
  treat it as automatically authoritative either.
- `backend/app/{products,carts,checkout,orders,payments}/schemas.py` are the real Pydantic
  response/request shapes — the ground truth when `frontend-api.md` and the code disagree.
- `backend/app/{products,carts,checkout,orders,payments}/router.py` show actual endpoints,
  methods, and status codes.
- Run `git log --oneline -- <path>` on any of the above from within that repo to see what's
  changed and when; `git show <commit> -- <path>` for the actual diff. As of 2026-07-12 every
  file under `carts/`, `checkout/`, and `orders/` has only ever been touched in its initial
  commit (`5c63cb9`) — all schema churn so far has been in `products/schemas.py`.
- Example of a change caught this way: commit `4476a83` ("WIF") added a `details: dict[str, Any]`
  field to `Product`, returned by `GET /products` and `GET /products/{slug}`. It's additive
  (defaults to `{}`), so nothing broke, but `src/types.ts`'s `Product` type didn't know about it
  until someone checked. Treat any new field the same way: confirm whether it's worth surfacing
  in the UI rather than silently ignoring it.
- That repo's working tree is often mid-edit with staged-but-uncommitted changes (WIP-style
  commit messages are the norm there) — `git status`/`git diff --cached` in that repo before
  relying on `git log` alone, since the latest change may not be committed yet.

## Auth model

Two mutually exclusive identities per request:

- **Signed-in**: `Authorization: Bearer <firebase-id-token>`
- **Guest**: `X-Guest-Token: <guest-token>` — no `Authorization` header

Never send both. `src/api/client.ts` enforces this: if a Firebase ID token provider is registered
(via `setFirebaseIdTokenProvider`) and returns a token, it's used and the guest token is skipped
entirely.

Firebase sign-in is **not wired up yet** — this app is guest-checkout only for now. The provider
hook exists so auth can be added later without touching every call site.

Guest token lifecycle:
- The first `GET /cart` (or any cart mutation) for a new guest returns a `guest_token` in the
  response body.
- `src/api/client.ts` persists it to `localStorage` under `herdtastic_guest_token` via
  `setGuestToken`/`getGuestToken`. Every subsequent request auto-attaches it as `X-Guest-Token`
  until a Firebase token is available.

## Money

All amounts are **integer cents**. `2599` = $25.99. Never send price/total/tax/discount/shipping
to the API — those are always server-computed. Use `formatCents()` in `src/lib/money.ts` for
display; don't hand-roll `/100` formatting elsewhere.

## Endpoints in use

| Purpose | Method + path | Notes |
|---|---|---|
| List products | `GET /products` | No auth. Active products only. |
| Get product | `GET /products/{slug}` | By **slug**, not ID. `404` if unavailable/unknown. |
| Get cart | `GET /cart` | Creates a guest cart on first call. |
| Add item | `POST /cart/items` | Body: `product_id`, `variant_id`, `quantity` (1–100). |
| Update quantity | `PATCH /cart/items/{item_id}` | Body still needs `product_id`/`variant_id` (ignored by the API today) plus `quantity`. |
| Remove item | `DELETE /cart/items/{item_id}` | Returns updated cart. |
| Create checkout session | `POST /checkout/sessions` | No body. Reads current cart server-side. Returns `{order_id, checkout_url}`. `503 PAYMENTS_NOT_CONFIGURED` while Stripe is disabled (true in dev). |
| Checkout session status | `GET /checkout/sessions/{session_id}` | Not currently used by the frontend — see below. |
| List orders | `GET /orders` | Requires Firebase bearer token. Guests get `[]`. Not reachable yet (no auth). |
| Get order | `GET /orders/{order_id}` | Signed-in: bearer token owning the order. Guest: `X-Guest-Token` **and** `X-Order-Email` headers both required. |

### Why there's no product-by-ID lookup

Cart items only carry `product_id`/`variant_id`/`quantity` — no denormalized name, image, or
price, and there is no `GET /products/{id}` (only by slug). To render names/prices in the cart
and on order-lookup, the frontend fetches the full catalog once and cross-references by ID
(`listProductsCached()` in `src/api/products.ts`). If the catalog grows large enough that this
stops being viable, ask the API team for a batch-by-ID or ID-inclusive cart response before
building pagination workarounds here.

### Why checkout success doesn't call `GET /checkout/sessions/{session_id}`

`createCheckoutSession()` returns an `order_id`, not a Stripe `session_id` — the frontend never
learns the Stripe session ID directly. The success/cancel flow instead:
1. Stashes `order_id` in `sessionStorage` (`herdtastic_last_order_id`, see `src/lib/constants.ts`)
   right before redirecting to `checkout_url`.
2. On return, shows the stashed `order_id` as a reference and links to `/orders/lookup` with it
   pre-filled.
3. The user supplies their checkout email there to actually fetch order status via
   `GET /orders/{order_id}` with `X-Order-Email`.

If the API guide's `checkout_url` success redirect ever starts appending a real
`?session_id=...`, wiring up `getCheckoutSessionStatus` directly would be a cleaner path — check
before adding it.

## Errors

All non-2xx responses follow:

```json
{ "error": { "code": "...", "message": "...", "request_id": "...", "details": [] } }
```

`src/api/client.ts` throws `ApiError` (has `.status`, `.code`, `.message`, `.requestId`,
`.details`) for these. A caller can check `err instanceof ApiError` and branch on `.code` (e.g.
`PAYMENTS_NOT_CONFIGURED`, see `CartPage.tsx`) or `.status` (e.g. `403`/`404` on order lookup, see
`OrderLookupPage.tsx`). Anything that isn't valid JSON with an `error` key (like an HTML error
page from infra in front of the API) becomes a generic `ApiError` with `code: "UNKNOWN_ERROR"`.

Common statuses: `401` invalid Firebase token, `403` another user's cart/order, `404` unknown
resource, `409` stock/state conflict, `422` invalid JSON body, `503` payments not configured.

## Adding a new endpoint

1. Add types to `src/types.ts`.
2. Add a thin function to the matching file in `src/api/` — always go through `apiFetch()` in
   `client.ts` so auth headers and error handling stay centralized. Don't call `fetch()` directly
   from components or context.
2a. If the response can include `guest_token` (any cart endpoint), persist it with
   `setGuestToken()` — see the `persistGuestToken` wrapper in `src/api/cart.ts`.
3. Consume it from a page/context, not inline in JSX.

## Design system

Visual styling is ported from the **Heardtastic Design System** project in Claude Design
(project id `53f70562-c922-4594-81b1-08548164d5f0`, reachable via the `DesignSync` tool). That
project is the source of truth for brand colors, type, spacing, and component behavior — this
repo's copy can drift, so re-check the source before making unrelated visual changes.

What was ported and where:
- `tokens/colors.css`, `tokens/spacing.css`, `tokens/typography.css`, `tokens/base.css`,
  `fonts/fonts.css` → copied verbatim into `src/styles/tokens/` and `src/styles/fonts.css`,
  combined via `src/styles/tokens.css`, imported at the top of `src/index.css` (before the
  `@tailwind` directives).
- `tailwind.config.js` extends `colors`/`fontFamily`/`boxShadow`/`borderRadius`/`letterSpacing`
  to reference those CSS variables (e.g. `red.700` → `var(--red-700)`) rather than hardcoding
  hex values, so re-pulling the token files keeps Tailwind in sync automatically.
- `assets/heardtastic-badge-logo.png` — **do not re-fetch this via `DesignSync.get_file` and
  wire it up again without checking file size first.** `get_file` silently truncates at 256 KiB;
  this particular PNG is larger than that, so every fetch (confirmed twice) returns a
  byte-for-byte identical truncated file with no `IEND` chunk — a corrupted image, not the real
  badge. It rendered in the header as a tiny cut-off arc instead of the full circular badge,
  which was the "logo is cutoff" bug. The corrupted copy was deleted from `src/assets/` and
  `public/favicon.png`; `Header.tsx`/`Footer.tsx` now use a plain text wordmark plus a small
  CSS/SVG "H" monogram instead of the image, and `public/favicon.svg` replaces the PNG favicon.
  This matches the design system's own SKILL.md guidance ("use the file or plain wordmark
  type") — it's an approved fallback, not a workaround to fix later by default. Only reintroduce
  the image if the user supplies a properly-sized export (well under 256 KiB) directly, since
  there's no way to pull the full-resolution original through this tool.
- `components/forms/*.jsx`, `components/display/*.jsx`, `components/feedback/Dialog.jsx`,
  `components/feedback/Toast.jsx` → reimplemented as Tailwind-based React components in
  `src/components/ui/` (`Button`, `IconButton`, `Input`, `Select`, `QuantityStepper`, `Badge`,
  `Tag`, `PriceTag`, `Dialog`, `Toast`). The source components use inline `style={}` objects with
  hover/active state tracked in React state; the ported versions use Tailwind's `hover:`/`active:`
  variants instead — behaviorally equivalent, less code. Icons use `lucide-react` (a real npm
  dependency) rather than the source's CDN `<script>` + `data-lucide` attribute approach, since
  this is a bundled Vite app.
- `ui_kits/store/*.jsx` (HomeScreen/CatalogScreen/ProductScreen/CartScreen/StoreChrome) is a
  *reference* for layout and interaction patterns, not copied directly — it uses fictional data
  (`data.js`) with fields our real API doesn't return (breed, reg number, rating, reviews, EPDs).
  Pages here adapt the same visual patterns to the real `Product`/`Cart`/`Order` shapes from
  `src/types.ts` and omit anything that would require fabricating data (e.g. no rating stars, no
  EPD tabs, no invented shipping thresholds).

Brand name note: the brand is **"Herdtastic"** — this reverses an earlier decision that had
standardized on the design system's "Heardtastic" spelling. The owner bought the production
domain `herdtastic.com` (2026-07-13) and confirmed "Herdtastic" is the intended name; all
wordmark/copy/package/SEO text now uses it. Two leftovers still carry the old spelling and
should not be "fixed" blindly: the backend directory path `/Users/giop54/heardtastic-backend`
(a real on-disk path) and the design-system project's own name/assets — in particular
`public/brand/herdtastic-medallion.png` is renamed on disk but the artwork itself still reads
"HEARDTASTIC" and needs a re-exported image from the owner.

To re-sync after the design system changes: use `DesignSync.list_files` /
`DesignSync.get_file` against the project id above, diff against what's in `src/styles/tokens/`
and `src/components/ui/`, and update incrementally — don't wholesale-replace, since the `ui/`
components have already diverged intentionally (Tailwind instead of inline styles, lucide-react
instead of CDN).

## SEO

This is a client-rendered SPA (no SSR/SSG), so everything below works by mutating `document.head`
after mount rather than serving pre-rendered meta tags. That's a real limitation — a crawler that
doesn't execute JS sees only the static defaults in `index.html` — but modern Googlebot does
render JS, so this is a reasonable tradeoff without introducing SSR.

- **`src/components/Seo.tsx`** — mount one per page (`<Seo title=... description=... path=...
  />`). Sets `document.title`, meta description, canonical link, OG/Twitter tags, and an optional
  JSON-LD `<script>`, all via upsert (finds-and-updates an existing tag if present, otherwise
  creates one) so it never duplicates the static tags already in `index.html`. Pass `noindex` for
  pages with no organic search value or that carry per-session/personal state.
- **Indexing policy**: `/`, `/catalog`, and `/products/:slug` are indexable. `/cart`,
  `/checkout/success`, `/checkout/cancel`, `/orders/lookup`, and the 404 page are `noindex` —
  matches the `Disallow` rules in `robots.txt`. Keep these two in sync: don't index something
  robots.txt blocks from being crawled, and don't list a noindexed path in the sitemap.
- **Product schema**: `ProductDetailPage` emits a schema.org `Product` with an `Offer` per
  variant (`price`, `availability` derived from `active`/`inventory_quantity`, matching what's
  actually shown on the page — don't add fields like `aggregateRating` that we have no real data
  for).
- **`scripts/generate-sitemap.mjs`** — runs automatically via the `prebuild` npm hook (also
  runnable directly as `npm run sitemap`). Fetches `GET /products` from `VITE_API_BASE_URL` to
  include real product URLs, and writes both `public/sitemap.xml` and `public/robots.txt` (so the
  `Sitemap:` line always matches `VITE_SITE_URL`). If the API is unreachable it logs a warning and
  falls back to the static routes only — it must never fail the build. Both output files are
  regenerated on every build; hand edits to them won't stick.
- **`VITE_SITE_URL`** in `.env` is the real production domain (`https://www.herdtastic.com` —
  www is primary; the apex 308-redirects to it in Vercel's domain settings). It's used to build
  absolute URLs in the sitemap, `robots.txt`, and the static OG/canonical tags in `index.html`.
  Canonical/OG tags set by `Seo.tsx` use `window.location.origin` at runtime so they're always
  correct regardless of this value, but the sitemap and robots.txt are generated at build time
  and have no other way to know the real domain.

## Admin panel (/admin)

The back office lives under `/admin` as a single lazy chunk (`src/pages/admin/`, split in
`App.tsx` so shoppers never download it). Pages: dashboard, products (+editor), bookings
calendar with blackout dates, orders (+detail), activity (audit log).

- Auth today is the backend's `ADMIN_API_KEY`: `/admin/login` verifies the entered key against
  `GET /admin/products`, stores it in `sessionStorage` (`herdtastic_admin_key`), and
  `src/api/admin.ts` attaches it as `X-Admin-Key` on every admin call. When Firebase admin
  sign-in lands, swap the header for the bearer token via `setFirebaseIdTokenProvider` — the
  route guard and API layer need no other changes.
- All admin endpoints and types are documented in the backend repo's `docs/frontend-api.md`
  ("Admin (back office)"). Admin-only response fields live in `src/types.ts` as `AdminProduct`,
  `AdminOrder`, etc., extending the public types.
- A 401 from any admin call signs the admin out (see `describeError` in
  `src/context/AdminAuthContext.tsx`) and the guard bounces to `/admin/login`.
- `/admin` is noindexed (Seo component) and disallowed in robots.txt (sitemap script). Keep it
  out of the sitemap.
- Local dev against a local backend: run the API with `ADMIN_API_KEY=... uvicorn app.main:app
  --port 8791` in the backend repo, then use the `herdtastic-dev-local-api` launch config
  (sets `VITE_API_BASE_URL=http://localhost:8791/api/v1`).
