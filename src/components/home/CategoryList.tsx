import { RootStackParamList } from "@/navigation/types";
import { Category } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  categories: Category[];
  loading?: boolean;
}

export default function CategoryList({ categories, loading }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!categories || categories.length === 0) return null;
  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("CategoryRestaurants", { categoryId: item.id })}
          >
            <View style={[styles.categoryImageContainer, { backgroundColor: colors.card }]}>
              <Image source={{ uri: item.image_url || "https://via.placeholder.com/50" }} style={styles.categoryImage} />
            </View>
            <Text style={[styles.categoryName, { color: colors.textSecondary }]} numberOfLines={1}>{item.category_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  categoriesContainer: { paddingHorizontal: 20, gap: 12 },
  categoryImageContainer: { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 8, overflow: "hidden" },
  categoryImage: { width: "100%", height: "100%", borderRadius: 27 },
  categoryCard: { alignItems: "center", width: 74 },
  categoryName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});
