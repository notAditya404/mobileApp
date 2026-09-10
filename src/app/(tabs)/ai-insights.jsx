import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAiInsights } from "@/api/aiInsights";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

// Icon purely presentational - frontend "key" se decide karta hai
const CONTRIBUTING_FACTOR_ICONS = {
  nightDutyFrequency: "moon-outline",
  consecutiveDutyDays: "calendar-outline",
  restGap: "bed-outline",
};
const DEFAULT_FACTOR_ICON = "ellipse-outline";

// Color backend se nahi aata - "impact" text se hi severity color
// derive kar lete hain, alag field ki zaroorat nahi
const IMPACT_COLORS = {
  "High Impact": "#dc2626",
  "Moderate Impact": "#ea580c",
  "Low Impact": "#16a34a",
};
const DEFAULT_IMPACT_COLOR = "#64748b";

export default function AiInsights() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function loadInsights() {
    setLoadError(false);
    return getAiInsights()
      .then(setData)
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    loadInsights();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadInsights().finally(() => setRefreshing(false));
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <ErrorState onRetry={loadInsights} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return <AiInsightsSkeleton />;
  }

  const { summaryTitle, summaryDescription, outlookScore, outlookLabel, contributingFactors, prediction, recommendation } = data;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mt-2">
          <View className="flex-row items-center gap-2 flex-1 pr-3">
            <Ionicons name="sparkles" size={22} color="#4c1d95" />
            <View>
              <Text className="text-2xl font-bold text-slate-900">AI Insights</Text>
              <Text className="text-slate-400 text-xs">
                Smart insights. Early awareness.
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1 bg-violet-50 px-3 py-2 rounded-xl">
            <Ionicons name="shield-checkmark-outline" size={16} color="#7c3aed" />
            <Text className="text-violet-700 text-xs">Secure & private</Text>
          </View>
        </View>

        {/* AI summary card */}
        <View className="bg-[#1e1b4b] rounded-2xl p-5 mt-5">
          <Text className="text-violet-300 text-xs mb-2">AI SUMMARY</Text>
          <Text className="text-white text-lg font-bold leading-6">{summaryTitle}</Text>
          <Text className="text-slate-300 text-sm mt-2">{summaryDescription}</Text>

          <View className="flex-row items-center gap-2 mt-4">
            <Text className="text-white text-3xl font-extrabold">{outlookScore}</Text>
            <Text className="text-slate-400">/100</Text>
            <View className="flex-1 items-end">
              <Text className="text-slate-400 text-xs">Wellness Outlook</Text>
              <Text className="text-violet-300 font-semibold">{outlookLabel}</Text>
            </View>
          </View>
        </View>

        {/* Contributing factors */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">Contributing Factors</Text>
        <View className="bg-white rounded-2xl shadow-sm">
          {contributingFactors.map((factor, index) => {
            const icon = CONTRIBUTING_FACTOR_ICONS[factor.key] ?? DEFAULT_FACTOR_ICON;
            const color = IMPACT_COLORS[factor.impact] ?? DEFAULT_IMPACT_COLOR;
            return (
              <View
                key={factor.key}
                className={`flex-row items-center p-4 ${
                  index < contributingFactors.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Ionicons name={icon} size={18} color={color} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold">{factor.label}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">{factor.description}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Text className="text-xs font-semibold" style={{ color }}>
                      {factor.impact}
                    </Text>
                  </View>
                  <View className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <View
                      className="h-1.5 rounded-full"
                      style={{ width: `${factor.impactPercent}%`, backgroundColor: color }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* AI prediction */}
        <View className="bg-violet-50 rounded-2xl p-4 mt-6">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="planet-outline" size={18} color="#7c3aed" />
            <Text className="text-slate-900 font-bold">AI Prediction</Text>
          </View>
          <Text className="text-slate-600 text-sm mb-3">{prediction.text}</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-violet-700 text-2xl font-extrabold">
              {prediction.riskPercent}%
            </Text>
            <View>
              <Text className="text-slate-500 text-xs">Risk of Decline</Text>
              <Text className="text-violet-700 text-sm font-semibold">{prediction.riskLabel}</Text>
            </View>
          </View>
        </View>

        {/* Recommendation */}
        <View className="bg-green-50 rounded-2xl p-4 mt-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="shield-checkmark" size={18} color="#16a34a" />
            <Text className="text-slate-900 font-bold">Personalized Recommendation</Text>
          </View>
          <Text className="text-slate-800 font-semibold mb-1">{recommendation.title}</Text>
          <Text className="text-slate-500 text-sm mb-3">{recommendation.description}</Text>
          <Pressable
            className="self-start border border-green-600 rounded-xl px-4 py-2 flex-row items-center gap-1"
            onPress={() => Alert.alert("Action Plan", recommendation.description)}
          >
            <Text className="text-green-700 font-semibold text-sm">View Action Plan</Text>
            <Ionicons name="chevron-forward" size={14} color="#16a34a" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 bg-slate-100 rounded-xl p-3 mt-6">
          <Ionicons name="information-circle-outline" size={16} color="#64748b" />
          <Text className="text-slate-500 text-xs flex-1">
            Insights are generated by AI using your authorized data only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Data load hone tak yeh dikhta hai
function AiInsightsSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between mt-2">
          <Skeleton className="w-32 h-7" />
          <Skeleton className="w-28 h-8" style={{ borderRadius: 12 }} />
        </View>

        <Skeleton className="w-full h-32 mt-5" style={{ borderRadius: 16 }} />

        <Skeleton className="w-36 h-5 mt-6 mb-3" />
        <Skeleton className="w-full h-24 mb-3" style={{ borderRadius: 16 }} />
        <Skeleton className="w-full h-24 mb-3" style={{ borderRadius: 16 }} />
        <Skeleton className="w-full h-24" style={{ borderRadius: 16 }} />
      </View>
    </SafeAreaView>
  );
}
