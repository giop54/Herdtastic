# Heardtastic

Storefront for Heardtastic, a Texas All-American Cattle Co. selling bovine semen straws for breeding: product catalog, guest cart, Stripe-hosted checkout, and guest order tracking.

## Stack

React + TypeScript + Vite, React Router, Tailwind CSS. No backend in this repo — it talks to the Ecommerce API over REST.

## Design system

Visual styling (colors, type, spacing, components) is ported from the "Heardtastic Design System" project in Claude Design — see [`AGENTS.md`](AGENTS.md#design-system) for how it's wired in and how to re-sync it.

## Setup

```bash
npm install
npm run dev
```

Configure the API base URL in `.env`:

```
VITE_API_BASE_URL=https://ecommerce-api-dev-1063728289659.us-central1.run.app/api/v1
```

## Notes

- Guest checkout only for now. Cart identity is a `guest_token` persisted in `localStorage`; sign-in (Firebase ID tokens) can be wired in later via `setFirebaseIdTokenProvider` in [`src/api/client.ts`](src/api/client.ts) — once set, it takes priority over the guest token on every request.
- Cart items only carry `product_id`/`variant_id`, so the cart and order-lookup views resolve names/prices against the full product catalog (see `listProductsCached` in [`src/api/products.ts`](src/api/products.ts)).
- After `POST /checkout/sessions`, the browser is redirected to Stripe Checkout. The returned `order_id` is stashed in `sessionStorage` so the success page can show a reference and link into order tracking.
- Guest order lookup (`/orders/lookup`) requires both the order ID and the email used at checkout, per the API's `X-Order-Email` requirement.
