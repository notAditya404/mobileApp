# MANOVA — Mobile App API Contract

## A few ground rules before the endpoints

Everything is plain JSON — requests and responses both use
`Content-Type: application/json`.

Once someone logs in or signs up, the app hangs onto the `token` you
send back and attaches it to every request after that as
`Authorization: Bearer <token>`.

One behavior worth knowing about: if **any** authenticated request
comes back with a `401`, the app treats that as "your session expired"
— it automatically clears the stored token and drops the user back to
the Welcome/Login screen. So please reserve `401` specifically for
missing, invalid, or expired tokens on authenticated endpoints. A
`401` from `/auth/login` itself (say, wrong password) is totally fine
too — there's no session yet for the app to clear, and the login
screen shows its own "check your credentials" message regardless of
the exact status code you return.

---

## Auth

### `POST /auth/login`
**Body:** `{ userId: string, password: string }`
**Response:**
```json
{
  "token": "string",
  "personnel": {
    "fullName": "Arjun Kumar",
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
Worth flagging: `sleepHours`, `dietQuality`, `workPressure`, and
`lastLeave` come from a short wellness survey we show during
onboarding, not just plain account fields. It'd make sense to save
these as the personnel's very first `self_assessments` row, so the
signup itself becomes their baseline data point.

**Response:** same shape as login — `{ token, personnel }`

### `POST /auth/change-password`
**Body:** `{ currentPassword: string, newPassword: string }`
**Response:** `{ success: true }` (or an appropriate error if the current password is wrong)

---

## Personnel / Profile

Quick note that applies everywhere below: `fullName` is always just
**first + last name**, never with rank baked into it — rank shows up
as its own separate field wherever it's relevant.

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
A couple of things to keep in mind here: `pillars` should always be
exactly those 5, and `influencingFactors` always those 8 — the `key`
on each one is fixed, since the app uses it to look up its own icon
and color locally. If you ever need to add, rename, or drop a key,
just give us a heads up first so the app side can match it. Speaking
of which — you won't see `icon` or `color` fields anywhere in this
response. Those are purely visual, so we kept them out of the API
entirely and let the app decide how things look based on `key`.

As for where the numbers themselves come from: `score`, `pillars`,
`influencingFactors`, and `trend` all get computed from
`hr_indicators` plus `self_assessments` — see the database section
near the bottom for how those tables fit together.

### `GET /personnel/me/ai-insights`
This one's basically a pass-through — it's the ML model's output, and
the backend's job here is just to relay it to the app as-is.
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
Same idea as the pillars above: `contributingFactors[].key` needs to
be one of `nightDutyFrequency`, `consecutiveDutyDays`, or `restGap`,
since that's what the app uses to pick an icon. If the ML model ever
starts surfacing a genuinely new kind of factor, just flag it to us
first so we can add a matching icon before it shows up blank. And
`impact` needs to be exactly `"High Impact"`, `"Moderate Impact"`, or
`"Low Impact"` — the app derives its own color straight from that
text, so there's no separate `color` field to send.

---

## Self-Assessment (the daily check-in)

### `GET /personnel/me/self-assessments/today`
**Response:** `{ "submittedToday": true }`

### `POST /personnel/me/self-assessments`
**Body:** `{ "mood": "good", "sleepHours": "7-8 hrs", "stressLevel": "Low" }`
**Response:** `{ "success": true }`
Every call here should create a fresh `self_assessments` row — this is
the ongoing trend data the AI model leans on over time.

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
The three `status` values the UI actively styles are `"Submitted"`,
`"Acknowledged"`, and `"In Progress"` — anything else still displays
fine, just falls back to a neutral gray badge.

### `POST /personnel/me/support-requests`
**Body:** `{ "requestType": "welfare" | "medical" | "general", "description": "string" }`
**Response:** same shape as one of the items above — `{ id, title, submittedAt, status }`

One thing that's deliberately **not** here: wellness resources (Rest &
Recovery, Sleep Better, Managing Stress, Stay Active). There's no
endpoint for those — they're just hardcoded on the app side
(`WELLNESS_RESOURCES` in `src/api/support.js`), so nothing to build
for that part.

---

## Settings

### `GET /personnel/me/notification-settings` / `PUT /personnel/me/notification-settings`
**Body/Response:** `{ "dailyCheckInReminder": true }`

---

## How this maps to a database

This isn't a strict spec, just a rundown of the tables we'd talked
through earlier and where each one plugs into the endpoints above —
useful context if you're sketching out the schema:

- `personnel` — everyone who signs up through the mobile app
- `admins` — everyone who signs up through the web dashboard
- `doctors`
- `admin_personnel` — links an admin to a personnel by email; an admin
  adds someone's email, and it auto-links once that person registers
- `self_assessments` — every daily check-in, plus the initial signup
  survey
- `hr_indicators` — raw duty logs (shift data), which is what the
  wellness score and pillars actually get computed from
- `stress_predictions` — the ML model's output, feeding `/ai-insights`
- `support_requests`
- `doctor_allotments` — an admin assigning a doctor to a personnel,
  optionally tied back to a `support_requests` row
- `notifications`
