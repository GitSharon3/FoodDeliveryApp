import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/restaurantService";
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
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { items: cartItems, isLoading: loading, subtotal } = useSelector((state: RootState) => state.cart);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on delivery");
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Stripe Modal & inputs
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Retrieve actual restaurant delivery fee or fallback
  const deliveryFee = cartItems[0]?.restaurant?.delivery_fee ?? 5;
  const total = subtotal + deliveryFee;

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      dispatch(clearCartState());
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
    }
  }, [user, dispatch]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Handle animation mount
  useEffect(() => {
    if (!loading && cartItems.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, cartItems, fadeAnim]);

  const proceedWithOrder = async (method: string) => {
    setPlacingOrder(true);
    const restaurantId = cartItems[0]?.restaurant_id;

    const { data, error } = await orderService.createOrder({
      user_id: user?.id || "dummy_user",
      restaurant_id: restaurantId,
      address_id: null,
      total_amount: total,
      delivery_fee: deliveryFee,
      payment_method: method,
      status: "pending",
    });

    setPlacingOrder(false);

    if (error || !data) {
      console.error("Order creation error:", error);
      Alert.alert("Error", "Could not place your order. Please try again.");
      return;
    }

    await cartService.clearCart();
    dispatch(clearCartState());
    setOrderSuccess(true);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigation.navigate("Auth" as never);
      return;
    }
    if (cartItems.length === 0) return;

    if (paymentMethod === "Stripe") {
      setShowStripeModal(true);
    } else {
      await proceedWithOrder("Cash on Delivery");
    }
  };

  const handleStripePayment = () => {
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      Alert.alert("Validation Error", "Please fill in all card details.");
      return;
    }
    setProcessingPayment(true);
    // Simulate secure network call to Stripe backend
    setTimeout(async () => {
      setProcessingPayment(false);
      setShowStripeModal(false);
      // Clean inputs
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardName("");
      await proceedWithOrder("Stripe (Credit Card)");
    }, 1500);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Preparing checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Beautiful full-screen success screen
  if (orderSuccess) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: "#fff" }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Icon name="checkmark-done" size={60} color="#fff" />
            </View>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Order Placed Successfully!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your order has been recorded and is now being processed by the restaurant.
          </Text>

          <View style={styles.successDetailsCard}>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Amount Paid:</Text>
              <Text style={[styles.successDetailVal, { color: colors.text }]}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Payment Option:</Text>
              <Text style={[styles.successDetailVal, { color: colors.text }]}>{paymentMethod}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Delivery Duration:</Text>
              <Text style={[styles.successDetailVal, { color: colors.text }]}>25 - 35 mins</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.successBtnPrimary, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => {
              navigation.navigate("Main" as never);
            }}
          >
            <Text style={styles.successBtnTextPrimary}>Track Your Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.successBtnSecondary}
            onPress={() => {
              navigation.navigate("Main" as never);
            }}
          >
            <Text style={[styles.successBtnTextSecondary, { color: colors.textSecondary }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backHomeBtn, { backgroundColor: colors.primary }]}>
             <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Delivery Address */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Deliver To</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => Alert.alert("Address", "Address selection coming soon")}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}>
                <Icon name="location-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Current Location</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Times Square, New York</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Payment Method */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={[styles.card, paymentMethod === "Cash on delivery" && [styles.selectedCard, { borderColor: colors.primary, backgroundColor: colors.primary + "05" }]]}
                onPress={() => setPaymentMethod("Cash on delivery")}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: "#22C55E15" }]}>
                  <Icon name="cash-outline" size={24} color="#22C55E" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Cash on Delivery</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Pay when you receive the order</Text>
                </View>
                <View style={[styles.radioOuter, { borderColor: colors.textSecondary }, paymentMethod === "Cash on delivery" && { borderColor: colors.primary }]}>
                  {paymentMethod === "Cash on delivery" && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, paymentMethod === "Stripe" && [styles.selectedCard, { borderColor: colors.primary, backgroundColor: colors.primary + "05" }]]}
                onPress={() => setPaymentMethod("Stripe")}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: "#6366F115" }]}>
                  <Icon name="card-outline" size={24} color="#6366F1" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Credit Card (Stripe)</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Pay securely via Stripe</Text>
                </View>
                <View style={[styles.radioOuter, { borderColor: colors.textSecondary }, paymentMethod === "Stripe" && { borderColor: colors.primary }]}>
                  {paymentMethod === "Stripe" && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
            <View style={styles.summaryCard}>
              {cartItems.map((item, index) => (
                <View key={item.id} style={[styles.summaryItem, index === cartItems.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={[styles.summaryQty, { color: colors.primary }]}>{item.quantity}x</Text>
                  <Text style={[styles.summaryName, { color: colors.text }]} numberOfLines={1}>{item.menu_item?.name}</Text>
                  <Text style={[styles.summaryPrice, { color: colors.text }]}>${item.total_price.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Receipt */}
            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.receiptValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                <Text style={[styles.receiptValue, { color: colors.text }]}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptTotalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.receiptTotalValue, { color: colors.accent }]}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.placeOrderBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }, placingOrder && { opacity: 0.7 }]}
            onPress={handlePlaceOrder}
            disabled={placingOrder}
            activeOpacity={0.85}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <View style={styles.totalChip}>
                  <Text style={styles.totalChipText}>${total.toFixed(2)}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Stripe simulated credit card modal */}
        <Modal
          visible={showStripeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStripeModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.stripeSheet}>
              {/* Sheet header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Stripe Secure Checkout</Text>
                <TouchableOpacity onPress={() => setShowStripeModal(false)} style={styles.closeBtn}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Decorative credit card card preview */}
              <View style={styles.cardPreview}>
                <Icon name="logo-bitcoin" size={28} color="#fff" style={{ position: "absolute", right: 20, top: 20, opacity: 0.2 }} />
                <Text style={styles.cardPreviewBrand}>VISA</Text>
                <Text style={styles.cardPreviewNumber}>
                  {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                </Text>
                <View style={styles.cardPreviewRow}>
                  <View>
                    <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardPreviewText}>{cardName || "NAME ON CARD"}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                    <Text style={styles.cardPreviewText}>{cardExpiry || "MM/YY"}</Text>
                  </View>
                </View>
              </View>

              {/* Input forms */}
              <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Name on Card</Text>
                <TextInput
                  placeholder="e.g. John Doe"
                  value={cardName}
                  onChangeText={setCardName}
                  style={[styles.textInput, { color: colors.text }]}
                  placeholderTextColor="#A0AEC0"
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
                <TextInput
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChangeText={(val) => setCardNumber(val.replace(/\D/g, "").slice(0, 16))}
                  keyboardType="numeric"
                  style={[styles.textInput, { color: colors.text }]}
                  placeholderTextColor="#A0AEC0"
                />

                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date</Text>
                    <TextInput
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChangeText={(val) => {
                        const sanitized = val.replace(/\D/g, "");
                        if (sanitized.length <= 2) {
                          setCardExpiry(sanitized);
                        } else {
                          setCardExpiry(sanitized.slice(0, 2) + "/" + sanitized.slice(2, 4));
                        }
                      }}
                      keyboardType="numeric"
                      style={[styles.textInput, { color: colors.text }]}
                      placeholderTextColor="#A0AEC0"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>CVC / CVV</Text>
                    <TextInput
                      placeholder="123"
                      value={cardCvc}
                      onChangeText={(val) => setCardCvc(val.replace(/\D/g, "").slice(0, 4))}
                      keyboardType="numeric"
                      secureTextEntry
                      style={[styles.textInput, { color: colors.text }]}
                      placeholderTextColor="#A0AEC0"
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.stripePayBtn, processingPayment && { opacity: 0.7 }]}
                onPress={handleStripePayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.stripePayBtnText}>Pay & Confirm Order (${total.toFixed(2)})</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 20,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backHomeText: {
    color: "#fff",
    fontWeight: "600",
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
    backgroundColor: "#fff",
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 12,
  },

  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "transparent",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  // Summary
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  summaryQty: {
    fontSize: 14,
    fontWeight: "700",
    width: 30,
  },
  summaryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Receipt
  receiptCard: {
    backgroundColor: "#F8FAFC",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 15,
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  receiptDivider: {
    height: 1,
    backgroundColor: "#CBD5E1",
    marginVertical: 12,
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: "800",
  },
  receiptTotalValue: {
    fontSize: 22,
    fontWeight: "800",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 12,
  },
  totalChip: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalChipText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  // Stripe Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  stripeSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  cardPreview: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    height: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  cardPreviewBrand: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    fontStyle: "italic",
  },
  cardPreviewNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
    marginVertical: 10,
  },
  cardPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPreviewLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "600",
  },
  cardPreviewText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  formContainer: {
    gap: 12,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  stripePayBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stripePayBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Success Screen
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successIconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  successDetailsCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 40,
    gap: 12,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  successDetailLabel: {
    fontSize: 14,
  },
  successDetailVal: {
    fontWeight: "700",
    fontSize: 14,
  },
  successBtnPrimary: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  successBtnTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successBtnSecondary: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  successBtnTextSecondary: {
    fontSize: 16,
    fontWeight: "700",
  },
});

