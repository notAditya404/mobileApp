import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import "../global.css";

export default function Layout() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  // App khulte hi check karo ki login token saved hai ya nahi.
  // Agar nahi hai, toh seedha Welcome/Login screen par bhej do.
  useEffect(() => {
    SecureStore.getItemAsync("authToken").then((token) => {
      if (!token) {
        router.replace("/welcome");
      }
      setCheckedAuth(true);
    });
  }, []);

  if (!checkedAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
