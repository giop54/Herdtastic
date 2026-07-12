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

// ---- Admin (back office) ----
// These shapes mirror the /api/v1/admin endpoints; see the backend repo's
// docs/frontend-api.md "Admin (back office)" section.

export type ProductStatus = "active" | "archived";

/** Admin product responses include fields the public catalog omits. */
export interface AdminProduct extends Product {
  status: ProductStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminVariantInput {
  sku: string;
  name: string;
  price_cents: number;
  inventory_quantity?: number;
  track_inventory?: boolean;
  active?: boolean;
}

export interface AdminProductInput {
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  category_ids?: string[];
  details?: Record<string, unknown>;
  fulfillment_type?: "shipping" | "booking";
  status?: ProductStatus;
  variants: AdminVariantInput[];
}

export type AdminProductPatch = Partial<Omit<AdminProductInput, "variants">>;

export type AdminVariantPatch = Partial<Omit<AdminVariantInput, "inventory_quantity">>;

export interface StockUpdate {
  op: "set" | "adjust";
  quantity: number;
}

export interface AdminBookingPatch {
  booking_date?: string;
  status?: "active" | "cancelled";
}

export interface BlackoutDate {
  date: string;
  reason: string;
}

export interface OrderStatusHistoryEntry {
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  timestamp: string;
  reason: string;
  source: string;
}

/** Admin order responses include ownership/audit fields the public lookup omits. */
export interface AdminOrder extends Order {
  customer_email: string | null;
  status_history: OrderStatusHistoryEntry[];
}

export interface AdminOrderPatch {
  status?: OrderStatus;
  tracking_number?: string;
}

export interface LowStockVariant {
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  sku: string;
  inventory_quantity: number;
}

export interface RevenueDay {
  date: string;
  total_cents: number;
}

export interface MetricsSummary {
  revenue_7d_cents: number;
  open_orders: number;
  bookings_today: number;
  low_stock_threshold: number;
  low_stock: LowStockVariant[];
  revenue_by_day: RevenueDay[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  timestamp: string;
}
