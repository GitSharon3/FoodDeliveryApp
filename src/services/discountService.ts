// Import Firebase authentication and database instances
import { auth, db } from "@/lib/firebase";
// Import Firestore functions for database operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";

// Type definition for a discount/coupon
export type Discount = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discount_percent: number;
  valid_until: string;
  is_active: boolean;
  code?: string;
  min_order_amount?: number;
  max_discount_amount?: number;
  restaurant_id?: string;
  usage_limit?: number;
  created_at?: string;
};

// Type definition for user coupon usage tracking
export type UserCoupon = {
  id: string;
  user_id: string;
  discount_id: string;
  used_at: string;
};

// Standard service result type for async operations
type ServiceResult<T> = Promise<{ data: T | null; error: any }>;

// Helper function to add document ID to data object
const withId = <T>(snapshot: any): T => ({ id: snapshot.id, ...snapshot.data() } as T);

// Discount service object containing all discount/coupon operations
export const discountService = {
  /**
   * Get all currently active discounts, ordered by newest first.
   */
  async getActiveDiscounts(): Promise<{ data: Discount[]; error: any }> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "discounts"),
          where("is_active", "==", true),
          orderBy("created_at", "desc"),
        ),
      );
      return { data: snapshot.docs.map(withId<Discount>), error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Get a single discount by its ID.
   */
  async getDiscountById(discountId: string): ServiceResult<Discount> {
    try {
      const discountDoc = await getDoc(doc(db, "discounts", discountId));
      if (!discountDoc.exists()) return { data: null, error: "Discount not found" };
      return { data: withId<Discount>(discountDoc), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Validate and retrieve a discount by coupon code.
   * Returns the discount if the code is valid, active, and within its usage limit.
   */
  async validateCouponCode(code: string): ServiceResult<Discount> {
    try {
      const normalizedCode = code.trim().toUpperCase();
      const snapshot = await getDocs(
        query(
          collection(db, "discounts"),
          where("code", "==", normalizedCode),
          where("is_active", "==", true),
        ),
      );

      if (snapshot.empty) {
        return { data: null, error: "Invalid or expired coupon code" };
      }

      const discount = withId<Discount>(snapshot.docs[0]);

      // Check expiration date
      if (discount.valid_until) {
        const expiryDate = new Date(discount.valid_until);
        if (expiryDate < new Date()) {
          return { data: null, error: "This coupon has expired" };
        }
      }

      // Check if current user has already used this coupon
      const userId = auth.currentUser?.uid;
      if (userId && discount.usage_limit) {
        const usageSnapshot = await getDocs(
          query(
            collection(db, "coupon_usage"),
            where("user_id", "==", userId),
            where("discount_id", "==", discount.id),
          ),
        );
        if (usageSnapshot.size >= discount.usage_limit) {
          return { data: null, error: "You have already used this coupon" };
        }
      }

      return { data: discount, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Record that the current user used a specific coupon (for usage-limit tracking).
   */
  async recordCouponUsage(discountId: string): ServiceResult<null> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return { data: null, error: "NOT_LOGGED_IN" };

      // Create unique usage record ID
      const usageId = `${userId}_${discountId}_${Date.now()}`;
      await setDoc(doc(db, "coupon_usage", usageId), {
        user_id: userId,
        discount_id: discountId,
        used_at: serverTimestamp(),
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get discounts specific to a restaurant.
   */
  async getRestaurantDiscounts(restaurantId: string): Promise<{ data: Discount[]; error: any }> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "discounts"),
          where("is_active", "==", true),
          where("restaurant_id", "==", restaurantId),
        ),
      );
      return { data: snapshot.docs.map(withId<Discount>), error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Calculate the discount amount for a given subtotal.
   */
  calculateDiscount(discount: Discount, subtotal: number): number {
    // Check minimum order amount requirement
    if (discount.min_order_amount && subtotal < discount.min_order_amount) {
      return 0;
    }

    // Calculate percentage-based discount
    let discountAmount = (subtotal * discount.discount_percent) / 100;

    // Apply maximum discount cap if set
    if (discount.max_discount_amount) {
      discountAmount = Math.min(discountAmount, discount.max_discount_amount);
    }

    // Round to 2 decimal places
    return Math.round(discountAmount * 100) / 100;
  },
};
