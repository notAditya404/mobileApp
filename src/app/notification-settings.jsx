import { useEffect, useState } from "react";
import { View, Text, Pressable, Switch, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getNotificationSettings, updateNotificationSettings } from "@/api/settings";
import { syncDailyCheckInReminder } from "@/api/notifications";
import { ErrorState } from "@/components/ErrorState";

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
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoadError(false);
    setSettings(null);
    getNotificationSettings()
      .then(setSettings)
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(key) {
    const previous = settings;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);

    try {
      await updateNotificationSettings(updated);
      // Reminder ka actual local schedule sirf server-save confirm hone
      // ke baad sync karo, taaki failed save par local notification aur
      // server setting out of sync na rahein.
      if (key === "dailyCheckInReminder") {
        syncDailyCheckInReminder(updated.dailyCheckInReminder);
      }
    } catch (error) {
      setSettings(previous);
      Alert.alert("Couldn't save", error.message || "Please try again.");
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

        {loadError ? (
          <ErrorState onRetry={load} />
        ) : !settings ? (
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
