import { MenuItem, Restaurant, restaurantService } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import {
    Ionicons as Icon,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RestaurantScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { restaurantId } = route.params;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const loadRestaurant = useCallback(async () => {
    try {
      const [restRes, favRes] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        restaurantService.isFavorite(restaurantId),
      ]);

      if (restRes.error) {
        Alert.alert("Error", "Failed to load restaurant");
      } else {
        setRestaurant(restRes.data || null);
      }

      setIsFavorite(favRes.data || false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
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
  }, [restaurantId, fadeAnim, slideAnim]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await restaurantService.removeFromFavorites(restaurantId);
      } else {
        await restaurantService.addToFavorites(restaurantId);
      }
      setIsFavorite(!isFavorite);
    } catch {
      Alert.alert("Error", "Could not update favorites");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading restaurant...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + "15" }]}>
          <Icon name="restaurant-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Restaurant Not Found</Text>
        <TouchableOpacity
          style={[styles.goBackBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group menu items by category
  const menuItems = restaurant.menu_items || [];
  const menuCategories = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categoryKeys = Object.keys(menuCategories);

  // Render a single menu item card
  const renderMenuItem = (menuItem: MenuItem) => (
    <TouchableOpacity
      key={menuItem.id}
      style={[styles.menuItemCard, { backgroundColor: colors.card }]}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("MenuItemDetail", {
          itemId: menuItem.id,
          restaurantId: restaurant.id,
        })
      }
    >
      <View style={styles.menuItemInfo}>
        <View style={styles.menuItemHeader}>
          <Text style={[styles.menuItemName, { color: colors.text }]} numberOfLines={2}>
            {menuItem.name}
          </Text>
          {menuItem.is_popular && (
            <View style={[styles.popularTag, { backgroundColor: colors.primary + "20" }]}>
              <Icon name="flame" size={10} color="#F97316" />
            </View>
          )}
        </View>

        {menuItem.description ? (
          <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {menuItem.description}
          </Text>
        ) : null}

        <View style={styles.menuItemFooter}>
          <Text style={[styles.menuItemPrice, { color: colors.accent }]}>${menuItem.price}</Text>
          <View style={styles.menuItemTags}>
            {menuItem.is_vegetarian && (
              <View style={[styles.vegTag, { backgroundColor: colors.accent + "20" }]}>
                <Icon name="leaf" size={10} color="#22C55E" />
              </View>
            )}
          </View>
        </View>
      </View>

      {menuItem.image_url ? (
        <View style={styles.menuItemImageContainer}>
          <Image
            source={{ uri: menuItem.image_url }}
            style={[styles.menuItemImage, { backgroundColor: colors.backgroundLight }]}
          />
          <TouchableOpacity
            style={[styles.addBtnSmall, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() =>
              navigation.navigate("MenuItemDetail", {
                itemId: menuItem.id,
                restaurantId: restaurant.id,
              })
            }
          >
            <Icon name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addBtnNoImage, { borderColor: colors.primary }]}
          onPress={() =>
            navigation.navigate("MenuItemDetail", {
              itemId: menuItem.id,
              restaurantId: restaurant.id,
            })
          }
        >
          <Icon name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const sections = categoryKeys.map((cat) => ({
    title: cat,
    data: menuCategories[cat],
  }));

  const renderHeader = () => (
    <>
      {/* Hero Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: restaurant.image_url }} style={styles.heroImage} />

        {/* Navigation */}
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.topRightBtns}>
          <TouchableOpacity style={styles.topBtn} onPress={toggleFavorite}>
            <Icon
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topBtn, { marginLeft: 8 }]}>
            <Icon name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusOverlay}>
          <View style={[styles.openBadge, { backgroundColor: restaurant.is_open ? "#22C55E" : "#EF4444" }]}>
            <Text style={[styles.openBadgeText, { color: colors.text }]}>
              {restaurant.is_open ? "Open Now" : "Closed"}
            </Text>
          </View>
        </View>
      </View>

      {/* Restaurant Info */}
      <Animated.View
        style={[
          styles.infoSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{restaurant.restaurant_name}</Text>

        {/* Category tag */}
        {restaurant.category && (
          <View style={styles.categoryTagRow}>
            <View style={[styles.categoryTag, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                {restaurant.category.category_name}
              </Text>
            </View>
          </View>
        )}

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          <View style={styles.statCard}>
            <Icon name="star" size={18} color="#FFD700" />
            <Text style={[styles.statValue, { color: colors.text }]}>{restaurant.rating}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{restaurant.total_reviews} reviews</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCard}>
            <Icon name="time-outline" size={18} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{restaurant.delivery_time}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Delivery</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCard}>
            <Icon name="bicycle-outline" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {restaurant.delivery_fee === 0 ? "Free" : `$${restaurant.delivery_fee}`}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fee</Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconCircle, { backgroundColor: colors.backgroundLight }]}>
            <Icon name="location-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={2}>{restaurant.address}</Text>
        </View>

        {/* Minimum order */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconCircle, { backgroundColor: colors.backgroundLight }]}>
            <Icon name="cash-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Minimum order: ${restaurant.minimum_order}</Text>
        </View>

        {/* Offers banner */}
        <TouchableOpacity style={[styles.offerBanner, { backgroundColor: colors.accent }]} activeOpacity={0.7}>
          <MaterialCommunityIcons name="sale" size={22} color={colors.text} />
          <View style={styles.offerBannerInfo}>
            <Text style={[styles.offerBannerTitle, { color: colors.text }]}>Special Offers Available!</Text>
            <Text style={[styles.offerBannerSubtitle, { color: colors.textSecondary }]}>Tap to view deals</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Menu Header */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.menuHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
          <Text style={[styles.menuCount, { color: colors.textSecondary }]}>
            {menuItems.length} {menuItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </Animated.View>
    </>
  );

  return (
    <SectionList
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      bounces={true}
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <View style={{ paddingHorizontal: 20 }}>{renderMenuItem(item)}</View>}
      renderSectionHeader={({ section: { title } }) => (
        <View style={[styles.menuCategorySection, { backgroundColor: colors.background }]}>
          <Text style={[styles.menuCategoryTitle, { color: colors.text }]}>{title}</Text>
        </View>
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={styles.noMenuContainer}>
          <Icon name="fast-food-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.noMenuText, { color: colors.textSecondary }]}>No menu items available</Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: 30 }} />}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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

  // Empty state
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
    marginBottom: 16,
  },
  goBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goBackText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Hero Image
  imageWrapper: {
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 240,
    backgroundColor: "#eee",
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
  topRightBtns: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
  },
  statusOverlay: {
    position: "absolute",
    bottom: 14,
    left: 20,
  },
  openBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Info section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  categoryTagRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Offer banner
  offerBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  offerBannerInfo: {
    flex: 1,
  },
  offerBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  offerBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Menu section
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  menuCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  menuCategorySection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  menuCategoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Menu item card
  menuItemCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  popularTag: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "800",
  },
  menuItemTags: {
    flexDirection: "row",
    gap: 4,
  },
  vegTag: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemImageContainer: {
    position: "relative",
  },
  menuItemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  addBtnSmall: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnNoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  // No menu
  noMenuContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  noMenuText: {
    fontSize: 15,
  },
});
