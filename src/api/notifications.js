import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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
