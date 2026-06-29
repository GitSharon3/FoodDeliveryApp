// src/screens/auth/LoginScreen.tsx
import { useTheme } from "@/theme";
import { Ionicons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

type RootStackParamList = {
  SignupScreen: undefined;
  Main: undefined;
};

const getReactNativeBiometrics = () => {
  try {
    return require("react-native-biometrics").default;
  } catch {
    return null;
  }
};

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn, signInWithGoogle } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fingerprint modal states
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState<
    "idle" | "success" | "fail"
  >("idle");

  // Normal login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userPassword", password);
        await AsyncStorage.setItem("hasLaunched", "true");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fingerprint login
  const handleFingerprintLogin = async () => {
    setShowFingerprintModal(true);
    setFingerprintStatus("idle");

    try {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedPassword = await AsyncStorage.getItem("userPassword");
      if (!storedEmail || !storedPassword) {
        setFingerprintStatus("fail");
        return;
      }

      const ReactNativeBiometrics = getReactNativeBiometrics();
      if (!ReactNativeBiometrics) {
        setFingerprintStatus("fail");
        Alert.alert(
          "Fingerprint Unavailable",
          "Fingerprint login is not available in Expo Go. Use a development build to enable it."
        );
        return;
      }

      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        setFingerprintStatus("fail");
        return;
      }

      const result = await rnBiometrics.simplePrompt({
        promptMessage: "Login with your fingerprint",
      });

      if (result.success) {
        const { error } = await signIn(storedEmail, storedPassword);
        if (!error) {
          await AsyncStorage.setItem("hasLaunched", "true");
          setFingerprintStatus("success");
          setTimeout(() => setShowFingerprintModal(false), 1000);
        } else {
          setFingerprintStatus("fail");
        }
      } else {
        setFingerprintStatus("fail");
      }
    } catch (err) {
      console.error(err);
      setFingerprintStatus("fail");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert(
          "Google Sign-In Failed",
          error.message || "Something went wrong"
        );
      } else {
        await AsyncStorage.setItem("hasLaunched", "true");
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={26} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.formBox}>
            <Text style={[styles.title, { color: colors.primary }]}>Login</Text>

            {/* Email */}
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Fingerprint Button */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.secondary }]}
              onPress={handleFingerprintLogin}
            >
              <Text style={styles.loginBtnText}>Login with Fingerprint</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Old style social buttons */}
            <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]} onPress={handleGoogleLogin}>
              <Image
                source={require("@/assets/images/google.png")}
                style={styles.icon}
              />
              <Text style={[styles.socialText, { color: colors.textSecondary }]}>Login with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]}>
              <Image
                source={require("@/assets/images/apple.png")}
                style={styles.icon}
              />
              <Text style={[styles.socialText, { color: colors.textSecondary }]}>Login with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don&apos;t have an account?{" "}
              <Text
                style={[styles.link, { color: colors.primary }]}
                onPress={() => navigation.navigate("SignupScreen")}
              >
                Register
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fingerprint Modal */}
      <Modal visible={showFingerprintModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Icon
              name="finger-print"
              size={60}
              color={
                fingerprintStatus === "success"
                  ? "#4CAF50"
                  : fingerprintStatus === "fail"
                  ? "#F44336"
                  : "#fff"
              }
              style={{ alignSelf: "center", marginBottom: 16 }}
            />
            {fingerprintStatus === "idle" && (
              <Text style={[styles.modalText, { color: colors.text }]}>
                Place your finger on the scanner to continue
              </Text>
            )}
            {fingerprintStatus === "success" && (
              <Text style={[styles.modalText, { color: "#4CAF50" }]}>
                Login successful!
              </Text>
            )}
            {fingerprintStatus === "fail" && (
              <Text style={[styles.modalText, { color: "#F44336" }]}>
                Fingerprint did not match. Try again.
              </Text>
            )}
            <TouchableOpacity onPress={() => setShowFingerprintModal(false)}>
              <Text style={[styles.cancelBtn, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  backBtn: { alignSelf: "flex-start" },

  formBox: { marginTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },

  loginBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divider: { flex: 1, height: 1 },
  orText: { marginHorizontal: 10 },

  socialBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { width: 20, height: 20, marginRight: 10 },
  socialText: {},

  footer: { alignItems: "center", marginTop: 20 },
  footerText: {},
  link: { fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    borderRadius: 16,
    padding: 32,
    width: "85%",
    alignItems: "center",
  },
  modalText: { fontSize: 16, textAlign: "center", marginBottom: 12 },
  cancelBtn: { fontSize: 16, marginTop: 16 },
});
