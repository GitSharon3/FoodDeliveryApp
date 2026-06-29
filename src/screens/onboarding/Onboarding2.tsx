// Import React
// Import React Native components
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Import navigation hooks
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// Import theme context
import { useTheme } from "@/theme";

// Navigation type definition
type RootStackParamList = {
  Onboarding3: undefined;
};

// Onboarding2: Second onboarding screen explaining payment feature
// Shows illustration, description, and next button
export default function Onboarding2() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Feature illustration */}
      <Image
        source={require("../../assets/images/order.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Feature description */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>Easy Payment</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Pay for your orders seamlessly with just a few taps.
        </Text>
      </View>

      {/* Navigate to next onboarding screen */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate("Onboarding3")}
      >
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
