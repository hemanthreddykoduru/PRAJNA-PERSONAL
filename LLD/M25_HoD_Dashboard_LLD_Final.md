# [LLD] PRAJNA — HoD Dashboard (Module 25)

## Module: 25 — HoD Dashboard

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
    Module 25 serves as the operational oversight cockpit for Heads of Departments (HoDs). It compiles department metrics, tracks faculty score registers, displays workload balance charts, and displays pending publication or certification approvals.
*   **Why does it exist in PRAJNA?**  
    It provides department managers with instant administrative visibility to verify academic materials, identify compliance warnings, balance credit hours among branch faculty, and eliminate pipeline approval bottlenecks.
*   **Who are the end users of this module?**  
    GITAM Heads of Departments, School Directors, Super-30 Compliance Auditors, and System Administrators.

---

## 2. Scope

### In Scope

- Operational stats widgets tracking total branch faculty, pending approvals, and low-compliance alerts.
- Departmental approval queue panel with one-click inline actions and smooth Framer Motion fade-out removals.
- Credit hour workload balancing monitor using horizontal computed SVG charts.
- Faculty directory tracker supporting live queries, department searches, and tier-badge filters.
- Secure token authorizer boundaries restricting queries to the HoD's specific department.

### Out of Scope

- Direct accreditation score generation (managed by Module 14 - Accreditation Score).
- Final UGC or university reporting rollups (managed by Module 17 - Report Generator).
- Managing student registrations or grade sheets.

---

## 3. Dependencies

### Depends On (modules this needs to work)

- **Module 5 (Database Layer)** — provides core profiles, departmental lists, and workloads.
- **Module 13 (Approvals)** — provides pending FDP certificates and publications queues.
- **Module 14 (Accreditation Score)** — provides faculty scores and tier rankings.

### Depended By (modules that need this to work)

- **Module 26 (Director Dashboard)** — consumes escalated approval items.
- **Module 27 (IQAC Dashboard)** — consumes audited compliance scores.

---

## 4. Architecture & Design

### Component Diagram

```
[React SPA Root]
       │
       ├─── [Operational Stats Row] ─── (Branch counters & alert tallies)
       │
       ├─── [Approval Queue Widget] ──── (FDP / Publication L1 Checks)
       │
       ├─── [Faculty Tracker Directory] ── (Rankings, Search, & Filters)
       │
       └─── [Workload Balance Chart] ─── (SVG Credit allocations)
```

### Data Flow

1. HoD logs in → Cognito returns JWT containing HoD role, campus, and department claims.
2. React checks claims, secures route context, and boots the `/dashboard/hod` panel.
3. Dashboard performs concurrent async queries: `hodApi.getDepartmentFaculty()` & `hodApi.getPendingApprovals()`.
4. API Gateway processes headers → Lambda decodes JWT and validates `campusId` + `departmentId`.
5. DynamoDB retrieves records → React reconciles active queue state → Renders workload indicators and approvals.

---

## 5. Data Model

### Entities

Module 25 consumes read-only data from the core database layer. The entities and access details mapped in DynamoDB are:

*   **Entity: DepartmentProfile**
    *   `deptId`: String (Primary Key)
    *   `averageScore`: Number
    *   `pendingApprovalsCount`: Number
*   **Entity: FacultyMemberRecord**
    *   `facultyId`: String (Primary Key)
    *   `name`: String
    *   `prajnaScore`: Number
    *   `workloadCredits`: Number (Ideal threshold: 12-16)
    *   `status`: String ('active' | 'attention')

### Access Patterns

| Access Pattern | PK | SK | Method |
| :--- | :--- | :--- | :--- |
| **List Pending Departmental Approvals** | `CAMPUS#{campusId}#DEPT#{deptId}#APPROVALS` | `PENDING#L1#{timestamp}` | `Query` (begins_with) |
| **List Departmental Faculty Directory** | `CAMPUS#{campusId}#FACULTY` | *(GSI filter by deptId)* | `Query` on GSI |
| **Get Faculty Workload Status** | `CAMPUS#{campusId}#FACULTY#{facultyId}` | `WORKLOAD` | `GetItem` |

---

## 6. API Design

### Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/hod/approvals` | Lists pending departmental approval requests | Yes (JWT) | None | `{ success: true, approvals: [...] }` |
| **POST** | `/hod/approvals/:id/action` | Executes an L1 Approve or Reject decision | Yes (JWT) | `{ action: 'approve'\|'reject' }` | `{ success: true }` |
| **GET** | `/hod/faculty` | Lists and filters all department faculty | Yes (JWT) | None | `{ success: true, faculty: [...] }` |

### Error Handling

- **401 Unauthorized**: Missing/invalid token. UI routes user directly back to `/login`.
- **403 Forbidden**: Department mismatch (e.g. CSE HoD trying to view EEE faculty). UI displays access warning modal.
- **500 Server Error**: Local boundary catch states trigger fallback mocks with automated logs.

---

## 7. Technology Choices

| Area | Choice | Why | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Visual Framework** | React SPA (Vite) | High-speed SPA transitions and quick pathing alias compatibility. | Next.js Server Components (rejected due to Cognito Client complexity) |
| **Animations** | Framer Motion | Smooth inline fade-out animations for quick approval queues. | Standard React state toggles (visually jarring list reflows) |
| **Workload Charts** | Inline Horizontal SVG | Direct threshold monitoring with zero chart library overhead. | Recharts or Chart.js (adds unnecessary weight and style limits) |

---

## 8. Security Considerations

*   **Authentication/authorization**: Restriced to Cognito groups containing 'HoD'. Claims verified on every router action.
*   **Data privacy**: Multi-tenant isolation limits all Lambda scans to the HoD's specific `departmentId` claim.
*   **Input validation**: Form fields checked for malicious inputs (XSS / SQL injections) before Lambda triggers.
*   **Sensitive data**: Faculty salaries and personal addresses are strictly excluded from the dashboard data models.

---

## 9. Testing Strategy

| Type | What You'll Test | Tool/Approach |
| :--- | :--- | :--- |
| **Unit** | Workload threshold colors (Green, Gold, Red) & state updates | Jest + React Testing Library |
| **Integration** | Department claims checking and blocked cross-department requests | Vitest + MSW |
| **E2E** | Multi-tenant department isolation and dashboard route blockings | Playwright / Cypress |

---

## 10. CDK / Infrastructure

*   **AWS Resources**: Amazon S3 (for static frontend hosting), Amazon CloudFront (distribution CDN).
*   **CDK Stack Design**: `HoDDashboardStack` creates the CloudFront distribution and links it securely to S3 buckets using OAI.
*   **Connections**: Inherits domain name DNS references from `PrajnaBaseStack`.

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **HoD session failures** | High | UI cache-busting redirects to `/login` with clear status notifications. |
| **Cross-department leaks** | High | Lambda strictly filters operations based on token department claim values. |
| **Tablet viewport breaks** | Medium | Built fully responsive flex layouts; audited tablet sizes early. |

---

## 12. Milestones & Timeline

| Week | Deliverable |
| :--- | :--- |
| **Week 1–2** | LLD complete, approved & visual style tokens configured in index.css |
| **Week 3–4** | Component skeleton setup, grid lines, and workload SVG charts completed |
| **Week 5–6** | Approval actions, faculty search lists, and filter widgets completed |
| **Week 7–8** | Integration with live Amplify Cognito authentication tokens & audit tests |
| **Week 9–10** | End-to-end multi-tenant isolation verification and edge-case UAT checks |
| **Week 11–12** | Staging dry runs, final documentation updates, and executive dashboard release |

---

## 13. Open Questions

- *Should L1 approvals require custom textual feedback justifications on rejection?* (Currently kept as simple reject action to minimize database writing operations).

---

## 14. Self-Assessment — Amazon Leadership Principles

Review all 14 LPs below. Pick your **top 3 you demonstrated** and **top 3 you need to work on**. Provide an example for each.

| # | Leadership Principle | Demonstrated / Need to Work On | Example from Your Work |
| :--- | :--- | :--- | :--- |
| 1 | **Customer Obsession** | Demonstrated | Developed workload charts focused on administrative balance, warning HoDs when teachers are overloaded to support employee comfort. |
| 2 | **Ownership** | Demonstrated | Took complete end-to-end responsibility for Module 25 UI layout, refactoring code to compile perfectly in less than 2 seconds. |
| 3 | **Invent and Simplify** | Demonstrated | Simplified complex approval lists with smooth inline fade-outs, eliminating complex manual list updates. |
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
1. **Customer Obsession** (Tailoring designs for the operational balance of GITAM Faculty).
2. **Invent and Simplify** (Building custom lightweight SVG credit load monitors instead of heavy libraries).
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
