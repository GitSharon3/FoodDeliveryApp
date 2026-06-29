// Import React for component creation
// Import createNativeStackNavigator for authentication flow navigation
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Import authentication screens
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";

// Create a native stack navigator for authentication screens
const Stack = createNativeStackNavigator();

// AuthNavigator: Handles the authentication flow between login and signup screens
// Hides the header for a cleaner authentication experience
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} 
    initialRouteName="LoginScreen">
    {/* Login screen for existing users */}
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    {/* Signup screen for new user registration */}
    <Stack.Screen name="SignupScreen" component={SignupScreen} />
  </Stack.Navigator>
);

// Export AuthNavigator as default
export default AuthNavigator;
