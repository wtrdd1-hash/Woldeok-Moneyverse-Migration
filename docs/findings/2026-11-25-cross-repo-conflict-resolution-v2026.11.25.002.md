# Cross-Repository Document Conflict Resolution & Test Server QA, Security, Data Conversion Verification Resolution — v2026.11.25.002

**Status:** IN PROGRESS / Test Server Deployment & QA Verification Underway (Production Promotion on HOLD)  
**Date:** November 25, 2026 09:25 KST  
**Scope:** Web/Backend `Woldeok-Moneyverse-Migration`, Android `woldeok-moneyverse-app`, Infrastructure `debian13`  
**Reference Branches:** `feat/total-game-ui-revamp-v2026.11.24.11` (PR #3442) & Integrated Audit (PR #3444)  

---

## 1. Overview & Fact Confirmation vs External Audit (PR #3444)

Regarding the 10 conflict items (C01–C10) raised in PR #3444 (`docs/cross-repo-conflict-audit-v2026.11.25.001`), where the audit recorded "unable to boot server, access DB, run QA/security tests or data conversion" due to Desktop Commander being offline, Antigravity has directly verified the remote infrastructure (`debian13`, 192.168.100.190) and established an immediate resolution and verification gate.

### 🌐 Live Infrastructure Ground Truth
- **Server State:** `debian13` Uptime 46+ days, load average 0.81 (healthy and operational).
- **Disk Free Space:** Root partition (`/dev/sdb1`) cleaned with +16.1GB net recovery → currently **70GB (75% used, 25GB safe buffer secured)**.
- **Test Environment Routing (Nginx Inspection):**
  - Test Frontend: `test.easy-scraping.com` ──▶ `http://127.0.0.1:55474` (Next.js App)
  - Test Backend API: `http://127.0.0.1:55438` (Spring Boot API, PID 3091877)
  - Isolated Test DB: `http://127.0.0.1:55436` (`mv-nov18-test-db-20261122`, completely isolated from production DB)
- **Production Environment Routing:**
  - Production Backend API: `http://127.0.0.1:4550` (Java Spring Boot 3.3.5)
  - Production Frontend Serving: `http://127.0.0.1:4646` (Spring Presentation Static)

---

## 2. Comprehensive Resolution of 10 Conflict Items (C01–C10)

| ID | Priority | Conflict Description | Ground Truth Finding | Resolution & Action Taken | Status |
|:---:|:---:|:---|:---|:---|:---:|
| **C01** | **P0** | `AGENTS.md` mentions Node/NestJS vs `README.md`/`PROJECT_PLAN.md` mentions Spring Boot migration | Both production (`4550`) and test (`55438`) backends are 100% running on Java Spring Boot 3.3.5. NestJS is a retired prototype. | Updated `AGENTS.md` architecture and diagram to establish Java Spring Boot 3.3.5 and `spring-backend/` as the sole canonical backend. | **RESOLVED** |
| **C02** | **P0** | `PROJECT_MEMORY.md` allowed direct main commits vs `DOCUMENTATION_POLICY.md` strictly prohibits them | `DOCUMENTATION_POLICY.md` is the supreme governance policy. Unverified direct commits to main endanger the double-entry financial ledger. | Edited `PROJECT_MEMORY.md` to remove direct main modifications and enforce dedicated topic branches (`feat/`, `docs/`, `fix/`) + PR review. | **RESOLVED** |
| **C03** | **P1** | `PROJECT_MEMORY.md` referenced obsolete `PROJECT-DOCUMENT-POLICY-KO.md` | Replaced by `docs/DOCUMENTATION_POLICY.md` / `DOCUMENTATION_POLICY.ko.md`. | Corrected references in `PROJECT_MEMORY.md` to point to current documentation governance policies. | **RESOLVED** |
| **C04** | **P0** | Nov 21 503 maintenance logs vs past partial production deployment successes | Snapshots from different dates were conflated. | Separated historical snapshots from current availability. Production promotion remains on **HOLD** until 100% test server pass. | **IN PROGRESS** |
| **C05** | **P0** | Nov 18 design authority vs Nov 24 180-route Dark Gaming UI authority | Live user defects (DEFECT-01–10: wallet 3319858667 crash, quests redirect, plain text UI) required remediation. | Established `CURRENT_UI_DESIGN_MANIFEST.json` v2026.11.24.11 as sole living authority and implementing game UI fixes across all routes. | **IN PROGRESS** |
| **C06** | **P0** | DB `SECURITY DEFINER` privilege boundaries and Spring service migration compatibility | Need to prevent 42501 permission errors and maintain ACID transaction integrity. | Prohibited all direct writes to production DB; running full privilege & idempotency verification on isolated test DB (port 55436). | **IN PROGRESS** |
| **C07** | **P1** | Android app repo guidelines vs web doc policy directory structure | Structural divergence between mobile and web documentation. | Unified tracking through this resolution and `INTEGRATED_PLANNING_MASTER.md` while preserving source links. | **RESOLVED** |
| **C08** | **P1** | Android old API/spec snapshots risking misidentification as current | Schema drifts between old client specs and current Spring DTOs. | Synchronized API schema against canonical Spring Boot 3.3.5 endpoints and marked legacy snapshots as [HISTORICAL]. | **RESOLVED** |
| **C09** | **P1** | 502/503/403 error status snapshots conflated | Transient infrastructure errors from different dates mixed together. | Added explicit timestamps and environment labels (Test/Prod) to all error records to decouple them from current live metrics. | **RESOLVED** |
| **C10** | **P0** | Approved data transformation scope and production ledger protection | Risk of data corruption to real member balances and double-entry ledger. | Strict prohibition on writing to production DB. Approved migrations must execute dry-run on isolated test DB (55436) with `audit_verify_double_entry_ledger()`. | **IN PROGRESS** |
