# v2026.11.17.1 — Administrator Full-Surface Live QA (English canonical)
## Before work (2026-11-17 KST)
- Scope: read-only, real edge/browser-path and API requests for every currently mapped administrator page and its control-plane interfaces, negative authorization, Spring/Nest/Next parity, API error handling, finance/admin risk inventory.
- Authority: latest origin/main 86777fb2d5; docs/planning/PROJECT_PLAN.md, docs/planning/INTEGRATED_PLANNING_MASTER.md, AGENTS.md, docs/CURRENT_DOCUMENTATION_STATUS.md. Product plan and actual deployed code must both be checked.
- Isolation: separate qa/admin-full-live-20261117-v2026.11.17.1 branch and isolated worktree; do not alter concurrent Gemini/developer worktrees.
- Safety: no real balance changes, minting, transfers, data deletion, OTP brute-force, account lockouts, production restarts, release promotion or leaked credentials. Safe unauthenticated requests and read-only authenticated checks only when existing approved test session exists.
- TODO: [ ] map active edge/upstream and runtime SHA [ ] inventory all admin routes/API [ ] probe each page and safe API [ ] test security headers/auth [ ] review logs/smoke results [ ] write findings/limitations and EN+KO result [ ] recheck main and push record.
- Deployment: NONE. A QA report cannot establish deployment or production-readiness.
## In progress
- Pending; record each execution checkpoint with redacted evidence.
## Finished
- Pending.

### Midpoint 1 — live HTTP observations (2026-11-17 KST)
- Anonymous, no Cookie, real public edge: 38 current static admin page paths probed: 37 HTTP 200, one /admin/logs/system HTTP 404; 200 indicates transport rendering only, NOT authorized functional pass. Multiple admin pages expose X-Robots-Tag: index, follow, whereas blog admin page is noindex,nofollow.
- Anonymous read-only GET inventory of 92 mapped frontend/backend admin API paths: HTTP 200:24, 401:4, 403:1, 404:58, 503:5. Some 404 represent legacy/unimplemented Spring route drift: assess by contract before classifying.
- Critical security/finance investigation: public anonymous GET /api/v1/admin/security reports open consoleSession and admin/superadmin roles; direct Spring :4550 and Nest :4500 both reject with 401. Public /api/v1/admin/me reports roles while both direct origins reject. Frontend :4501 with HTTPS-aware headers also provides the open-console response.
- Public anonymous Spring GET /api/v1/admin/treasury/overview, revenue, expenditure, transactions, kdic/ledger-integrity, fx/status return 200 while Nest :4500 rejects with 401. Returned money provenance is NOT CERTIFIED.
- Current live admin mint status and orders endpoints return 503; test-main-backend inactive, Test treasury API 502, Test mint status 503 and SWF BFF 500. Do not perform money mutations on Production or assume Test isolated before proving connections.
- On-host evidence under /tmp/mv_adminqa_20261117/{pages,apis}.json contains response status, headers, key names and hashes but not response bodies.
- NEXT: inspect Next app-api rewrite and finance fallback; add actual safe Test SQL/HTTP checks; finalize precise report.

### Midpoint 2 — financial evidence and comprehensive tests
- One real production-linked PostgreSQL READ ONLY snapshot: 943 tx, 1950 postings, 43 accounts, 52 linked Treasury rows, 0 unbalanced, 0 stored/journal balance mismatch.
- Source review found Spring SecurityConfig permitAll/CSRF disable, Spring KDIC hardcoded normal ledger metrics (14250/42/42), KDIC fake payout/liquidity success, SWF false SUCCESS on DB error, Treasury fabricated empty history.
- Nested source test results: full Nest admin 655 PASS/112 SKIP; Next 968 PASS; Spring Gradle 9 suites/22 PASS. Focused initial 144 Nest are a subset of 655.
- Full English/Korean findings and GitHub/internal update records generated.

## Finished — 2026-11-17 KST
- Safe public live HTML/API probes, direct backend comparison, actual canonical PostgreSQL read-only reconciliation and tested code review complete.
- Blocked: signed-in browser UI/OTP and financial write E2E, disabled Test backend, independent restore, exact artifact Test, production acceptance.
- Result: P0 FAIL / RELEASE HOLD. Production and Test untouched; no WLD write, no main merge, no production promotion.
- Evidence: docs/findings/2026-11-17-admin-finance-live-qa-v2026.11.17.1.md and .ko.md, docs/updates/v2026.11.17.1-admin-finance-qa-*.
