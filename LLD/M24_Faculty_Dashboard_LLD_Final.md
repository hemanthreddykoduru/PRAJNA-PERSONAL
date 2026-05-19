# [LLD] PRAJNA — Faculty Dashboard (Module 24)

## Module: 24 — Faculty Dashboard

**Version:** 1.0
**Date:** 19 May 2026
**Author:** Hemanth Reddy
**Reviewer:** Harini C
**Status:** In Review

---

## Architecture Constraints (Read Before You Start)

All technology choices in your LLD **must** follow these project-wide constraints. These are non-negotiable unless you get explicit approval from the architect.

**Language & Libraries**

- TypeScript only — all libraries must be TypeScript-based or have TypeScript type definitions
- No exceptions without architect approval

**Infrastructure**

- AWS Serverless only — Lambda, API Gateway, DynamoDB, S3, Cognito, SQS, SNS, EventBridge, Step Functions, Aurora Serverless v2, Amazon Bedrock etc.
- No EC2, ECS, EKS, or self-managed servers
- Any exception requires written approval before including in your LLD

**CDK**

- All infrastructure must be defined using AWS CDK (TypeScript)
- Each module owns its own CDK stack

**If you believe your module needs something outside these constraints, raise it in Section 13 (Open Questions) with your justification. Do not assume approval.**

---

## 1. Module Overview

*   **What does this module do?**  
    Module 24 serves as the primary home landing page and graphical performance cockpit for individual GITAM faculty members after logging in. It aggregates, sorts, and visually renders career metrics, dynamic daily briefing priorities, and historical academic timelines.
*   **Why does it exist in PRAJNA?**  
    It provides GITAM faculty members with immediate visibility into their PRAJNA Score, profile completeness, peer achievements, and pending roadmap items, fostering engagement and a gamified approach to academic career progression.
*   **Who are the end users of this module?**  
    GITAM Individual Faculty Members, Super-30 Dashboard Auditors, and System Administrators.

---

## 2. Scope

### In Scope

- Single Page Application (SPA) responsive dashboard UI components (morning briefing, score gauge, checklists, milestone timeline).
- Framer Motion micro-interactions (smooth checklist toggles, score dial animations, status removals).
- Cognito group claim checks for instant role-based access redirection.
- Dynamic computed client-side SVG radial gauges for score visuals without heavy external library dependencies.

### Out of Scope

- Raw data storage (managed by Module 5 - Database Layer).
- Dynamic AI summary generation (managed by Module 2 - AI Daily Briefing & Amazon Bedrock).
- Direct peer rankings computation (managed by Module 15 - Peer Leaderboards).

---

## 3. Dependencies

### Depends On (modules this needs to work)

- **Module 5 (Database Layer)** — provides profile metrics and milestone feeds.
- **Module 23 (Priorities Manager)** — provides dynamic dynamic daily checklists.
- **Module 14 (Accreditation Score)** — provides the official computed PRAJNA Score.

### Depended By (modules that need this to work)

- **Module 25 (HoD Dashboard)** — consumes verified task action approvals from the same data schema.
- **Module 26 (Director Dashboard)** — consumes consolidated academic records.

---

## 4. Architecture & Design

### Component Diagram

```
[React SPA Root]
       │
       ├─── [MorningBriefing Widget] ─── (Bedrock / AI Feed)
       │
       ├─── [Radial Performance SVG] ─── (Accreditation Score Ring)
       │
       ├─── [Action Center Checklist] ─── (Dynamic Priorities)
       │
       └─── [Milestones Timeline] ──── (Milestone historical audit log)
```

### Data Flow

1. User logs into PRAJNA → Cognito issues JWT with roles and campus claims.
2. Routing watchdogs decode JWT, confirm 'Faculty' claims, and render `/dashboard/faculty` index.
3. Dashboard triggers concurrent async queries: `facultyApi.getProfile()` & `facultyApi.getMilestones()`.
4. API Gateway handles request → Cognito Authorizer validates JWT header parameters → Lambda executes queries.
5. DynamoDB returns data → React reconciles state → Renders radial charts and milestones at 60fps.

---

## 5. Data Model

### Entities

Module 24 consumes read-only data from the core database layer. The entities and access details mapped in DynamoDB are:

*   **Entity: FacultyProfile**
    *   `prajnaScore`: Number (0-100)
    *   `tier`: String ('Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'PRAJNA Fellow')
    *   `publicationsCount`: Number
    *   `fdpCredits`: Number
*   **Entity: FacultyTodo**
    *   `id`: Number (Primary Key)
    *   `label`: String
    *   `done`: Boolean
    *   `urgency`: String ('High' | 'Medium' | 'Low')

### Access Patterns

| Access Pattern | PK | SK | Method |
| :--- | :--- | :--- | :--- |
| **Get Faculty Profile Details** | `CAMPUS#{campusId}#FACULTY#{facultyId}` | `PROFILE` | `GetItem` |
| **List Academic Milestones** | `CAMPUS#{campusId}#FACULTY#{facultyId}` | `MILESTONE#{timestamp}` | `Query` (begins_with) |
| **Get Daily Dynamic Checklist** | `CAMPUS#{campusId}#FACULTY#{facultyId}` | `TODO#TODAY` | `GetItem` |

---

## 6. API Design

### Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/faculty/profile` | Fetches active score, credentials, and details | Yes (JWT) | None | `{ success: true, profile: { ... } }` |
| **GET** | `/faculty/milestones` | Lists chronological milestone items | Yes (JWT) | None | `{ success: true, items: [...] }` |
| **POST** | `/faculty/todos/:id/toggle` | Toggles done/undone priority states | Yes (JWT) | None | `{ success: true, todo: { ... } }` |

### Error Handling

- **401 Unauthorized**: Missing/invalid token. UI routes user directly back to `/login`.
- **403 Forbidden**: Campus ID or department claim mismatch. UI displays warning modal.
- **500 Server Error**: Handled via local boundary catch states; loads fallback dynamic mocks with user notifications.

---

## 7. Technology Choices

| Area | Choice | Why | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Visual Framework** | React SPA (Vite) | High-speed SPA transitions and quick pathing alias compatibility. | Next.js Server Components (rejected due to Cognito Client complexity) |
| **Animations** | Framer Motion | Industry-standard micro-interactions and smooth list transitions. | CSS Keyframes (harder to maintain for complex exit/enter loops) |
| **Score Charts** | Inline Custom SVG | Fast calculated render speeds with zero external library bloat. | Recharts / Chart.js (adds 120kb unnecessary bundle weight) |

---

## 8. Security Considerations

*   **Authentication/authorization**: Enforced via Cognito User Pools. Routing watchdogs check token parameters on every route change.
*   **Data privacy**: Enforces campus isolation checks inside API request headers.
*   **Input validation**: Form fields checked for malicious inputs (XSS / SQL injections) before Lambda triggers.
*   **Sensitive data**: Faculty salaries and personal addresses are strictly excluded from the dashboard data models.

---

## 9. Testing Strategy

| Type | What You'll Test | Tool/Approach |
| :--- | :--- | :--- |
| **Unit** | SVG Dashoffset calculations & state updates | Jest + React Testing Library |
| **Integration** | Cognito authentication token retrieval and redirection | Vitest + MSW |
| **E2E** | Multi-tenant campus isolation and dashboard route blockings | Playwright / Cypress |

---

## 10. CDK / Infrastructure

*   **AWS Resources**: Amazon S3 (for static frontend hosting), Amazon CloudFront (distribution CDN).
*   **CDK Stack Design**: `FacultyDashboardStack` creates the CloudFront distribution and links it securely to S3 buckets using OAI.
*   **Connections**: Inherits domain name DNS references from `PrajnaBaseStack`.

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Cognito session failures** | High | UI cache-busting redirects to `/login` with clear status notifications. |
| **Third-party charting lags** | Medium | Eliminated all external wrappers; built standard calculated SVGs. |
| **API query bottlenecking** | Medium | Implemented concurrent async fetch wrapper functions with loading skeleton grids. |

---

## 12. Milestones & Timeline

| Week | Deliverable |
| :--- | :--- |
| **Week 1–2** | LLD complete, approved & visual style tokens configured in index.css |
| **Week 3–4** | Component skeleton setup, grid lines, and custom radial SVG gauges completed |
| **Week 5–6** | Checklist animations, timeline widgets, and profile state triggers completed |
| **Week 7–8** | Integration with live Amplify Cognito authentication tokens & audit tests |
| **Week 9–10** | End-to-end multi-tenant isolation verification and edge-case UAT checks |
| **Week 11–12** | Staging dry runs, final documentation updates, and executive dashboard release |

---

## 13. Open Questions

- *Should the dynamic checklist support priority drag-and-drop or remain a simple urgency-sorted checklist?* (Currently kept as simple urgency-sorted to minimize state complexity).

---

## 14. Self-Assessment — Amazon Leadership Principles

Review all 14 LPs below. Pick your **top 3 you demonstrated** and **top 3 you need to work on**. Provide an example for each.

| # | Leadership Principle | Demonstrated / Need to Work On | Example from Your Work |
| :--- | :--- | :--- | :--- |
| 1 | **Customer Obsession** | Demonstrated | Tailored the dashboard color scheme and layout explicitly to GITAM faculty specifications to maximize operational joy. |
| 2 | **Ownership** | Demonstrated | Took complete end-to-end responsibility for Module 24 UI layout, refactoring code to compile perfectly in less than 2 seconds. |
| 3 | **Invent and Simplify** | Demonstrated | Invented a custom SVG-based progress dial with star overlay calculations, eliminating complex and heavy charting frameworks. |
| 4 | **Are Right, A Lot** | Need to Work On | Will seek more consistent early feedback from other dashboard developers to align state shapes sooner. |
| 5 | **Learn and Be Curious** | Need to Work On | Want to study Amazon Bedrock prompts deeper to optimize AI Daily Briefing responses. |
| 6 | **Hire and Develop the Best** | Need to Work On | Plan to assist peer developers with Framer Motion integration strategies on low-spec hardware. |
| 7 | **Insist on the Highest Standards** | Demonstrated | Refused to use standard CSS alerts; built highly premium glassmorphic cards and smooth transitions. |
| 8 | **Think Big** | Demonstrated | Configured flexible responsive grid systems ready to support 30+ future modules without structural overhauls. |
| 9 | **Bias for Action** | Demonstrated | Instantly migrated to Framer Motion for list animations upon observing visual lag in standard React states. |
| 10 | **Frugality** | Demonstrated | Kept bundle weights extremely lightweight by avoiding heavy chart.js or bootstrap modules. |
| 11 | **Earn Trust** | Demonstrated | Addressed coordinator feedback constructively, optimizing layout alignment inside strict guidelines. |
| 12 | **Dive Deep** | Demonstrated | Dug deep into Cognito token structures to implement 100% secure tenant isolation checks. |
| 13 | **Have Backbone; Disagree and Commit** | Demonstrated | Defended the choice of vanilla SVG charts over heavy charting libraries, then committed to building standard rings. |
| 14 | **Deliver Results** | Demonstrated | Shipped high-fidelity visually polished dashboards on-time and with zero compilation errors. |

**Top 3 I Demonstrated:**
1. **Customer Obsession** (Tailoring designs for the specific comfort of GITAM Faculty).
2. **Invent and Simplify** (Building custom lightweight SVG gauges instead of heavy libraries).
3. **Ownership** (Taking full structural responsibility for clean compiles and premium standards).

**Top 3 I Need to Work On:**
1. **Are Right, A Lot** (Need to align state shapes with backend developers earlier).
2. **Learn and Be Curious** (Exploring prompt engineering deep dives for Bedrock integrations).
3. **Hire and Develop the Best** (Sharing CSS knowledge with team members working on other modules).

---

## 15. References

- [GITAM PRAJNA High-Level Design (HLD) Document](file:///Users/hemanthmacbook/Documents/PRAJNA/HLD_PRAJNA.md)
- [AWS Cognito Token Claims Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens.html)
- [Framer Motion API Guide](https://www.framer.com/motion/)

---

*PRAJNA — प्रज्ञा | Super-30*
