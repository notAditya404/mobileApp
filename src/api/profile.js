import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const MOCK_PROFILE = {
  fullName: "Rifleman Arjun Kumar",
  employeeId: "CAPF123456",
  unitCode: "114",
  unitLabel: "114 Bn, CRPF",
  unitName: "114 Battalion",
  force: "CRPF",
  verified: true,
  personalInfo: {
    dob: "15 Feb 1998",
    gender: "Male",
    email: "arjun.kumar@capf.gov.in",
    mobile: "+91 98765 43210",
    baseLocation: "Jammu, J&K",
    bloodGroup: "O+",
  },
  activeDevicesCount: 2,
  language: "English",
};

// Backend endpoint (jab ready ho): GET /personnel/me
export async function getProfile() {
  if (USE_MOCK_DATA) {
    return MOCK_PROFILE;
  }
  return apiRequest("/personnel/me");
}
