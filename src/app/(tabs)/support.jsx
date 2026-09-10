import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getSupportRequests, createSupportRequest, WELLNESS_RESOURCES } from "@/api/support";
import { getLeaveRequests, createLeaveRequest } from "@/api/leave";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

const LEAVE_STATUS_COLORS = {
  Pending: "#d97706",
  Approved: "#16a34a",
  Rejected: "#dc2626",
  Expired: "#64748b",
};

const STATUS_COLORS = {
  Acknowledged: "#16a34a",
  "In Progress": "#2563eb",
  Submitted: "#7c3aed",
};

const REQUEST_TYPES = [
  { key: "welfare", label: "Welfare" },
  { key: "medical", label: "Medical" },
  { key: "general", label: "General" },
];

const SUPPORT_TYPE_ICONS = {
  welfare: "person-outline",
  medical: "medkit-outline",
  general: "chatbubble-outline",
};

export default function Support() {
  const [requests, setRequests] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Resource card tap karne par isme woh resource set hoti hai (detail modal)
  const [selectedResource, setSelectedResource] = useState(null);

  // "Request Support" form modal - API ko ek real requestType + description
  // chahiye (sirf ek fixed string kaafi nahi), isliye chhota form leta hai
  const [isRequestFormVisible, setIsRequestFormVisible] = useState(false);
  const [requestType, setRequestType] = useState("welfare");
  const [requestDescription, setRequestDescription] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState(null);
  const [isLeaveFormVisible, setIsLeaveFormVisible] = useState(false);
  const [leaveFromDate, setLeaveFromDate] = useState("");
  const [leaveToDate, setLeaveToDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  function loadRequests() {
    setLoadError(false);
    return Promise.all([getSupportRequests(), getLeaveRequests()])
      .then(([supportData, leaveData]) => {
        setRequests(supportData);
        setLeaveRequests(leaveData);
      })
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadRequests().finally(() => setRefreshing(false));
  }

  async function handleSubmitRequest() {
    if (!requestDescription.trim()) {
      Alert.alert("Missing details", "Please briefly describe what you need help with.");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      // Yeh call asli backend ready hone par seedha admin dashboard ko
      // dikhne wali request banayegi (src/api/config.js mein USE_MOCK_DATA
      // false karke). Admin phir apni taraf se doctor/counselor allot karega.
      const newRequest = await createSupportRequest(requestType, requestDescription.trim());
      setRequests((prev) => [newRequest, ...(prev ?? [])]);
      setIsRequestFormVisible(false);
      setRequestDescription("");
      setRequestType("welfare");
      Alert.alert("Request Sent", "Your support request has been submitted to your welfare officer.");
    } catch (error) {
      Alert.alert("Something went wrong", "Please try again in a moment.");
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  async function handleSubmitLeave() {
    if (!leaveFromDate.trim() || !leaveToDate.trim() || !leaveReason.trim()) {
      Alert.alert("Missing details", "Please fill in the dates and a reason for leave.");
      return;
    }

    setIsSubmittingLeave(true);
    try {
      // Asli backend ready hone par yeh seedha admin ke Scheduling tab par
      // "Pending" dikhega, jahan se woh approve/reject karega.
      const newLeave = await createLeaveRequest(
        leaveFromDate.trim(),
        leaveToDate.trim(),
        leaveReason.trim(),
      );
      setLeaveRequests((prev) => [newLeave, ...(prev ?? [])]);
      setIsLeaveFormVisible(false);
      setLeaveFromDate("");
      setLeaveToDate("");
      setLeaveReason("");
      Alert.alert("Leave Requested", "Your leave request has been sent to your admin for approval.");
    } catch (error) {
      Alert.alert("Something went wrong", "Please try again in a moment.");
    } finally {
      setIsSubmittingLeave(false);
    }
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <ErrorState onRetry={loadRequests} />
      </SafeAreaView>
    );
  }

  if (!requests || !leaveRequests) {
    return <SupportSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
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
            onPress={() => setIsRequestFormVisible(true)}
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
                <Ionicons
                  name={SUPPORT_TYPE_ICONS[req.requestType] ?? "document-text-outline"}
                  size={18}
                  color="#334155"
                />
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

        {/* Apply for leave card */}
        <View className="bg-blue-50 rounded-2xl p-5 mt-6">
          <View className="w-11 h-11 rounded-full bg-blue-100 items-center justify-center mb-3">
            <Ionicons name="calendar-outline" size={22} color="#2563eb" />
          </View>
          <Text className="text-slate-900 font-bold text-lg">Need Time Off?</Text>
          <Text className="text-slate-500 text-sm mt-1 mb-4">
            Apply for leave - your admin will review and approve it.
          </Text>
          <Pressable
            className="bg-blue-700 rounded-xl py-3 px-5 self-start flex-row items-center gap-2"
            onPress={() => setIsLeaveFormVisible(true)}
          >
            <Text className="text-white font-semibold">Apply for Leave</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </Pressable>
        </View>

        {/* My leave requests */}
        <Text className="text-slate-900 text-lg font-bold mt-6 mb-3">My Leave Requests</Text>
        <View className="gap-3">
          {leaveRequests.map((leave) => (
            <View key={leave.id} className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={18} color="#334155" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-semibold">
                  {leave.fromDate}
                  {leave.fromDate !== leave.toDate ? ` - ${leave.toDate}` : ""}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">{leave.reason}</Text>
              </View>
              <View
                className="px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${LEAVE_STATUS_COLORS[leave.status] ?? "#64748b"}1A` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: LEAVE_STATUS_COLORS[leave.status] ?? "#64748b" }}
                >
                  {leave.status}
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

      {/* Request Support form modal */}
      <Modal
        visible={isRequestFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRequestFormVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsRequestFormVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6" onPress={() => {}}>
            <Text className="text-slate-900 text-lg font-bold mb-1">Request Support</Text>
            <Text className="text-slate-400 text-sm mb-4">
              This goes directly to your unit's welfare officer.
            </Text>

            <Text className="text-slate-600 text-sm mb-2">What kind of support do you need?</Text>
            <View className="flex-row gap-2 mb-4">
              {REQUEST_TYPES.map((type) => {
                const selected = requestType === type.key;
                return (
                  <Pressable
                    key={type.key}
                    onPress={() => setRequestType(type.key)}
                    className={`px-4 py-2 rounded-full border ${
                      selected ? "bg-violet-700 border-violet-700" : "bg-white border-slate-300"
                    }`}
                  >
                    <Text className={selected ? "text-white text-sm" : "text-slate-600 text-sm"}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-slate-600 text-sm mb-2">Briefly describe your situation</Text>
            <TextInput
              className="border border-slate-300 rounded-xl p-3 text-slate-900 mb-5"
              placeholder="What's going on? (kept confidential)"
              multiline
              numberOfLines={4}
              value={requestDescription}
              onChangeText={setRequestDescription}
              style={{ minHeight: 90, textAlignVertical: "top" }}
            />

            <Pressable
              className="bg-violet-700 rounded-xl py-4 items-center"
              onPress={handleSubmitRequest}
              disabled={isSubmittingRequest}
            >
              <Text className="text-white font-semibold">
                {isSubmittingRequest ? "Submitting..." : "Submit Request"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Apply for Leave form modal */}
      <Modal
        visible={isLeaveFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLeaveFormVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsLeaveFormVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6" onPress={() => {}}>
            <Text className="text-slate-900 text-lg font-bold mb-1">Apply for Leave</Text>
            <Text className="text-slate-400 text-sm mb-4">
              This goes directly to your admin for approval.
            </Text>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-slate-600 text-sm mb-2">From</Text>
                <TextInput
                  className="border border-slate-300 rounded-xl p-3 text-slate-900"
                  placeholder="e.g. 12 Sep 2024"
                  value={leaveFromDate}
                  onChangeText={setLeaveFromDate}
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-600 text-sm mb-2">To</Text>
                <TextInput
                  className="border border-slate-300 rounded-xl p-3 text-slate-900"
                  placeholder="e.g. 14 Sep 2024"
                  value={leaveToDate}
                  onChangeText={setLeaveToDate}
                />
              </View>
            </View>

            <Text className="text-slate-600 text-sm mb-2">Reason</Text>
            <TextInput
              className="border border-slate-300 rounded-xl p-3 text-slate-900 mb-5"
              placeholder="e.g. Family function"
              multiline
              numberOfLines={3}
              value={leaveReason}
              onChangeText={setLeaveReason}
              style={{ minHeight: 70, textAlignVertical: "top" }}
            />

            <Pressable
              className="bg-blue-700 rounded-xl py-4 items-center"
              onPress={handleSubmitLeave}
              disabled={isSubmittingLeave}
            >
              <Text className="text-white font-semibold">
                {isSubmittingLeave ? "Submitting..." : "Submit Leave Request"}
              </Text>
            </Pressable>
          </Pressable>
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

        <Skeleton className="w-full h-40 mt-6" style={{ borderRadius: 16 }} />

        <Skeleton className="w-40 h-5 mt-6 mb-3" />
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
