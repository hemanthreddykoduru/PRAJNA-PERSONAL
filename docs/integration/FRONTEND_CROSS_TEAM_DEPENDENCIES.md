# PRAJNA Frontend Dashboards — Cross-Team Dependency Report

**For:** Domain leads of modules that our Frontend Dashboards (Faculty, HoD, etc.) depend on for data, APIs, and authentication.
**From:** PRAJNA Frontend Team (Modules 24, 25)
**Date:** 2026-06-23
**Status:** Draft for review

---

## TL;DR for each lead

| You own | Read section | Why we need you |
|---|---|---|
| **Module 3 (Auth / Cognito)** | [§3](#3-module-3--auth--cognito-jwt-claims) | Login flow and exact JWT claims we parse for routing |
| **Module 4 (API Gateway)** | [§4](#4-module-4--api-gateway--cors) | Proper CORS headers and base URL routing |
| **Modules 7–12 (Faculty Data Leads)** | [§7](#7-modules-712--faculty-profile--activities-data) | The JSON shapes we expect from your APIs for the dashboard |
| **Module 14 (PRAJNA Score Engine)** | [§14](#14-module-14--prajna-score) | Total score and metrics for our UI gauge |
| **Module 15 (Leaderboard)** | [§15](#15-module-15--leaderboard-rankings) | Rank and percentile data for the dashboard cards |
| **Module 23 (To-Do Engine)** | [§23](#23-module-23--to-do-engine) | The urgent tasks and daily checklist JSON payloads |

If you change the structure of your JSON responses or the expected claims, please coordinate with us so we do not break the UI.

---

## 1. What this document is

The Frontend layer (Modules 24, 25, etc.) is a **terminal read-only consumer**. We aggregate data from upstream modules (M7-M23), authenticate via M3, and fetch from M4 API Gateway. We are the cockpit that the end users actually see.

Every frontend dependency is listed here with:
- **What we read** from your module (or what shape we expect you to send).
- **Where it lives in our code** so you know what will break.
- **Consequences** if you change your response format without telling us.

This is a working contract. **Until your live APIs are shipped matching these contracts, the Frontend is using hard-coded mock data.**

## 2. What modules we own

| Module | Name | Status | Owner |
|---|---|---|---|
| 24 | Faculty Dashboard | ✅ UI Complete, awaiting live APIs | Hemanth Reddy |
| 25 | HoD Dashboard | 🟡 In progress | Hemanth Reddy |
| 26 | Admin Dashboard | ⚪ Pending | TBD |

---

## 3. Module 3 — Auth / Cognito JWT claims

**Used by:** Authentication Context (`src/contexts/AuthContext.tsx`) and `LoginPage.tsx`.

### What we read from the JWT

When a user logs in, we decode their JWT locally to build their session state.

| Claim | Required | Used for |
|---|---|---|
| `name` | ✅ | Displayed in the Morning Briefing banner (e.g., "Welcome back, {name}"). |
| `email` | ✅ | Profile display and account settings. |
| `cognito:groups` | ✅ | Route redirection (determining if they go to `/dashboard/faculty` or `/dashboard/hod`). |
| `custom:campus` | ✅ | Displaying the campus location on their profile card. |

### What would silently break us

- ❌ Changing `name` to `given_name` or `family_name` without telling us. The UI will say "Welcome back, undefined".
- ❌ Changing group names. If `Faculty` becomes `Teachers`, our router will throw users back to the login page because it won't recognize the role.

---

## 4. Module 4 — API Gateway & CORS

**Used by:** Every `fetch` or `axios` call in the frontend application (`src/utils/api.ts`).

### What we need from you

- **CORS Headers:** You MUST return `Access-Control-Allow-Origin: *` (or our specific CloudFront domain) and `Access-Control-Allow-Headers: Authorization, Content-Type` on all endpoints.
- **OPTIONS Route:** Every endpoint must respond correctly to preflight `OPTIONS` requests.
- **Base URL:** A single, stable production URL (e.g., `https://api.prajna.gitam.edu/v1`) that we can inject into our Vite environment variables (`VITE_API_URL`).

### What would silently break us

- ❌ Failing to deploy CORS headers. The browser will block the network request entirely, and the dashboard will show blank data boxes.

---

## 7. Modules 7–12 — Faculty Profile & Activities Data

**Used by:** Faculty Dashboard (`src/pages/dashboards/FacultyDashboard.tsx`).

### What we need from you

We need a unified or easily combinable REST API response to populate the "Profile Information", "Personal Timeline", and "Profile Completeness" sections.

**Expected Response Shape (`GET /faculty/{facultyId}/profile`):**
```json
{
  "name": "Hemanth Reddy",
  "email": "hemanth.reddyk@gitam.edu",
  "department": "Computer Science and Engineering (CSE)",
  "role": "Faculty",
  "profileCompleteness": 85,
  "missingIntegrations": [
    { "id": "orcid", "name": "ORCID ID", "status": "missing" },
    { "id": "google_scholar", "name": "Google Scholar", "status": "linked" }
  ]
}
```

**Expected Response Shape (`GET /faculty/{facultyId}/timeline`):**
```json
[
  {
    "id": "1",
    "title": "IEEE Paper Published",
    "pointsAwarded": 50,
    "timestamp": "2026-06-20T10:00:00Z"
  },
  {
    "id": "2",
    "title": "Completed FDP Program",
    "pointsAwarded": 20,
    "timestamp": "2026-06-15T14:30:00Z"
  }
]
```

### What would silently break us

- ❌ Renaming `profileCompleteness` to `completionPercentage`. Our UI ring chart will crash or show `0%`.
- ❌ Formatting timestamps in a non-ISO 8601 format (like `DD-MM-YYYY`). Our frontend `Date` parser will fail and say "Invalid Date".

---

## 14. Module 14 — PRAJNA Score Engine

**Used by:** The main score widget and the AI Morning Briefing (`src/components/MorningBriefBanner.tsx`).

### What we need from you

**Expected Response Shape (`GET /score/{facultyId}`):**
```json
{
  "totalScore": 840,
  "maxScore": 1000,
  "academicYear": "2024-25",
  "tier": "Gold",
  "pointsToNextTier": 15,
  "nextTierName": "PRAJNA Fellow"
}
```

### What would silently break us

- ❌ Returning `totalScore` as a string `"840"` instead of an integer. The `SlotCounter` animation component expects a strict `number` to calculate the spin math and will crash.

---

## 15. Module 15 — Leaderboard Rankings

**Used by:** The Department Rank and Percentile cards.

### What we need from you

**Expected Response Shape (`GET /leaderboard/rankings/{facultyId}`):**
```json
{
  "departmentRank": 4,
  "departmentTotalFaculty": 45,
  "rankTrend": 5, 
  "universityPercentile": 88,
  "percentileTrend": 8
}
```
*(Note: Positive trend numbers mean improvement, negative means dropping in rank).*

### What would silently break us

- ❌ Removing the `departmentTotalFaculty` field. The UI explicitly says `#4 of 45 Faculty`. If this is missing, the UI will look broken.

---

## 23. Module 23 — To-Do Engine

**Used by:** The "Today's Priorities" checklist on the dashboard.

### What we need from you

**Expected Response Shape (`GET /faculty/{facultyId}/todos/today`):**
```json
[
  {
    "id": "task-1",
    "title": "Submit Q1 Research Evidence",
    "description": "Due today at 5:00 PM",
    "isUrgent": true,
    "status": "pending"
  },
  {
    "id": "task-2",
    "title": "Verify Mid-term Attendance",
    "description": "Pending for CSE-302",
    "isUrgent": true,
    "status": "pending"
  }
]
```

### What would silently break us

- ❌ Changing `isUrgent` from a boolean (`true`/`false`) to a string (`"high"`, `"medium"`). Our UI relies on a boolean to render the red notification dot and "Urgent" badges.

---

## How to propose a breaking change

If you need to change the JSON shapes defined above, please alert the Frontend team **before** deploying to production. We will need to update our TypeScript interfaces and React components to match your new schema in the same deployment window.

---

*PRAJNA Frontend Layer · Cross-Team Dependency Report · 2026-06-23*
