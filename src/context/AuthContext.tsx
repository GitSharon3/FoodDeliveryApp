import { logout, setLoading, setUser } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export type AppUser = User & {
  id: string;
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
    phone_number?: string | null;
    username?: string | null;
  };
};

interface AuthContextType {
  user: AppUser | null;
  session: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any; data?: any }>;
  signInWithGoogle: () => Promise<{ error?: any; data?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; email?: string; password?: string; phone_number?: string; username?: string; avatar_url?: string }) => Promise<{ error?: any; data?: any }>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const MOCK_USER: AppUser = {
  uid: "dummy_user",
  email: "user@example.com",
  emailVerified: true,
  displayName: "Foodie User",
  isAnonymous: false,
  photoURL: null,
  providerData: [],
  providerId: "mock",
  tenantId: null,
  refreshToken: "",
  delete: async () => {},
  getIdToken: async () => "",
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  metadata: {},
  phoneNumber: null,
  id: "dummy_user",
  user_metadata: {
    full_name: "Foodie User",
    avatar_url: null,
    phone_number: null,
    username: null,
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading: loading } = useSelector((state: RootState) => state.auth);
  const currentUser = user;

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("mock_auth_session");
        if (storedAuth === "logged_in") {
          const email = await AsyncStorage.getItem("userEmail");
          const name = await AsyncStorage.getItem("userName");
          dispatch(setUser({
            ...MOCK_USER,
            email: email || MOCK_USER.email,
            displayName: name || MOCK_USER.displayName,
            user_metadata: {
              ...MOCK_USER.user_metadata,
              full_name: name || MOCK_USER.user_metadata?.full_name,
            }
          }));
        } else {
          dispatch(setUser(null));
        }
      } catch (e) {
        console.error("Failed to load session", e);
        dispatch(setLoading(false));
      }
    };
    loadSession();
  }, [dispatch]);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      await AsyncStorage.setItem("mock_auth_session", "logged_in");
      if (email) await AsyncStorage.setItem("userEmail", email);
      if (name) await AsyncStorage.setItem("userName", name);

      const userToSet = {
        ...MOCK_USER,
        email: email,
        displayName: name || "Foodie User",
        user_metadata: {
          ...MOCK_USER.user_metadata,
          full_name: name || "Foodie User",
        }
      };

      dispatch(setUser(userToSet));
      return { data: userToSet, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem("mock_auth_session", "logged_in");
      if (email) await AsyncStorage.setItem("userEmail", email);

      const name = await AsyncStorage.getItem("userName");
      const userToSet = {
        ...MOCK_USER,
        email: email,
        displayName: name || "Foodie User",
        user_metadata: {
          ...MOCK_USER.user_metadata,
          full_name: name || "Foodie User",
        }
      };

      dispatch(setUser(userToSet));
      return { data: userToSet, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await AsyncStorage.setItem("mock_auth_session", "logged_in");
      dispatch(setUser(MOCK_USER));
      return { data: MOCK_USER, error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOutHandler = async () => {
    try {
      await AsyncStorage.removeItem("mock_auth_session");
      dispatch(logout());
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (data: { full_name?: string; email?: string; password?: string; phone_number?: string; username?: string; avatar_url?: string }) => {
    try {
      if (!currentUser) {
        return { error: "No user logged in", data: null };
      }

      if (data.full_name) {
        await AsyncStorage.setItem("userName", data.full_name);
      }
      if (data.email) {
        await AsyncStorage.setItem("userEmail", data.email);
      }
      if (data.phone_number) {
        await AsyncStorage.setItem("userPhoneNumber", data.phone_number);
      }
      if (data.username) {
        await AsyncStorage.setItem("userName", data.username);
      }

      const updatedUser = {
        ...currentUser,
        displayName: data.full_name || currentUser.displayName,
        email: data.email || currentUser.email,
        user_metadata: {
          ...currentUser.user_metadata,
          full_name: data.full_name || currentUser.user_metadata?.full_name,
          avatar_url: data.avatar_url || currentUser.user_metadata?.avatar_url,
          phone_number: data.phone_number || currentUser.user_metadata?.phone_number,
          username: data.username || currentUser.user_metadata?.username,
        }
      };

      dispatch(setUser(updatedUser));

      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session: user ? ({} as User) : null,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: signOutHandler,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
