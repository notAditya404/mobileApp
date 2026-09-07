import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { login } from "@/api/auth";

export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!userId || !password) {
      Alert.alert("Missing details", "Please enter your User ID and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const { token } = await login(userId, password);
      // Token ko secure storage mein save karte hain taaki app dobara
      // khulne par user ko login karne ki zaroorat na pade
      await SecureStore.setItemAsync("authToken", token);
      router.replace("/");
    } catch (error) {
      Alert.alert("Login failed", "Please check your User ID and Password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-8">
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-3">
            <Ionicons name="shield-checkmark" size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-slate-900">Welcome Back</Text>
          <Text className="text-slate-500 mt-1">Login to continue</Text>
        </View>

        <Text className="text-slate-600 text-sm mb-1">User ID</Text>
        <View className="flex-row items-center border border-slate-300 rounded-xl px-3 mb-4">
          <Ionicons name="person-outline" size={18} color="#64748b" />
          <TextInput
            className="flex-1 py-3 px-2 text-slate-900"
            placeholder="User ID"
            autoCapitalize="none"
            value={userId}
            onChangeText={setUserId}
          />
        </View>

        <Text className="text-slate-600 text-sm mb-1">Password</Text>
        <View className="flex-row items-center border border-slate-300 rounded-xl px-3 mb-2">
          <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
          <TextInput
            className="flex-1 py-3 px-2 text-slate-900"
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#64748b"
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() => Alert.alert("Forgot Password", "Please contact your unit admin to reset your password.")}
          className="self-end mb-6"
        >
          <Text className="text-blue-600 text-sm">Forgot Password?</Text>
        </Pressable>

        <Pressable
          className="bg-blue-700 rounded-xl py-4 items-center"
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-semibold">
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </Pressable>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="text-slate-400 text-xs mx-3">OR</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <View className="items-center">
          <Text className="text-slate-900 font-semibold">New to MANOVA?</Text>
          <Text className="text-slate-400 text-sm mt-1 mb-4">
            Join MANOVA for a healthier, safe tomorrow.
          </Text>
          <Pressable
            className="border border-slate-300 rounded-xl py-3 px-8 flex-row items-center gap-2"
            onPress={() => router.push("/signup")}
          >
            <Ionicons name="person-add-outline" size={18} color="#1d4ed8" />
            <Text className="text-blue-700 font-semibold">Create Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
