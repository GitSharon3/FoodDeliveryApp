// Import AsyncStorage for persisting favorite restaurants
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import dummy data for development (restaurants, categories, menu items)
import { dummyCategories, dummyMenuItems, dummyRestaurants } from "@/data/dummyData";

// Standard service result type for async operations
type ServiceResult<T> = Promise<{ data: T | null; error: any }>;

// Type definition for a food category
export interface Category {
  id: string;
  category_name: string;
  category_description: string;
  image_url?: string;
}

// Type definition for a restaurant
export interface Restaurant {
  id: string;
  restaurant_name: string;
  address: string;
  phone: string;
  email: string;
  category_id: string;
  image_url?: string;
  rating: number;
  total_reviews: number;
  delivery_fee: number;
  minimum_order: number;
  delivery_time: string;
  is_open: boolean;
  is_featured: boolean;
  category?: Category;
  menu_items?: MenuItem[];
}

// Type definition for a menu item
export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_vegetarian: boolean;
  is_popular: boolean;
  is_available: boolean;
  category?: string;
}

// Type definition for a cart item
export interface CartItem {
  id: string;
  user_id: string;
  menu_item_id: string;
  restaurant_id: string;
  quantity: number;
  price: number;
  total_price: number;
  note?: string;
  menu_item?: MenuItem;
  restaurant?: Restaurant;
}

// ──────────────────────────────────────────
//  Helper Functions
// ──────────────────────────────────────────

// Get a category by its ID from dummy data
const getCategory = (categoryId?: string): Category | undefined => {
  if (!categoryId) return undefined;
  return dummyCategories.find((c) => c.id === categoryId);
};

// Attach category object to a restaurant
const attachCategory = (restaurant: Restaurant): Restaurant => ({
  ...restaurant,
  category: getCategory(restaurant.category_id),
});

// ──────────────────────────────────────────
//  Restaurant Service (In-Memory)
// ──────────────────────────────────────────

class RestaurantService {
  // Get all food categories
  async getCategories(): ServiceResult<Category[]> {
    return { data: dummyCategories, error: null };
  }

  // Get featured restaurants that are currently open
  async getFeaturedRestaurants(): ServiceResult<Restaurant[]> {
    const featured = dummyRestaurants.filter(r => r.is_featured && r.is_open).map(attachCategory);
    return { data: featured, error: null };
  }

  // Get restaurants belonging to a specific category
  async getRestaurantsByCategory(categoryId: string): ServiceResult<Restaurant[]> {
    const restaurants = dummyRestaurants.filter(r => r.category_id === categoryId && r.is_open).map(attachCategory);
    return { data: restaurants, error: null };
  }

  // Search restaurants by name or address
  async searchRestaurants(searchTerm: string): ServiceResult<Restaurant[]> {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const restaurants = dummyRestaurants
      .filter(r => r.is_open)
      .filter((restaurant) =>
        // Search in restaurant name and address
        [restaurant.restaurant_name, restaurant.address].some((value) =>
          value?.toLowerCase().includes(normalizedQuery),
        ),
      )
      // Sort by rating (highest first)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .map(attachCategory);

    return { data: restaurants, error: null };
  }

  // Get a single restaurant by ID with its menu items
  async getRestaurantById(id: string): ServiceResult<Restaurant> {
    const restaurantDoc = dummyRestaurants.find(r => r.id === id);
    if (!restaurantDoc) return { data: null, error: "Restaurant not found" };

    // Fetch menu items for this restaurant
    const menuItems = await this.getMenuItems(id);
    const restaurant = attachCategory(restaurantDoc);
    return { data: { ...restaurant, menu_items: menuItems.data || [] }, error: null };
  }

  // Get all menu items for a specific restaurant
  async getMenuItems(restaurantId: string): ServiceResult<MenuItem[]> {
    const items = dummyMenuItems.filter(m => m.restaurant_id === restaurantId && m.is_available);
    return { data: items, error: null };
  }

  // Get a single menu item by ID
  async getMenuItemById(itemId: string): ServiceResult<MenuItem> {
    const itemDoc = dummyMenuItems.find(m => m.id === itemId);
    return itemDoc
      ? { data: itemDoc, error: null }
      : { data: null, error: "Menu item not found" };
  }

  // Get all open restaurants
  async getAllRestaurants(): ServiceResult<Restaurant[]> {
    const restaurants = dummyRestaurants.filter(r => r.is_open).map(attachCategory);
    return { data: restaurants, error: null };
  }

  // Add a restaurant to user's favorites
  async addToFavorites(restaurantId: string) {
    try {
      const stored = await AsyncStorage.getItem("favorite_restaurant_ids");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      // Only add if not already in favorites
      if (!ids.includes(restaurantId)) {
        ids.push(restaurantId);
        await AsyncStorage.setItem("favorite_restaurant_ids", JSON.stringify(ids));
      }
      return { data: null, error: null };
    } catch {
      return { data: null, error: "STORAGE_ERROR" };
    }
  }

  // Remove a restaurant from user's favorites
  async removeFromFavorites(restaurantId: string) {
    try {
      const stored = await AsyncStorage.getItem("favorite_restaurant_ids");
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = ids.filter(id => id !== restaurantId);
      await AsyncStorage.setItem("favorite_restaurant_ids", JSON.stringify(ids));
      return { data: null, error: null };
    } catch {
      return { data: null, error: "STORAGE_ERROR" };
    }
  }

  // Check if a restaurant is in user's favorites
  async isFavorite(restaurantId: string) {
    try {
      const stored = await AsyncStorage.getItem("favorite_restaurant_ids");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      return { data: ids.includes(restaurantId), error: null };
    } catch {
      return { data: false, error: null };
    }
  }

  // Get all favorite restaurants for the user
  async getUserFavorites(): ServiceResult<Restaurant[]> {
    try {
      const stored = await AsyncStorage.getItem("favorite_restaurant_ids");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      const restaurants = dummyRestaurants
        .filter(r => ids.includes(r.id))
        .map(attachCategory);
      return { data: restaurants, error: null };
    } catch {
      return { data: [], error: "STORAGE_ERROR" };
    }
  }
}

// Export singleton instance of RestaurantService
export const restaurantService = new RestaurantService();

// ──────────────────────────────────────────
//  Cart Service (In-Memory)
// ──────────────────────────────────────────

// Simulating an in-memory database for the cart (resets on app restart)
let inMemoryCart: CartItem[] = [];

class CartService {
  // Add an item to the cart
  async addToCart(menuItemId: string, restaurantId: string, quantity: number = 1, note?: string) {
    const userId = "dummy_user";
    const menuData = dummyMenuItems.find(m => m.id === menuItemId);
    if (!menuData) return { data: null, error: "MENU_ITEM_NOT_FOUND" };

    const finalRestaurantId = restaurantId || menuData.restaurant_id;
    
    // Check if item already exists in cart
    const existingItem = inMemoryCart.find(item => item.menu_item_id === menuItemId);
    // Check if cart contains items from a different restaurant
    const differentRestaurantItem = inMemoryCart.find(item => item.restaurant_id !== finalRestaurantId);

    // Prevent adding items from multiple restaurants
    if (differentRestaurantItem) return { data: null, error: "DIFFERENT_RESTAURANT" };

    // Update quantity if item already exists
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total_price = menuData.price * existingItem.quantity;
      if (note) existingItem.note = note;
      return {
        data: existingItem,
        error: null,
      };
    }

    // Create new cart item
    const cartItem: CartItem = {
      id: Math.random().toString(36).substring(2, 11),
      user_id: userId,
      menu_item_id: menuItemId,
      restaurant_id: finalRestaurantId,
      quantity,
      price: menuData.price,
      total_price: menuData.price * quantity,
      note: note || "",
    };
    
    inMemoryCart.push(cartItem);
    return { data: cartItem, error: null };
  }

  // Get all items in the cart with related menu item and restaurant data
  async getCartItems(): ServiceResult<CartItem[]> {
    const items = inMemoryCart.map(cartItem => {
      const menuItem = dummyMenuItems.find(m => m.id === cartItem.menu_item_id);
      const restaurant = dummyRestaurants.find(r => r.id === cartItem.restaurant_id);
      
      return {
        ...cartItem,
        menu_item: menuItem,
        restaurant: restaurant,
      };
    });

    return { data: items, error: null };
  }

  // Update the quantity of a cart item
  async updateCartItem(cartItemId: string, quantity: number) {
    const cartItem = inMemoryCart.find(item => item.id === cartItemId);
    if (!cartItem) return { data: null, error: "CART_ITEM_NOT_FOUND" };
    
    cartItem.quantity = quantity;
    cartItem.total_price = cartItem.price * quantity;
    return { data: null, error: null };
  }

  // Remove an item from the cart
  async removeFromCart(cartItemId: string) {
    inMemoryCart = inMemoryCart.filter(item => item.id !== cartItemId);
    return { data: null, error: null };
  }

  // Clear all items from the cart
  async clearCart() {
    inMemoryCart = [];
    return { data: null, error: null };
  }

  // Get the total price and item count of the cart
  async getCartTotal() {
    const total = inMemoryCart.reduce((sum, item) => sum + item.total_price, 0);
    const itemCount = inMemoryCart.reduce((sum, item) => sum + item.quantity, 0);
    return { data: { total, itemCount }, error: null };
  }
}

// Export singleton instance of CartService
export const cartService = new CartService();
