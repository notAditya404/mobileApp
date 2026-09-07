import { useEffect, useState } from "react";
import { View, Text, Pressable, Switch, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getNotificationSettings, updateNotificationSettings } from "@/api/settings";
import { syncDailyCheckInReminder } from "@/api/notifications";

const OPTIONS = [
  {
    key: "dailyCheckInReminder",
    title: "Daily Check-in Reminder",
    description: "Remind me if I haven't done today's wellness check-in.",
    icon: "happy-outline",
  },
];

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getNotificationSettings().then(setSettings);
  }, []);

  function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    updateNotificationSettings(updated);

    // Reminder ka actual local schedule bhi turant sync karo
    if (key === "dailyCheckInReminder") {
      syncDailyCheckInReminder(updated.dailyCheckInReminder);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-6 py-6">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900 mb-1">Notification Settings</Text>
        <Text className="text-slate-400 mb-6">Choose what you want to be notified about.</Text>

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
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name={option.icon} size={18} color="#2563eb" />
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
      </ScrollView>
    </SafeAreaView>
  );
}
