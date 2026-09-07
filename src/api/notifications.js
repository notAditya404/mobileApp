import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_REMINDER_ID = "daily-check-in-reminder";

// Expo Go (Android, SDK 53+) is-poore module ke kuch calls par error
// throw kar deta hai - isliye har jagah try/catch lagaya hai taaki app
// crash na ho, sirf reminder feature us case mein silently skip ho jaye.
try {
  // App foreground mein ho tab bhi notification banner + sound dikhe
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log("Notification handler setup skipped:", error.message);
}

// User se notification permission maangta hai (iOS mein zaroori,
// Android 13+ mein bhi zaroori hai)
export async function requestNotificationPermission() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.log("Notification permission request skipped:", error.message);
    return false;
  }
}

// Har roz shaam 8 baje local reminder - isko backend ki zaroorat nahi,
// phone khud hi schedule karke rakhta hai
export async function scheduleDailyCheckInReminder() {
  try {
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
  } catch (error) {
    console.log("Daily reminder scheduling skipped:", error.message);
  }
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
