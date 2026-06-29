import CategoryList from "@/components/home/CategoryList";
import HomeBanner from "@/components/home/HomeBanner";
import RestaurantCard from "@/components/home/RestaurantCard";
import RestaurantHorizontalList from "@/components/home/RestaurantHorizontalList";
import SearchBar from "@/components/home/SearchBar";
import { Category, Restaurant, restaurantService } from "@/services/restaurantService";
import { useTheme } from "@/theme";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { colors } = useTheme();
  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<Restaurant[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      const [catRes, featRes, recRes] = await Promise.all([
        restaurantService.getCategories(),
        restaurantService.getFeaturedRestaurants(),
        restaurantService.getAllRestaurants(),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (featRes.data) setFeaturedRestaurants(featRes.data);
      if (recRes.data) setRecommendedRestaurants(recRes.data.slice(0, 10));
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initLoad = async () => {
      setLoading(true);
      await loadAllData();
      if (isMounted) setLoading(false);
    };
    
    initLoad();
    
    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const res = await restaurantService.searchRestaurants(searchQuery);
        if (res.data) setSearchResults(res.data);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderMainContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <CategoryList categories={categories} loading={loading} />
          <RestaurantHorizontalList title="Popular Restaurants" restaurants={featuredRestaurants} loading={loading} />
          <RestaurantHorizontalList title="Most Recommended" restaurants={recommendedRestaurants} loading={loading} />
          <View style={{ height: 100 }} />
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        style={styles.container}
        data={searchQuery.length > 0 ? searchResults : []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            <HomeBanner />
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {searchQuery.length > 0 && (
              <View style={styles.searchResultsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Results</Text>
                {isSearching && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />}
              </View>
            )}
            {searchQuery.length === 0 && renderMainContent()}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.searchItemContainer}>
            <RestaurantCard restaurant={item} fullWidth />
          </View>
        )}
        ListEmptyComponent={
          searchQuery.length > 0 && !isSearching ? (
            <Text style={styles.emptyText}>No restaurants found for &quot;{searchQuery}&quot;</Text>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchItemContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

