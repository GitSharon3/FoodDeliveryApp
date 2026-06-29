// Import React
// Import React Native components
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Import AsyncStorage for persisting onboarding state
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import theme context
import { useTheme } from "@/theme";

// Onboarding3: Final onboarding screen explaining delivery feature
// Completes onboarding and saves state to AsyncStorage
export default function Onboarding3() {
  const { colors } = useTheme();
  // Handle completion of onboarding flow
  const handleFinishOnboarding = async () => {
    // Save that onboarding is done to AsyncStorage
    await AsyncStorage.setItem("hasLaunched", "true");
    // Do NOT navigate manually — AppNavigator will re-render and show Auth
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Feature illustration */}
      <Image
        source={require("../../assets/images/delivery.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Feature description */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>Fast Delivery</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Get your food delivered to you in no time.
        </Text>
      </View>

      {/* Complete onboarding and save state */}
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleFinishOnboarding}>
        <Text style={[styles.buttonText, { color: colors.background }]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 50,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    width: "70%",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
