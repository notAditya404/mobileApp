import { BASE_URL } from "./config";

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
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Login ke baad yahan Authorization: `Bearer <token>` add hoga
      // (token expo-secure-store se read karke).
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
