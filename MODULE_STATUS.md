# 📑 PRAJNA — Module Progress & Roadmap

> **Last Updated:** 2026-05-07  
> **Platform:** AWS (Cognito, DynamoDB, S3, API Gateway, Lambda, Bedrock)  
> **Frontend:** Vite + React + TypeScript, GITAM Design System

---

## 🚦 Overall Project Status

| Metric | Status |
| :--- | :--- |
| **Current Phase** | Phase 2 — Backend Integration |
| **Branding / Design System** | ✅ 100% — GITAM Forest Green `#007366` |
| **Auth & RBAC** | ✅ 100% — 6 role groups live in Cognito |
| **UI Shells Built** | ✅ 9 / 30 modules |
| **Live Backends** | ⚡ 2 / 30 modules (Admin, Attendance) |
| **Untouched Modules** | 🔴 21 modules — UI + Backend both missing |

---

## ✅ UI Complete — Backend Integration Needed

| Module | Name | UI | Backend | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **M21** | Morning Briefing | ✅ | ❌ | Hero, greeting, classes today, score shift |
| **M08** | Teaching Delivery | ✅ | ❌ | Timetable, attendance toggles, ongoing class |
| **M12** | Score Engine / Research | ✅ | ❌ | H-Index, DOI lookup, publication status |
| **M13** | Approvals Engine | ✅ | ❌ | Queue, approve/reject, status badges |
| **M07** | IQAC HQ | ✅ | ❌ | Readiness speedometer, 7-criteria grid |
| **M15** | Peer Leaderboard | ✅ | ❌ | Top 3 podium, searchable rankings |
| **M30** | Document Vault | ✅ | ❌ | Encrypted storage UI, NAAC mapping |
| **M04** | AI Career Companion | ✅ | ❌ | Chat UI, action chips, Bedrock-branded |
| **M00** | System Admin | ✅ | ⚡ Partial | Add User live; stats/table CORS WIP |

---

## ⚡ Fully Live (UI + Backend Connected)

| Module | Name | Stack | Notes |
| :--- | :--- | :--- | :--- |
| **M00** | Admin — User Management | Cognito + API GW + Lambda | List, Create, Export working |
| **M21** | Faculty Attendance | DynamoDB + API GW + Lambda | Log sessions, weekly load tracker |

---

## 🔌 Infrastructure Status

| Service | Status | Notes |
| :--- | :--- | :--- |
| **Cognito** | ✅ Active | 6 role groups, AdminCreateUser live |
| **API Gateway** | ✅ Active | `/admin`, `/attendance` endpoints live |
| **Lambda** | ✅ Active | AdminHandler, AttendanceHandler deployed |
| **DynamoDB** | ⚡ Partial | `PrajnaMainTable`, `PrajnaAttendance`, `PrajnaAuditLogs` created |
| **S3** | ⚡ Created | `PrajnaDocVault` bucket exists, presigned URLs not wired |
| **EventBridge** | ⏳ Pending | Bus created, no event rules yet |
| **Amazon Bedrock** | ❌ Not started | Needed for M04 AI Chat + M21 Briefing |
| **Vite + React** | ✅ Active | GITAM branding, RBAC routing complete |

---

## 🎯 Backend Integration Roadmap (Priority Order)

### Phase 2A — Core Data Layer
1. **M12 Research / Score Engine** → Deploy DynamoDB schema + CrossRef/Scopus DOI fetcher Lambda
2. **M13 Approvals Engine** → Step Functions approval flow + EventBridge faculty notifications
3. **M30 Document Vault** → S3 presigned URL Lambda for upload/download

### Phase 2B — Intelligence Layer
4. **M04 AI Career Companion** → Bedrock Claude 3 Lambda + faculty context injection
5. **M21 Morning Briefing** → Bedrock cron (8AM IST) generating personalized briefings
6. **M07 IQAC HQ** → Real dept scores → 7 NAAC criteria mapping from DynamoDB

### Phase 2C — Social & Reporting Layer
7. **M15 Peer Leaderboard** → Live PRAJNA scores from DynamoDB aggregation
8. **M08 Teaching Delivery** → SIS integration for real student lists + attendance writes
9. **M16 Notification Engine** → SES + SNS + WhatsApp for M13 approval alerts

---

## 🔴 Not Built At All (UI + Backend Both Missing)

| Module | Name | Priority |
| :--- | :--- | :--- |
| **M09** | Research Innovation (patents, grants, PhD) | High |
| **M10** | Achievements & Recognition | Medium |
| **M11** | Faculty Development (FDPs, MOOCs) | Medium |
| **M14** | APAR & Appraisal | High |
| **M16** | Notification Engine (SES + SNS + WhatsApp) | High |
| **M17** | Report Generator (NAAC/NBA/NIRF PDF/Excel) | High |
| **M18** | Career Coach + Opportunity Spotter | Medium |
| **M19** | Dynamic To-Do Engine | Low |
| **M22** | HoD Dashboard (full) | High |
| **M23** | Director / ProVC Command Centre | High |
| **M24** | Multi-channel Integration | Medium |
| **M25** | Security & Audit Trail | High |
| **M26** | Monitoring & Observability | Medium |
| **M27** | Data Migration Tools | Low |
| **M28** | GITAM Portal + HR Integration | High |
| **M29** | PWA Optimization | Low |
| **M07b** | Personal Profile CRUD | Medium |

---

## 📌 Summary

> **9 UI shells done. 2 backends live. ~21 modules untouched.**  
> The entire next phase is backend integration, starting with M12 (Research/Score Engine) as it powers the most downstream features (leaderboard, IQAC scores, briefings).
