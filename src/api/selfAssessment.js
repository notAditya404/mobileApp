import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const LAST_CHECKIN_DATE_KEY = "lastCheckInDate";

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

// Backend endpoint (jab ready ho): POST /personnel/me/self-assessments
// Body: { mood, sleepHours, stressLevel }
// Yeh har check-in ek naya self_assessments row banayega (DB design ke
// mutabik), jo AI model ke liye baseline/trend data ban jayega.
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
