# Development A — Owner session scope (2026-10-31 04:25 KST)

## BEFORE
- Connected to Debian 13.6 miniPC; backend/frontend/nginx/Docker active, development PostgreSQL connected. Main `761a55a094fb9dd383d213e817305e68c79fa23c` after admin PR #2045 merge. Canonical checkout has an unrelated untracked frontend/.build_id; isolated worktree only.
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN, QA v1404 inventory, A/B/C PRs and CI, planning Draft v1536 #2089. Avoid B pocket/ledger and C inventory; account session read scope is independent.
- Start 38 remote branches, 34 open PRs. Preserve all unique unmerged commits. No applied migration edit, no production writes or service restarts.
- Feature: authenticated owner may view **other active devices only** without seeing current device in that filtered list; default all-session view stays unchanged. Android app-api rejects duplicate scope and mismatched/forged success responses. Current session is never revoked by a filter.

## IN PROGRESS
- [x] TDD RED on API/owner SQL result mapping, web parser/UI, Android app-api.
- [x] Implement minimal backend+Next+Android gateway and verify GREEN.
- [x] Verify actual PostgreSQL function and owner boundary; full local gates PASS, exact-SHA Test E2E remains BLOCKED.

## FINISHED (04:38 KST; RELEASE HOLD)
- Candidate code SHA `5dd606145fa9e2a6015d035b12a63b1633f40d5d`; Draft PR #2090. Latest main rechecked `761a55a094fb9dd383d213e817305e68c79fa23c`, no overlap with planning v1536 or B/C.
- Final clean local frontend build PASS (initial 140s build timed out under concurrent resource pressure); backend build/typecheck PASS; full lint 0 errors / 1,049 warnings. Full backend **2,781 PASS / 501 SKIP**; full frontend **2,779 PASS**. Mobile API contract 184 endpoints PASS; security 11 PASS; DB unit 62 PASS / 4 SKIP; accessibility/SEO 11 PASS; production dependency audit zero known vulnerabilities.
- Real isolated PostgreSQL 17.11: original `account_active_sessions` source-function 7 owner/ACL assertions PASS; fresh **311/311** migrations applied. This is not authenticated official Test E2E. Scratch containers removed; no production DB accessed or modified.
- Independent read-only DEV role ACL shows 253 public tables, 237 SELECT / 211 INSERT / 211 UPDATE / 211 DELETE effective `moneyverse_app` privileges (role not superuser); clean-schema migration fixture has 247 tables, 11 UPDATE and 7 DELETE grants. Reported P0 DEV drift in issue #993; Production role not verified.
- Authorized Test identity preflight FAIL: Test `c2129625...` instead of candidate, public Treasury HTTP 200 instead of fail-closed 503. Production identity preflight BLOCKED due inactive/missing `moneyverse-release-v1935-backend.service` environment. Reported in P0 issue #1984. Exact candidate Test authenticated E2E, independent backup restore, financial reconciliation and zero-downtime release gates not PASS.
- **No main merge, no Test/Production deploy, no service restart, no production DB write, no rollback and no branch deletion.** All 38 existing non-main remote branches had unique commits and were preserved. Rollback if ever released: revert optional filter code; no migration rollback.
- English/Korean QA and detailed evidence: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0425-security-session-scope/`. Full CI result must be checked against the final PR SHA; local PASS does not authorize release.


## DURING (04:26–04:28 KST)
- RED: backend 3 FAIL; frontend/Android 6 FAIL / 1 PASS. GREEN after minimal implementation: backend 3 PASS; frontend/Android 7 PASS. Reused source SQL function; no migrations or new grants.
- Rechecked main and planning v1536. Added strict `scope=all|other` validation, owner session list filtering, private noindex Android response verification and accessible web links. Revoke actions continue using unfiltered owner session proof.
- Remaining: broader regression, actual PostgreSQL fixture, build/lint/typecheck/security/SEO and exact SHA CI.
