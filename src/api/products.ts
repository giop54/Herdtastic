import { apiFetch } from "./client";
import type { Product } from "../types";

export function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export function getProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);
}

let productsPromise: Promise<Product[]> | null = null;

/**
 * Cart items only carry product/variant IDs, and there's no get-product-by-id
 * endpoint, so cart and checkout views resolve names/prices against the full
 * catalog. This cache avoids re-fetching it for every item.
 */
export function listProductsCached(): Promise<Product[]> {
  if (!productsPromise) {
    productsPromise = listProducts().catch((err) => {
      productsPromise = null;
      throw err;
    });
  }
  return productsPromise;
}
