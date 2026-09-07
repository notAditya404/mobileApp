import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// Fake user - jab tak mock mode on hai, login isi data se "success" hoga.
const MOCK_LOGIN_RESPONSE = {
  token: "mock-token-123",
  personnel: {
    id: 1,
    fullName: "Rifleman Arjun Kumar",
    employeeId: "CAPF123456",
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
// Body: { fullName, email, rank, otp, locationAccess, password }
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

// Backend endpoint (jab ready ho): POST /auth/send-otp
// Body: { email: string }
export async function sendOtp(email) {
  if (USE_MOCK_DATA) {
    return { sent: true };
  }

  return apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
