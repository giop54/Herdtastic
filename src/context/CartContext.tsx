import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addCartItem, getCart, removeCartItem, updateCartItemQuantity } from "../api/cart";
import { ApiError } from "../api/client";
import type { Cart } from "../types";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (
    itemId: string,
    productId: string,
    variantId: string,
    quantity: number,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCart();
      setCart(res.cart);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: string, variantId: string, quantity: number) => {
    setError(null);
    try {
      const res = await addCartItem(productId, variantId, quantity);
      setCart(res.cart);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add that item to your cart.");
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, productId: string, variantId: string, quantity: number) => {
      setError(null);
      try {
        const res = await updateCartItemQuantity(itemId, productId, variantId, quantity);
        setCart(res.cart);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not update that item.");
        throw err;
      }
    },
    [],
  );

  const removeItem = useCallback(async (itemId: string) => {
    setError(null);
    try {
      const res = await removeCartItem(itemId);
      setCart(res.cart);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove that item.");
      throw err;
    }
  }, []);

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, itemCount, loading, error, addItem, updateQuantity, removeItem, refresh }),
    [cart, itemCount, loading, error, addItem, updateQuantity, removeItem, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
