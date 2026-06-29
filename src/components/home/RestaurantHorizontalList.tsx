import { Restaurant } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RestaurantCard from "./RestaurantCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  title: string;
  restaurants: Restaurant[];
  loading?: boolean;
}

export default function RestaurantHorizontalList({ title, restaurants, loading }: Props) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <TouchableOpacity>
          <Icon name="arrow-forward-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={restaurants}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalListContainer}
        snapToInterval={SCREEN_WIDTH * 0.75 + 16}
        decelerationRate="fast"
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  horizontalListContainer: { paddingHorizontal: 20 },
  loadingContainer: { padding: 20, alignItems: "center", justifyContent: "center" },
});
