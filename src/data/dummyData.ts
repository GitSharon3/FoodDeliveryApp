// src/data/dummyData.ts
import { Category, MenuItem, Restaurant } from "@/services/restaurantService";

export const dummyCategories: Category[] = [
  {
    id: "c1",
    category_name: "Burger",
    category_description: "Delicious burgers",
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c2",
    category_name: "Pizza",
    category_description: "Hot and fresh pizzas",
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c3",
    category_name: "Sushi",
    category_description: "Fresh sushi and rolls",
    image_url:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c4",
    category_name: "Desserts",
    category_description: "Sweet treats",
    image_url:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c5",
    category_name: "Drinks",
    category_description: "Refreshing beverages",
    image_url:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c6",
    category_name: "Indian",
    category_description: "Spiced classics & curries",
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=60"
  },
  {
    id: "c7",
    category_name: "Chinese",
    category_description: "Wok-fired stir fry & noodles",
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c8",
    category_name: "Tacos",
    category_description: "Crunchy & zesty tacos",
    image_url:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c9",
    category_name: "Healthy",
    category_description: "Salads, bowls & protein plates",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "c10",
    category_name: "Breakfast",
    category_description: "Morning favorites",
    image_url:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=60",
  },
];

// Dummy restaurants with various cuisines
export const dummyRestaurants: Restaurant[] = [
  {
    id: "r1",
    restaurant_name: "Burger Joint",
    address: "123 Burger St, NY",
    phone: "123-456-7890",
    email: "contact@burgerjoint.com",
    category_id: "c1",
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    total_reviews: 1240,
    delivery_fee: 2.99,
    minimum_order: 10,
    delivery_time: "20-30 min",
    is_open: true,
    is_featured: true,
  },
  {
    id: "r2",
    restaurant_name: "Pizza Palace",
    address: "456 Pizza Ave, NY",
    phone: "123-456-7891",
    email: "contact@pizzapalace.com",
    category_id: "c2",
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    total_reviews: 850,
    delivery_fee: 1.99,
    minimum_order: 15,
    delivery_time: "30-40 min",
    is_open: true,
    is_featured: true,
  },
  {
    id: "r3",
    restaurant_name: "Sushi Master",
    address: "789 Sushi Blvd, NY",
    phone: "123-456-7892",
    email: "contact@sushimaster.com",
    category_id: "c3",
    image_url:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    total_reviews: 2100,
    delivery_fee: 3.99,
    minimum_order: 20,
    delivery_time: "40-50 min",
    is_open: true,
    is_featured: false,
  },
  {
    id: "r4",
    restaurant_name: "Sweet Tooth",
    address: "101 Dessert Ln, NY",
    phone: "123-456-7893",
    email: "contact@sweettooth.com",
    category_id: "c4",
    image_url:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    total_reviews: 560,
    delivery_fee: 1.49,
    minimum_order: 5,
    delivery_time: "15-25 min",
    is_open: true,
    is_featured: true,
  },
  {
    id: "r5",
    restaurant_name: "Fresh Sips",
    address: "222 Drink Rd, NY",
    phone: "123-456-7894",
    email: "hello@freshsips.com",
    category_id: "c5",
    image_url:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80",
    rating: 4.4,
    total_reviews: 390,
    delivery_fee: 0.99,
    minimum_order: 8,
    delivery_time: "20-25 min",
    is_open: true,
    is_featured: false,
  },
  {
    id: "r6",
    restaurant_name: "Tandoori Times",
    address: "55 Spice St, NY",
    phone: "123-456-7895",
    email: "team@tandooritimes.com",
    category_id: "c6",
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    total_reviews: 920,
    delivery_fee: 2.49,
    minimum_order: 18,
    delivery_time: "30-45 min",
    is_open: true,
    is_featured: true,
  },
  {
    id: "r7",
    restaurant_name: "Wok & Roll",
    address: "77 Noodle Ave, NY",
    phone: "123-456-7896",
    email: "support@wokandroll.com",
    category_id: "c7",
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    rating: 4.3,
    total_reviews: 640,
    delivery_fee: 1.79,
    minimum_order: 12,
    delivery_time: "25-35 min",
    is_open: true,
    is_featured: false,
  },
  {
    id: "r8",
    restaurant_name: "Taco Terraform",
    address: "9 Sunset Blvd, NY",
    phone: "123-456-7897",
    email: "hi@tacotf.com",
    category_id: "c8",
    image_url:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    rating: 4.2,
    total_reviews: 410,
    delivery_fee: 2.19,
    minimum_order: 14,
    delivery_time: "25-40 min",
    is_open: true,
    is_featured: false,
  },
  {
    id: "r9",
    restaurant_name: "Green Bowl",
    address: "300 Wellness Way, NY",
    phone: "123-456-7898",
    email: "orders@greenbowl.com",
    category_id: "c9",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    total_reviews: 780,
    delivery_fee: 2.59,
    minimum_order: 16,
    delivery_time: "25-35 min",
    is_open: true,
    is_featured: true,
  },
  {
    id: "r10",
    restaurant_name: "Morning Stack",
    address: "12 Breakfast Ct, NY",
    phone: "123-456-7899",
    email: "team@morningstack.com",
    category_id: "c10",
    image_url:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    rating: 4.1,
    total_reviews: 260,
    delivery_fee: 1.29,
    minimum_order: 9,
    delivery_time: "20-30 min",
    is_open: true,
    is_featured: false,
  },
];

// Dummy menu items organized by restaurant
export const dummyMenuItems: MenuItem[] = [
  // Burger Joint (r1) menu items
  {
    id: "m1",
    restaurant_id: "r1",
    name: "Classic Cheeseburger",
    description:
      "Juicy beef patty with melted cheese, lettuce, tomato, and our secret sauce.",
    price: 8.99,
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m2",
    restaurant_id: "r1",
    name: "Double Bacon Burger",
    description: "Two beef patties, crispy bacon, cheddar cheese, and BBQ sauce.",
    price: 11.99,
    image_url:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m3",
    restaurant_id: "r1",
    name: "Mushroom Swiss Burger",
    description: "Sautéed mushrooms, swiss cheese, caramelized onions, herb mayo.",
    price: 10.49,
    image_url:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },

  // Pizza Palace (r2)
  {
    id: "m4",
    restaurant_id: "r2",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
    price: 14.99,
    image_url:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m5",
    restaurant_id: "r2",
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and extra cheese.",
    price: 16.99,
    image_url:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m6",
    restaurant_id: "r2",
    name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce, grilled chicken, red onions, mozzarella.",
    price: 18.49,
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },

  // Sushi Master (r3)
  {
    id: "m7",
    restaurant_id: "r3",
    name: "Spicy Tuna Roll",
    description: "Fresh tuna, spicy mayo, and cucumber.",
    price: 9.99,
    image_url:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m8",
    restaurant_id: "r3",
    name: "Salmon Nigiri (6 pcs)",
    description: "Silky salmon over seasoned rice with house soy.",
    price: 13.5,
    image_url:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m9",
    restaurant_id: "r3",
    name: "Veggie Maki",
    description: "Avocado, cucumber, and carrot with sesame soy.",
    price: 8.75,
    image_url:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },

  // Sweet Tooth (r4)
  {
    id: "m10",
    restaurant_id: "r4",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey center, served with vanilla ice cream.",
    price: 6.99,
    image_url:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m11",
    restaurant_id: "r4",
    name: "Strawberry Cheesecake",
    description: "Creamy cheesecake with strawberry glaze.",
    price: 7.49,
    image_url:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m12",
    restaurant_id: "r4",
    name: "Vanilla Bean Cupcake",
    description: "Buttery vanilla cupcake with whipped frosting.",
    price: 3.99,
    image_url:
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },

  // Fresh Sips (r5)
  {
    id: "m13",
    restaurant_id: "r5",
    name: "Classic Lemonade",
    description: "Fresh lemons, cane sugar, and a cool squeeze.",
    price: 4.25,
    image_url:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m14",
    restaurant_id: "r5",
    name: "Iced Green Tea",
    description: "Brewed green tea with mint and citrus.",
    price: 4.75,
    image_url:
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m15",
    restaurant_id: "r5",
    name: "Berry Smoothie",
    description: "Mixed berries blended with yogurt.",
    price: 6.5,
    image_url:
      "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },

  // Tandoori Times (r6)
  {
    id: "m16",
    restaurant_id: "r6",
    name: "Butter Chicken",
    description: "Creamy tomato gravy with tender chicken.",
    price: 14.99,
    image_url:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m17",
    restaurant_id: "r6",
    name: "Palak Paneer",
    description: "Spinach curry with paneer and aromatic spices.",
    price: 13.49,
    image_url:
      "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m18",
    restaurant_id: "r6",
    name: "Garlic Naan",
    description: "Oven baked naan with garlic butter.",
    price: 3.49,
    image_url:
      "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },

  // Wok & Roll (r7)
  {
    id: "m19",
    restaurant_id: "r7",
    name: "Chicken Chow Mein",
    description: "Wok-tossed noodles with veggies and savory sauce.",
    price: 12.99,
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m20",
    restaurant_id: "r7",
    name: "Veg Fried Rice",
    description: "Rice fried with seasonal vegetables and soy glaze.",
    price: 10.99,
    image_url:
      "https://images.unsplash.com/photo-1603133872878-685f588c7a1a?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m21",
    restaurant_id: "r7",
    name: "General Tso’s Tofu",
    description: "Crispy tofu in sweet & spicy sauce.",
    price: 12.49,
    image_url:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },

  // Taco Terraform (r8)
  {
    id: "m22",
    restaurant_id: "r8",
    name: "Street Corn Tacos (3)",
    description: "Elote-style corn, lime crema, cotija, and herbs.",
    price: 11.5,
    image_url:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m23",
    restaurant_id: "r8",
    name: "Carne Asada Tacos (3)",
    description: "Marinated steak, pico de gallo, and warm tortillas.",
    price: 13.25,
    image_url:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m24",
    restaurant_id: "r8",
    name: "Chipotle Chicken Bowl",
    description: "Chipotle chicken, rice, beans, and fresh salsa.",
    price: 12.75,
    image_url:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },

  // Green Bowl (r9)
  {
    id: "m25",
    restaurant_id: "r9",
    name: "Quinoa Power Bowl",
    description: "Quinoa, roasted veggies, chickpeas, lemon tahini.",
    price: 12.25,
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m26",
    restaurant_id: "r9",
    name: "Chicken Caesar Salad",
    description: "Crisp romaine, parmesan, chicken, and caesar dressing.",
    price: 13.99,
    image_url:
      "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m27",
    restaurant_id: "r9",
    name: "Avocado Toast (2 slices)",
    description: "Toasted bread with smashed avocado & chili flakes.",
    price: 9.75,
    image_url:
      "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },

  // Morning Stack (r10)
  {
    id: "m28",
    restaurant_id: "r10",
    name: "Classic Pancakes",
    description: "Fluffy pancakes with maple syrup.",
    price: 9.25,
    image_url:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: true,
    is_available: true,
  },
  {
    id: "m29",
    restaurant_id: "r10",
    name: "Bacon & Egg Sandwich",
    description: "Smoky bacon, fried egg, and cheddar on a toasted bun.",
    price: 11.75,
    image_url:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: false,
    is_popular: false,
    is_available: true,
  },
  {
    id: "m30",
    restaurant_id: "r10",
    name: "Berry Yogurt Parfait",
    description: "Layered yogurt with berries and crunchy granola.",
    price: 7.95,
    image_url:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=60",
    is_vegetarian: true,
    is_popular: false,
    is_available: true,
  },
];
