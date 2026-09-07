import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const MOCK_SUPPORT_REQUESTS = [
  {
    id: "WS-240828-102",
    title: "Welfare Support Request",
    submittedAt: "28 Aug 2024, 10:30 AM",
    status: "Acknowledged",
    icon: "person-outline",
  },
  {
    id: "GA-240818-041",
    title: "General Assistance",
    submittedAt: "18 Aug 2024, 04:15 PM",
    status: "In Progress",
    icon: "chatbubble-outline",
  },
];

const MOCK_RESOURCES = [
  { title: "Rest & Recovery", description: "Tips to improve rest during irregular duties.", icon: "leaf-outline", color: "#16a34a" },
  { title: "Sleep Better", description: "Guidance for quality sleep in tough schedules.", icon: "moon-outline", color: "#7c3aed" },
  { title: "Managing Stress", description: "Simple techniques to stay calm and focused.", icon: "pulse-outline", color: "#db2777" },
  { title: "Stay Active", description: "Easy workouts to keep your body strong.", icon: "barbell-outline", color: "#ea580c" },
  { title: "Stay Connected", description: "Strengthen bonds even while away.", icon: "people-outline", color: "#2563eb" },
  { title: "Family Support", description: "Resources for you and your family.", icon: "home-outline", color: "#0891b2" },
];

// Backend endpoint (jab ready ho): GET /personnel/me/support-requests
export async function getSupportRequests() {
  if (USE_MOCK_DATA) {
    return MOCK_SUPPORT_REQUESTS;
  }
  return apiRequest("/personnel/me/support-requests");
}

// Backend endpoint (jab ready ho): GET /wellness-resources
export async function getWellnessResources() {
  if (USE_MOCK_DATA) {
    return MOCK_RESOURCES;
  }
  return apiRequest("/wellness-resources");
}

// Backend endpoint (jab ready ho): POST /personnel/me/support-requests
// Body: { requestType: "medical" | "welfare" | "general", description: string }
export async function createSupportRequest(requestType, description) {
  if (USE_MOCK_DATA) {
    // Mock mein bas ek "success" response wapas bhej dete hain
    return {
      id: `MOCK-${Date.now()}`,
      title: "Support Request",
      submittedAt: new Date().toLocaleString(),
      status: "Submitted",
    };
  }

  return apiRequest("/personnel/me/support-requests", {
    method: "POST",
    body: JSON.stringify({ requestType, description }),
  });
}
