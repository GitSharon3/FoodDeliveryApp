// Import createSlice and PayloadAction from Redux Toolkit for slice creation
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Import CartItem type from restaurant service
import { CartItem } from '@/services/restaurantService';

// Define the shape of the cart state
interface CartState {
  items: CartItem[]; // Array of cart items
  subtotal: number; // Total price of all items in cart
  isLoading: boolean; // Loading state for async operations
  error: string | null; // Error message if any
}

// Initial state for the shopping cart
const initialState: CartState = {
  items: [],
  subtotal: 0,
  isLoading: false,
  error: null,
};

// Create the cart slice with reducers for cart actions
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set cart items and calculate subtotal
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      // Calculate subtotal by summing all item total prices
      state.subtotal = action.payload.reduce((sum, item) => sum + item.total_price, 0);
      state.isLoading = false;
      state.error = null;
    },
    // Set the loading state for async operations
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    // Set an error message and clear loading state
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Clear all cart data (items, subtotal, error)
    clearCartState(state) {
      state.items = [];
      state.subtotal = 0;
      state.error = null;
    },
  },
});

// Export cart actions for use in components
export const { setCartItems, setLoading, setError, clearCartState } = cartSlice.actions;
// Export the cart reducer as default
export default cartSlice.reducer;
