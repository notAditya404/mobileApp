import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { signup, sendOtp } from "@/api/auth";

const TOTAL_STEPS = 4;
const STEP_TITLES = {
  1: "Personal Details",
  2: "Verification (OTP)",
  3: "Location & Device",
  4: "Set Password",
};

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 - Personal Details
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rank, setRank] = useState("");
  const [organization, setOrganization] = useState("");
  const [mobile, setMobile] = useState("");

  // Step 2 - OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(58);
  const otpRefs = useRef([]);

  // Step 3 - Location & Device
  const [locationAccess, setLocationAccess] = useState(true);

  // Step 4 - Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP screen par har second countdown chalta hai
  useEffect(() => {
    if (step !== 2 || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  }

  async function handleStep1Next() {
    if (!fullName || !employeeId || !rank || !organization || !mobile) {
      Alert.alert("Missing details", "Please fill all the required fields.");
      return;
    }
    await sendOtp(mobile);
    setSecondsLeft(58);
    setStep(2);
  }

  function handleOtpChange(text, index) {
    const digits = [...otp];
    digits[index] = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp(digits);

    // Digit bharte hi agle box par cursor le jao
    if (digits[index] && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleStep2Next() {
    if (otp.some((d) => d === "")) {
      Alert.alert("Incomplete OTP", "Please enter the full 6-digit OTP.");
      return;
    }
    setStep(3);
  }

  const passwordRules = {
    minLength: password.length >= 8,
    hasLetterAndNumber: /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };

  async function handleCreateAccount() {
    const allRulesPassed = Object.values(passwordRules).every(Boolean);
    if (!allRulesPassed) {
      Alert.alert("Weak password", "Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please re-enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { token } = await signup({
        fullName,
        employeeId,
        rank,
        organization,
        mobile,
        otp: otp.join(""),
        locationAccess,
        password,
      });
      await SecureStore.setItemAsync("authToken", token);
      router.replace("/");
    } catch (error) {
      Alert.alert("Signup failed", "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-6 py-6 flex-grow">
        {/* Header */}
        <Pressable onPress={goBack} className="mb-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900">Create Account</Text>
        <Text className="text-slate-400 mb-4">
          Step {step} of {TOTAL_STEPS}
        </Text>

        <StepIndicator step={step} />

        <Text className="text-lg font-bold text-slate-900 mt-6">
          {STEP_TITLES[step]}
        </Text>

        {step === 1 && (
          <View className="mt-4">
            <Field label="Full Name" icon="person-outline" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />
            <Field label="User ID / Employee ID" icon="person-outline" value={employeeId} onChangeText={setEmployeeId} placeholder="Enter your service/employee ID" />
            <Field label="Rank / Designation" icon="ribbon-outline" value={rank} onChangeText={setRank} placeholder="Select your rank/designation" />
            <Field label="Organization / Force" icon="shield-checkmark-outline" value={organization} onChangeText={setOrganization} placeholder="Select your organization" />
            <Field label="Mobile Number" icon="call-outline" value={mobile} onChangeText={setMobile} placeholder="Enter your mobile number" keyboardType="phone-pad" />

            <InfoBanner text="Make sure your details match your official records." />
            <PrimaryButton label="Next" onPress={handleStep1Next} />
          </View>
        )}

        {step === 2 && (
          <View className="mt-4">
            <Text className="text-slate-500 text-sm mb-4">
              Enter the OTP sent to {mobile || "your mobile number"}
            </Text>

            <View className="flex-row justify-between mb-3">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  className="w-12 h-14 border border-slate-300 rounded-xl text-center text-lg text-slate-900"
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                />
              ))}
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-400 text-xs">
                OTP sent to your mobile number
              </Text>
              <Text className="text-blue-700 text-xs font-semibold">
                {secondsLeft > 0 ? `00:${String(secondsLeft).padStart(2, "0")}` : "Expired"}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setSecondsLeft(58);
                sendOtp(mobile);
              }}
              className="mb-4"
            >
              <Text className="text-blue-700 text-sm font-semibold">Resend OTP</Text>
            </Pressable>

            <InfoBanner text="We use OTP to verify your identity and keep your account secure." />
            <PrimaryButton label="Next" onPress={handleStep2Next} />
          </View>
        )}

        {step === 3 && (
          <View className="mt-4">
            <View className="border border-slate-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1 pr-3">
                  <Ionicons name="location-outline" size={18} color="#1e293b" />
                  <Text className="font-semibold text-slate-900">Location Access</Text>
                </View>
                <Switch value={locationAccess} onValueChange={setLocationAccess} />
              </View>
              <Text className="text-slate-500 text-sm mt-2">
                Allow location access to get relevant alerts and support services.
              </Text>
            </View>

            <View className="border border-slate-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="phone-portrait-outline" size={18} color="#1e293b" />
                <Text className="font-semibold text-slate-900">Device Information</Text>
              </View>
              <Text className="text-slate-500 text-sm mb-2">
                We collect basic device information to ensure security.
              </Text>
              <Text className="text-slate-400 text-xs">
                Device: Android &middot; Version: 14
              </Text>
            </View>

            <InfoBanner text="Your location is used only for welfare services and never shared outside your organization." />
            <PrimaryButton label="Next" onPress={() => setStep(4)} />
          </View>
        )}

        {step === 4 && (
          <View className="mt-4">
            <Field
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onPressRightIcon={() => setShowPassword((v) => !v)}
            />
            <Field
              label="Confirm Password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showPassword}
            />

            <View className="mb-4">
              <RuleRow ok={passwordRules.minLength} text="At least 8 characters" />
              <RuleRow ok={passwordRules.hasLetterAndNumber} text="Include letters and numbers" />
              <RuleRow ok={passwordRules.hasSpecialChar} text="Include special character" />
            </View>

            <PrimaryButton
              label={isSubmitting ? "Creating Account..." : "Create Account"}
              onPress={handleCreateAccount}
              disabled={isSubmitting}
              icon="person-add-outline"
            />

            <Text className="text-slate-400 text-xs text-center mt-4">
              By creating an account, you agree to our{" "}
              <Text className="text-blue-700">Privacy Policy</Text> and{" "}
              <Text className="text-blue-700">Terms of Use</Text>.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Top par 4 circles jo current step dikhate hain
function StepIndicator({ step }) {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4].map((n) => (
        <View key={n} className="flex-row items-center flex-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              n < step ? "bg-blue-700" : n === step ? "bg-blue-700" : "bg-slate-200"
            }`}
          >
            {n < step ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Text className={n === step ? "text-white font-bold" : "text-slate-500"}>
                {n}
              </Text>
            )}
          </View>
          {n < 4 && (
            <View className={`flex-1 h-0.5 ${n < step ? "bg-blue-700" : "bg-slate-200"}`} />
          )}
        </View>
      ))}
    </View>
  );
}

// Har form field isi se banti hai (label + icon + input)
function Field({ label, icon, rightIcon, onPressRightIcon, ...inputProps }) {
  return (
    <View className="mb-4">
      <Text className="text-slate-600 text-sm mb-1">{label}</Text>
      <View className="flex-row items-center border border-slate-300 rounded-xl px-3">
        <Ionicons name={icon} size={18} color="#64748b" />
        <TextInput className="flex-1 py-3 px-2 text-slate-900" {...inputProps} />
        {rightIcon && (
          <Pressable onPress={onPressRightIcon}>
            <Ionicons name={rightIcon} size={18} color="#64748b" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function InfoBanner({ text }) {
  return (
    <View className="flex-row items-start gap-2 bg-blue-50 rounded-xl p-3 mb-6">
      <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
      <Text className="text-blue-900 text-xs flex-1">{text}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, icon }) {
  return (
    <Pressable
      className="bg-blue-700 rounded-xl py-4 flex-row items-center justify-center gap-2"
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white text-base font-semibold">{label}</Text>
      <Ionicons name={icon ?? "arrow-forward"} size={18} color="white" />
    </Pressable>
  );
}

function RuleRow({ ok, text }) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons
        name={ok ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={ok ? "#16a34a" : "#cbd5e1"}
      />
      <Text className={ok ? "text-green-700 text-sm" : "text-slate-400 text-sm"}>
        {text}
      </Text>
    </View>
  );
}
