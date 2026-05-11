# https://prajna.hemanthreddykoduru.dev/
# PRAJNA

> **Sanskrit: प्रज्ञा** — *deep intelligence, inner wisdom*

PRAJNA is an AI-powered faculty intelligence platform built for **GITAM University** (Bengaluru, Visakhapatnam, Hyderabad campuses). It is an enterprise SaaS dashboard that serves six distinct user roles — Faculty, Head of Department, Director, Pro Vice-Chancellor, IQAC Officer, and System Admin — each with their own tailored command centre, backed by a serverless AWS infrastructure.

---

## 🗂️ Repository Structure

```
PRAJNA/
├── infrastructure/                 # AWS CDK v2 — all cloud resources
│   ├── bin/
│   │   └── infrastructure.ts       # CDK App entry: wires all 4 stacks
│   └── lib/
│       ├── foundation-stack.ts     # DynamoDB (3 tables), S3, Cognito, EventBridge
│       ├── api-stack.ts            # API Gateway + 7 Lambda functions
│       ├── chat-backend-stack.ts   # Separate API Gateway + AI chat Lambda
│       └── website-stack.ts        # S3 + CloudFront distribution
│
├── packages/
│   ├── frontend/                   # Vite + React 18 + TypeScript SPA
│   │   ├── src/
│   │   │   ├── App.tsx             # React Router — all 30+ route definitions
│   │   │   ├── main.tsx            # Amplify config + React root
│   │   │   ├── contexts/
│   │   │   │   └── AuthContext.tsx # Cognito session, RBAC, nuclear cleanup
│   │   │   ├── layouts/
│   │   │   │   └── DashboardLayout.tsx  # Sidebar, header, mobile nav
│   │   │   ├── components/
│   │   │   │   ├── AICompanionChat.tsx  # Floating chat overlay (Gemini-powered)
│   │   │   │   ├── MorningBriefing.tsx  # Hero morning card
│   │   │   │   ├── ProtectedRoute.tsx   # Role-gated wrapper
│   │   │   │   ├── DashboardSkeleton.tsx # Shimmer loading state
│   │   │   │   └── CelebrationEffect.tsx # Confetti on publication submit
│   │   │   ├── pages/
│   │   │   │   ├── dashboards/          # One per role
│   │   │   │   │   ├── FacultyDashboard.tsx  # Score card, briefing, to-do
│   │   │   │   │   ├── HoDDashboard.tsx
│   │   │   │   │   ├── DirectorDashboard.tsx
│   │   │   │   │   ├── ProVCDashboard.tsx
│   │   │   │   │   ├── IQACDashboard.tsx
│   │   │   │   │   └── AdminDashboard.tsx    # Campus health, activity log
│   │   │   │   ├── admin/
│   │   │   │   │   ├── SystemSettings.tsx
│   │   │   │   │   ├── DataMigration.tsx
│   │   │   │   │   ├── AuditLogs.tsx
│   │   │   │   │   └── UserManagement.tsx
│   │   │   │   ├── AdminManagement.tsx   # User CRUD, bulk import, CSV export
│   │   │   │   ├── Attendance.tsx        # Teaching session log + weekly load
│   │   │   │   ├── ResearchPage.tsx      # DOI lookup, publications, H-Index
│   │   │   │   ├── ApprovalsPage.tsx     # HoD/Director approval queue
│   │   │   │   ├── TeachingPage.tsx      # Timetable, attendance toggles
│   │   │   │   ├── PeerLeaderboard.tsx   # Faculty rankings
│   │   │   │   ├── DocumentVault.tsx     # Encrypted file storage
│   │   │   │   ├── CriteriaDetail.tsx    # IQAC NAAC criteria drilldown
│   │   │   │   └── LoginPage.tsx
│   │   │   └── utils/
│   │   │       └── api.ts              # Authenticated fetch wrapper + facultyApi
│   │   └── .env                        # Cognito + API config (see below)
│   │
│   └── functions/                  # Lambda source (TypeScript, Node.js 20)
│       └── src/
│           ├── admin/handler.ts    # List/Create Cognito users + audit logging
│           ├── attendance/handler.ts # DynamoDB read/write for teaching logs
│           ├── research/
│           │   ├── handler.ts      # GET/POST publications, H-Index compute
│           │   └── lookup.ts       # Public CrossRef DOI metadata fetch
│           ├── chat/handler.ts     # Gemini AI chat + DynamoDB history
│           ├── documents/get-presigned-url.ts # S3 presigned URL generation
│           └── audit/logger.ts     # Structured audit log writer
│
├── docs/                           # Architecture diagrams, LLDs
├── scripts/                        # Migration and seeding utilities
├── cdk.json                        # CDK config (app entry + context)
├── MODULE_STATUS.md                # Live module roadmap tracker
└── DEVELOPMENT_GUIDE.md            # Design system + phase plan
```

---

## 🏗️ AWS Infrastructure (4 CDK Stacks)

### `PrajnaFoundationStack`
| Resource | Name / Config | Purpose |
| :--- | :--- | :--- |
| DynamoDB | `PrajnaMainTableV2` (PK+SK, GSI1, streams, PITR) | Primary single-table store |
| DynamoDB | `PrajnaAttendance` (facultyId + date) | Teaching session logs |
| DynamoDB | `PrajnaAuditLogs` (userId + timestamp) | Admin action trail |
| S3 | `PrajnaDocVault` (versioned, AES-256, CORS) | Document vault uploads |
| EventBridge | `PrajnaBus` | System event bus |
| Cognito | `prajna-users` (email sign-in, 6 groups) | Auth & RBAC |

### `PrajnaApiStack`
| Lambda | Entry | Routes |
| :--- | :--- | :--- |
| `ProfileHandler` | `dist/profile` | `GET/PUT /faculty/profile` |
| `ResearchHandler` | `src/research/handler.ts` | `GET/POST /research` |
| `ResearchLookupHandler` | `src/research/lookup.ts` | `GET /research/lookup` (public) |
| `DocumentUploadHandler` | `src/documents/get-presigned-url.ts` | `POST /documents/upload-url` |
| `AdminHandler` | `src/admin/handler.ts` | `GET/POST /admin` |
| `AttendanceHandler` | `src/attendance/handler.ts` | `GET/POST /attendance` |

All routes (except DOI lookup) protected by `CognitoUserPoolsAuthorizer` (ID Token required).  
Gateway-level CORS responses configured for `DEFAULT_4XX` and `DEFAULT_5XX`.

### `PrajnaChatBackendStack`
Separate API Gateway at `https://wh0rh0v5y9.execute-api.us-east-1.amazonaws.com/prod`  
- `GET /history/{userId}` — fetch conversation history  
- `POST /history` — save message + trigger Gemini AI response

### `PrajnaWebsiteStack`
S3 → CloudFront distribution (HTTPS, SPA 404→index.html rewrite)  
Production URL: `https://d3t7dws4bypadt.cloudfront.net`

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Routing** | React Router v6 (nested routes, role guards) |
| **Auth** | AWS Amplify v6 (`aws-amplify/auth`), Amazon Cognito |
| **API** | Amazon API Gateway REST, AWS Lambda Node.js 20 |
| **Database** | Amazon DynamoDB (single-table + 2 dedicated tables) |
| **Storage** | Amazon S3 (versioned, AES-256 encrypted) |
| **AI Chat** | Amazon Bedrock — Anthropic Claude 3 Haiku |
| **CDN** | Amazon CloudFront |
| **IaC** | AWS CDK v2 (TypeScript), 4 stacks |
| **Bundler** | esbuild (via `aws-cdk-lib/aws-lambda-nodejs`) |

---

## 🎨 Design System

Official **GITAM University** colour palette.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--primary` | `#007366` | Buttons, active nav, metrics (Forest Green) |
| `--secondary` | `#F0E0C1` | Card backgrounds, AI chat (Chamois) |
| `--accent` | `#E33A0C` | Warnings, destructive actions (Trinidad Red) |
| `--text` | `#1A1A1A` | Body copy |
| `--border` | `#EDEDED` | Dividers, card outlines |
| `--primary-hover` | `#00594C` | Interactive hover state |

Typography: Inter / system-ui. All interactive elements use `transition-all` micro-animations.

---

## 🔒 Authentication & RBAC

**Role Priority (highest → lowest):** `Admin > ProVC > Director > IQAC > HoD > Faculty`

- Roles read from `cognito:groups` in the **ID Token payload** (not access token)
- Custom Cognito attributes: `custom:campus`, `custom:department`, `custom:empId`, `custom:role`
- **Nuclear cleanup on sign-out**: wipes all `amplify` and `CognitoIdentityServiceProvider` keys from `localStorage`, clears `sessionStorage`
- **5-second auth timeout**: `Promise.race` against a timeout — fails gracefully to login
- Every route wrapped in `<ProtectedRoute allowedRoles={[...]} />` — unauthenticated users redirected to `/login`
- Login/logout use `window.location.href` (not React Router) to guarantee clean auth context

**Role → Home Route mapping:**
```
Faculty  → /dashboard/faculty
HoD      → /dashboard/hod
Director → /dashboard/director
ProVC    → /dashboard/provc
IQAC     → /dashboard/iqac
Admin    → /dashboard/admin
```

---

## 🗄️ Database Design

### `PrajnaMainTableV2` — Single-Table Design

| Access Pattern | PK | SK |
| :--- | :--- | :--- |
| Faculty profile | `FACULTY#<sub>` | `PROFILE` |
| Publications | `FACULTY#<sub>` | `PUB#<doi-encoded>` |
| PRAJNA Score | `FACULTY#<sub>` | `SCORE` |
| Pending approvals | `APPROVAL#<hodId>` | `STATUS#PENDING#<ts>` |

GSI1 available for cross-entity queries.  
DynamoDB Streams enabled (NEW_AND_OLD_IMAGES) for future event-driven processing.

### `PrajnaAttendance`
`facultyId` (PK) + `date` (SK format: `YYYY-MM-DD#<timestamp>`)

### `PrajnaAuditLogs`
`userId` (PK) + `timestamp` (SK, Number)

### `PrajnaChatHistoryV2` (in ChatBackendStack)
`userId` (PK) + `timestamp` (SK, Number) — 50-message query window

---

## 🌐 Live Endpoints

**Main API:** `https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod`

| Method | Path | Auth | Handler | Status |
| :--- | :--- | :---: | :--- | :---: |
| `GET` | `/faculty/profile` | JWT | ProfileHandler | ✅ Live |
| `PUT` | `/faculty/profile` | JWT | ProfileHandler | ✅ Live |
| `GET` | `/research` | JWT | ResearchHandler | ✅ Live |
| `POST` | `/research` | JWT | ResearchHandler | ✅ Live |
| `GET` | `/research/lookup?doi=` | Public | ResearchLookupHandler | ✅ Live |
| `GET` | `/attendance` | JWT | AttendanceHandler | ✅ Live |
| `POST` | `/attendance` | JWT | AttendanceHandler | ✅ Live |
| `GET` | `/admin?action=list` | JWT (Admin) | AdminHandler | ✅ Live |
| `POST` | `/admin?action=create` | JWT (Admin) | AdminHandler | ✅ Live |
| `POST` | `/documents/upload-url` | JWT | DocumentUploadHandler | ✅ Live |

**Chat API:** `https://wh0rh0v5y9.execute-api.us-east-1.amazonaws.com/prod`

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/history/{userId}` | Public | Fetch conversation history |
| `POST` | `/history` | Public | Send message + get AI reply |

---

## 📦 Module Status

> 9 screens built. 3 backends live (Admin, Attendance, Research). ~21 modules remaining.

### ✅ UI + Backend Live
| Module | Name | Notes |
| :--- | :--- | :--- |
| M00 | System Admin | Cognito user list, create, CSV export |
| M21b | Faculty Attendance | Teaching log, weekly load tracker |
| M12 | Research / Score Engine | DOI lookup (CrossRef), publications, H-Index |

### ✅ UI Complete — Backend Pending
| Module | Name | Backend Needed |
| :--- | :--- | :--- |
| M21 | Morning Briefing | Bedrock cron (8AM IST) |
| M08 | Teaching Delivery | SIS integration for student lists |
| M13 | Approvals Engine | Step Functions + EventBridge notifications |
| M15 | Peer Leaderboard | DynamoDB score aggregation |
| M07 | IQAC HQ | NAAC criteria score mapping |
| M30 | Document Vault | S3 presigned URL wiring |
| M04 | AI Career Companion | Amazon Bedrock (Claude 3 Haiku) |

### 🔴 Not Built (UI + Backend both missing)
M09, M10, M11, M14, M16–M19, M22–M29

See [`MODULE_STATUS.md`](./MODULE_STATUS.md) for the full prioritised roadmap.

---

## 🧠 PRAJNA Score

Each faculty member receives a composite score (0–100) driving tier classification:

| Component | Weight |
| :--- | :---: |
| Research Output (publications, H-Index, citations) | 30% |
| Teaching Delivery (attendance, timetable) | 25% |
| Faculty Development (FDPs, MOOCs, certifications) | 20% |
| Achievements (awards, patents, keynotes) | 10% |
| Administrative Contribution | 10% |
| Profile Completeness | 5% |

**Tiers:** Bronze (0–40) → Silver (41–60) → Gold (61–80) → Platinum (81–95) → PRAJNA Fellow (96–100)

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 20
AWS CLI configured (us-east-1)
```

### 1. Install dependencies
```bash
# Frontend
cd packages/frontend && npm install

# Lambda functions
cd packages/functions && npm install

# CDK infrastructure
cd infrastructure && npm install
```

### 2. Configure environment
Create `packages/frontend/.env`:
```
VITE_API_URL=https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod
VITE_USER_POOL_ID=us-east-1_lxxysDfi1
VITE_CLIENT_ID=7onjevnqk9l25jdu5j6f18bh62
VITE_REGION=us-east-1
```

### 3. Run frontend locally
```bash
cd packages/frontend && npm run dev
# → http://localhost:5173
```

### 4. Deploy to AWS
```bash
# Full deploy (all 4 stacks)
npx cdk deploy --all --require-approval never

# Deploy a single stack (avoids cross-stack issues)
npx cdk deploy PrajnaApiStack --exclusively --require-approval never
```

> **Note:** Always use `--exclusively` when deploying `PrajnaApiStack` alone — the `PrajnaFoundationStack` exports the EventBus ARN and deploying both together can cause cross-stack rollbacks if CDK detects unused exports.

---

## ⚠️ Known Gotchas

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `Authorization` header blocks CORS | API GW rejects before Lambda runs | `CfnGatewayResponse` for `DEFAULT_4XX/5XX` already configured |
| 401 despite valid session | Wrong token type | API GW Cognito Authorizer requires **IdToken**, not AccessToken |
| `FoundationStack` rollback on `cdk deploy --all` | Removing EventBus grant deletes cross-stack export | Keep `eventBus.grantPutEventsTo()` even if Lambda doesn't use it |
| New Lambda `CannotFindEntryFile` | Wrong relative path from `__dirname` | `infrastructure/lib/` → `../../packages/functions/src/...` (2 levels up) |
| `@aws-sdk` not found during esbuild | Missing `package.json` in `packages/functions/` | Run `npm init -y && npm install @aws-sdk/...` in that directory |

---

## 📄 License

Private — GITAM University. All rights reserved.
