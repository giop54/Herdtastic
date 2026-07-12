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
- `assets/heardtastic-badge-logo.png` → `src/assets/heardtastic-badge-logo.png` (used in
  `Header.tsx`/`Footer.tsx`) and `public/favicon.png`. This is the only real brand asset — never
  redraw or approximate it.
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

Brand name note: the design system's badge logo and its own docs read **"Heardtastic"**
(a "heard" pun), confirmed as correct over the initial "Herdtastic" spelling this repo started
with. The project directory is still named `herdtastic` — only the visible wordmark/copy/package
name were updated, not the folder, to avoid an unnecessary disruptive rename.

To re-sync after the design system changes: use `DesignSync.list_files` /
`DesignSync.get_file` against the project id above, diff against what's in `src/styles/tokens/`
and `src/components/ui/`, and update incrementally — don't wholesale-replace, since the `ui/`
components have already diverged intentionally (Tailwind instead of inline styles, lucide-react
instead of CDN).
