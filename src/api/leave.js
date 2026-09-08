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
    // web dashboard se approve/reject karega
    return {
      id: `MOCK-${Date.now()}`,
      fromDate,
      toDate,
      reason,
      status: "Pending",
      submittedAt: new Date().toLocaleString(),
    };
  }

  return apiRequest("/personnel/me/leave-requests", {
    method: "POST",
    body: JSON.stringify({ fromDate, toDate, reason }),
  });
}
