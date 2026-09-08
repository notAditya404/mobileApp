# MANOVA — Mobile App API Contract

This is what the mobile app (React Native / Expo) expects from the backend.
Right now the app runs entirely on mock data (`src/api/config.js` →
`USE_MOCK_DATA = true`). Once these endpoints exist, we flip that one flag
to `false` and set `BASE_URL` to the real server — nothing else in the app
needs to change.

All endpoints below are prefixed with the configured `BASE_URL` (currently
`http://localhost:8080/api` for local testing).

## Conventions

- All requests/responses are JSON (`Content-Type: application/json`)
- After login/signup, the app stores the returned `token` and sends it on
  every subsequent request as `Authorization: Bearer <token>`
  (handled centrally in `src/api/client.js`)
- `GET /personnel/me...` endpoints should resolve "me" from the auth token
  (JWT/session), not a client-supplied ID
- Token type: recommend **JWT** (pairs naturally with the `Bearer` scheme
  above, and Spring Security has strong built-in support for it). The app
  treats the token as an opaque string either way — it doesn't decode it.
- **Any request that returns HTTP `401`** is treated by the app as "session
  expired" — it automatically clears the stored token and sends the user
  back to Welcome/Login. This is meant for missing/invalid/expired tokens
  on authenticated endpoints. A `401` from `/auth/login` itself (wrong
  password) is harmless too — there's no session to clear yet, and the
  login screen shows its own "check your credentials" message regardless
  of the exact status code.
- Every source file under `src/api/*.js` in the repo has the exact request
  body / response shape as a comment right above the function — this doc
  is a summary of those

---

## Auth

### `POST /auth/login`
**Body:** `{ userId: string, password: string }`
**Response:**
```json
{
  "token": "string",
  "personnel": {
    "id": 1,
    "fullName": "Arjun Kumar",
    "employeeId": "CAPF123456",
    "rank": "Rifleman"
  }
}
```

### `POST /auth/signup`
**Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "rank": "string",
  "dob": "string",
  "gender": "string",
  "bloodGroup": "string",
  "sleepHours": "string",
  "dietQuality": "string",
  "workPressure": "string",
  "lastLeave": "string",
  "password": "string"
}
```
`sleepHours` / `dietQuality` / `workPressure` / `lastLeave` come from the
onboarding wellness survey — save these as the personnel's **first
`self_assessments` row**, not just account fields.
**Response:** same shape as login (`{ token, personnel }`)

### `POST /auth/change-password`
**Body:** `{ currentPassword: string, newPassword: string }`
**Response:** `{ success: true }` (or an error status if current password is wrong)

---

## Personnel / Profile

`fullName` everywhere below is **first + last name only** — no rank
prefix (rank is always its own separate field).

### `GET /personnel/me`
**Response:**
```json
{
  "fullName": "Arjun Kumar",
  "rank": "Rifleman",
  "verified": true,
  "personalInfo": {
    "dob": "15 Feb 1998",
    "gender": "Male",
    "email": "arjun.kumar@capf.gov.in",
    "bloodGroup": "O+"
  }
}
```

### `GET /personnel/me/home-dashboard`
**Response:**
```json
{
  "personnel": { "fullName": "Arjun Kumar" },
  "wellnessStatus": {
    "label": "Balanced",
    "description": "You're maintaining a good balance of duty and recovery.",
    "trend": "Improving"
  },
  "atAGlance": {
    "dutyLoad": { "value": "Moderate", "note": "Within healthy range" },
    "avgRestGap": { "value": "8.1 hrs", "note": "Good" },
    "nightDuties": { "value": "2", "note": "Manageable" }
  }
}
```

### `GET /personnel/me/wellness`
**Response:**
```json
{
  "score": 78,
  "status": "Balanced",
  "description": "string",
  "lastUpdated": "Today, 7:30 AM",
  "pillars": [
    { "key": "dutyBalance", "label": "Duty Balance", "score": 72, "status": "Good" },
    { "key": "restRecovery", "label": "Rest & Recovery", "score": 82, "status": "Excellent" },
    { "key": "nightDutyImpact", "label": "Night Duty Impact", "score": 68, "status": "Manageable" },
    { "key": "deploymentLoad", "label": "Deployment Load", "score": 74, "status": "Good" },
    { "key": "recoveryConsistency", "label": "Recovery Consistency", "score": 79, "status": "Good" }
  ],
  "influencingFactors": [
    { "key": "dutyHours", "label": "Duty Hours", "value": "Moderate" },
    { "key": "nightDuties", "label": "Night Duties", "value": "Within limits" },
    { "key": "restGap", "label": "Rest Gap", "value": "Good" },
    { "key": "consecutiveDutyDays", "label": "Consecutive Duty Days", "value": "Normal" },
    { "key": "workloadTrend", "label": "Workload Trend", "value": "Stable" },
    { "key": "deploymentDuration", "label": "Deployment Duration", "value": "28 Days" },
    { "key": "leaveRecoveryPattern", "label": "Leave / Recovery Pattern", "value": "Good" },
    { "key": "wearableData", "label": "Wearable Data", "value": "Optimal" }
  ],
  "trend": {
    "rangeLabel": "Last 30 Days",
    "points": [45, 52, 48, 60, 55, 65, 70, 68, 80, 85, 78],
    "summary": "string"
  }
}
```
`pillars` is always **all 5**, `influencingFactors` is always all 8
shown above (`key` is fixed for both — don't add/rename/drop keys
without telling the app side, since the app maps each `key` to its own
icon/color locally). **No `icon`/`color` fields on either** — purely
presentational, the app owns them.
`score`, `pillars`, `influencingFactors`, `trend` are all computed from
`hr_indicators` + `self_assessments` — see DB notes below.

### `GET /personnel/me/ai-insights`
This is the ML model's output — backend just passes it through from the
ML service to the app.
**Response:**
```json
{
  "summaryTitle": "string",
  "summaryDescription": "string",
  "outlookScore": 78,
  "outlookLabel": "Balanced",
  "contributingFactors": [
    { "key": "nightDutyFrequency", "label": "string", "description": "string", "impact": "High Impact", "impactPercent": 80 },
    { "key": "consecutiveDutyDays", "label": "string", "description": "string", "impact": "Moderate Impact", "impactPercent": 55 },
    { "key": "restGap", "label": "string", "description": "string", "impact": "Low Impact", "impactPercent": 25 }
  ],
  "prediction": { "text": "string", "riskPercent": 65, "riskLabel": "Moderate" },
  "recommendation": { "title": "string", "description": "string" }
}
```
`contributingFactors[].key` must be one of `nightDutyFrequency` /
`consecutiveDutyDays` / `restGap` (app maps each to its own icon) —
if the ML model surfaces a genuinely new factor type, flag it so we
add a matching icon on the app side first. `impact` must be exactly
`"High Impact"` / `"Moderate Impact"` / `"Low Impact"` (app derives
the color from this string — no separate `color` field needed).

---

## Self-Assessment (daily check-in)

### `GET /personnel/me/self-assessments/today`
**Response:** `{ "submittedToday": true }`

### `POST /personnel/me/self-assessments`
**Body:** `{ "mood": "good", "sleepHours": "7-8 hrs", "stressLevel": "Low" }`
**Response:** `{ "success": true }`
Each call creates a new `self_assessments` row.

---

## Support

### `GET /personnel/me/support-requests`
**Response:**
```json
[
  {
    "id": "WS-240828-102",
    "title": "Welfare Support Request",
    "submittedAt": "28 Aug 2024, 10:30 AM",
    "status": "Acknowledged"
  }
]
```
`status` values used by the UI: `"Submitted"`, `"Acknowledged"`, `"In Progress"` (any other string is displayed but shown in a neutral gray).

### `POST /personnel/me/support-requests`
**Body:** `{ "requestType": "welfare" | "medical" | "general", "description": "string" }`
**Response:** same shape as one item above (`{ id, title, submittedAt, status }`)

**Wellness Resources** (Rest & Recovery, Sleep Better, Managing Stress,
Stay Active) — **no endpoint needed**, this stays hardcoded on the app
side (`WELLNESS_RESOURCES` in `src/api/support.js`). Nothing for the
backend to build here.

---

## Settings

### `GET /personnel/me/notification-settings` / `PUT /personnel/me/notification-settings`
**Body/Response:** `{ "dailyCheckInReminder": true }`

---

## Database tables this implies (from our earlier design discussion)

- `personnel` — mobile app signups
- `admins` — web dashboard signups
- `doctors`
- `admin_personnel` — links admin ↔ personnel by email (admin adds a personnel's email; auto-links once that personnel registers)
- `self_assessments` — daily check-ins + the initial signup survey
- `hr_indicators` — duty logs (raw shift data), used to compute wellness score/pillars
- `stress_predictions` — ML model output, feeds `/ai-insights`
- `support_requests`
- `doctor_allotments` — admin assigns a doctor to a personnel, optionally linked to a `support_requests` row
- `notifications`

## Known gaps / open items (backend-side)

1. **`/wellness` score calculation** — the mobile app expects a fully computed result; the actual computation logic (from raw `hr_indicators`) is entirely a backend concern, not something the app does.
2. **Push notifications** — not implemented on the backend side at all yet; only a local (on-device) daily reminder exists right now, no server-triggered push.
