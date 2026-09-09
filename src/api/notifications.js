import { Platform } from "react-native";

const DAILY_REMINDER_ID = "daily-check-in-reminder";

// "import" statements Metro/Babel dwara hamesha module ke sabse upar
// hoist ho jaate hain - agar expo-notifications khud apne load hote
// waqt Android+Expo Go par throw karta hai, toh woh throw kisi bhi
// try/catch se pehle hi ho jayega. Isliye yahan "require" use kiya hai
// (jo hoist nahi hota) taaki hum usse try/catch mein safely wrap kar
// sakein.
let Notifications = null;
try {
  Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log("expo-notifications unavailable on this runtime:", error.message);
}

// User se notification permission maangta hai (iOS mein zaroori,
// Android 13+ mein bhi zaroori hai)
export async function requestNotificationPermission() {
  if (!Notifications) return false;

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
  if (!Notifications) return;

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
  if (!Notifications) return;
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
