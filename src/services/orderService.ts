// Import AsyncStorage for persisting order data
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import dummy restaurant data for resolving restaurant info
import { dummyRestaurants } from "@/data/dummyData";

// Define all possible order statuses
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

// Human-readable labels for each order status
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Color codes for each order status (for UI badges)
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  out_for_delivery: "#F97316",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

// Type definition for an individual order item
export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  menu_item_image?: string;
  quantity: number;
  price: number;
  total_price: number;
  note?: string;
};

// Type definition for a complete order
export type Order = {
  id: string;
  user_id: string | null;
  restaurant_id: string | null;
  restaurant_name?: string;
  restaurant_image?: string;
  address_id: string | null;
  total_amount: number;
  subtotal?: number;
  delivery_fee: number;
  discount_amount?: number;
  payment_method: string;
  status: string;
  order_number: string;
  estimated_delivery?: string;
  delivery_address?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
};

// Type for creating a new order (excludes auto-generated fields)
export type CreateOrderInput = Omit<Order, "id" | "order_number" | "created_at" | "updated_at">;

// Standard service result type for async operations
type ServiceResult<T> = Promise<{ data: T | null; error: any }>;

// AsyncStorage key for persisting orders
const ORDERS_KEY = "@orders_storage_key";

// Helper function to load orders array from AsyncStorage
const loadOrdersFromStorage = async (): Promise<Order[]> => {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load orders:", e);
    return [];
  }
};

// Helper function to save orders array to AsyncStorage
const saveOrdersToStorage = async (orders: Order[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save orders:", e);
  }
};

// Order service object containing all order-related operations
export const orderService = {
  /**
   * Create a new order with an auto-generated order number and timestamp.
   */
  async createOrder(orderData: CreateOrderInput): ServiceResult<Order> {
    try {
      const nowString = new Date().toISOString();
      const orders = await loadOrdersFromStorage();
      
      // Create new order with auto-generated fields
      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substring(2, 11),
        order_number: `NB-${Date.now().toString().slice(-6)}`,
        created_at: nowString,
        updated_at: nowString,
      };

      // Resolve restaurant info from dummyData
      if (newOrder.restaurant_id) {
        const rest = dummyRestaurants.find(r => r.id === newOrder.restaurant_id);
        if (rest) {
          newOrder.restaurant_name = rest.restaurant_name;
          newOrder.restaurant_image = rest.image_url;
        }
      }

      orders.unshift(newOrder); // Add to beginning (newest first)
      await saveOrdersToStorage(orders);

      return { data: newOrder, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Fetch all orders for a user, sorted by newest first.
   */
  async getOrdersByUser(userId: string): Promise<{ data: Order[]; error: any }> {
    try {
      const orders = await loadOrdersFromStorage();
      const userOrders = orders.filter(o => o.user_id === userId);
      return { data: userOrders, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Get a single order by its ID.
   */
  async getOrderById(orderId: string): ServiceResult<Order> {
    try {
      const orders = await loadOrdersFromStorage();
      const order = orders.find(o => o.id === orderId);
      if (!order) return { data: null, error: "Order not found" };
      return { data: order, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update the status of an order.
   */
  async updateOrderStatus(orderId: string, status: string): ServiceResult<Order> {
    try {
      const orders = await loadOrdersFromStorage();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx === -1) return { data: null, error: "Order not found" };
      
      // Update order status and timestamp
      orders[idx] = {
        ...orders[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      await saveOrdersToStorage(orders);

      return { data: orders[idx], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Cancel an order. Only pending/confirmed orders can be cancelled.
   */
  async cancelOrder(orderId: string): ServiceResult<Order> {
    try {
      const { data: order } = await this.getOrderById(orderId);
      if (!order) return { data: null, error: "Order not found" };

      // Check if order is in a cancellable state
      const cancellable: OrderStatus[] = ["pending", "confirmed"];
      if (!cancellable.includes(order.status as OrderStatus)) {
        return { data: null, error: "This order can no longer be cancelled" };
      }

      return this.updateOrderStatus(orderId, "cancelled");
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get the count of active (non-delivered, non-cancelled) orders.
   */
  async getActiveOrdersCount(): ServiceResult<number> {
    try {
      const orders = await loadOrdersFromStorage();
      const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
      return { data: active.length, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get human-readable status label.
   */
  getStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as OrderStatus] || status;
  },

  /**
   * Get status badge color.
   */
  getStatusColor(status: string): string {
    return ORDER_STATUS_COLORS[status as OrderStatus] || "#94A3B8";
  },
};
