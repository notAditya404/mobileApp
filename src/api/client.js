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
const REQUEST_TIMEOUT_MS = 15000;

export async function apiRequest(endpoint, options = {}) {
  const token = await SecureStore.getItemAsync("authToken");

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Login/signup ke baad SecureStore mein save hua token yahan
        // automatically har request ke saath jaata hai
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw error;
  }

  // A 401 only means "session expired" when we actually sent a token that
  // got rejected - a login/signup attempt has no token yet, so its own 401
  // (wrong credentials) must NOT also trigger an app-wide logout side effect.
  if (response.status === 401 && token) {
    // Token expire ho gaya ya invalid hai - user ko automatically
    // logout kar do (AuthContext ne apna logout() yahan register kiya hai)
    notifyUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    // Backend (errorHandler.js) always sends a specific { msg } explaining
    // what went wrong - surface that instead of a generic status line so
    // the user actually knows what to fix.
    const body = await response.json().catch(() => null);
    throw new Error(body?.msg || `API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
