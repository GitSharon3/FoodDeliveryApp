import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.searchBarWrapper}>
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <Icon name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name & restaurant"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.card }]}>
        <Icon name="map-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: -26, marginBottom: 24, gap: 12 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 52, borderRadius: 26, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, height: "100%" },
  mapBtn: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
});
