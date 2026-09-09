import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const MOCK_LEAVE_REQUESTS = [
  {
    id: "LV-240903-01",
    fromDate: "09 Sept 2024",
    toDate: "10 Sept 2024",
    reason: "Medical appointment",
    status: "Approved",
    submittedAt: "03 Sept 2024, 11:00 AM",
  },
];

// Backend endpoint (jab ready ho): GET /personnel/me/leave-requests
export async function getLeaveRequests() {
  if (USE_MOCK_DATA) {
    return MOCK_LEAVE_REQUESTS;
  }
  return apiRequest("/personnel/me/leave-requests");
}

// Backend endpoint (jab ready ho): POST /personnel/me/leave-requests
// Body: { fromDate: string, toDate: string, reason: string }
export async function createLeaveRequest(fromDate, toDate, reason) {
  if (USE_MOCK_DATA) {
    // Mock mein bas ek "Pending" response wapas bhej dete hain - admin
    // web dashboard se approve/reject karega. Date format seeded mock
    // entry jaisa hi rakha hai (locale-dependent toLocaleString() nahi),
    // warna list mein do alag date styles dikhte.
    return {
      id: `MOCK-${Date.now()}`,
      fromDate,
      toDate,
      reason,
      status: "Pending",
      submittedAt: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }

  return apiRequest("/personnel/me/leave-requests", {
    method: "POST",
    body: JSON.stringify({ fromDate, toDate, reason }),
  });
}
