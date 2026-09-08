import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getSupportRequests, createSupportRequest, WELLNESS_RESOURCES } from "@/api/support";
import { Skeleton } from "@/components/Skeleton";

const STATUS_COLORS = {
  Acknowledged: "#16a34a",
  "In Progress": "#2563eb",
  Submitted: "#7c3aed",
};

export default function Support() {
  const [requests, setRequests] = useState(null);

  // Resource card tap karne par isme woh resource set hoti hai (detail modal)
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    getSupportRequests().then(setRequests);
  }, []);

  async function handleRequestSupport() {
    // Yeh call asli backend ready hone par seedha admin dashboard ko
    // dikhne wali request banayegi (src/api/config.js mein USE_MOCK_DATA
    // false karke). Admin phir apni taraf se doctor/counselor allot karega.
    const newRequest = await createSupportRequest("welfare", "Requesting welfare officer support.");
    setRequests((prev) => [newRequest, ...(prev ?? [])]);
    Alert.alert("Request Sent", "Your support request has been submitted. A welfare officer will reach out to you.");
  }

  if (!requests) {
    return <SupportSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Header */}
        <View className="flex-row items-start justify-between mt-2">
          <View className="flex-1 pr-3">
            <Text className="text-2xl font-bold text-slate-900">Support</Text>
            <Text className="text-slate-400 mt-1">
              We're here for your well-being. All support is confidential and secure.
            </Text>
          </View>
        </View>

        {/* Need support card */}
        <View className="bg-violet-50 rounded-2xl p-5 mt-5">
          <View className="w-11 h-11 rounded-full bg-violet-100 items-center justify-center mb-3">
            <Ionicons name="headset-outline" size={22} color="#7c3aed" />
          </View>
          <Text className="text-slate-900 font-bold text-lg">Need Support?</Text>
          <Text className="text-slate-500 text-sm mt-1 mb-4">
            Talk to a welfare officer or counselor. You are not alone.
          </Text>
          <Pressable
            className="bg-violet-700 rounded-xl py-3 px-5 self-start flex-row items-center gap-2"
            onPress={handleRequestSupport}
          >
            <Text className="text-white font-semibold">Request Support</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </Pressable>
        </View>

        {/* My requests */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">My Support Requests</Text>
        <View className="gap-3">
          {requests.map((req) => (
            <View key={req.id} className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name={req.icon ?? "document-text-outline"} size={18} color="#334155" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-semibold">{req.title}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Submitted on {req.submittedAt}</Text>
                <Text className="text-slate-300 text-xs">Request ID: {req.id}</Text>
              </View>
              <View
                className="px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${STATUS_COLORS[req.status] ?? "#64748b"}1A` }}
              >
                <Text className="text-xs font-semibold" style={{ color: STATUS_COLORS[req.status] ?? "#64748b" }}>
                  {req.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Resources */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">Wellness Resources</Text>
        <View className="flex-row flex-wrap gap-3">
          {WELLNESS_RESOURCES.map((resource) => (
            <Pressable
              key={resource.title}
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ width: "47%" }}
              onPress={() => setSelectedResource(resource)}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${resource.color}1A` }}
              >
                <Ionicons name={resource.icon} size={18} color={resource.color} />
              </View>
              <Text className="text-slate-900 font-semibold text-sm">{resource.title}</Text>
              <Text className="text-slate-400 text-xs mt-1">{resource.description}</Text>
            </Pressable>
          ))}
        </View>

        {/* Privacy banner */}
        <View className="flex-row items-center gap-2 bg-violet-50 rounded-xl p-3 mt-6">
          <Ionicons name="lock-closed-outline" size={16} color="#7c3aed" />
          <Text className="text-violet-800 text-xs flex-1">
            Your privacy is our priority. We connect you only with authorized welfare officers and counselors.
          </Text>
        </View>

        {/* Emergency banner */}
        <View className="flex-row items-center gap-2 bg-amber-50 rounded-xl p-3 mt-3">
          <Ionicons name="call-outline" size={16} color="#d97706" />
          <Text className="text-amber-800 text-xs flex-1">
            In case of emergency or distress, contact your unit welfare officer immediately.
          </Text>
          <Pressable
            className="bg-white border border-amber-300 rounded-lg px-3 py-1.5"
            onPress={() => Linking.openURL("tel:1800111000")}
          >
            <Text className="text-amber-700 text-xs font-semibold">Helpline</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Resource detail modal - card bada hoke, translucent backdrop ke sath info dikhata hai */}
      <Modal
        visible={!!selectedResource}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedResource(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setSelectedResource(null)}
        >
          {selectedResource && (
            <Pressable className="bg-white rounded-3xl p-6 w-full" onPress={() => {}}>
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${selectedResource.color}1A` }}
              >
                <Ionicons name={selectedResource.icon} size={28} color={selectedResource.color} />
              </View>
              <Text className="text-slate-900 text-xl font-bold mb-2">
                {selectedResource.title}
              </Text>
              <Text className="text-slate-600 text-sm leading-5">
                {selectedResource.details}
              </Text>
              <Pressable
                className="bg-slate-100 rounded-xl py-3 items-center mt-6"
                onPress={() => setSelectedResource(null)}
              >
                <Text className="text-slate-700 font-semibold">Close</Text>
              </Pressable>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Data load hone tak yeh dikhta hai
function SupportSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 px-5">
        <View className="mt-2">
          <Skeleton className="w-28 h-7 mb-2" />
          <Skeleton className="w-56 h-4" />
        </View>

        <Skeleton className="w-full h-40 mt-5" style={{ borderRadius: 16 }} />

        <Skeleton className="w-44 h-5 mt-6 mb-3" />
        <Skeleton className="w-full h-20 mb-3" style={{ borderRadius: 16 }} />
        <Skeleton className="w-full h-20" style={{ borderRadius: 16 }} />

        <Skeleton className="w-40 h-5 mt-6 mb-3" />
        <View className="flex-row flex-wrap gap-3">
          <Skeleton className="h-28" style={{ width: "47%", borderRadius: 16 }} />
          <Skeleton className="h-28" style={{ width: "47%", borderRadius: 16 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}
