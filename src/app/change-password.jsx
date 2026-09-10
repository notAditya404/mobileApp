import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { changePassword } from "@/api/auth";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = {
    minLength: newPassword.length >= 8,
    hasLetterAndNumber: /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
  };

  async function handleSubmit() {
    if (!currentPassword) {
      Alert.alert("Missing details", "Please enter your current password.");
      return;
    }
    const allRulesPassed = Object.values(passwordRules).every(Boolean);
    if (!allRulesPassed) {
      Alert.alert("Weak password", "Please meet all password requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please re-enter your new password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Password Changed", "Your password has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Something went wrong", error.message || "Please check your current password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-6 py-6">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900 mb-1">Change Password</Text>
        <Text className="text-slate-400 mb-6">
          Choose a strong password to keep your account secure.
        </Text>

        <Field
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry={!showPassword}
        />
        <Field
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
          onPressRightIcon={() => setShowPassword((v) => !v)}
        />
        <Field
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={!showPassword}
        />

        <View className="mb-6">
          <RuleRow ok={passwordRules.minLength} text="At least 8 characters" />
          <RuleRow ok={passwordRules.hasLetterAndNumber} text="Include letters and numbers" />
          <RuleRow ok={passwordRules.hasSpecialChar} text="Include special character" />
        </View>

        <Pressable
          className="bg-blue-700 rounded-xl py-4 items-center"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? "Updating..." : "Update Password"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, rightIcon, onPressRightIcon, ...inputProps }) {
  return (
    <View className="mb-4">
      <Text className="text-slate-600 text-sm mb-1">{label}</Text>
      <View className="flex-row items-center border border-slate-300 rounded-xl px-3">
        <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
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

function RuleRow({ ok, text }) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons
        name={ok ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={ok ? "#16a34a" : "#cbd5e1"}
      />
      <Text className={ok ? "text-green-700 text-sm" : "text-slate-400 text-sm"}>{text}</Text>
    </View>
  );
}
