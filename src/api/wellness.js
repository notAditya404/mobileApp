import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// "My Wellness" tab ke liye fake data
const MOCK_WELLNESS = {
  score: 78,
  status: "Balanced",
  description:
    "Your recent duty, rest and workload patterns are within a healthy range.",
  lastUpdated: "Today, 7:30 AM",

  // Yeh 5 "pillars" horizontally scroll hote hain. Icon/color yahan
  // se nahi aate - woh purely presentational hain, PILLAR_STYLES
  // (wellness.jsx mein) "key" ke hisaab se frontend khud decide karta hai.
  // Backend ko sirf key/label/score/status bhejne hain.
  pillars: [
    { key: "dutyBalance", label: "Duty Balance", score: 72, status: "Good" },
    { key: "restRecovery", label: "Rest & Recovery", score: 82, status: "Excellent" },
    { key: "nightDutyImpact", label: "Night Duty Impact", score: 68, status: "Manageable" },
    { key: "deploymentLoad", label: "Deployment Load", score: 74, status: "Good" },
    { key: "recoveryConsistency", label: "Recovery Consistency", score: 79, status: "Good" },
  ],

  // "What is influencing my wellness?" grid. Icon/color yahan se nahi
  // aate (pillars jaisa hi pattern) - frontend "key" se decide karta hai.
  influencingFactors: [
    { key: "dutyHours", label: "Duty Hours", value: "Moderate" },
    { key: "nightDuties", label: "Night Duties", value: "Within limits" },
    { key: "restGap", label: "Rest Gap", value: "Good" },
    { key: "consecutiveDutyDays", label: "Consecutive Duty Days", value: "Normal" },
    { key: "workloadTrend", label: "Workload Trend", value: "Stable" },
    { key: "deploymentDuration", label: "Deployment Duration", value: "28 Days" },
    { key: "leaveRecoveryPattern", label: "Leave / Recovery Pattern", value: "Good" },
    { key: "wearableData", label: "Wearable Data", value: "Optimal" },
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
