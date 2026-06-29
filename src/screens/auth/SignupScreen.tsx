// src/screens/auth/SignupScreen.tsx
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
import { useAuth } from "../../context/AuthContext";

type RootStackParamList = {
  LoginScreen: undefined;
  Main: undefined;
};

const getReactNativeBiometrics = () => {
  try {
    return require("react-native-biometrics").default;
  } catch {
    return null;
  }
};

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signUp, signInWithGoogle } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fingerprint states
  const [fingerprintRegistered, setFingerprintRegistered] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState<"idle" | "success" | "fail">("idle");

  // Handle signup
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, name);

      if (error) {
        Alert.alert("Signup Failed", error.message);
      } else {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userPassword", password);
        await AsyncStorage.setItem("hasLaunched", "true"); // skip onboarding next time

        Alert.alert("Success", "Account created! Please log in.");
        navigation.replace("LoginScreen");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle fingerprint registration
  const handleRegisterFingerprint = async () => {
    setShowFingerprintModal(true);
    setFingerprintStatus("idle");

    try {
      const ReactNativeBiometrics = getReactNativeBiometrics();
      if (!ReactNativeBiometrics) {
        setFingerprintStatus("fail");
        Alert.alert(
          "Fingerprint Unavailable",
          "Fingerprint registration is not available in Expo Go. Use a development build to enable it."
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
        promptMessage: "Register your fingerprint",
      });

      if (result.success) {
        await AsyncStorage.setItem("fingerprintRegistered", "true");
        setFingerprintRegistered(true);
        setFingerprintStatus("success");
      } else {
        setFingerprintStatus("fail");
      }
    } catch (error) {
      console.log(error);
      setFingerprintStatus("fail");
    }
  };

  // Handle GOOGLE signup
    const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        Alert.alert("Google Sign-Up Failed", error.message || "Something went wrong");
      } else {
        await AsyncStorage.setItem("hasLaunched", "true");
        // User will be automatically signed in
      }
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert("Error", "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
     <ScrollView>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={26} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.formBox}>
        <Text style={[styles.title, { color: colors.primary }]}>Register</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Enter your full name"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="********"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          textContentType="oneTimeCode"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="********"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          textContentType="oneTimeCode"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* Fingerprint Button */}
        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: fingerprintRegistered ? "#4CAF50" : colors.secondary, marginTop: 10 },
          ]}
          onPress={handleRegisterFingerprint}
        >
          <Text style={styles.loginBtnText}>
            {fingerprintRegistered ? "Fingerprint Registered" : "Register Fingerprint"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.textSecondary }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* Social login buttons */}
        <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]} onPress={handleGoogleSignup}>
          <Image source={require("@/assets/images/google.png")} style={styles.icon} />
          <Text style={[styles.socialText, { color: colors.textSecondary }]}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]}>
          <Image source={require("@/assets/images/apple.png")} style={styles.icon} />
          <Text style={[styles.socialText, { color: colors.textSecondary }]}>Sign up with Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Already have an account?{" "}
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate("LoginScreen")}>
            Login
          </Text>
        </Text>
      </View>

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
                Please hold your finger at the scanner to verify your identity
              </Text>
            )}
            {fingerprintStatus === "success" && (
              <Text style={[styles.modalText, { color: "#4CAF50" }]}>
                Fingerprint registered successfully!
              </Text>
            )}
            {fingerprintStatus === "fail" && (
              <Text style={[styles.modalText, { color: "#F44336" }]}>
                Your fingerprint did not match. Please try again later.
              </Text>
            )}
            <TouchableOpacity onPress={() => setShowFingerprintModal(false)}>
              <Text style={[styles.cancelBtn, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  backBtn: { position: "absolute", top: 20, left: 24, zIndex: 2 },
  formBox: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 2, marginTop: 10 },
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
    marginTop: 20,
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: "white", fontWeight: "bold" },
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
