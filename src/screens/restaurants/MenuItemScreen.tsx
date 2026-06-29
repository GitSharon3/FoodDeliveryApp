import { useAuth } from "@/context/AuthContext";
import {
    cartService,
    MenuItem,
    restaurantService,
} from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MenuItemScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { itemId, restaurantId } = route.params;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const { user } = useAuth();

  const loadMenuItem = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await restaurantService.getMenuItemById(itemId);
      if (error) throw error;
      setItem(data);
    } catch (err) {
      console.error("Error fetching menu item:", err);
      Alert.alert("Error", "Could not load menu item.");
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [itemId, fadeAnim, slideAnim]);

  useEffect(() => {
    loadMenuItem();
  }, [loadMenuItem]);

  const handleAddToCart = async () => {
    if (!user) {
      navigation.navigate("Auth" as never);
      return;
    }
    if (!item) return;

    setAdding(true);
    try {
      const res: any = await cartService.addToCart(
        item.id,
        restaurantId,
        quantity,
        note,
      );
      const error = res?.error;

      if (error) {
        if (error === "DIFFERENT_RESTAURANT") {
          Alert.alert(
            "Different Restaurant",
            "Your cart contains items from another restaurant. Clear cart and add this item?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear & Add",
                style: "destructive",
                onPress: async () => {
                  try {
                    setAdding(true);
                    const clearRes: any = await cartService.clearCart();
                    if (clearRes?.error) {
                      Alert.alert("Error", "Failed to clear cart. Try again.");
                      return;
                    }
                    const retryRes: any = await cartService.addToCart(
                      item.id,
                      restaurantId,
                      quantity,
                      note,
                    );
                    if (retryRes?.error) {
                      Alert.alert("Error", "Could not add item after clearing cart.");
                      return;
                    }
                    Alert.alert("Added to Cart", `${quantity}x ${item.name} added!`);
                  } catch {
                    Alert.alert("Error", "Something went wrong.");
                  } finally {
                    setAdding(false);
                  }
                },
              },
            ],
          );
          return;
        }

        console.error("Add to cart error:", error);
        Alert.alert("Error", "Could not add item to cart. Please try again.");
        return;
      }

      Alert.alert("Added to Cart", `${quantity}x ${item.name} added!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      Alert.alert("Error", "Could not add item to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading || !item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading menu item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image_url }} style={styles.heroImage} />

          {/* Gradient overlay */}
          <View style={styles.imageGradient} />

          {/* Navigation buttons */}
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topBtn, styles.topRightBtn]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Icon
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : "#fff"}
            />
          </TouchableOpacity>

          {/* Price badge on image */}
          <View style={[styles.priceBadge, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={styles.priceBadgeText}>${item.price}</Text>
          </View>
        </View>

        {/* Info Section */}
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title and tags */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
            {item.is_popular && (
              <View style={styles.popularBadge}>
                <Icon name="flame" size={12} color="#F97316" />
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>

          {/* Tags row */}
          <View style={styles.tagsRow}>
            {item.is_vegetarian && (
              <View style={[styles.tag, { backgroundColor: "#22C55E18" }]}>
                <Icon name="leaf" size={12} color="#22C55E" />
                <Text style={[styles.tagText, { color: "#22C55E" }]}>Vegetarian</Text>
              </View>
            )}
            {item.category && (
              <View style={[styles.tag, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {item.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Quantity selector */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Quantity</Text>
          <View style={[styles.quantityContainer, { backgroundColor: colors.backgroundLight }]}>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.backgroundLight }, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={adding || quantity <= 1}
            >
              <Icon
                name="remove"
                size={20}
                color={quantity <= 1 ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>

            <View style={[styles.qtyDisplay, { backgroundColor: colors.backgroundLight }]}>
              <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.backgroundLight }]}
              onPress={() => setQuantity(quantity + 1)}
              disabled={adding}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Special Instructions</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., no onions, extra spicy..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            editable={!adding}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.goToCartBtn, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate("Cart" as never)}
        >
          <Icon name="cart-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }, adding && { opacity: 0.7 }]}
          onPress={handleAddToCart}
          disabled={adding}
          activeOpacity={0.85}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="bag-add-outline" size={20} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
              <View style={styles.priceChip}>
                <Text style={styles.priceChipText}>${totalPrice}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
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

  // Hero Image
  imageWrapper: {
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: "#eee",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
  topBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  topRightBtn: {
    left: undefined,
    right: 20,
  },
  priceBadge: {
    position: "absolute",
    bottom: -16,
    right: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  priceBadgeText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  // Info section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    flex: 1,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F97316",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },

  divider: {
    height: 1,
    marginVertical: 20,
  },

  // Quantity
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 14,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyDisplay: {
    width: 50,
    alignItems: "center",
  },
  qtyText: {
    fontSize: 20,
    fontWeight: "800",
  },

  // Note
  noteInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    marginBottom: 20,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    gap: 12,
  },
  goToCartBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  priceChip: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
