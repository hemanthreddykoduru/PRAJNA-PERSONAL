# 🧠 PRAJNA — Complete Development Guide

**PRAJNA** (Sanskrit: deep intelligence, inner wisdom) is an AI-powered professional companion for GITAM faculty. It acts as a personal coach, career guide, and motivator, built on top of faculty data.

## 🎯 Project Overview
*   **Target Audience:** Faculty (primary), HoD, Director, IQAC.
*   **Campuses:** Bengaluru, Visakhapatnam, Hyderabad (Core Engineering Phase 1).
*   **Goal:** Provide daily morning briefings, AI companion chat, compute a composite "PRAJNA Score," and automate compliance reports (NAAC, NBA, NIRF).

---

## 🎨 Design System & Color Palette
The application will have a premium, professional, and academic look and feel.

| Color Type | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary** | `#007366` | Primary buttons, active navigation, key metrics (GITAM Tropical Rain Forest). |
| **Secondary**| `#F0E0C1` | Soft backgrounds, card sections, AI companion chat background (GITAM Chamois). |
| **Accent** | `#E33A0C` | Warnings, highlights, or distinct call-to-actions (GITAM Trinidad Red). |
| **Background**| `#FFFFFF` | Main application background for a crisp look. |
| **Text** | `#1A1A1A` | Main typography, ensuring high readability. |
| **Border** | `#EDEDED` | Subtle dividers, card outlines, table borders. |
| **Hover** | `#00594C` | Interactive states on buttons and links (Darker shade of Primary). |

---

## 🏗️ Technical Architecture (AWS Serverless)

The application follows a **Modular Serverless Architecture** managed via **AWS CDK**.

*   **Infrastructure as Code:** AWS CDK (TypeScript)
*   **Frontend:** React.js + Tailwind CSS (Vite)
*   **Authentication:** Amazon Cognito (JWT Groups for RBAC)
*   **Database:** DynamoDB (Single-table design)
*   **AI Engine:** Amazon Bedrock (Anthropic Claude 3)

---

## 🔒 Authentication & Stability

To ensure a seamless multi-role experience, the following patterns are enforced:

1.  **RBAC Logic**: Roles are extracted from `cognito:groups` in the ID Token. Priority: `Admin > ProVC > Director > IQAC > HoD > Faculty`.
2.  **Nuclear Cache Fix**: On sign-out or session conflict, `emergencyCleanup()` wipes all Cognito keys from LocalStorage and IndexedDB to prevent "Already signed in" errors.
3.  **Skeleton Screens**: Every protected route uses `DashboardSkeleton` to provide a shimmering loading state during auth verification.
4.  **Force Reload**: Login and Logout use `window.location.href` instead of SPA navigation to ensure a 100% fresh auth context.

---

## 📅 Module Progress

| ID | Module Name | Status | Lead Role |
| :--- | :--- | :--- | :--- |
| **M21** | **Morning Briefing** | ✅ Stable | Faculty |
| **M8** | **Teaching Delivery** | ✅ Stable | Faculty |
| **M12** | **Score Engine** | ✅ Stable | Faculty |
| **M13** | **Approvals Engine** | ✅ Stable | HoD / Director |
| **M15** | **Peer Leaderboard** | ⏳ Planned | Faculty |
| **M07** | **IQAC HQ** | ⏳ Planned | IQAC |

---

## 🗂️ Project Repository Structure

```text
PRAJNA/
├── infrastructure/          # CDK stacks (one per module)
├── packages/
│   ├── shared/              # Shared types, utils, constants
│   ├── lambdas/             # All Lambda functions (grouped by module)
│   │   ├── auth/
│   │   ├── faculty-profile/
│   │   ├── research/
│   │   └── ai-companion/
│   └── frontend/            # React + Tailwind CSS PWA
├── scripts/                 # Migration, seeding, utilities
└── docs/                    # Architecture and LLDs
```

---

## 🚀 Development Phases

### **Phase 0: Setup & Foundation (Current)**
*   Initialize Monorepo structure (`package.json`, workspaces).
*   Setup AWS CDK and initialize the Foundation Stack (DynamoDB Table, S3 Bucket, EventBridge Bus).
*   Configure Cognito User Pools (Roles: Faculty, HoD, Director, ProVC, IQAC, Admin).

### **Phase 1: Frontend & Design System**
*   Initialize Vite + React + TypeScript project.
*   Configure Tailwind CSS with the defined Color Palette.
*   Create reusable UI components (Buttons, Cards, Modals, Forms).
*   Set up React Router with role-based access control.

### **Phase 2: Core Faculty Data Modules (Backend & API)**
*   **Module:** Personal Profile API (CRUD for faculty details).
*   **Module:** Research & Innovation API (Crossref integration, DOI fetching).
*   **Module:** Teaching & Deliverables.
*   **Module:** Faculty Development (FDPs, MOOCs).

### **Phase 3: Business Logic & Workflows**
*   **Approval Workflow Engine:** Build AWS Step Functions for multi-level approvals (HoD -> Dean -> Director).
*   **PRAJNA Score Engine:** EventBridge triggered Lambda functions to calculate the score based on:
    *   Teaching (25%), Research (30%), FDP (20%), Achievements (10%), Admin (10%), Profile Bonus (5%).

### **Phase 4: AI Companion (Amazon Bedrock)**
*   **AI Chat API:** Connect to Amazon Bedrock (Claude 3). Inject faculty context (PRAJNA Score, pending tasks, profile) into system prompts.
*   **Morning Briefing:** CRON-triggered Lambda (via EventBridge) running at 8 AM IST to generate and store daily briefings for each active faculty member.

### **Phase 5: Dashboards & Role Views**
*   **Faculty Dashboard:** Morning briefing, Score, Todo list, Chat.
*   **HoD Dashboard:** Department overview, Pending approvals queue.
*   **Director Dashboard:** Campus-wide overview, Inspection Readiness Score, Reports export.

---

## 📊 Database Design (DynamoDB Single-Table)

**Table Name:** `prajna-main`

| Access Pattern | Partition Key (PK) | Sort Key (SK) |
| :--- | :--- | :--- |
| Faculty Profile | `FACULTY#<empId>` | `PROFILE` |
| Faculty in Dept | `DEPT#<deptId>` | `FACULTY#<empId>` |
| Publications | `FACULTY#<empId>` | `PUB#<pubId>` |
| Pending Approvals | `APPROVAL#<hodId>` | `STATUS#PENDING#<timestamp>` |
| PRAJNA Score | `FACULTY#<empId>` | `SCORE` |

---

## 🔧 Getting Started (Next Steps)

1. **Initialize Workspace:** Run `npm init` and setup the monorepo.
2. **Scaffold Frontend:** Create the `/packages/frontend` directory and apply the color palette.
3. **Scaffold CDK:** Create the `/infrastructure` directory to start defining AWS resources.
