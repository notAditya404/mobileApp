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

// Agle 8pm occurrence ka Date - aaj ka check-in ho chuka ho ya aaj ka
// 8pm nikal chuka ho, dono cases mein kal 8pm par chala jaata hai.
function nextReminderDate(alreadyCheckedInToday) {
  const next = new Date();
  next.setHours(20, 0, 0, 0);
  if (alreadyCheckedInToday || next <= new Date()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

// Ek hi baar ke liye 8pm reminder schedule karta hai (DAILY recurring
// trigger nahi) - warna yeh check-in ho jaane ke baad bhi "still pending"
// bolta rehta, kyunki recurring trigger ko kabhi pata hi nahi chalta ki
// beech mein check-in ho chuka hai. Isliye Home mount aur check-in ke
// baad, dono jagah se isko phir se schedule kiya jaata hai (agla din ke
// liye), taaki yeh hamesha sahi din ke liye hi baje.
export async function scheduleDailyCheckInReminder(alreadyCheckedInToday = false) {
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
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextReminderDate(alreadyCheckedInToday),
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
// dono isi ek function ko call karte hain. `alreadyCheckedInToday` pass
// karo taaki aaj check-in ho chuka ho to reminder seedha kal ke liye
// schedule ho, aaj phir se "pending" bolkar user ko mislead na kare.
export async function syncDailyCheckInReminder(isEnabled, alreadyCheckedInToday = false) {
  if (!isEnabled) {
    await cancelDailyCheckInReminder();
    return;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await scheduleDailyCheckInReminder(alreadyCheckedInToday);
}
