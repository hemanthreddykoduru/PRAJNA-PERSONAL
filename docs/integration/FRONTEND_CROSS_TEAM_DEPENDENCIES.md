# PRAJNA — Dashboard Cross-Team Dependency Report

**Module:** 24 (Faculty Dashboard) → 25 (HoD Dashboard)
**From:** Hemanth Reddy — Frontend / Dashboard Team
**Date:** 2026-06-23
**Status:** 🟡 Draft — Pending review by each module owner

---

## About This Document

This document is the **official API contract** between the Dashboard team (Module 24/25) and every upstream module we consume data from. It is written in the same style as the Business Logic team's cross-team dependency report so all module leads can follow a consistent format.

**Read this if you own any module listed in the dependency table below.** Your section tells you exactly what JSON shape your API must return so the Faculty Dashboard can consume it without any frontend changes.

---

## Phase Plan

> The Dashboard is being built in two phases. **HoD Dashboard work does not begin until Phase 1 is live.**

| Phase | Module | Dashboard | Delivery Status | Blocking Modules |
|---|---|---|---|---|
| **🟢 Phase 1 — ACTIVE NOW** | 24 | Faculty Dashboard | ✅ UI 100% complete. Awaiting live APIs. | M3, M4, M7, M14, M15, M23 |
| **⏳ Phase 2 — Not Started** | 25 | HoD Dashboard | Starts only after M24 is in production | M3, M4, M7, M13, M14, M15 |
| **⚪ Phase 3 — Out of Scope** | 26 | Director / Pro-VC / IQAC | Owned by Bharath, not this team | — |

---

## Phase 1 — Faculty Dashboard Dependency Map

The table below is the single source of truth for every module the Faculty Dashboard reads from. Each row identifies the **module number, module name, module domain lead (SME), and the assigned developer.**

| # | Module Name | Domain SME Lead | Developer / Owner | What We Need From Them | Phase |
|---|---|---|---|---|---|
| **M3** | Auth & User Management | Goondla Balaji | Balaji | Cognito JWT claims (`name`, `email`, `cognito:groups`, `custom:campus`) | Phase 1 🔴 Blocker |
| **M4** | API Gateway & Middleware | Goondla Balaji | Neha | CORS headers, base URL, OPTIONS preflight routes | Phase 1 🔴 Blocker |
| **M7** | Personal & Professional Profile | Greeshmitha Bingumalla | Greeshmitha | Faculty profile + profile completeness % | Phase 1 🔴 Blocker |
| **M9** | Research & Innovation | Greeshmitha Bingumalla | Abhigna | Publications count for personal timeline events | Phase 1 🟡 Needed |
| **M11** | Faculty Development & Growth | Greeshmitha Bingumalla | *(Unassigned)* | FDP completion events for personal timeline | Phase 1 🟡 Needed |
| **M14** | PRAJNA Score Engine | Komma Bhanu Teja | Santosh | Total score, tier, points to next tier | Phase 1 🔴 Blocker |
| **M15** | Leaderboard System | Komma Bhanu Teja | Bhavesh | Department rank, total faculty count, percentile | Phase 1 🔴 Blocker |
| **M23** | Dynamic To-Do Engine | Jaya Harshitha Mannela | Deeksha Oruganti | Today's to-do checklist with urgency flags | Phase 1 🔴 Blocker |

> 🔴 **Blocker** = The Faculty Dashboard will show empty/broken sections without this API.
> 🟡 **Needed** = The timeline will have fewer events but the dashboard will still load.

---

## Section-by-Section API Contracts

---

### M3 — Auth & User Management

**Domain SME:** Goondla Balaji | **Developer:** Balaji
**Used in:** `src/contexts/AuthContext.tsx` and `src/pages/LoginPage.tsx`

The frontend decodes the Cognito JWT on login to build the user session and route each user to their correct dashboard.

#### JWT Claims We Read

| Claim Key | Type | Required | Used For in UI |
|---|---|---|---|
| `name` | `string` | ✅ Yes | Displayed in the Morning Briefing banner — *"Welcome back, Hemanth"* |
| `email` | `string` | ✅ Yes | Shown in the profile header (top-right corner) |
| `cognito:groups` | `string[]` | ✅ Yes | Routes user to `/dashboard/faculty` or `/dashboard/hod` |
| `custom:campus` | `string` | ✅ Yes | Campus label in the profile card — *"EECE Department"* |
| `sub` | `string` | ✅ Yes | Used as the `facultyId` for all downstream API calls |

#### Allowed Values

- `cognito:groups` must contain one of: `Faculty`, `HoD`, `Director`, `IQAC`, `ProVC`, `Admin`
- `custom:campus` must be one of: `BENGALURU`, `VIZAG`, `HYDERABAD`

#### What Would Break Us

- ❌ Renaming `name` → `given_name`. The welcome banner will show *"Welcome back, undefined"*.
- ❌ Changing group names (e.g., `Faculty` → `Teachers`). Our router will not recognize the role and redirect back to login.
- ❌ Missing `sub` claim. We have no facultyId to make any downstream API call.

---

### M4 — API Gateway & Middleware

**Domain SME:** Goondla Balaji | **Developer:** Neha
**Used in:** `src/utils/api.ts` — every single API call in the dashboard goes through this.

#### What We Need From You

| Requirement | Detail |
|---|---|
| **CORS** | `Access-Control-Allow-Origin: *` (or our CloudFront domain) on every endpoint |
| **Allowed Headers** | `Authorization`, `Content-Type` must be in `Access-Control-Allow-Headers` |
| **OPTIONS preflight** | Every route must handle `OPTIONS` and return 200 |
| **Base URL** | A single stable URL injected into `VITE_API_URL` in our `.env` |
| **Auth pass-through** | `requestContext.authorizer.claims` must be forwarded to Lambda — we read JWT claims from there |

#### What Would Break Us

- ❌ Missing CORS headers — the browser blocks the request entirely. The dashboard shows blank boxes. This is the #1 silent killer.
- ❌ Stripping `requestContext.authorizer` — all our Lambda calls assume JWT claims come from there.

---

### M7 — Personal & Professional Profile

**Domain SME:** Greeshmitha Bingumalla | **Developer:** Greeshmitha
**Used in:** `src/pages/dashboards/FacultyDashboard.tsx` — Profile Completeness widget and top greeting.

#### Endpoint We Will Call

```
GET /faculty/{facultyId}/profile
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
{
  "name": "Hemanth Reddy",
  "email": "hemanth.reddyk@gitam.edu",
  "department": "Computer Science and Engineering (CSE)",
  "role": "Faculty",
  "campus": "HYDERABAD",
  "profileCompleteness": 85,
  "missingIntegrations": [
    { "id": "orcid", "label": "ORCID ID", "status": "missing" },
    { "id": "google_scholar", "label": "Google Scholar", "status": "linked" }
  ]
}
```

#### Field-by-Field Usage

| Field | UI Component | Notes |
|---|---|---|
| `name` | Morning Briefing greeting | Same as JWT `name` claim — either source is fine |
| `email` | Profile header | Displayed under the user's initials avatar |
| `department` | Profile header sub-label | e.g., *"EECE Department"* |
| `profileCompleteness` | Circular ring chart (0–100%) | Must be a `number`, not a string |
| `missingIntegrations` | "Add ORCID ID" / "Link Google Scholar" buttons | If `status: "missing"`, button shows. If `status: "linked"`, it hides. |

#### What Would Break Us

- ❌ Renaming `profileCompleteness` → `completionPercentage`. The ring chart shows `0%`.
- ❌ Returning `profileCompleteness` as a string `"85"`. Our SVG calculation crashes.
- ❌ Changing `status` values from `"missing"` / `"linked"` to `"0"` / `"1"`. Our conditional rendering breaks.

---

### M9 — Research & Innovation

**Domain SME:** Greeshmitha Bingumalla | **Developer:** Abhigna
**Used in:** Personal Timeline widget on `FacultyDashboard.tsx`

#### Endpoint We Will Call

```
GET /faculty/{facultyId}/research/timeline
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
[
  {
    "id": "pub-001",
    "type": "PUBLICATION",
    "title": "IEEE Paper Published",
    "pointsAwarded": 50,
    "timestamp": "2026-06-20T10:00:00Z"
  }
]
```

#### Field-by-Field Usage

| Field | UI Component | Notes |
|---|---|---|
| `type` | Icon next to event | `PUBLICATION` shows a document icon. Future types: `PATENT`, `GRANT`. |
| `title` | Event title text | e.g., *"IEEE Paper Published"* |
| `pointsAwarded` | Green badge | e.g., *"+50 PRAJNA Points"* |
| `timestamp` | Relative time display | e.g., *"2 days ago"*. Must be ISO 8601. |

---

### M11 — Faculty Development & Growth

**Domain SME:** Greeshmitha Bingumalla | **Developer:** *(Unassigned — please confirm)*
**Used in:** Personal Timeline widget on `FacultyDashboard.tsx`

#### Endpoint We Will Call

```
GET /faculty/{facultyId}/development/timeline
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
[
  {
    "id": "fdp-001",
    "type": "FDP",
    "title": "Completed FDP Program",
    "pointsAwarded": 20,
    "timestamp": "2026-06-15T14:30:00Z"
  }
]
```

> **Note:** This can be merged into M7's single `GET /faculty/{facultyId}/timeline` response if Greeshmitha and the M11 owner agree. We are flexible on the approach — just confirm before shipping.

---

### M14 — PRAJNA Score Engine

**Domain SME:** Komma Bhanu Teja | **Developer:** Santosh
**Used in:** PRAJNA Score card and Morning Briefing banner (`src/components/MorningBriefBanner.tsx`)

#### Endpoint We Will Call

```
GET /score/{facultyId}
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
{
  "totalScore": 840,
  "maxScore": 1000,
  "academicYear": "2024-25",
  "tier": "Gold",
  "previousScore": 750,
  "rankTrend": 12,
  "pointsToNextTier": 15,
  "nextTierName": "PRAJNA Fellow"
}
```

#### Field-by-Field Usage

| Field | UI Component | Notes |
|---|---|---|
| `totalScore` | Animated score number (`SlotCounter`) | **Must be a `number`, not a string.** Will crash if `"840"` is returned. |
| `maxScore` | Score denominator — *"840/1000"* | Defaults to 1000 if missing |
| `tier` | Tier badge label | e.g., *"Gold"* |
| `rankTrend` | *"↑ 12% vs last year"* badge | Positive = improvement. Negative = dropped. |
| `pointsToNextTier` | Morning Briefing tip line | e.g., *"You are only 15 points away from PRAJNA Fellow!"* |
| `nextTierName` | Same tip line | The name of the next tier above current |

#### What Would Break Us

- ❌ Returning `totalScore` as a string. The `SlotCounter` animation uses it directly in number math.
- ❌ Missing `pointsToNextTier` and `nextTierName`. The motivational tip in the Morning Briefing will be blank.

---

### M15 — Leaderboard System

**Domain SME:** Komma Bhanu Teja | **Developer:** Bhavesh
**Used in:** Department Rank, Percentile, and Pending Evidence cards on the dashboard

#### Endpoint We Will Call

```
GET /leaderboard/rankings/{facultyId}
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
{
  "departmentRank": 4,
  "departmentTotalFaculty": 45,
  "rankTrend": 5,
  "universityPercentile": 88,
  "percentileTrend": 8,
  "pendingEvidenceItems": 3
}
```

#### Field-by-Field Usage

| Field | UI Component | Notes |
|---|---|---|
| `departmentRank` | *"#4"* in Dept. Rank card | Displayed as `#${departmentRank}` |
| `departmentTotalFaculty` | *"of 45 Faculty"* sub-label | The UI explicitly renders this — must be present |
| `rankTrend` | *"↑ 5% positions up"* badge | Positive = improved. Negative = dropped. |
| `universityPercentile` | *"88%"* in Percentile card | Must be a `number` (0–100) |
| `percentileTrend` | *"↑ 8% improvement"* badge | Same sign convention as rankTrend |
| `pendingEvidenceItems` | *"3 Evidence Items"* in Pending card | Count of items awaiting HoD approval |

#### What Would Break Us

- ❌ Removing `departmentTotalFaculty`. The UI literally says *"of 45 Faculty"*. Without it, that line breaks.
- ❌ Returning percentile as a decimal (`0.88` instead of `88`). The UI shows `0%` instead of `88%`.

---

### M23 — Dynamic To-Do Engine

**Domain SME:** Jaya Harshitha Mannela | **Developer:** Deeksha Oruganti
**Used in:** *"Today's Priorities"* checklist section — the most prominent action area on the dashboard

#### Endpoint We Will Call

```
GET /faculty/{facultyId}/todos/today
Authorization: Bearer <CognitoJWT>
```

#### Expected Response Shape

```json
[
  {
    "id": "task-1",
    "title": "Submit Q1 Research Evidence",
    "description": "Due today at 5:00 PM",
    "isUrgent": true,
    "status": "pending",
    "category": "Research"
  },
  {
    "id": "task-2",
    "title": "Verify Mid-term Attendance",
    "description": "Pending for CSE-302",
    "isUrgent": false,
    "status": "pending",
    "category": "Teaching"
  }
]
```

#### Field-by-Field Usage

| Field | UI Component | Notes |
|---|---|---|
| `id` | React list `key` prop | Must be unique per task |
| `title` | Task label text | e.g., *"Submit Q1 Research Evidence"* |
| `description` | Task sub-label in grey | e.g., *"Due today at 5:00 PM"* |
| `isUrgent` | Red dot + *"Urgent"* badge | **Must be boolean `true`/`false`.** Not a string. |
| `status` | Used to filter out completed tasks | `"pending"` or `"completed"` |
| `category` | Category label in task modal | e.g., *"Research"*, *"Teaching"* |

#### What Would Break Us

- ❌ Changing `isUrgent` from `boolean` → `string` (e.g., `"high"`). Our UI does `if (task.isUrgent)` — a non-empty string is always truthy, making everything look urgent.
- ❌ Returning an empty array `[]` when there are no tasks — this is fine and expected. Do **not** return `null` or `undefined` — we call `.map()` on the response directly.

---

## Phase 2 Preview — HoD Dashboard (Module 25)

> **Not active yet.** This section is for awareness only. HoD Dashboard work begins after Faculty Dashboard goes live.

The HoD Dashboard will additionally require data from:

| # | Module Name | Domain SME | Developer | What We Need |
|---|---|---|---|---|
| **M13** | Approval Workflow Engine | Komma Bhanu Teja | K Bhanu Teja | Pending approval queue for the HoD's department |
| **M7** | Personal & Professional Profile | Greeshmitha Bingumalla | Greeshmitha | Faculty list for the department |
| **M14** | PRAJNA Score Engine | Komma Bhanu Teja | Santosh | Department-wide score distribution |
| **M15** | Leaderboard System | Komma Bhanu Teja | Bhavesh | Department rank table, faculty needing attention |

A separate HoD dependency contract will be published before Phase 2 begins.

---

## How to Propose a Breaking Change

If you need to rename a field, change a type, or restructure a response after we've integrated your API:

1. Message Hemanth Reddy **before** deploying to prod.
2. We update our TypeScript interfaces and component code in the same PR window.
3. Never deploy a breaking payload change to production without coordinating — the dashboard will crash silently.

---

## Contact

- **Frontend / Dashboard Team:** Hemanth Reddy (Module 24, 25)
- **Faculty Data Domain SME:** Greeshmitha Bingumalla (Modules 7–12)
- **Business Logic Domain SME:** Komma Bhanu Teja (Modules 13–18)
- **AI / To-Do Domain SME:** Jaya Harshitha Mannela (Modules 19–23)
- **Core Platform Domain SME:** Goondla Balaji (Modules 1–6)

---

*PRAJNA — प्रज्ञा | Super-30 | Dashboard Cross-Team Dependency Report · 2026-06-23*
