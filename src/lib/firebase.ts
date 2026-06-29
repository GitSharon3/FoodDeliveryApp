// Import Firebase configuration from environment variables
import {
    FIREBASE_API_KEY,
    FIREBASE_APP_ID,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
} from '@env';
// Import Firebase SDK functions
import { getApp, getApps, initializeApp } from 'firebase/app';
// @ts-ignore - React Native persistence not in standard Firebase types
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
// Import AsyncStorage for Firebase Auth persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Firestore and Storage services
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Helper function to validate required environment variables
function requireEnvVar(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `[firebase] Missing required env var: ${name}. ` +
        `Create a .env file in project root with your Firebase values.`
    );
  }
  return value;
}

// Firebase configuration object with validated environment variables
const firebaseConfig = {
  apiKey: requireEnvVar('FIREBASE_API_KEY', FIREBASE_API_KEY),
  authDomain: requireEnvVar('FIREBASE_AUTH_DOMAIN', FIREBASE_AUTH_DOMAIN),
  projectId: requireEnvVar('FIREBASE_PROJECT_ID', FIREBASE_PROJECT_ID),
  storageBucket: requireEnvVar('FIREBASE_STORAGE_BUCKET', FIREBASE_STORAGE_BUCKET),
  messagingSenderId: requireEnvVar(
    'FIREBASE_MESSAGING_SENDER_ID',
    FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: requireEnvVar('FIREBASE_APP_ID', FIREBASE_APP_ID),
};

console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase app (reuse existing if already initialized)
export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Safe initialization of Firebase Auth with AsyncStorage persistence
// Checks if Auth has already been initialized (e.g. during hot reloads) to avoid errors
export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
      return getAuth(firebaseApp);
    }
    throw error;
  }
})();

// Export Firestore database instance
export const db = getFirestore(firebaseApp);
// Export Firebase Storage instance
export const storage = getStorage(firebaseApp);

