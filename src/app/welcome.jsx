import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

// Yeh app khulte hi sabse pehli screen hai (agar user login nahi hai)
export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Background photo with logo/tagline overlaid on top */}
      <View style={{ height: "62%" }} className="relative">
        <Image
          source={require("@/assets/images/welcome-soldier.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View className="absolute inset-0 bg-black/20" />
        <SafeAreaView className="flex-1 items-center pt-6">
          <View className="bg-white/95 rounded-2xl p-2.5 shadow-sm">
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 44, height: 44 }}
              contentFit="contain"
            />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-widest mt-3">
            MANOVA
          </Text>
          <Text className="text-white/90 text-center text-base mt-2">
            Smart care for those{"\n"}who protect us.
          </Text>
        </SafeAreaView>
      </View>

      {/* Feature row + CTA - flex-1 so this fills the rest of the screen
          exactly (no leftover empty space below the button) */}
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-white rounded-t-3xl -mt-6 px-8 pt-8 pb-6">
        <View className="flex-1 justify-center">
          <View className="flex-row justify-between">
            <FeatureItem icon="pulse-outline" title="Monitor" subtitle="Well-being" />
            <FeatureItem icon="shield-checkmark-outline" title="Predict" subtitle="Risks" />
            <FeatureItem icon="people-outline" title="Support" subtitle="Always" />
            <FeatureItem icon="bar-chart-outline" title="Improve" subtitle="Everyday" />
          </View>
        </View>

        <Pressable
          className="bg-blue-700 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/login")}
        >
          <Text className="text-white text-lg font-semibold">Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </SafeAreaView>
    </View>
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
