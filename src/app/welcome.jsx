import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Yeh app khulte hi sabse pehli screen hai (agar user login nahi hai)
export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="w-28 h-28 rounded-full bg-blue-600 items-center justify-center mb-6">
          <Ionicons name="shield-checkmark" size={56} color="white" />
        </View>

        <Text className="text-4xl font-extrabold text-blue-900 tracking-widest">
          MANOVA
        </Text>
        <Text className="text-slate-500 text-center text-base mt-4">
          Smart care for those{"\n"}who protect us.
        </Text>
      </View>

      {/* Feature row */}
      <View className="flex-row justify-between px-8 mb-8">
        <FeatureItem icon="pulse-outline" title="Monitor" subtitle="Well-being" />
        <FeatureItem icon="shield-checkmark-outline" title="Predict" subtitle="Risks" />
        <FeatureItem icon="people-outline" title="Support" subtitle="Always" />
        <FeatureItem icon="bar-chart-outline" title="Improve" subtitle="Everyday" />
      </View>

      <View className="px-8 pb-6">
        <Pressable
          className="bg-blue-700 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/login")}
        >
          <Text className="text-white text-lg font-semibold">Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, subtitle }) {
  return (
    <View className="items-center">
      <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mb-2">
        <Ionicons name={icon} size={22} color="#1d4ed8" />
      </View>
      <Text className="text-slate-800 font-semibold text-xs">{title}</Text>
      <Text className="text-slate-400 text-xs">{subtitle}</Text>
    </View>
  );
}
