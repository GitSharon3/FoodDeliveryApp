import { useAuth } from "@/context/AuthContext";
import { Order, ORDER_STATUS_COLORS, orderService } from "@/services/orderService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StatusBadge = ({ status }: { status: string }) => {
  const { colors } = useTheme();
  const color = ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || colors.secondary;
  const label = orderService.getStatusLabel(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "18" }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
};

type TabType = "active" | "completed";

const EmptyState = ({ user, activeTab, navigation, colors }: { user: any; activeTab: TabType; navigation: any; colors: any }) => (
  <View style={styles.emptyContainer}>
    <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + "15" }]}>
      <Icon
        name={!user ? "person-outline" : activeTab === "active" ? "receipt-outline" : "checkmark-done-outline"}
        size={48}
        color={colors.primary}
      />
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      {!user
        ? "Login Required"
        : activeTab === "active" ? "No Active Orders" : "No Past Orders"}
    </Text>
    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
      {!user
        ? "Please log in to view and track your orders."
        : activeTab === "active"
          ? "Your active orders will appear here"
          : "Your completed orders will show up here"}
    </Text>
    {!user && (
      <TouchableOpacity
        style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate("Auth" as never)}
      >
        <Text style={styles.loginBtnText}>Log In or Sign Up</Text>
      </TouchableOpacity>
    )}
  </View>
);

const OrdersScreen = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const fadeAnim = useState(new Animated.Value(0))[0];

  const navigation = useNavigation();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    const { data, error } = await orderService.getOrdersByUser(user.id);
    if (!error && data) setOrders(data);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await fetchOrders();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      };
      load();
    }, [fetchOrders, fadeAnim])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return !["delivered", "cancelled"].includes(order.status);
    }
    return ["delivered", "cancelled"].includes(order.status);
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────
  // Loading state removed as per request to avoid unnecessary full-screen loading


  // ─── Order Card ──────────────────────────────────────────────────
  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Restaurant header */}
      <View style={styles.cardHeader}>
        {item.restaurant_image ? (
          <Image source={{ uri: item.restaurant_image }} style={styles.restaurantThumb} />
        ) : (
          <View style={[styles.restaurantThumbPlaceholder, { backgroundColor: colors.primary + "15" }]}>
            <Icon name="restaurant-outline" size={20} color={colors.primary} />
          </View>
        )}
        <View style={styles.cardHeaderInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
            {item.restaurant_name || "Restaurant"}
          </Text>
          <Text style={[styles.orderNumber, { color: colors.textSecondary }]}>#{item.order_number}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Order details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(item.created_at)}
            {formatTime(item.created_at) ? ` • ${formatTime(item.created_at)}` : ""}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="card-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.payment_method || "Cash on delivery"}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>Rs {item.total_amount?.toFixed(2) || "0.00"}</Text>
        </View>

        {item.status === "delivered" && (
          <TouchableOpacity style={[styles.reorderBtn, { backgroundColor: colors.accent }]}>
            <Icon name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        )}

        {(item.status === "pending" || item.status === "confirmed") && (
          <TouchableOpacity style={[styles.trackBtn, { borderColor: colors.primary }]}>
            <Icon name="navigate-outline" size={16} color={colors.primary} />
            <Text style={[styles.trackText, { color: colors.primary }]}>Track</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
          <View style={[styles.orderCountBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.orderCountText}>{orders.length}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundLight }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && [styles.activeTab, { backgroundColor: colors.primary, shadowColor: colors.primary }]]}
            onPress={() => setActiveTab("active")}
          >
            <Icon
              name="time-outline"
              size={16}
              color={activeTab === "active" ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "active" && styles.activeTabText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && [styles.activeTab, { backgroundColor: colors.primary, shadowColor: colors.primary }]]}
            onPress={() => setActiveTab("completed")}
          >
            <Icon
              name="checkmark-done-outline"
              size={16}
              color={activeTab === "completed" ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "completed" && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState user={user} activeTab={activeTab} navigation={navigation} colors={colors} />}
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
};

export default OrdersScreen;

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
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  orderCountBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
  },
  orderCountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Order Card
  orderCard: {
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  restaurantThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
  },
  orderNumber: {
    fontSize: 12,
    marginTop: 2,
  },

  // Status badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    marginVertical: 12,
  },

  // Card body
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },

  // Card footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  reorderText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  trackText: {
    fontSize: 13,
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
    marginBottom: 24,
  },
  loginBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
