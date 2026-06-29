// Import React for component creation
import React from "react";
// Import navigators for bottom tabs and stack navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Import Ionicons for tab bar icons
import { Ionicons as Icon } from "@expo/vector-icons";
// Import theme context for styling
import { useTheme } from "@/theme";

// Import home-related screens
import HomeScreen from "@/screens/home/HomeScreen";
import NotificationsScreen from "@/screens/notifications/NotificationsScreen";
import CategoryScreen from "@/screens/restaurants/CategoryScreen";
import MenuItemScreen from "@/screens/restaurants/MenuItemScreen";

// Import main tab screens
import FavoritesScreen from "@/screens/favorites/FavoritesScreen";
import OrdersScreen from "@/screens/orders/OrdersScreen";
import EditProfileScreen from "@/screens/profile/EditProfileScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import WalletScreen from "@/screens/wallet/WalletScreen";

// Create bottom tab navigator for main app navigation
const Tab = createBottomTabNavigator();
// Create stack navigator for nested navigation within tabs
const Stack = createNativeStackNavigator();

// HomeStackNavigator: Handles navigation within the Home tab
// Allows users to navigate from home to categories and menu items
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main home screen showing restaurants and categories */}
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    {/* Screen showing restaurants in a specific category */}
    <Stack.Screen name="CategoryRestaurants" component={CategoryScreen} />
    {/* Individual menu item detail screen */}
    <Stack.Screen name="MenuItemDetail" component={MenuItemScreen} />
    {/* Notifications screen */}
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

// ProfileStackNavigator: Handles navigation within the Profile tab
// Allows users to navigate from profile to edit profile and other profile-related screens
const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main profile screen */}
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    {/* Edit profile screen */}
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);


// MainNavigator: Bottom tab navigator for the main app screens
// Provides navigation between Home, Orders, Wallet, Favorites, and Profile
const MainNavigator = () => {
  const { colors } = useTheme();
  return (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      // Render appropriate icon based on route and focus state
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: React.ComponentProps<typeof Icon>["name"];

        switch (route.name) {
          case "Home":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Orders":
            iconName = focused ? "receipt" : "receipt-outline";
            break;
          case "Wallet":
            iconName = focused ? "card" : "card-outline";
            break;
          case "Favorites":
            iconName = focused ? "heart" : "heart-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          default:
            iconName = "home-outline";
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      // Styling for active and inactive tab colors
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      // Tab bar styling with custom height and borders
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      // Tab label styling
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
      },
    })}
  >
    {/* Home tab with nested stack navigator */}
    <Tab.Screen name="Home" component={HomeStackNavigator} />
    {/* Orders tab for order history */}
    <Tab.Screen name="Orders" component={OrdersScreen} />
    {/* Wallet tab for payment methods */}
    <Tab.Screen name="Wallet" component={WalletScreen} />
    {/* Favorites tab for saved restaurants */}
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    {/* Profile tab for user settings */}
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
  );
};

// Export MainNavigator as default
export default MainNavigator;
