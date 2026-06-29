export type RootStackParamList = {
  Home: undefined;
  Cart: { userId: string };
  Checkout: undefined;
  CategoryRestaurants: { categoryId: string };
  RestaurantDetail: { restaurantId: string };
  MenuItemDetail: { itemId: string; restaurantId: string };
  Orders: undefined;
};
