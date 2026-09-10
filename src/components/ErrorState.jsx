import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Data load fail hone par (backend down, network issue, session expired)
// yeh dikhta hai - taaki screen hamesha ke liye khaali skeleton mein
// atki na rahe aur user ko retry karne ka tarika mile.
export function ErrorState({ onRetry }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-4">
        <Ionicons name="cloud-offline-outline" size={26} color="#dc2626" />
      </View>
      <Text className="text-slate-900 font-bold text-base text-center">
        Couldn't load your data
      </Text>
      <Text className="text-slate-400 text-sm text-center mt-1 mb-5">
        Please check your connection and try again.
      </Text>
      <Pressable
        className="bg-blue-700 rounded-xl py-3 px-6 flex-row items-center gap-2"
        onPress={onRetry}
      >
        <Ionicons name="refresh-outline" size={16} color="white" />
        <Text className="text-white font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );
}
