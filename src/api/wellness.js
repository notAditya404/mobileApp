import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// "My Wellness" tab ke liye fake data
const MOCK_WELLNESS = {
  score: 78,
  status: "Balanced",
  description:
    "Your recent duty, rest and workload patterns are within a healthy range.",
  lastUpdated: "Today, 7:30 AM",

  // Yeh 5 "pillars" horizontally scroll hote hain
  pillars: [
    { key: "dutyBalance", label: "Duty Balance", icon: "time-outline", score: 72, status: "Good", color: "#7c3aed" },
    { key: "restRecovery", label: "Rest & Recovery", icon: "bed-outline", score: 82, status: "Excellent", color: "#16a34a" },
    { key: "nightDutyImpact", label: "Night Duty Impact", icon: "moon-outline", score: 68, status: "Manageable", color: "#ea580c" },
    { key: "deploymentLoad", label: "Deployment Load", icon: "shield-outline", score: 74, status: "Good", color: "#2563eb" },
    { key: "recoveryConsistency", label: "Recovery Consistency", icon: "heart-outline", score: 79, status: "Good", color: "#db2777" },
  ],

  // "What is influencing my wellness?" grid
  influencingFactors: [
    { label: "Duty Hours", value: "Moderate", icon: "calendar-outline", color: "#16a34a" },
    { label: "Night Duties", value: "Within limits", icon: "moon-outline", color: "#7c3aed" },
    { label: "Rest Gap", value: "Good", icon: "time-outline", color: "#2563eb" },
    { label: "Consecutive Duty Days", value: "Normal", icon: "trending-up-outline", color: "#ea580c" },
    { label: "Workload Trend", value: "Stable", icon: "briefcase-outline", color: "#db2777" },
    { label: "Deployment Duration", value: "28 Days", icon: "shield-checkmark-outline", color: "#0891b2" },
    { label: "Leave / Recovery Pattern", value: "Good", icon: "calendar-outline", color: "#7c3aed" },
    { label: "Wearable Data", value: "Optimal", icon: "watch-outline", color: "#16a34a" },
  ],

  // 30 din ka trend - har number ek din ka wellness score hai
  trend: {
    rangeLabel: "Last 30 Days",
    points: [45, 52, 48, 60, 55, 65, 70, 68, 80, 85, 78],
    summary: "Your wellness has improved steadily over the last 30 days.",
  },
};

// Backend endpoint (jab ready ho): GET /personnel/me/wellness
export async function getWellnessOverview() {
  if (USE_MOCK_DATA) {
    return MOCK_WELLNESS;
  }

  return apiRequest("/personnel/me/wellness");
}
