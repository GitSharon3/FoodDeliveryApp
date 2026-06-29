import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ──────────────────────────────────────────────────────────
type Transaction = {
  id: string;
  type: "credit" | "debit";
  title: string;
  description: string;
  amount: number;
  date: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  iconColor: string;
};

// ─── Mock data (replace with real wallet service later) ─────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "credit",
    title: "Cashback Reward",
    description: "Order #NB-1001 cashback",
    amount: 25,
    date: "Today, 2:30 PM",
    icon: "gift-outline",
    iconColor: "#22C55E",
  },
  {
    id: "2",
    type: "debit",
    title: "Order Payment",
    description: "Paid for Order #NB-1002",
    amount: 120,
    date: "Yesterday, 7:15 PM",
    icon: "restaurant-outline",
    iconColor: "#F59E0B",
  },
  {
    id: "3",
    type: "credit",
    title: "Referral Bonus",
    description: "Friend joined via your link",
    amount: 50,
    date: "Jun 17, 11:00 AM",
    icon: "people-outline",
    iconColor: "#3B82F6",
  },
  {
    id: "4",
    type: "credit",
    title: "Promo Applied",
    description: "WELCOME50 coupon cashback",
    amount: 50,
    date: "Jun 16, 9:30 AM",
    icon: "pricetag-outline",
    iconColor: "#8B5CF6",
  },
  {
    id: "5",
    type: "debit",
    title: "Order Payment",
    description: "Paid for Order #NB-998",
    amount: 85,
    date: "Jun 15, 1:00 PM",
    icon: "restaurant-outline",
    iconColor: "#F59E0B",
  },
];

// ─── Quick Action ───────────────────────────────────────────────────
const QuickAction = ({
  icon,
  label,
  color,
  onPress,
  colors,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  color: string;
  onPress: () => void;
  colors: any;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
  </TouchableOpacity>
);

export default function WalletScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [balance] = useState(125.0);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, { borderBottomColor: colors.border }]}>
      <View style={[styles.transactionIcon, { backgroundColor: item.iconColor + "15" }]}>
        <Icon name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.transactionDesc, { color: colors.textSecondary }]}>{item.description}</Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{item.date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === "credit" ? "#22C55E" : "#EF4444" },
        ]}
      >
        {item.type === "credit" ? "+" : "-"} Rs {item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>

        {/* Balance Card */}
        <Animated.View style={[styles.balanceCard, { backgroundColor: colors.primary, opacity: fadeAnim }]}>
          <View style={styles.balanceCardGlow} />
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>Rs {balance.toFixed(2)}</Text>
            </View>
            <View style={styles.walletIconCircle}>
              <Icon name="wallet-outline" size={28} color="#fff" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceBottom}>
            <View style={styles.balanceStatItem}>
              <Icon name="trending-up-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceStat}>Rs 125 earned</Text>
            </View>
            <View style={styles.balanceStatItem}>
              <Icon name="trending-down-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceStat}>Rs 205 spent</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickAction
            icon="add-circle-outline"
            label="Top Up"
            color="#22C55E"
            colors={colors}
            onPress={() => Alert.alert("Top Up", "Top up feature coming soon!")}
          />
          <QuickAction
            icon="send-outline"
            label="Transfer"
            color="#3B82F6"
            colors={colors}
            onPress={() => Alert.alert("Transfer", "Transfer feature coming soon!")}
          />
          <QuickAction
            icon="qr-code-outline"
            label="Scan & Pay"
            color="#8B5CF6"
            colors={colors}
            onPress={() => Alert.alert("Scan", "Scan & Pay feature coming soon!")}
          />
          <QuickAction
            icon="pricetag-outline"
            label="Vouchers"
            color="#F59E0B"
            colors={colors}
            onPress={() => Alert.alert("Vouchers", "Vouchers feature coming soon!")}
          />
        </View>

        {/* Promo Banner */}
        <TouchableOpacity
          style={[styles.promoBanner, { backgroundColor: colors.card }]}
          activeOpacity={0.85}
          onPress={() => Alert.alert("Promo", "Invite friends to earn Rs 50!")}
        >
          <View style={[styles.promoIconCircle, { backgroundColor: colors.primary }]}>
            <Icon name="gift" size={24} color="#fff" />
          </View>
          <View style={styles.promoInfo}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Invite Friends & Earn</Text>
            <Text style={[styles.promoSubtitle, { color: colors.textSecondary }]}>Get Rs 50 for each friend who joins!</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          <View style={[styles.transactionsList, { backgroundColor: colors.card }]}>
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                {renderTransaction({ item: transaction })}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + "15" }]}>
              <Icon name="receipt-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Your transaction history will appear here
            </Text>
          </View>
        )}
      </ScrollView>
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

  // Header
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceCardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  walletIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 16,
  },
  balanceBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceStat: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  quickAction: {
    alignItems: "center",
    width: 72,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  // Promo Banner
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  promoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  promoInfo: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  promoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Transactions
  transactionsList: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "800",
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
