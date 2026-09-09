import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const MOCK_PROFILE = {
  fullName: "Arjun Kumar",
  rank: "Rifleman",
  verified: true,
  personalInfo: {
    dob: "15 Feb 1998",
    gender: "Male",
    email: "arjun.kumar@capf.gov.in",
    bloodGroup: "O+",
  },
};

// Backend endpoint (jab ready ho): GET /personnel/me
export async function getProfile() {
  if (USE_MOCK_DATA) {
    return MOCK_PROFILE;
  }
  return apiRequest("/personnel/me");
}
