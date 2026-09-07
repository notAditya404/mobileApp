import { View, Text } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <Text className="text-2xl font-bold text-slate-900">Profile</Text>
      <Text className="text-slate-500 mt-2 text-center">
        Yeh screen agle step mein banayenge.
      </Text>
    </View>
  );
}
