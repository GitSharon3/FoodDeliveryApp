import { useAuth } from "@/context/AuthContext";
import { CartItem, cartService } from "@/services/restaurantService";
import { clearCartState, setCartItems, setLoading } from "@/store/slices/cartSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function CartScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading: loading, subtotal } = useSelector((state: RootState) => state.cart);

  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadCartItems = useCallback(async () => {
    if (!user) {
      dispatch(clearCartState());
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      return;
    }
    dispatch(setLoading(true));
    try {
      const { data, error } = await cartService.getCartItems();
      if (error) {
        Alert.alert("Error", "Failed to load cart items");
      } else {
        dispatch(setCartItems(data || []));
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      dispatch(setLoading(false));
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [user, fadeAnim, dispatch]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const clearCart = async () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Clear",
        style: "destructive",
        onPress: async () => {
          const { error } = await cartService.clearCart();
          if (error) {
            Alert.alert("Error", "Failed to clear cart");
          } else {
            dispatch(clearCartState());
          }
        },
      },
    ]);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await cartService.removeFromCart(itemId);
    if (error) {
      Alert.alert("Error", "Failed to remove item");
    } else {
      dispatch(setCartItems(items.filter((i) => i.id !== itemId)));
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Optimistic update
    const updatedItems = items.map(i => i.id === item.id ? { ...i, quantity: newQuantity, total_price: i.price * newQuantity } : i);
    dispatch(setCartItems(updatedItems));

    const { error } = await cartService.updateCartItem(item.id, newQuantity);
    if (error) {
       Alert.alert("Error", "Failed to update quantity");
       // Revert optimistic update
       loadCartItems();
    }
  }

  const renderItem = ({ item, index }: { item: CartItem, index: number }) => (
    <Animated.View
      style={[
        styles.cartCard,
        { backgroundColor: colors.card },
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20 + index * 10, 0],
              }),
            },
          ],
        },
      ]}
    >
          <Image
            source={{ uri: item.menu_item?.image_url || item.restaurant?.image_url }}
            style={[styles.itemImage, { backgroundColor: colors.backgroundLight }]}
          />
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.menu_item?.name}</Text>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
            <Icon name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.restaurant?.restaurant_name}
        </Text>
        
        {item.note ? (
          <Text style={[styles.itemNote, { color: colors.primary }]} numberOfLines={1}>Note: {item.note}</Text>
        ) : null}

        <View style={styles.itemFooter}>
          <Text style={[styles.itemPrice, { color: colors.accent }]}>${item.total_price.toFixed(2)}</Text>
          
          <View style={[styles.qtyContainer, { backgroundColor: colors.backgroundLight }]}>
            <TouchableOpacity 
              style={[styles.qtyBtn, { backgroundColor: colors.card }, item.quantity <= 1 && styles.qtyBtnDisabled]} 
              onPress={() => updateQuantity(item, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Icon name="remove" size={16} color={item.quantity <= 1 ? colors.textSecondary : colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity 
              style={[styles.qtyBtn, { backgroundColor: colors.card }]} 
              onPress={() => updateQuantity(item, item.quantity + 1)}
            >
              <Icon name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>

          {items.length > 0 ? (
            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          ) : (
             <View style={{ width: 44 }} /> // Spacer for alignment
          )}
        </View>

        {/* Cart Items */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + "15" }]}>
                <Icon name={!user ? "person-circle-outline" : "cart-outline"} size={60} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{!user ? "Login Required" : "Your cart is empty"}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {!user ? "Please login or create an account to view and add items to your cart." : "Looks like you haven't added any food yet."}
              </Text>
              <TouchableOpacity 
                style={[styles.browseBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={() => {
                  if (!user) {
                    navigation.navigate("Auth" as never);
                  } else {
                    navigation.navigate("Main" as never);
                  }
                }}
              >
                <Text style={styles.browseBtnText}>{!user ? "Login / Sign Up" : "Browse Restaurants"}</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Bottom Bar */}
        {items.length > 0 && (
          <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
              onPress={() => {
                if (!user) {
                  navigation.navigate("Auth" as never);
                } else {
                  navigation.navigate("Checkout" as never);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  clearBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Cart Card
  cartCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  itemNote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "800",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnDisabled: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 12,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
