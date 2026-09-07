import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getWellnessOverview } from "@/api/wellness";
import { Skeleton } from "@/components/Skeleton";

export default function Wellness() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getWellnessOverview().then(setData);
  }, []);

  if (!data) {
    return <WellnessSkeleton />;
  }

  const { score, status, description, lastUpdated, pillars, influencingFactors, trend } = data;
  const maxTrendPoint = Math.max(...trend.points);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Header */}
        <View className="flex-row items-start justify-between mt-2">
          <View className="flex-1 pr-3">
            <Text className="text-2xl font-bold text-slate-900">My Wellness</Text>
            <Text className="text-slate-400 mt-1">
              Your wellness, understood through your patterns.
            </Text>
          </View>
          <View className="flex-row items-center gap-1 bg-violet-50 px-3 py-2 rounded-xl">
            <Ionicons name="shield-checkmark-outline" size={16} color="#7c3aed" />
            <Text className="text-violet-700 text-xs">Your data is secure & private</Text>
          </View>
        </View>

        {/* Wellness score card */}
        <View className="bg-white rounded-2xl p-5 mt-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-500 text-sm">Your Wellness Status</Text>
            <Ionicons name="information-circle-outline" size={16} color="#94a3b8" />
          </View>
          <Text className="text-violet-700 text-3xl font-extrabold mt-1">{status}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-4xl font-extrabold text-slate-900">{score}</Text>
            <Text className="text-slate-400 mb-1">/100 Wellness Score</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <View className="h-2 bg-violet-600 rounded-full" style={{ width: `${score}%` }} />
          </View>
          <Text className="text-slate-500 text-sm mt-3">{description}</Text>
          <Text className="text-slate-400 text-xs mt-3">Last updated: {lastUpdated}</Text>
        </View>

        {/* Pillars */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">Wellness Pillars</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {pillars.map((pillar) => (
              <View key={pillar.key} className="bg-white rounded-2xl p-4 w-32 shadow-sm">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${pillar.color}1A` }}
                >
                  <Ionicons name={pillar.icon} size={18} color={pillar.color} />
                </View>
                <Text className="text-slate-500 text-xs">{pillar.label}</Text>
                <Text className="text-slate-900 font-bold text-base mt-1">
                  {pillar.score}/100
                </Text>
                <View className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-1.5 rounded-full"
                    style={{ width: `${pillar.score}%`, backgroundColor: pillar.color }}
                  />
                </View>
                <Text className="text-xs mt-2" style={{ color: pillar.color }}>
                  {pillar.status}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Influencing factors */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-1">
          What is influencing my wellness?
        </Text>
        <Text className="text-slate-400 text-xs mb-3">
          These authorized factors are contributing to your current status.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {influencingFactors.map((factor) => (
            <View key={factor.label} className="bg-white rounded-2xl p-3 items-center" style={{ width: "31%" }}>
              <Ionicons name={factor.icon} size={20} color={factor.color} />
              <Text className="text-slate-700 text-xs text-center mt-2">{factor.label}</Text>
              <Text className="text-xs font-semibold text-center mt-1" style={{ color: factor.color }}>
                {factor.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Trend */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">
          Wellness Trend ({trend.rangeLabel})
        </Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-end gap-1.5" style={{ height: 90 }}>
            {trend.points.map((point, index) => (
              <View
                key={index}
                className="flex-1 bg-violet-500 rounded-t"
                style={{ height: `${(point / maxTrendPoint) * 100}%` }}
              />
            ))}
          </View>
          <View className="flex-row items-center gap-2 mt-4 bg-green-50 rounded-xl p-3">
            <Ionicons name="trending-up-outline" size={18} color="#16a34a" />
            <Text className="text-green-700 text-sm flex-1">{trend.summary}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Data load hone tak yeh dikhta hai
function WellnessSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 px-5">
        <View className="mt-2">
          <Skeleton className="w-32 h-7 mb-2" />
          <Skeleton className="w-48 h-4" />
        </View>

        <Skeleton className="w-full h-40 mt-5" style={{ borderRadius: 16 }} />

        <Skeleton className="w-36 h-5 mt-6 mb-3" />
        <View className="flex-row gap-3">
          <Skeleton className="w-32 h-32" style={{ borderRadius: 16 }} />
          <Skeleton className="w-32 h-32" style={{ borderRadius: 16 }} />
          <Skeleton className="w-32 h-32" style={{ borderRadius: 16 }} />
        </View>

        <Skeleton className="w-full h-40 mt-6" style={{ borderRadius: 16 }} />
      </View>
    </SafeAreaView>
  );
}
