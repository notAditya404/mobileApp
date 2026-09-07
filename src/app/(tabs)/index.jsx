import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getHomeDashboard } from "@/api/home";

// Device ke current time ke hisaab se greeting - subah/dopahar/shaam
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  return "Good Evening,";
}

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState(null);

  // Screen khulte hi dashboard data load karo (abhi mock, baad mein backend)
  useEffect(() => {
    getHomeDashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const { personnel, wellnessStatus, atAGlance } = data;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Header: greeting + notification bell */}
        <View className="flex-row items-start justify-between mt-2">
          <View>
            <Text className="text-slate-500 text-base">{getGreeting()}</Text>
            <Text className="text-slate-900 text-2xl font-bold">
              {personnel.fullName}
            </Text>
            <Text className="text-slate-400 mt-1">
              Your well-being. Our priority.
            </Text>
          </View>
          <View className="bg-white p-2.5 rounded-full shadow-sm">
            <Ionicons name="notifications-outline" size={22} color="#334155" />
          </View>
        </View>

        {/* Wellness status card */}
        <View className="bg-white rounded-2xl p-5 mt-5 shadow-sm">
          <View className="flex-row">
            <View className="flex-1 pr-3">
              <Text className="text-slate-500 text-sm">
                Your Wellness Status
              </Text>
              <Text className="text-green-600 text-2xl font-bold mt-1">
                {wellnessStatus.label}
              </Text>
              <Text className="text-slate-500 text-sm mt-1">
                {wellnessStatus.description}
              </Text>
            </View>
            <View className="items-center justify-center border-l border-slate-100 pl-4">
              <Text className="text-slate-400 text-xs">Trend (7 Days)</Text>
              <Text className="text-green-600 font-bold mt-1">
                {wellnessStatus.trend}
              </Text>
            </View>
          </View>
        </View>

        {/* At a Glance stats */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">
          At a Glance
        </Text>
        <View className="flex-row gap-3">
          <StatCard
            icon="calendar-outline"
            label="Duty Load"
            value={atAGlance.dutyLoad.value}
            note={atAGlance.dutyLoad.note}
            color="#2563eb"
          />
          <StatCard
            icon="bed-outline"
            label="Avg. Rest Gap"
            value={atAGlance.avgRestGap.value}
            note={atAGlance.avgRestGap.note}
            color="#16a34a"
          />
          <StatCard
            icon="moon-outline"
            label="Night Duties"
            value={atAGlance.nightDuties.value}
            note={atAGlance.nightDuties.note}
            color="#7c3aed"
          />
        </View>

        {/* Quick access */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">
          Quick Access
        </Text>
        <View className="gap-3">
          <QuickAccessRow
            icon="headset-outline"
            title="Request Support"
            subtitle="Talk to a welfare officer or counselor"
            onPress={() => router.push("/(tabs)/support")}
          />
          <QuickAccessRow
            icon="leaf-outline"
            title="Wellness Resources"
            subtitle="Guides and tools for better recovery"
            onPress={() => router.push("/(tabs)/wellness")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// "At a Glance" ke teeno stat cards isi ek reusable component se banenge
function StatCard({ icon, label, value, note, color }) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-slate-500 text-xs text-center">{label}</Text>
      <Text className="text-slate-900 font-bold text-base mt-1">{value}</Text>
      <Text className="text-xs mt-1" style={{ color }}>
        {note}
      </Text>
    </View>
  );
}

// Quick Access section ki dono rows isi se banti hain
function QuickAccessRow({ icon, title, subtitle, onPress }) {
  return (
    <Pressable
      className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-semibold">{title}</Text>
        <Text className="text-slate-500 text-sm">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </Pressable>
  );
}
