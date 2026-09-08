import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// Fake user - jab tak mock mode on hai, login isi data se "success" hoga.
const MOCK_LOGIN_RESPONSE = {
  token: "mock-token-123",
  personnel: {
    fullName: "Arjun Kumar",
    rank: "Rifleman",
  },
};

// Backend endpoint (jab ready ho): POST /auth/login
// Body: { userId: string, password: string }
// Response: { token: string, personnel: {...} }
export async function login(userId, password) {
  if (USE_MOCK_DATA) {
    return MOCK_LOGIN_RESPONSE;
  }

  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ userId, password }),
  });
}

// Backend endpoint (jab ready ho): POST /auth/signup
// Body: { fullName, email, rank, dob, gender, bloodGroup, sleepHours,
//         dietQuality, workPressure, lastLeave, password }
// (sleepHours/dietQuality/workPressure/lastLeave signup ke waqt li gayi
// initial wellness survey se aate hain - backend inhe personnel ke pehle
// self_assessment record ki tarah save kar sakta hai)
// Response: { token: string, personnel: {...} }
export async function signup(signupData) {
  if (USE_MOCK_DATA) {
    return MOCK_LOGIN_RESPONSE;
  }

  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(signupData),
  });
}

// Backend endpoint (jab ready ho): POST /auth/change-password
// Body: { currentPassword, newPassword }
export async function changePassword(currentPassword, newPassword) {
  if (USE_MOCK_DATA) {
    return { success: true };
  }

  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
