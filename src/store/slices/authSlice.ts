// Import createSlice and PayloadAction from Redux Toolkit for slice creation
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the authentication state
interface AuthState {
  user: any | null; // User object (can be typed better with Firebase User type later)
  isLoading: boolean; // Loading state for async operations
  error: string | null; // Error message if any
}

// Initial state for authentication
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Create the auth slice with reducers for authentication actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set the current user and clear loading/error states
    setUser(state, action: PayloadAction<any | null>) {
      state.user = action.payload;
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
    // Clear user data on logout
    logout(state) {
      state.user = null;
      state.error = null;
    },
  },
});

// Export auth actions for use in components
export const { setUser, setLoading, setError, logout } = authSlice.actions;
// Export the auth reducer as default
export default authSlice.reducer;
