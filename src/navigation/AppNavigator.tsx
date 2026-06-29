import { useTheme } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

import Onboarding1 from "@/screens/onboarding/Onboarding1";
import Onboarding2 from "@/screens/onboarding/Onboarding2";
import Onboarding3 from "@/screens/onboarding/Onboarding3";
import SplashScreen from "@/screens/onboarding/SplashScreen";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";

import CartScreen from "@/screens/cart/CartScreen";
import CheckoutScreen from "@/screens/checkout/CheckoutScreen";
import MenuItemScreen from "@/screens/restaurants/MenuItemScreen";
import RestaurantScreen from "@/screens/restaurants/RestaurantScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      setIsFirstLaunch(hasLaunched === null);
    };
    checkLaunch();
  }, []);

  if (loading || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
<Stack.Navigator screenOptions={{ headerShown: false }}>
  {isFirstLaunch ? (
    <>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
    </>
  ) : !user ? (
    <>
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ headerShown: false }}
      />
    </>
  ) : (
    <>
      <Stack.Screen name="Main" component={MainNavigator} />

      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MenuItemDetail"
        component={MenuItemScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ presentation: "modal", headerShown: false }}
      />

      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </>
  )}
</Stack.Navigator>
  );
};

export default AppNavigator;
