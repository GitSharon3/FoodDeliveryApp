import { Category, Restaurant, restaurantService } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EmptyState = ({ colors }: { colors: any }) => (
  <View style={styles.emptyContainer}>
    <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + "15" }]}>
      <Icon name="restaurant-outline" size={48} color={colors.primary} />
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Restaurants Found</Text>
    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
      No restaurants are available in this category right now. Check back later!
    </Text>
  </View>
);

export default function CategoryScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { categoryId } = route.params;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadData = useCallback(async () => {
    try {
      const [restRes, catRes] = await Promise.all([
        restaurantService.getRestaurantsByCategory(categoryId),
        restaurantService.getCategories(),
      ]);

      if (restRes.error) {
        Alert.alert("Error", "Failed to load restaurants");
      } else {
        setRestaurants(restRes.data || []);
      }

      // Find current category info for header
      if (catRes.data) {
        const currentCategory = catRes.data.find((c) => c.id === categoryId);
        if (currentCategory) setCategory(currentCategory);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [categoryId, fadeAnim]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderRestaurantCard = ({ item, index }: { item: Restaurant; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[styles.restaurantCard, { backgroundColor: colors.card }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item.id })}
      >
        {/* Image with overlay */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.restaurantImage} />

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingBadgeText}>{item.rating}</Text>
          </View>

          {/* Delivery time badge */}
          <View style={styles.deliveryTimeBadge}>
            <Icon name="time-outline" size={12} color="#fff" />
            <Text style={styles.deliveryTimeBadgeText}>{item.delivery_time}</Text>
          </View>

          {/* Free delivery badge */}
          {item.delivery_fee === 0 && (
            <View style={[styles.freeDeliveryBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.freeDeliveryText}>FREE DELIVERY</Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
            {item.restaurant_name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="star" size={13} color="#FFD700" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.rating} ({item.total_reviews})
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Icon name="bicycle-outline" size={13} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.delivery_fee === 0 ? "Free" : `$${item.delivery_fee}`}
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Icon name="cash-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>Min ${item.minimum_order}</Text>
            </View>
          </View>

          {item.category && (
            <View style={[styles.categoryTag, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.categoryTagText, { color: colors.primary }]}>{item.category.category_name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Icon name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {category?.category_name || "Restaurants"}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"}
            </Text>
          </View>

          {category?.image_url && (
            <Image source={{ uri: category.image_url }} style={styles.categoryHeaderImage} />
          )}
        </View>

        {/* Restaurant List */}
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurantCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState colors={colors} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  categoryHeaderImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Restaurant Card
  restaurantCard: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#eee",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  deliveryTimeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  deliveryTimeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  freeDeliveryBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeDeliveryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Info
  restaurantInfo: {
    padding: 14,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
