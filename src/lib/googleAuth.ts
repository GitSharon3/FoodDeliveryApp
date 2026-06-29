// Import Google Web Client ID from environment variables
import { GOOGLE_WEB_CLIENT_ID } from '@env';

// Type definition for Google Sign-In module
// (using dynamic require to avoid issues when module is not installed)
type GoogleSigninModule = {
  GoogleSignin: {
    configure: (options: { webClientId: string; offlineAccess: boolean }) => void;
    hasPlayServices: () => Promise<void>;
    signIn: () => Promise<{ data?: { idToken?: string | null } }>;
    signOut: () => Promise<void>;
  };
};

// Safely get the Google Sign-In module (returns null if not available)
export const getGoogleSignin = () => {
  try {
    const googleSigninModule =
      require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    return googleSigninModule.GoogleSignin;
  } catch {
    return null;
  }
};

// Configure Google Sign-In with the web client ID
export const configureGoogleSignIn = () => {
  const GoogleSignin = getGoogleSignin();
  if (!GoogleSignin) {
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,  // using only web client ID
    offlineAccess: true,  // Enables server-side verification
  });
};
