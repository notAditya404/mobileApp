import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "./config";
import { notifyUnauthorized } from "./authEvents";

// Yeh ek common function hai jo poore app mein backend ko call karne
// ke liye use hoga - isse har jagah alag alag fetch() likhne ki
// zaroorat nahi padegi.
//
// Usage example:
//   const data = await apiRequest("/personnel/me");
//   const data = await apiRequest("/support-requests", {
//     method: "POST",
//     body: JSON.stringify({ requestType: "medical" }),
//   });
export async function apiRequest(endpoint, options = {}) {
  const token = await SecureStore.getItemAsync("authToken");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Login/signup ke baad SecureStore mein save hua token yahan
      // automatically har request ke saath jaata hai
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expire ho gaya ya invalid hai - user ko automatically
    // logout kar do (AuthContext ne apna logout() yahan register kiya hai)
    notifyUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
