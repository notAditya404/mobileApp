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

// Yeh static content hai - koi backend endpoint nahi, seedha yahan se
// import hota hai. "details" wala text card tap karne par expanded
// view mein dikhta hai.
export const WELLNESS_RESOURCES = [
  {
    title: "Rest & Recovery",
    description: "Tips to improve rest during irregular duties.",
    details:
      "Recovery is as important as duty. Try to get at least 7-8 hours of rest between long shifts, take short breaks during the day, and avoid back-to-back night duties when possible. Even 20-30 minutes of rest can help reset your focus and energy.",
    icon: "leaf-outline",
    color: "#16a34a",
  },
  {
    title: "Sleep Better",
    description: "Guidance for quality sleep in tough schedules.",
    details:
      "Quality sleep matters more than quantity. Keep a consistent sleep schedule even on irregular duty days, avoid screens 30 minutes before sleeping, keep your sleeping area dark and cool, and avoid caffeine close to bedtime.",
    icon: "moon-outline",
    color: "#7c3aed",
  },
  {
    title: "Managing Stress",
    description: "Simple techniques to stay calm and focused.",
    details:
      "Simple breathing exercises (like the 4-7-8 technique), short walks, and talking to a trusted colleague can help reduce stress in the moment. If stress persists for more than a few days, don't hesitate to request support through this app.",
    icon: "pulse-outline",
    color: "#db2777",
  },
  {
    title: "Stay Active",
    description: "Easy workouts to keep your body strong.",
    details:
      "Even 15-20 minutes of physical activity - stretching, a brisk walk, or basic bodyweight exercises - can significantly improve mood and reduce fatigue, especially during long deployments with limited access to a gym.",
    icon: "barbell-outline",
    color: "#ea580c",
  },
];

// Backend endpoint (jab ready ho): GET /personnel/me/support-requests
export async function getSupportRequests() {
  if (USE_MOCK_DATA) {
    return MOCK_SUPPORT_REQUESTS;
  }
  return apiRequest("/personnel/me/support-requests");
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
