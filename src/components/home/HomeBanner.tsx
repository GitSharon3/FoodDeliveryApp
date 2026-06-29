import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TOP_BG_IMG = "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

export default function HomeBanner() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleLocationPress = () => {
    Alert.alert("Location", "Location picker coming soon!");
  };

  return (
    <ImageBackground
      source={{ uri: TOP_BG_IMG }}
      style={styles.topSection}
      imageStyle={styles.topSectionImage}
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />

      <SafeAreaView edges={["top"]} style={styles.safeAreaHeader}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtnDark}>
            <Icon name="menu-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.locationLabel}>Delivery location</Text>
            <TouchableOpacity style={styles.locationRow} activeOpacity={0.7} onPress={handleLocationPress}>
              <Icon name="location" size={16} color={colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>351 Maison Street, NY</Text>
              <Icon name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={[styles.headerIcons, { gap: 10 }]}>
            <TouchableOpacity
              style={[styles.iconBtnDark, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => navigation.navigate("Notifications" as never)}
            >
              <Icon name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtnDark, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("Cart" as never)}
            >
              <Icon name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.promoContainer}>
          <View style={styles.promoRow}>
            <Text style={[styles.promoDiscount, { color: colors.primary }]}>15%</Text>
            <Text style={styles.promoExtra}> EXTRA{"\n"} DISCOUNT</Text>
          </View>
          <Text style={styles.promoSubtitle}>Get your first order{"\n"}delivery free!</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  topSection: { width: "100%", minHeight: 320, paddingBottom: 40, position: "relative" },
  topSectionImage: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.6)", borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  safeAreaHeader: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  iconBtnDark: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerCenter: { alignItems: "center" },
  locationLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { fontSize: 15, fontWeight: "700", color: "#fff", marginLeft: 4 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  badgeDot: { position: "absolute", top: 10, right: 12, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)" },
  promoContainer: { alignItems: "center", marginTop: 20 },
  promoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  promoDiscount: { fontSize: 48, fontWeight: "900" },
  promoExtra: { fontSize: 18, fontWeight: "800", color: "#fff", marginLeft: 8, lineHeight: 22 },
  promoSubtitle: { fontSize: 18, color: "#fff", textAlign: "center", marginTop: 10, lineHeight: 24, fontWeight: "500" },
});
