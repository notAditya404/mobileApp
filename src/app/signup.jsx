import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { signup } from "@/api/auth";

const TOTAL_STEPS = 3;
const STEP_TITLES = {
  1: "Personal Details",
  2: "Initial Wellness Survey",
  3: "Set Password",
};

// Rank dropdown ke options - CAPF/Armed Forces ke common ranks
const RANK_OPTIONS = [
  "Constable",
  "Head Constable",
  "Naik",
  "Lance Naik",
  "Havildar",
  "Assistant Sub Inspector",
  "Sub Inspector",
  "Inspector",
  "Subedar",
  "Subedar Major",
  "Other",
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Survey ke saare sawaal aur unke options - yeh initial baseline data
// self_assessments table mein jayega taaki signup ke sath hi kuch data ho
const SURVEY_QUESTIONS = [
  {
    key: "sleepHours",
    question: "How many hours do you sleep on average?",
    options: ["< 5 hrs", "5-6 hrs", "6-7 hrs", "7-8 hrs", "8+ hrs"],
  },
  {
    key: "dietQuality",
    question: "How would you rate your diet quality?",
    options: ["Poor", "Average", "Good", "Excellent"],
  },
  {
    key: "workPressure",
    question: "How would you describe your current work pressure?",
    options: ["Low", "Moderate", "High", "Very High"],
  },
  {
    key: "lastLeave",
    question: "When did you last take leave?",
    options: ["This month", "1-3 months ago", "3-6 months ago", "6+ months ago"],
  },
];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 - Personal Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [isRankPickerVisible, setIsRankPickerVisible] = useState(false);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  // Step 2 - Initial Wellness Survey
  const [surveyAnswers, setSurveyAnswers] = useState({});

  // Step 3 - Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  }

  function handleStep1Next() {
    if (!fullName || !email || !rank || !dob || !gender || !bloodGroup) {
      Alert.alert("Missing details", "Please fill all the required fields.");
      return;
    }
    setStep(2);
  }

  function handleSurveyNext() {
    const unanswered = SURVEY_QUESTIONS.some((q) => !surveyAnswers[q.key]);
    if (unanswered) {
      Alert.alert("Incomplete survey", "Please answer all the questions.");
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
        email,
        rank,
        dob,
        gender,
        bloodGroup,
        ...surveyAnswers,
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

        <StepIndicator step={step} totalSteps={TOTAL_STEPS} />

        <Text className="text-lg font-bold text-slate-900 mt-6">
          {STEP_TITLES[step]}
        </Text>

        {step === 1 && (
          <View className="mt-4">
            <Field label="Full Name" icon="person-outline" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />
            <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />

            <View className="mb-4">
              <Text className="text-slate-600 text-sm mb-1">Rank</Text>
              <Pressable
                className="flex-row items-center border border-slate-300 rounded-xl px-3"
                onPress={() => setIsRankPickerVisible(true)}
              >
                <Ionicons name="ribbon-outline" size={18} color="#64748b" />
                <Text className={`flex-1 py-3 px-2 ${rank ? "text-slate-900" : "text-slate-400"}`}>
                  {rank || "Select your rank"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#64748b" />
              </Pressable>
            </View>

            <Field
              label="Date of Birth"
              icon="calendar-outline"
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
            />

            <ChipGroup
              question="Gender"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
            />

            <ChipGroup
              question="Blood Group"
              options={BLOOD_GROUP_OPTIONS}
              value={bloodGroup}
              onChange={setBloodGroup}
            />

            <InfoBanner text="Make sure your details match your official records." />
            <PrimaryButton label="Next" onPress={handleStep1Next} />

            <RankPickerModal
              visible={isRankPickerVisible}
              selectedRank={rank}
              onSelect={(value) => {
                setRank(value);
                setIsRankPickerVisible(false);
              }}
              onClose={() => setIsRankPickerVisible(false)}
            />
          </View>
        )}

        {step === 2 && (
          <View className="mt-4">
            <Text className="text-slate-500 text-sm mb-4">
              Bas kuch quick sawaal, taaki hum aapke liye ek baseline wellness
              profile bana sakein.
            </Text>

            {SURVEY_QUESTIONS.map((q) => (
              <ChipGroup
                key={q.key}
                question={q.question}
                options={q.options}
                value={surveyAnswers[q.key]}
                onChange={(value) =>
                  setSurveyAnswers((prev) => ({ ...prev, [q.key]: value }))
                }
              />
            ))}

            <InfoBanner text="Yeh jawab confidential hain aur sirf aapki wellness samajhne ke liye use honge." />
            <PrimaryButton label="Next" onPress={handleSurveyNext} />
          </View>
        )}

        {step === 3 && (
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

// Top par circles jo current step dikhate hain
function StepIndicator({ step, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <View className="flex-row items-center">
      {steps.map((n) => (
        <View key={n} className="flex-row items-center flex-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              n <= step ? "bg-blue-700" : "bg-slate-200"
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
          {n < totalSteps && (
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

// Survey ka ek sawaal - options chips ki tarah, single-select
function ChipGroup({ question, options, value, onChange }) {
  return (
    <View className="mb-5">
      <Text className="text-slate-700 font-medium mb-2">{question}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={`px-3 py-2 rounded-full border ${
                selected ? "bg-blue-700 border-blue-700" : "bg-white border-slate-300"
              }`}
            >
              <Text className={selected ? "text-white text-sm" : "text-slate-600 text-sm"}>
                {option}
              </Text>
            </Pressable>
          );
        })}
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

// Rank select karne ke liye chhota bottom-sheet jaisa modal
function RankPickerModal({ visible, selectedRank, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-2xl max-h-[70%]">
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">Select Rank</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>
          <FlatList
            data={RANK_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50"
                onPress={() => onSelect(item)}
              >
                <Text className="text-slate-800">{item}</Text>
                {selectedRank === item && (
                  <Ionicons name="checkmark" size={18} color="#1d4ed8" />
                )}
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
