import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getHomeDashboard } from "@/api/home";
import { getTodayCheckInStatus, submitCheckIn } from "@/api/selfAssessment";

// Device ke current time ke hisaab se greeting - subah/dopahar/shaam
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  return "Good Evening,";
}

const MOOD_OPTIONS = [
  { key: "low", emoji: "😞", label: "Low" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "great", emoji: "😄", label: "Great" },
];
const SLEEP_OPTIONS = ["< 5 hrs", "5-6 hrs", "6-7 hrs", "7-8 hrs", "8+ hrs"];
const STRESS_OPTIONS = ["Low", "Moderate", "High", "Very High"];

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState(true);

  const [isCheckInVisible, setIsCheckInVisible] = useState(false);
  const [mood, setMood] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Screen khulte hi dashboard data aur "aaj check-in hua ya nahi" dono load karo
  useEffect(() => {
    getHomeDashboard().then(setData);
    getTodayCheckInStatus().then((status) => setCheckedInToday(status.submittedToday));
  }, []);

  async function handleSubmitCheckIn() {
    if (!mood || !sleepHours || !stressLevel) {
      Alert.alert("Missing details", "Please answer all 3 quick questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCheckIn({ mood, sleepHours, stressLevel });
      setCheckedInToday(true);
      setIsCheckInVisible(false);
      setMood("");
      setSleepHours("");
      setStressLevel("");
    } catch (error) {
      Alert.alert("Something went wrong", "Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <Text className="text-white font-semibold">Aaj ka wellness check-in baaki hai</Text>
              <Text className="text-blue-100 text-xs mt-0.5">Bas 30 second - 3 quick sawaal</Text>
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
              Yeh sirf aapko dikhega, aur aapki wellness samajhne mein madad karega.
            </Text>

            <Text className="text-slate-700 font-medium mb-2">Aaj mood kaisa hai?</Text>
            <View className="flex-row gap-2 mb-5">
              {MOOD_OPTIONS.map((option) => {
                const selected = mood === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setMood(option.key)}
                    className={`flex-1 items-center py-3 rounded-xl border ${
                      selected ? "bg-blue-50 border-blue-600" : "bg-white border-slate-200"
                    }`}
                  >
                    <Text className="text-2xl">{option.emoji}</Text>
                    <Text className={`text-xs mt-1 ${selected ? "text-blue-700 font-semibold" : "text-slate-500"}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ChipGroup question="Kal raat neend kaisi thi?" options={SLEEP_OPTIONS} value={sleepHours} onChange={setSleepHours} />
            <ChipGroup question="Aaj stress level?" options={STRESS_OPTIONS} value={stressLevel} onChange={setStressLevel} />

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

// Check-in modal ke sawaal (sleep/stress) isi se bante hain - single-select chips
function ChipGroup({ question, options, value, onChange }) {
  return (
    <View className="mb-5">
      <Text className="text-slate-700 font-medium mb-2">{question}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={`px-3 py-2 rounded-full border ${
                selected ? "bg-blue-700 border-blue-700" : "bg-white border-slate-300"
              }`}
            >
              <Text className={selected ? "text-white text-sm" : "text-slate-600 text-sm"}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
