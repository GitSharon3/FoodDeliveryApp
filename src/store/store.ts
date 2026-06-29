// Import configureStore from Redux Toolkit for store creation
import { configureStore } from '@reduxjs/toolkit';
// Import auth and cart reducers
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

// Configure and create the Redux store
export const store = configureStore({
  // Combine all reducers into a single root reducer
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  // Firebase heavily uses non-serializable objects (like UserImpl). 
  // Disable serializableCheck to avoid Redux Toolkit warnings.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// TypeScript type for the entire Redux state tree
export type RootState = ReturnType<typeof store.getState>;
// TypeScript type for the dispatch function
export type AppDispatch = typeof store.dispatch;
