export interface ProductVariant {
  variant_id: string;
  sku: string;
  name: string;
  price_cents: number;
  inventory_quantity: number;
  track_inventory: boolean;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category_ids: string[];
  details: Record<string, unknown>;
  fulfillment_type: "shipping" | "booking";
  variants: ProductVariant[];
}

export interface BookingDay {
  date: string;
  available: boolean;
}

export interface BookingAvailability {
  product_id: string;
  timezone: string;
  days: BookingDay[];
}

export interface Booking {
  id: string;
  product_id: string;
  booking_date: string;
  status: "active" | "cancelled";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

export interface BookingCreateResponse {
  booking: Booking;
  guest_token?: string;
}

export interface CartItem {
  item_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
}

export interface Cart {
  id: string;
  currency: string;
  items: CartItem[];
  updated_at: string | null;
}

export interface CartResponse {
  cart: Cart;
  guest_token?: string;
}

export interface CheckoutSessionResponse {
  order_id: string;
  checkout_url: string;
}

export interface CheckoutSessionStatus {
  id: string;
  status: string;
}

export type OrderStatus =
  | "pending"
  | "checkout_created"
  | "payment_processing"
  | "paid"
  | "fulfillment_pending"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed"
  | "partially_refunded"
  | "refunded"
  | "disputed";

export interface OrderLineItem {
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  currency: string;
  line_items: OrderLineItem[];
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  request_id: string;
  details: unknown[];
}
