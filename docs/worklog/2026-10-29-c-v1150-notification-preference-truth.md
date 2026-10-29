# C v1150 — Member notification preference persistence evidence

## BEFORE WORK — 2026-10-29 09:50 KST
- Base: `2ac90063d45cfab879d4fb36863484d8a423deba` from freshly fetched `origin/main`; independent `auto/hourly-c-notification-preference-truth-v1150-20261029-0945` worktree.
- MiniPC Debian 13.6 reachable; seven services active, development database connected. Read AGENTS.md, README, README/README.ko.md, both living plans, QA v1361 and open PR/A/B/C inventory. Existing A notification inbox PR #1698 is separate; C credential PRs #1793/#1805 are separate.
- P1 evidence: member `saveGoalNotifications` currently ignores the actual `notifications_enabled` PUT receipt and never verifies persisted `GET /api/v1/engagement` state. A 2xx contradictory response could display `saved=1` although the preference did not change. Existing page also treats malformed preference evidence as OFF.
- Scope: fail-closed exact boolean mutation receipt and authoritative readback, distinguish unavailable/malformed state in UI, regression tests. Preserve existing PostgreSQL SECURITY DEFINER preference function, no migration/grants/ledger changes. Accessible responsive form and noindex retained.
- HOLD: QA v1361 reports 5 migration checksum mismatches and 20 unapplied migrations; prior QA reports 18,000 WLD projection drift, app-role grants and backup restore gaps. Official exact-SHA Test/Production release forbidden until all gates pass.

## PLAN / IN PROGRESS
- [ ] RED test malformed/contradictory mutation receipt, stale readback and unavailable UI evidence.
- [ ] GREEN implement strict receipt and readback validation, and visible failure/unknown states.
- [ ] Run focused/full tests, build, typecheck, lint, security, isolated PostgreSQL, app-api, CI and official Test when safe.
- [ ] Re-fetch main and plan, record final SHA, PR, deployment hold and preservation.

## FINISHED
Pending evidence; no merge or deployment authorized.

## IN PROGRESS — 09:51 KST
- RED reproduced: 9/10 action tests failed because HTTP success was accepted without a mutation receipt or persisted readback; 1 UI static test failed on missing unknown-state guard.
- GREEN: 12/12 focused tests passed. The PUT must return the requested boolean, and a fresh owner-scoped GET must match before revalidation or success. Invalid dashboard evidence now displays an alert rather than an invented OFF state.
- `api` uses no-store per-caller requests and the backend reads via `member_engagement_dashboard(actor)`; no DB/API contract changes required.
- Midpoint main and both planning docs re-fetched; full verification and PR pending.

## FINISHED LOCAL VERIFICATION — 2026-10-29 09:59 KST (CI/official Test pending)
- Focused Frontend **14/14 PASS** (12 behavioral mutation/readback tests, 2 UI/source contract tests). TDD initial RED 9 action failures + 1 UI failure, then GREEN. Added true/false and readback-outage regression coverage.
- Full Frontend **1,916 PASS / 4 FAIL**: the 4 existing blog publisher/admin expectations fail against main (legacy JSON publisher returned 200/ACTIVE instead of expected 503/RETIRED, admin blog initial status mismatch); no blog files changed. These are release blockers, not excused as PASS.
- Backend without database **1,955 PASS / 440 SKIP**; database package **46 PASS / 4 SKIP**; contract **38 PASS**. Root backup-evidence safety unit tests **6 PASS**.
- Full typecheck PASS; full lint PASS (0 errors / 1,095 warnings); Frontend and Backend builds PASS; mobile app-api contract **180 endpoints match**. Security advisory-floor tests PASS.
- `pnpm audit --prod --audit-level moderate` FAIL (1 Moderate); full audit FAIL (12: 3 Low / 9 Moderate). No exceptions added.
- Isolated PostgreSQL 17.11: 290 migrations applied via CI apply using a disposable private Docker container; backend engagement repository/database/HTTP tests **41 PASS**; `moneyverse_app` account_balances UPDATE denied and member_engagement_dashboard(uuid) EXECUTE allowed. First isolated attempt was blocked by absent host `psql`; corrected using a temporary docker-exec `psql` wrapper with a read-only source mount. Both isolated containers removed; no shared database or financial state touched.
- Latest main and English/Korean plans re-fetched at start/mid/end: main `2ac90063d45cfab879d4fb36863484d8a423deba` unchanged. No overlapping implementation with active A/B/C/QA/Gemini PRs; all unique branches and worktrees preserved, none deleted.
- **RELEASE HOLD**: official exact-SHA Test authenticated member flow unavailable (Test not running this candidate); no merged SHA. Financial/backup/security QA gates and the 4 baseline blog tests remain unresolved. No main merge, GitOps, Test deployment, Production promotion or rollback. Production SHA not verified.
- GitHub Draft/HOLD PR and exact-SHA CI evidence will be recorded after push; a CI build is not an official Test promotion.
