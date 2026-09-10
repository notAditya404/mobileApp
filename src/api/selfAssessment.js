import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const LAST_CHECKIN_DATE_KEY = "lastCheckInDate";

// Local date parts, not toISOString() (which converts to UTC) - between
// 12:00am and ~5:30am IST, the UTC calendar date is still "yesterday",
// so toISOString() would say a check-in from a few minutes ago wasn't
// "today" at all.
function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Aaj ka daily check-in bhara ja chuka hai ya nahi, yeh check karta hai.
// Backend endpoint (jab ready ho): GET /personnel/me/self-assessments/today
// Response: { submittedToday: boolean }
export async function getTodayCheckInStatus() {
  if (USE_MOCK_DATA) {
    // Real backend na hone tak, device par hi aaj ki date save karke
    // "already submitted" ka behavior simulate karte hain.
    const lastDate = await SecureStore.getItemAsync(LAST_CHECKIN_DATE_KEY);
    return { submittedToday: lastDate === todayString() };
  }
  return apiRequest("/personnel/me/self-assessments/today");
}

// Backend endpoint: POST /personnel/me/self-assessments
// Body: { sleepHours: number, mealsPerDay: number }
// Yeh har check-in ek naya self_assessments row banayega, jo ML model ke
// liye seedha input banta hai (sleep_hours ka 15-din average, meals_per_day
// ka sabse recent value - dekho backend ka mlRecordBuilder.js).
export async function submitCheckIn(checkInData) {
  if (USE_MOCK_DATA) {
    await SecureStore.setItemAsync(LAST_CHECKIN_DATE_KEY, todayString());
    return { success: true };
  }

  return apiRequest("/personnel/me/self-assessments", {
    method: "POST",
    body: JSON.stringify(checkInData),
  });
}
