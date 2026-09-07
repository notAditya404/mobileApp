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
