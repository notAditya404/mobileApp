import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

// Home screen ke liye fake data - jaisa backend se JSON response aayega,
// waisa hi shape yahan rakha hai taaki baad mein sirf function ke andar
// ka switch hataana pade, UI mein kuch badalna na pade.
const MOCK_HOME_DASHBOARD = {
  personnel: {
    fullName: "Arjun Kumar",
  },
  wellnessStatus: {
    label: "Balanced",
    description: "You're maintaining a good balance of duty and recovery.",
    trend: "Improving",
  },
  atAGlance: {
    dutyLoad: { value: "Moderate", note: "Within healthy range" },
    avgRestGap: { value: "8.1 hrs", note: "Good" },
    nightDuties: { value: "2", note: "Manageable" },
  },
};

// Backend endpoint (jab ready ho): GET /personnel/me/home-dashboard
// Response shape upar wale MOCK_HOME_DASHBOARD jaisa hi expect kiya hai.
export async function getHomeDashboard() {
  if (USE_MOCK_DATA) {
    return MOCK_HOME_DASHBOARD;
  }

  return apiRequest("/personnel/me/home-dashboard");
}
