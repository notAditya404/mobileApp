import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getHomeDashboard } from "@/api/home";
import { getTodayCheckInStatus, submitCheckIn } from "@/api/selfAssessment";
import { getNotificationSettings } from "@/api/settings";
import { syncDailyCheckInReminder } from "@/api/notifications";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

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
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(true);

  const [isCheckInVisible, setIsCheckInVisible] = useState(false);
  const [sleepHours, setSleepHours] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Screen khulte hi dashboard data aur "aaj check-in hua ya nahi" dono load karo
  function loadDashboard() {
    setLoadError(false);
    return Promise.all([
      getHomeDashboard().then(setData),
      getTodayCheckInStatus().then((status) => setCheckedInToday(status.submittedToday)),
    ]).catch(() => setLoadError(true));
  }

  useEffect(() => {
    loadDashboard();

    // Notification settings ke hisaab se daily reminder ensure karo
    getNotificationSettings()
      .then((settings) => {
        syncDailyCheckInReminder(settings.dailyCheckInReminder);
      })
      .catch(() => {});
  }, []);

  // Pull-to-refresh - dashboard aur check-in status dono taaza kar deta hai
  function onRefresh() {
    setRefreshing(true);
    loadDashboard().finally(() => setRefreshing(false));
  }

  async function handleSubmitCheckIn() {
    const sleepHoursValid = sleepHours.trim() !== "" && !Number.isNaN(Number(sleepHours));
    const mealsPerDayValid = mealsPerDay.trim() !== "" && !Number.isNaN(Number(mealsPerDay));
    if (!sleepHoursValid || !mealsPerDayValid) {
      Alert.alert("Missing details", "Please answer both quick questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCheckIn({ sleepHours: Number(sleepHours), mealsPerDay: Number(mealsPerDay) });
      setCheckedInToday(true);
      setIsCheckInVisible(false);
      setSleepHours("");
      setMealsPerDay("");
    } catch (error) {
      Alert.alert("Something went wrong", "Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <ErrorState onRetry={loadDashboard} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return <HomeSkeleton />;
  }

  const { personnel, wellnessStatus, atAGlance, assignedDuty } = data;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
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

        {/* Daily check-in reminder - sirf tab dikhta hai jab aaj ka check-in nahi hua */}
        {!checkedInToday && (
          <Pressable
            className="flex-row items-center bg-blue-700 rounded-2xl p-4 mt-5"
            onPress={() => setIsCheckInVisible(true)}
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
              <Ionicons name="happy-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Today's wellness check-in is pending</Text>
              <Text className="text-blue-100 text-xs mt-0.5">Just 15 seconds - 2 quick questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </Pressable>
        )}

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

        {/* Assigned duty card - admin ne web dashboard se allot kiya hua */}
        <View className="flex-row items-center bg-white rounded-2xl p-4 mt-6 shadow-sm">
          <View
            className={`w-11 h-11 rounded-full items-center justify-center ${
              assignedDuty ? "bg-blue-50" : "bg-slate-100"
            }`}
          >
            <Ionicons
              name="briefcase-outline"
              size={20}
              color={assignedDuty ? "#2563eb" : "#94a3b8"}
            />
          </View>
          <View className="flex-1 px-3">
            {assignedDuty ? (
              <>
                <Text className="text-slate-900 text-sm font-semibold">
                  Duty Assigned - {assignedDuty.date}
                </Text>
                <Text className="text-slate-500 text-xs mt-1">{assignedDuty.remark}</Text>
              </>
            ) : (
              <>
                <Text className="text-slate-700 text-sm font-medium">No duty assigned yet</Text>
                <Text className="text-slate-400 text-xs mt-1">
                  Your admin hasn't allotted your next duty.
                </Text>
              </>
            )}
          </View>
          {assignedDuty && (
            <View className="items-end">
              <Text className="text-blue-700 font-bold text-base">{assignedDuty.hours} hrs</Text>
              <Text className="text-slate-400 text-[10px]">Working Hours</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Daily check-in modal */}
      <Modal
        visible={isCheckInVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCheckInVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsCheckInVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6" onPress={() => {}}>
            <Text className="text-slate-900 text-lg font-bold mb-1">Daily Check-in</Text>
            <Text className="text-slate-400 text-sm mb-5">
              This is only visible to you, and helps us understand your wellness.
            </Text>

            <Text className="text-slate-700 font-medium mb-2">How many hours did you sleep last night?</Text>
            <TextInput
              className="border border-slate-300 rounded-xl px-3 py-3 text-slate-900 mb-5"
              placeholder="e.g. 7"
              keyboardType="numeric"
              value={sleepHours}
              onChangeText={setSleepHours}
            />

            <Text className="text-slate-700 font-medium mb-2">How many meals have you eaten today?</Text>
            <TextInput
              className="border border-slate-300 rounded-xl px-3 py-3 text-slate-900 mb-5"
              placeholder="e.g. 3"
              keyboardType="numeric"
              value={mealsPerDay}
              onChangeText={setMealsPerDay}
            />

            <Pressable
              className="bg-blue-700 rounded-xl py-4 items-center mt-2"
              onPress={handleSubmitCheckIn}
              disabled={isSubmitting}
            >
              <Text className="text-white font-semibold">
                {isSubmitting ? "Submitting..." : "Submit Check-in"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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

// Data load hone tak yeh dikhta hai - Home screen ke roughly jaisa shape
function HomeSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 px-5">
        <View className="flex-row items-start justify-between mt-2">
          <View>
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-40 h-7 mb-2" />
            <Skeleton className="w-32 h-3" />
          </View>
          <Skeleton className="w-10 h-10 rounded-full" />
        </View>

        <Skeleton className="w-full h-28 mt-5" style={{ borderRadius: 16 }} />

        <Skeleton className="w-28 h-5 mt-6 mb-3" />
        <View className="flex-row gap-3">
          <Skeleton className="flex-1 h-28" style={{ borderRadius: 16 }} />
          <Skeleton className="flex-1 h-28" style={{ borderRadius: 16 }} />
          <Skeleton className="flex-1 h-28" style={{ borderRadius: 16 }} />
        </View>

        <Skeleton className="w-32 h-5 mt-6 mb-3" />
        <Skeleton className="w-full h-16 mb-3" style={{ borderRadius: 16 }} />
        <Skeleton className="w-full h-16" style={{ borderRadius: 16 }} />

        <Skeleton className="w-full h-16 mt-6" style={{ borderRadius: 16 }} />
      </View>
    </SafeAreaView>
  );
}
