import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getProfile } from "@/api/profile";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(false);

  function loadProfile() {
    setLoadError(false);
    getProfile()
      .then(setProfile)
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        // AuthContext token clear karke isLoggedIn false kar deta hai -
        // Stack.Protected khud Welcome par le jata hai
        onPress: logout,
      },
    ]);
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <ErrorState onRetry={loadProfile} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return <ProfileSkeleton />;
  }

  const { fullName, rank, verified, personalInfo } = profile;

  const personalInfoRows = [
    { icon: "calendar-outline", label: "Date of Birth", value: personalInfo.dob },
    { icon: "person-outline", label: "Gender", value: personalInfo.gender },
    { icon: "mail-outline", label: "Email", value: personalInfo.email },
    { icon: "water-outline", label: "Blood Group", value: personalInfo.bloodGroup },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Header */}
        <Text className="text-2xl font-bold text-slate-900 mt-2">Profile</Text>
        <Text className="text-slate-400 mt-1 mb-5">
          View and manage your personal information and account settings.
        </Text>

        {/* Profile card */}
        <View className="bg-blue-50 rounded-2xl p-5">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-3">
              <Text className="text-white text-xl font-bold">
                {fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-slate-900 font-bold" numberOfLines={1}>
                  {fullName}
                </Text>
                {verified && <Ionicons name="checkmark-circle" size={16} color="#16a34a" />}
              </View>
              <Text className="text-slate-500 text-xs mt-1">{rank}</Text>
            </View>
          </View>
          {verified && (
            <View className="bg-green-100 self-start rounded-full px-3 py-1 mt-3 flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
              <Text className="text-green-700 text-xs font-semibold">Verified Personnel</Text>
            </View>
          )}
        </View>

        {/* Personal information */}
        <SectionTitle icon="person-outline" title="Personal Information" />
        <View className="bg-white rounded-2xl shadow-sm">
          {personalInfoRows.map((row, index) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between p-4 ${
                index < personalInfoRows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name={row.icon} size={16} color="#2563eb" />
                <Text className="text-slate-500 text-sm">{row.label}</Text>
              </View>
              <Text className="text-slate-900 text-sm font-medium">{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Account & security */}
        <SectionTitle icon="lock-closed-outline" title="Account & Security" />
        <View className="bg-white rounded-2xl shadow-sm">
          <SettingsRow
            icon="lock-closed-outline"
            label="Change Password"
            last
            onPress={() => router.push("/change-password")}
          />
        </View>

        {/* Settings */}
        <SectionTitle icon="settings-outline" title="Settings" />
        <View className="bg-white rounded-2xl shadow-sm">
          <SettingsRow
            icon="notifications-outline"
            label="Notification Settings"
            last
            onPress={() => router.push("/notification-settings")}
          />
        </View>

        {/* Logout */}
        <Pressable
          className="flex-row items-center justify-between bg-red-50 rounded-2xl p-4 mt-6"
          onPress={handleLogout}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <View>
              <Text className="text-red-600 font-semibold">Logout</Text>
              <Text className="text-red-400 text-xs">Sign out from your account</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#dc2626" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <View className="flex-row items-center gap-2 mt-6 mb-3">
      <Ionicons name={icon} size={16} color="#2563eb" />
      <Text className="text-slate-900 font-bold">{title}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, value, last, onPress }) {
  return (
    <Pressable
      className={`flex-row items-center justify-between p-4 ${last ? "" : "border-b border-slate-100"}`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color="#334155" />
        <Text className="text-slate-800 text-sm">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-slate-400 text-sm">{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      </View>
    </Pressable>
  );
}

// Data load hone tak yeh dikhta hai
function ProfileSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 px-5">
        <Skeleton className="w-24 h-7 mt-2 mb-2" />
        <Skeleton className="w-64 h-4 mb-5" />

        <Skeleton className="w-full h-24" style={{ borderRadius: 16 }} />

        <Skeleton className="w-40 h-5 mt-6 mb-3" />
        <Skeleton className="w-full h-40" style={{ borderRadius: 16 }} />

        <Skeleton className="w-40 h-5 mt-6 mb-3" />
        <Skeleton className="w-full h-14" style={{ borderRadius: 16 }} />
      </View>
    </SafeAreaView>
  );
}
