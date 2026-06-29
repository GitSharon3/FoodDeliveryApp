// Import React Native components
import { Dimensions, Image, View } from "react-native";
// Import useEffect hook for side effects
import { useEffect } from "react";
// Import navigation hooks
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// Import LottieView for animations
import LottieView from "lottie-react-native";
// Import theme context
import { useTheme } from "@/theme";

// Get screen height for positioning
const { height } = Dimensions.get("window");

// Navigation type definition
type RootStackParamList = {
  WelcomeScreen: undefined;
};

// SplashScreen: Initial splash screen shown on app launch
// Displays app logo and loader animation, then navigates to welcome screen
export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  
  // Auto-navigate to welcome screen after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("WelcomeScreen"); 
    }, 2500);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* App Logo */}
      <Image
        source={require("../../assets/images/nanlogobg.png")}
        style={{ width: 240, height: 240, marginBottom: 20 }}
        resizeMode="contain"
      />


      {/* Loader Animation */}
      <LottieView
        source={require("../../assets/animations/loader.json")}
        autoPlay
        loop
        style={{
          position: "absolute",
          bottom: height * 0.08,
          width: 90,
          height: 90,
        }}
      />
    </View>
  );
}
