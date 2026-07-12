import { apiFetch, setGuestToken } from "./client";
import type { CartResponse } from "../types";

function persistGuestToken(res: CartResponse): CartResponse {
  if (res.guest_token) {
    setGuestToken(res.guest_token);
  }
  return res;
}

export async function getCart(): Promise<CartResponse> {
  return persistGuestToken(await apiFetch<CartResponse>("/cart"));
}

export async function addCartItem(
  productId: string,
  variantId: string,
  quantity: number,
): Promise<CartResponse> {
  return persistGuestToken(
    await apiFetch<CartResponse>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity }),
    }),
  );
}

export async function updateCartItemQuantity(
  itemId: string,
  productId: string,
  variantId: string,
  quantity: number,
): Promise<CartResponse> {
  return persistGuestToken(
    await apiFetch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity }),
    }),
  );
}

export async function removeCartItem(itemId: string): Promise<CartResponse> {
  return persistGuestToken(
    await apiFetch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    }),
  );
}
