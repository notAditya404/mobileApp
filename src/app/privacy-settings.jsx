import { useEffect, useState } from "react";
import { View, Text, Pressable, Switch, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getPrivacySettings, updatePrivacySettings } from "@/api/settings";

const OPTIONS = [
  {
    key: "location",
    title: "Location Access",
    description: "Used only to provide relevant welfare alerts and support services.",
    icon: "location-outline",
  },
  {
    key: "wearableData",
    title: "Wearable / Biometric Data",
    description: "Optional - sleep and heart-rate data from a connected wearable, if authorized.",
    icon: "watch-outline",
  },
  {
    key: "hrData",
    title: "HR Data (Duty & Leave Records)",
    description: "Duty schedules and leave records used to calculate your wellness score.",
    icon: "briefcase-outline",
  },
];

export default function PrivacySettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getPrivacySettings().then(setSettings);
  }, []);

  function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    updatePrivacySettings(updated);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-6 py-6">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900 mb-1">Privacy & Data Settings</Text>
        <Text className="text-slate-400 mb-6">
          Control exactly what data you share. You can change these anytime.
        </Text>

        {!settings ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <View className="bg-slate-50 rounded-2xl">
            {OPTIONS.map((option, index) => (
              <View
                key={option.key}
                className={`flex-row items-center p-4 ${
                  index < OPTIONS.length - 1 ? "border-b border-slate-200" : ""
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-violet-50 items-center justify-center mr-3">
                  <Ionicons name={option.icon} size={18} color="#7c3aed" />
                </View>
                <View className="flex-1 pr-3">
                  <Text className="text-slate-900 font-semibold">{option.title}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">{option.description}</Text>
                </View>
                <Switch value={settings[option.key]} onValueChange={() => toggle(option.key)} />
              </View>
            ))}
          </View>
        )}

        <View className="flex-row items-start gap-2 bg-violet-50 rounded-xl p-3 mt-6">
          <Ionicons name="shield-checkmark-outline" size={16} color="#7c3aed" />
          <Text className="text-violet-800 text-xs flex-1">
            Turning off a data type means we won't collect it, but it may reduce the accuracy of
            your wellness insights. Only authorized welfare officers can view your data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
