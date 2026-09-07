import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "../global.css";

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login hone ke baad hi yeh screens reachable hain. Jab isLoggedIn
          false ho jaata hai (logout), yeh poori group navigation history
          se hat jaati hai - "back" dabane se yeh wapas nahi aatin. */}
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="privacy-settings" />
      </Stack.Protected>

      {/* Login se pehle hi yeh screens reachable hain. Login/Signup
          success hote hi yeh group hat jaati hai, isliye Home se "back"
          dabane se Welcome/Login wapas nahi aata. */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
