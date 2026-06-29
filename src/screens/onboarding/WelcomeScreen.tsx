// Import React
// Import React Native components
import { Button, ImageBackground, StyleSheet, Text, View } from "react-native";
// Import navigation hooks
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation type definition
type RootStackParamList = {
  Onboarding1: undefined;
};

// WelcomeScreen: First screen of onboarding flow
// Shows welcome message with background image and next button
export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ImageBackground
      source={require("@/assets/images/welcomebg.jpg")}
      style={styles.bg}
    >
      {/* Dark overlay for text readability */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to NanBites 👋</Text>
        <Text style={styles.subtitle}>Delicious meals, faster than ever 🍕</Text>
        {/* Navigate to first onboarding screen */}
        <Button title="Next" onPress={() => navigation.navigate("Onboarding1")} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  title: {
    color: "#1a974e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    marginTop: 7,
    marginBottom: 20,
  },
});
