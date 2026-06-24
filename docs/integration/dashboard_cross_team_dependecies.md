# PRAJNA — Faculty Dashboard (Module 24)
# Cross-Team Dependency Report

**Module Owner:** Hemanth Reddy
**Document Type:** API Integration Contract
**Audience:** All upstream module owners whose APIs we consume
**Date:** 2026-06-23
**Status:** 🟡 Draft — Pending acknowledgement from each section owner

---

## How to Use This Document

Each section below corresponds to one upstream module. Read your section. It tells you:

1. **Exactly what data** the Faculty Dashboard reads from your API
2. **Which UI widget** breaks if your API is wrong or missing
3. **The exact JSON response shape** your Lambda must return
4. **TypeScript interface** we use in our code — your response must satisfy this
5. **What silently breaks** vs. **what loudly crashes**

**This is a two-way contract.** If you have questions or need to change anything described here, reach Hemanth Reddy before deploying changes to production.

---

## Phase Scope

> **This document covers Phase 1 only: Faculty Dashboard (Module 24).**
> HoD Dashboard (Module 25) has its own dependency document. That work does not start until Module 24 is live.

| Module | Dashboard | Status |
|---|---|---|
| **24** | Faculty Dashboard | 🟢 UI 100% built. Blocked on live APIs. |
| **25** | HoD Dashboard | ⏳ Pending. Starts after M24 is in production. |

---

## Dependency Summary — Who We Need and Why

| Priority | Module | Module Name | Domain SME | Developer | Blocks Which UI Widget |
|---|---|---|---|---|---|
| 🔴 Critical | **M3** | Auth & User Management | Goondla Balaji | Balaji | Entire app — login, routing, identity |
| 🔴 Critical | **M4** | API Gateway & Middleware | Goondla Balaji | Neha | All API calls — CORS, base URL, auth pass-through |
| 🔴 Critical | **M7** | Personal & Professional Profile | Greeshmitha Bingumalla | Greeshmitha | Profile Completeness widget + top header |
| 🔴 Critical | **M13** | Approval Workflow Engine | Komma Bhanu Teja | K Bhanu Teja | Pending approvals count |
| 🔴 Critical | **M14** | PRAJNA Score Engine | Komma Bhanu Teja | Santosh | PRAJNA Score card + Morning Brief banner stats |
| 🔴 Critical | **M15** | Leaderboard System | Komma Bhanu Teja | Bhavesh | Dept. Rank card + Percentile card |
| 🔴 Critical | **M23** | Dynamic To-Do Engine | Jaya Harshitha Mannela | Deeksha Oruganti | Today's Priorities checklist |
| 🟡 Important | **M21** | Morning Briefing & End-of-Day | Jaya Harshitha Mannela | Jaya Harshitha Mannela | AI message in Morning Brief banner |
| 🟡 Important | **M9** | Research & Innovation | Greeshmitha Bingumalla | Abhigna | Personal Timeline (publication events) |
| 🟡 Important | **M11** | Faculty Development & Growth | Greeshmitha Bingumalla | *(Unassigned)* | Personal Timeline (FDP events) |

> 🔴 **Critical** = The dashboard section will be empty, broken, or crash without this API.
> 🟡 **Important** = The section will partially render with fallback text but look incomplete.

---

## Visual Map — Widget → Module

```
Faculty Dashboard
│
├── [Morning Briefing Banner]
│     ├── Faculty first name               ← M3 (JWT: `name` claim)
│     ├── AI greeting message              ← M21 (GET /briefing/today/{facultyId})
│     ├── Score: 840/1k                    ← M14 (GET /score/{facultyId})
│     ├── Dept Rank: #4                    ← M15 (GET /leaderboard/rankings/{facultyId})
│     └── Today's Tasks: 2 Urgent         ← M23 (GET /faculty/{facultyId}/todos/today)
│
├── [KPI Cards Row — 4 cards]
│     ├── PRAJNA Score (840/1000)          ← M14
│     ├── Dept. Rank (#4 of 45 Faculty)   ← M15
│     ├── Percentile (88% University-wide) ← M15
│     └── Pending (3 Evidence Items)       ← M13 (GET /approval/pending/me/count)
│
├── [Today's Priorities]                   ← M23
│     ├── Task 1: Submit Q1 Research...
│     ├── Task 2: Verify Mid-term...
│     └── Task 3: Peer Review...
│
├── [Personal Timeline]
│     ├── IEEE Paper Published (+50 pts)   ← M9
│     ├── Completed FDP Program (+20 pts)  ← M11
│     └── Joined Mentorship Committee      ← M12
│
└── [Profile Completeness]                 ← M7
      ├── 85% ring chart
      ├── Add ORCID ID (button)
      └── Link Google Scholar (button)
```

---

## Section 1 — Module 3: Auth & User Management

**Domain SME:** Goondla Balaji | **Developer:** Balaji

The frontend reads the Cognito JWT on login to:
1. Build the user session (`name`, `email`, `department`)
2. Route the user to the correct dashboard (`cognito:groups`)
3. Build the `facultyId` used in every downstream API call (`sub` claim)

### JWT Claims Contract

> **⚠️ BLOCKER:** There are currently 3 different JWT claim naming conventions circulating (between M24, M15, and M13). A 3-way sync is scheduled this week (by 2026-06-25) between Hemanth, Bhanu, and Balaji to lock the names. **Do not code against these exact claim keys yet.**

| Claim | Type | Required | Used In | Breaks If Missing |
|---|---|---|---|---|
| `sub` | `string` | ✅ | Passed as `facultyId` to all API calls | Every API call fails — no faculty ID |
| `name` | `string` | ✅ | Morning Brief: *"Welcome back, Hemanth"* | Banner says *"Welcome back, Professor"* |
| `email` | `string` | ✅ | Top-right profile header | Shows blank |
| `cognito:groups` | `string[]` | ✅ | Route to `/dashboard/faculty` or `/dashboard/hod` | User stuck at login or sent to wrong page |
| `custom:campus` | `string` | ✅ | Profile sub-label: *"EECE Department"* | Shows blank |

### Our TypeScript Interface

```typescript
// src/contexts/AuthContext.tsx
interface User {
  id: string;          // from JWT: sub
  name: string;        // from JWT: name
  email: string;       // from JWT: email
  role: UserRole;      // from JWT: cognito:groups[0]
  campus: string;      // from JWT: custom:campus
}

type UserRole = 'Faculty' | 'HoD' | 'Director' | 'IQAC' | 'ProVC' | 'Admin';
```

### Routing Logic We Apply

```typescript
// The group names in cognito:groups must match EXACTLY
const ROLE_HOME: Record<UserRole, string> = {
  'Faculty':   '/dashboard/faculty',
  'HoD':       '/dashboard/hod',
  'Director':  '/dashboard/director',
  'IQAC':      '/dashboard/iqac',
  'ProVC':     '/dashboard/provc',
  'Admin':     '/dashboard/admin',
};
```

### Breaking Changes

| Change | Impact |
|---|---|
| `name` → `given_name` | Banner shows *"Welcome back, undefined"* |
| `Faculty` → `FACULTY` (casing) | Router falls through — user redirected to login |
| Remove `sub` from token | All downstream API calls have no `facultyId` — every widget breaks |
| Add new role not in the 6 above | User gets a blank page — no matching route |

---

## Section 2 — Module 4: API Gateway & Middleware

**Domain SME:** Goondla Balaji | **Developer:** Neha

Every single API call in the dashboard goes through API Gateway. This is the foundation.

### What We Need

| Requirement | Exact Value Needed |
|---|---|
| **Base URL** | Stable production URL → injected into `VITE_API_URL` env var. Share this with Hemanth to configure the build. |
| **CORS: Allow-Origin** | `Access-Control-Allow-Origin: *` or `https://prajna.hemanthreddykoduru.dev` |
| **CORS: Allow-Headers** | Must include `Authorization`, `Content-Type` |
| **CORS: Allow-Methods** | Must include `GET`, `POST`, `OPTIONS` |
| **OPTIONS preflight** | Every route must return `200` on `OPTIONS` — browsers send this before every real request |
| **Auth pass-through** | `requestContext.authorizer.claims` forwarded to Lambda — we read `facultyId` from there |

### How We Call APIs

```typescript
// src/utils/api.ts
const BASE_URL = import.meta.env.VITE_API_URL; // e.g., https://api.prajna.gitam.edu

const headers = {
  'Authorization': `Bearer ${cognitoToken}`,
  'Content-Type': 'application/json',
};

// Every module call looks like this:
const res = await fetch(`${BASE_URL}/score/${facultyId}`, { headers });
```

### Breaking Changes

| Change | Impact |
|---|---|
| No CORS headers | Browser blocks the request silently. Dashboard shows empty boxes. **This is the #1 silent killer.** |
| OPTIONS returns 4xx | Browser never sends the real request. Same result as above. |
| Strip `requestContext.authorizer` | Lambda gets no JWT claims — returns 401 for every user |

---

## Section 3 — Module 7: Personal & Professional Profile

**Domain SME:** Greeshmitha Bingumalla | **Developer:** Greeshmitha

**Feeds:** Profile Completeness widget (bottom-right card) and the faculty header label.

### Endpoint We Call

```
GET /faculty/{facultyId}/profile
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
{
  "facultyId": "sub-from-jwt",
  "name": "Hemanth Reddy",
  "email": "hemanth.reddyk@gitam.edu",
  "department": "Computer Science and Engineering (CSE)",
  "designation": "Assistant Professor",
  "campus": "HYDERABAD",
  "profileCompleteness": 85,
  "missingFields": [
    {
      "id": "orcid",
      "label": "ORCID ID",
      "status": "missing"
    },
    {
      "id": "google_scholar",
      "label": "Google Scholar",
      "status": "linked"
    }
  ]
}
```

### Our TypeScript Interface

```typescript
interface FacultyProfile {
  facultyId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  campus: string;
  profileCompleteness: number;     // integer 0–100
  missingFields: Array<{
    id: string;
    label: string;
    status: 'missing' | 'linked';  // MUST be one of these two values
  }>;
}
```

### UI Widget Map

| JSON Field | Exactly Renders In |
|---|---|
| `profileCompleteness` | SVG ring chart. Formula: `strokeDashoffset = 100 - profileCompleteness` |
| `missingFields[n].label` | Button text: *"Add ORCID ID"*, *"Link Google Scholar"* |
| `missingFields[n].status` | `'missing'` → button shown. `'linked'` → button hidden |

### Breaking Changes

| Change | Impact |
|---|---|
| `profileCompleteness: "85"` (string) | SVG math breaks — ring shows `0%` or `NaN%` |
| `status: 0` or `status: "incomplete"` | Buttons never hide even after user links account |
| Rename `missingFields` → `incompleteFields` | Array is `undefined` — code crashes with `.map is not a function` |

---

## Section 4 — Module 14: PRAJNA Score Engine

**Domain SME:** Komma Bhanu Teja | **Developer:** Santosh

**Feeds:** PRAJNA Score KPI card (top-left), Morning Brief banner score stat, and the motivational tip line.

### Endpoint We Call

```
GET /score/{facultyId}
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
{
  "facultyId": "sub-from-jwt",
  "totalScore": 840,
  "maxScore": 1000,
  "academicYear": "2024-25",
  "tier": "Gold",
  "previousScore": 750,
  "yearOnYearTrend": 12,
  "pointsToNextTier": 15,
  "nextTierName": "PRAJNA Fellow"
}
```

### Our TypeScript Interface

```typescript
interface PrajnaScore {
  facultyId: string;
  totalScore: number;           // MUST be number, not string
  maxScore: number;             // Default 1000
  academicYear: string;         // e.g., "2024-25"
  tier: string;                 // e.g., "Gold", "Silver", "Bronze"
  previousScore: number;
  yearOnYearTrend: number;      // Positive = improved, Negative = dropped
  pointsToNextTier: number;
  nextTierName: string;
}
```

### UI Widget Map

| JSON Field | Exactly Renders In |
|---|---|
| `totalScore` | `SlotCounter` animation (spinning digits). Value `840` becomes animated `8`, `4`, `0` |
| `maxScore` | Denominator: *"840/1000"* |
| `academicYear` | Sub-label: *"Academic Year 2024-25"* |
| `yearOnYearTrend` | Badge: *"↑ 12% vs last year"* |
| `pointsToNextTier` + `nextTierName` | Morning Brief tip: *"You are only 15 points from PRAJNA Fellow!"* |

### Breaking Changes

| Change | Impact |
|---|---|
| `totalScore: "840"` (string) | `SlotCounter` passes it to `String().split('').map(Number)` — `NaN` crashes the animation |
| Missing `pointsToNextTier` | Morning Brief shows tip with *"undefined points"* |
| `tier: null` | Tier badge shows *"null"* on the card |

---

## Section 5 — Module 15: Leaderboard System

**Domain SME:** Komma Bhanu Teja | **Developer:** Bhavesh

**Feeds:** Two KPI cards — Dept. Rank and Percentile.

### Endpoint We Call

```
GET /leaderboard/rankings/{facultyId}
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
{
  "facultyId": "sub-from-jwt",
  "departmentRank": 4,
  "departmentTotalFaculty": 45,
  "rankTrend": 5,
  "universityPercentile": 88,
  "percentileTrend": 8
}
```

### Our TypeScript Interface

```typescript
interface LeaderboardData {
  facultyId: string;
  departmentRank: number;          // e.g., 4
  departmentTotalFaculty: number;  // e.g., 45 — renders as "#4 of 45 Faculty"
  rankTrend: number;               // +5 = moved up 5 positions
  universityPercentile: number;    // 0–100 (integer)
  percentileTrend: number;         // +8 = 8% improvement
}
```

### UI Widget Map

| JSON Field | Exactly Renders In |
|---|---|
| `departmentRank` | *"#4"* in the Dept. Rank card |
| `departmentTotalFaculty` | *"of 45 Faculty"* — sub-label directly uses this number |
| `rankTrend` | *"↑ 5% positions up"* — positive = up arrow, negative = down arrow |
| `universityPercentile` | *"88%"* in the Percentile card |
| `percentileTrend` | *"↑ 8% improvement"* badge |

### Breaking Changes

| Change | Impact |
|---|---|
| `universityPercentile: 0.88` (decimal instead of int) | Card shows *"0%"* — looks completely wrong |
| Remove `departmentTotalFaculty` | Card renders *"#4 of undefined Faculty"* |

---

## Section 5.5 — Module 13: Approval Workflow Engine

**Domain SME:** Komma Bhanu Teja | **Developer:** K Bhanu Teja

**Feeds:** Pending Evidence KPI card.

### Endpoint We Call

```
GET /approval/pending/me/count
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
{
  "count": 3
}
```

### UI Widget Map

| JSON Field | Exactly Renders In |
|---|---|
| `count` | *"3 Evidence Items"* in the Pending card |

### Breaking Changes

| Change | Impact |
|---|---|
| `count: null` | Pending card crashes — `SlotCounter` receives `null` |

---

## Section 6 — Module 23: Dynamic To-Do Engine

**Domain SME:** Jaya Harshitha Mannela | **Developer:** Deeksha Oruganti

**Feeds:** "Today's Priorities" section — the most action-critical widget on the entire dashboard.

### Endpoint We Call

```
GET /faculty/{facultyId}/todos/today
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
[
  {
    "id": "task-001",
    "title": "Submit Q1 Research Evidence",
    "description": "Due today at 5:00 PM",
    "isUrgent": true,
    "status": "pending",
    "category": "Research",
    "dueAt": "2026-06-23T17:00:00Z"
  },
  {
    "id": "task-002",
    "title": "Verify Mid-term Attendance",
    "description": "Pending for CSE-302",
    "isUrgent": true,
    "status": "pending",
    "category": "Teaching",
    "dueAt": null
  },
  {
    "id": "task-003",
    "title": "Peer Review: AI Journal",
    "description": "Due in 3 days",
    "isUrgent": false,
    "status": "pending",
    "category": "Research",
    "dueAt": "2026-06-26T23:59:00Z"
  }
]
```

### Our TypeScript Interface

```typescript
interface TodoItem {
  id: string;
  title: string;
  description: string;
  isUrgent: boolean;                          // strict boolean, not string
  status: 'pending' | 'completed';
  category: 'Research' | 'Teaching' | 'Admin' | 'Development';
  dueAt: string | null;                       // ISO 8601 or null
}

type TodoResponse = TodoItem[];               // Always an array, never null
```

### UI Widget Map

| JSON Field | Exactly Renders In |
|---|---|
| `title` | Task label: *"Submit Q1 Research Evidence"* |
| `description` | Sub-label: *"Due today at 5:00 PM"* |
| `isUrgent` | `true` → red dot + *"Urgent"* badge count. `false` → green dot, no badge |
| `status` | `'completed'` tasks filtered out — not shown in the list |
| `category` | Shown in the task detail modal when user taps the task |

### Task Modal Trigger

When a faculty member taps any task in the list, a glassmorphism modal appears:

```
[ ⚠ Submit Q1 Research Evidence ]
"This task requires your attention..."
[Cancel]  [Begin Task →]
```

The `id` field is used to pass the task to the `POST /todos/{id}/complete` endpoint when *"Begin Task"* is clicked. **(This write endpoint is also owned by M23 — see below.)**

### Write Endpoint We Also Need

```
POST /faculty/{facultyId}/todos/{taskId}/complete
Authorization: Bearer <CognitoJWT>
Body: {}

Response: 200 OK
{ "success": true, "remainingUrgentCount": 1 }
```

### Breaking Changes

| Change | Impact |
|---|---|
| `isUrgent: "high"` (string) | Non-empty string is always truthy in JS. Everything becomes "Urgent". |
| Return `null` instead of `[]` | `null.map()` crashes the entire dashboard — white screen |
| `status: "PENDING"` (uppercase) | Our filter `status === 'pending'` fails — completed tasks remain visible |
| Missing `id` field | Tapping task does nothing — modal has no task ID to pass |

---

## Section 7 — Module 21: Morning Briefing & End-of-Day

**Domain SME:** Jaya Harshitha Mannela | **Developer:** Jaya Harshitha Mannela

**Feeds:** The AI-generated typewriter text in the Morning Briefing banner.

### Current State

Currently the Morning Brief message is **hard-coded** in the frontend:

```typescript
// src/components/MorningBriefBanner.tsx — Line 41
const aiMessage = `${greeting.text}, Professor ${firstName}! Your workspace is ready. 
You're currently ranked #4 in the department. Let's clear those 2 urgent tasks...`
```

This text **should** come from the M21 API with Bedrock-generated personalized content.

### Endpoint We Need

```
GET /briefing/today/{facultyId}
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
{
  "facultyId": "sub-from-jwt",
  "message": "Good evening, Professor Hemanth! Your workspace is ready. You're currently ranked #4 in the department. Let's clear those 2 urgent tasks and make it a highly productive day!",
  "generatedAt": "2026-06-23T08:00:00Z",
  "taskCount": 2,
  "urgentCount": 2
}
```

### Our TypeScript Interface

```typescript
interface MorningBriefing {
  facultyId: string;
  message: string;       // The full AI-generated text — typewriter animation plays on this
  generatedAt: string;   // ISO 8601 — used to show "Today's Briefing"
  taskCount: number;     // Shown in the "Today's Tasks" mini-stat card
  urgentCount: number;   // Shown in the "Today's Tasks" mini-stat: "2 Urgent"
}
```

> **Note for M21 team:** Until your API is live, the banner uses a hard-coded message with mock numbers. The `taskCount` and `urgentCount` currently come from the M23 response — M21 can override or source these from M23 directly.

---

## Section 8 — Module 9: Research & Innovation

**Domain SME:** Greeshmitha Bingumalla | **Developer:** Abhigna

**Feeds:** Personal Timeline — publication milestone events.

### Endpoint We Need

```
GET /faculty/{facultyId}/research/milestones?limit=5
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
[
  {
    "id": "pub-001",
    "type": "PUBLICATION",
    "title": "IEEE Paper Published",
    "subtitle": "SCI Indexed — IEEE Transactions on AI",
    "pointsAwarded": 50,
    "timestamp": "2026-06-21T10:00:00Z"
  }
]
```

### TypeScript Interface

```typescript
interface TimelineEvent {
  id: string;
  type: 'PUBLICATION' | 'PATENT' | 'GRANT' | 'FDP' | 'AWARD' | 'COMMITTEE';
  title: string;
  subtitle?: string;
  pointsAwarded?: number;     // null if no PRAJNA points awarded for this event
  timestamp: string;          // ISO 8601 — rendered as "2 days ago", "Last week"
}
```

---

## Section 9 — Module 11: Faculty Development & Growth

**Domain SME:** Greeshmitha Bingumalla | **Developer:** *(Currently unassigned — please confirm)*

**Feeds:** Personal Timeline — FDP and certification milestone events.

### Endpoint We Need

```
GET /faculty/{facultyId}/development/milestones?limit=5
Authorization: Bearer <CognitoJWT>
```

### Expected JSON Response

```json
[
  {
    "id": "fdp-001",
    "type": "FDP",
    "title": "Completed FDP Program",
    "subtitle": "AI for Educators — NPTEL",
    "pointsAwarded": 20,
    "timestamp": "2026-06-16T14:30:00Z"
  }
]
```

Same `TimelineEvent` interface as M9 above.

> **Alternative:** M9 and M11 timelines can be merged. If Greeshmitha (M7) can expose a unified `GET /faculty/{facultyId}/timeline?limit=10` that combines research + FDP events sorted by timestamp, that is also acceptable. Please confirm the approach before shipping.

---

## API Call Summary

Below is the complete list of every HTTP request the Faculty Dashboard fires on page load:

```typescript
// All fired in parallel via Promise.all on mount:

Promise.all([
  fetch(`${BASE_URL}/faculty/${facultyId}/profile`),           // M7
  fetch(`${BASE_URL}/score/${facultyId}`),                     // M14
  fetch(`${BASE_URL}/leaderboard/rankings/${facultyId}`),      // M15
  fetch(`${BASE_URL}/approval/pending/me/count`),              // M13
  fetch(`${BASE_URL}/faculty/${facultyId}/todos/today`),       // M23
  fetch(`${BASE_URL}/briefing/today/${facultyId}`),            // M21
  fetch(`${BASE_URL}/faculty/${facultyId}/research/milestones?limit=5`),    // M9
  fetch(`${BASE_URL}/faculty/${facultyId}/development/milestones?limit=5`), // M11
])
```

All requests include `Authorization: Bearer <token>` from Cognito.

---

## Error Handling Contract

The dashboard has graceful fallback behavior but only if your API returns proper HTTP status codes:

| Your API Returns | Dashboard Behavior |
|---|---|
| `200` with valid JSON | Widget renders live data ✅ |
| `200` with empty/null data | Widget shows `--` placeholder |
| `401 Unauthorized` | User is logged out and redirected to `/login` |
| `403 Forbidden` | Widget shows *"Access denied"* message |
| `404 Not Found` | Widget shows *"No data yet"* placeholder |
| `500 Internal Server Error` | Widget shows *"Could not load data"* with a retry button |
| Network timeout (>10s) | Widget shows *"Could not load data"* with a retry button |

**Do NOT return `200` with an error message inside the JSON body.** We check the HTTP status code, not the body, for error detection.

---

## Open Questions for Each Team

| # | Question | Addressed To | Why It Matters |
|---|---|---|---|
| 1 | Can M9 + M11 timelines be merged into a single `/faculty/{id}/timeline` endpoint? | Greeshmitha + M11 owner | Reduces parallel API calls on page load |
| 2 | Is M21 (Morning Briefing API) ready for Phase 1, or do we keep hard-coded text until Phase 2? | Jaya Harshitha | Affects how we wire the banner |
| 3 | ~~Will `GET /leaderboard...` include pending items?~~ | ~~Bhavesh~~ | **Resolved:** M13 providing `/approval/pending/me/count` |
| 4 | What is the stable production API Gateway base URL for `VITE_API_URL`? | Neha | We cannot build and deploy without this |
| 5 | Is M11 (Faculty Development) assigned? If not, who owns FDP milestone data? | Greeshmitha / Balaji | Timeline will be incomplete without FDP events |

---

## How to Notify Us of a Breaking Change

1. Message **Hemanth Reddy** directly before deploying any schema change to production.
2. We update TypeScript interfaces + component code in the same deployment window.
3. **Never deploy a payload change without coordinating** — the dashboard will crash silently.

---

## Phase 2 Preview — HoD Dashboard (Module 25)

*Not active yet. Listed for awareness only.*

The HoD Dashboard will additionally need from:
- **M13 (Bhanu Teja)** — Department approval queue
- **M14 (Santosh)** — Department-wide score distribution
- **M15 (Bhavesh)** — Department faculty ranking table, faculty needing attention
- **M7 (Greeshmitha)** — Department faculty list

A separate Phase 2 document will be shared before HoD work begins.

---

## Contact

| Role | Name | Module |
|---|---|---|
| **Dashboard Owner (this doc)** | Hemanth Reddy | M24, M25 |
| **Faculty Data Domain SME** | Greeshmitha Bingumalla | M7–M12 |
| **Business Logic Domain SME** | Komma Bhanu Teja | M13–M18 |
| **AI / Briefing Domain SME** | Jaya Harshitha Mannela | M19–M23 |
| **Core Platform Domain SME** | Goondla Balaji | M1–M6 |

---

*PRAJNA — प्रज्ञा | Super-30*
*Faculty Dashboard (Module 24) — Cross-Team Dependency Report · 2026-06-23*
