import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// "AI Insights" tab ke liye fake data - yeh asli ML model ka output hoga
const MOCK_AI_INSIGHTS = {
  summaryTitle: "Your recovery is on track, but stay consistent.",
  summaryDescription:
    "AI is continuously learning from your patterns to keep you balanced.",
  outlookScore: 78,
  outlookLabel: "Balanced",

  // "icon" purely presentational hai (frontend "key" se decide karta
  // hai). "color" bhi nahi bhejna - frontend "impact" text se hi
  // (High/Moderate/Low) color derive kar leta hai, alag field ki
  // zaroorat nahi.
  contributingFactors: [
    {
      key: "nightDutyFrequency",
      label: "Night Duty Frequency",
      description: "Slight increase in night duties in the last 2 weeks.",
      impact: "High Impact",
      impactPercent: 80,
    },
    {
      key: "consecutiveDutyDays",
      label: "Consecutive Duty Days",
      description: "You had longer stretches of consecutive duties.",
      impact: "Moderate Impact",
      impactPercent: 55,
    },
    {
      key: "restGap",
      label: "Rest Gap",
      description: "Rest gaps between duties are improving.",
      impact: "Low Impact",
      impactPercent: 25,
    },
  ],

  prediction: {
    text: "If current patterns continue, there is a moderate chance of reduced recovery in the next 2-3 weeks.",
    riskPercent: 65,
    riskLabel: "Moderate",
  },

  recommendation: {
    title: "Prioritize rest and balance in the next 7-10 days.",
    description:
      "Try to avoid more than 5 consecutive duty days and ensure quality sleep.",
  },
};

// Backend endpoint (jab ready ho): GET /personnel/me/ai-insights
// Yeh response ML model service se aayega, backend sirf pass-through karega.
export async function getAiInsights() {
  if (USE_MOCK_DATA) {
    return MOCK_AI_INSIGHTS;
  }

  return apiRequest("/personnel/me/ai-insights");
}
