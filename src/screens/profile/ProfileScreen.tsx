import { useAuth } from "@/context/AuthContext";
import { restaurantService } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Menu Item ─────────────────────────────────────────────────────────
type MenuItemProps = {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  iconColor?: string;
  rightComponent?: React.ReactNode;
};

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  showArrow = true,
  iconColor,
  rightComponent,
}: MenuItemProps) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: iconColor + "15" }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightComponent || (showArrow && <Icon name="chevron-forward" size={18} color={colors.textSecondary} />)}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [favCount, setFavCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const getCount = async () => {
        const { data } = await restaurantService.getUserFavorites();
        if (isMounted && data) {
          setFavCount(data.length);
        }
      };
      if (user) {
        getCount();
      } else {
        setFavCount(0);
      }
      return () => {
        isMounted = false;
      };
    }, [user])
  );

  const displayName = user?.user_metadata?.full_name || user?.displayName || (user ? "Foodie" : "Guest User");
  const email = user?.email || (user ? "" : "Log in to view your profile");
  const avatarUrl = user?.user_metadata?.avatar_url || user?.photoURL;
  const initials = user ? displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) : "?";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert("Error", "Could not sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const requireAuth = (callback: () => void) => {
    if (!user) {
      navigation.navigate("Auth" as never);
    } else {
      callback();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
              {user ? (
                <Text style={styles.avatarInitials}>{initials}</Text>
              ) : (
                <Icon name="person" size={32} color="#fff" />
              )}
            </View>
          )}
          
          <View style={styles.profileInfo}>
            {!user ? (
              <TouchableOpacity onPress={() => navigation.navigate("Auth" as never)}>
                <Text style={[styles.displayName, { color: colors.primary }]}>Sign In / Log In</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>Tap here to access your account</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={[styles.displayName, { color: colors.text }]}>{displayName}</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
              </>
            )}
          </View>
          
          {user && (
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: colors.primary + "15" }]}
              onPress={() => navigation.navigate("EditProfile" as never)}
            >
              <Icon name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconCircle, { backgroundColor: "#F59E0B18" }]}>
              <Icon name="receipt-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{user ? "12" : "-"}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Orders</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("Favorites")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconCircle, { backgroundColor: "#EF444418" }]}>
              <Icon name="heart-outline" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{user ? favCount.toString() : "-"}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favorites</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconCircle, { backgroundColor: "#22C55E18" }]}>
              <Icon name="card-outline" size={20} color="#22C55E" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{user ? "Rs 0" : "-"}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wallet</Text>
          </View>
        </View>

        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
        <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
          <MenuItem
            icon="person-outline"
            label="Personal Information"
            subtitle="Name, phone, email"
            iconColor="#3B82F6"
            onPress={() => requireAuth(() => navigation.navigate("EditProfile" as never))}
          />
          <MenuItem
            icon="location-outline"
            label="Delivery Addresses"
            subtitle="Manage your addresses"
            iconColor="#F59E0B"
            onPress={() => requireAuth(() => Alert.alert("Addresses", "Address management coming soon!"))}
          />
          <MenuItem
            icon="card-outline"
            label="Payment Methods"
            subtitle="Cards, wallets, UPI"
            iconColor="#22C55E"
            onPress={() => requireAuth(() => Alert.alert("Payment", "Payment methods coming soon!"))}
          />
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
        <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
            iconColor="#8B5CF6"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E2E8F0", true: colors.primary + "60" }}
                thumbColor={notificationsEnabled ? colors.primary : "#CBD5E1"}
              />
            }
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            subtitle="English"
            iconColor="#06B6D4"
            onPress={() => Alert.alert("Language", "Language settings coming soon!")}
          />
          <MenuItem
            icon="moon-outline"
            label="Appearance"
            subtitle={isDark ? "Dark mode" : "Light mode"}
            iconColor="#1E293B"
            showArrow={false}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#E2E8F0", true: colors.primary + "60" }}
                thumbColor={isDark ? colors.primary : "#CBD5E1"}
              />
            }
          />
        </View>

        {/* Support Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
        <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
          <MenuItem
            icon="help-circle-outline"
            label="Help & FAQ"
            iconColor="#F97316"
            onPress={() => Alert.alert("Help", "Help center coming soon!")}
          />
          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Contact Support"
            iconColor="#14B8A6"
            onPress={() => Alert.alert("Support", "Support chat coming soon!")}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Privacy"
            iconColor="#64748B"
            onPress={() => Alert.alert("Legal", "Terms & privacy coming soon!")}
          />
        </View>

        {/* Sign Out */}
        {user && (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Icon name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* App version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>NaanBites v1.0.0</Text>
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

  // Profile Card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  displayName: {
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  loginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Sections
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  menuSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Sign Out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 20,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
});
