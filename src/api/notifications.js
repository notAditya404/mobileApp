import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const DAILY_REMINDER_ID = "daily-check-in-reminder";

// App foreground mein ho tab bhi notification banner + sound dikhe
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// User se notification permission maangta hai (iOS mein zaroori,
// Android 13+ mein bhi zaroori hai)
export async function requestNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Har roz shaam 8 baje local reminder - isko backend ki zaroorat nahi,
// phone khud hi schedule karke rakhta hai
export async function scheduleDailyCheckInReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Wellness Check-in",
      body: "Today's check-in is still pending - it only takes 30 seconds.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function cancelDailyCheckInReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}

// Toggle ke on/off state ke hisaab se reminder ko schedule/cancel karta
// hai - Home (app start par) aur Notification Settings (manual toggle)
// dono isi ek function ko call karte hain
export async function syncDailyCheckInReminder(isEnabled) {
  if (!isEnabled) {
    await cancelDailyCheckInReminder();
    return;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await scheduleDailyCheckInReminder();
}

// Backend endpoint (jab ready ho): POST /personnel/me/push-token
// Body: { token: string, platform: "ios" | "android" }
// Yeh asli push notifications (support updates, AI insights) ke liye
// zaroori hai - backend isi token pe Expo ke through notification bhejega.
export async function registerPushToken() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    if (USE_MOCK_DATA) {
      console.log("Mock: push token ready to send to backend ->", token);
      return;
    }

    await apiRequest("/personnel/me/push-token", {
      method: "POST",
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (error) {
    // Expo Go mein remote push token nahi milta (SDK 53+ se yeh feature
    // sirf standalone/dev-client build mein kaam karta hai) - ignore karo
    console.log("Push token registration skipped:", error.message);
  }
}
