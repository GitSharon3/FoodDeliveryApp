import { RootStackParamList } from "@/navigation/types";
import { Restaurant, restaurantService } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  restaurant: Restaurant;
  fullWidth?: boolean;
}

export default function RestaurantCard({ restaurant: rest, fullWidth }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkFav = async () => {
      const { data } = await restaurantService.isFavorite(rest.id);
      if (isMounted && data !== null) {
        setIsFav(data);
      }
    };
    checkFav();
    return () => {
      isMounted = false;
    };
  }, [rest.id]);

  const handleFavoritePress = async () => {
    try {
      if (isFav) {
        await restaurantService.removeFromFavorites(rest.id);
        setIsFav(false);
      } else {
        await restaurantService.addToFavorites(rest.id);
        setIsFav(true);
      }
    } catch {
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.restaurantCard, { backgroundColor: colors.card }, fullWidth && styles.fullWidthCard]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: rest.id })}
    >
      <View style={styles.restaurantImageWrapper}>
        <Image source={{ uri: rest.image_url || "https://via.placeholder.com/150" }} style={styles.restaurantCardImage} />

        <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
          <Icon name="pricetag" size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.discountText}>15% off</Text>
        </View>
        <TouchableOpacity style={styles.heartBadge} onPress={handleFavoritePress}>
          <Icon name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#EF4444" : "#fff"} />
        </TouchableOpacity>
      </View>

      <View style={styles.restaurantCardInfo}>
        <View style={styles.restTopRow}>
          <Text style={[styles.restaurantCardName, { color: colors.text }]} numberOfLines={1}>{rest.restaurant_name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{rest.rating || "New"} <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({rest.total_reviews || 0})</Text></Text>
          </View>
        </View>

        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          $$ • {rest.category?.category_name || "Restaurant"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  restaurantCard: { width: SCREEN_WIDTH * 0.75, borderRadius: 20, marginRight: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  fullWidthCard: { width: "100%", marginRight: 0, marginBottom: 16 },
  restaurantImageWrapper: { position: "relative" },
  restaurantCardImage: { width: "100%", height: 160, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  discountBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  discountText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  heartBadge: { position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  restaurantCardInfo: { padding: 16 },
  restTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  restaurantCardName: { flex: 1, fontSize: 18, fontWeight: "800", marginRight: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, fontWeight: "700", marginLeft: 4 },
  reviewsText: { fontWeight: "500" },
  metaText: { fontSize: 14, fontWeight: "500" },
});
