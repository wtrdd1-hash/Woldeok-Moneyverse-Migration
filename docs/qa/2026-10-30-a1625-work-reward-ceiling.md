# A 2026-10-30 16:25 — Member work preview-reward ceiling QA

**Verdict: TARGETED PASS / ISOLATED POSTGRESQL PASS / FULL TEST FAIL / EXACT-SHA CI FAIL / RELEASE HOLD.**

## Source and implementation
- Main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; independent `auto/hourly-a-20261030-1625-work-reward-ceiling` worktree; Draft PR #2016. Existing A/B/C/Gemini branches, PRs, worktrees, DBs and release processes untouched.
- P1 member work task preview-WLD maximum reward filter (`maxReward`), validated as canonical 0..18-digit non-negative integer string. Supports simultaneous existing `minReward` and `maxDurationSeconds`; rejects duplicate/array/invalid/contradictory inputs as HTTP 400.
- PostgreSQL predicate uses bound `::numeric` values over `public.work_task_board($1)` actor-scoped `SECURITY DEFINER` function. No direct work catalogue table read, migration, grant, idempotency mutation or WLD/ledger write. Existing read-only feature switch behavior unchanged.
- Web `/work` has a labelled accessible GET preset selector, clear/reset state, server-side filtered fetch, retained unfiltered duration metadata for existing assignments and noindex metadata. Android `/app-api/v1/work/tasks` forwards exact query bytes and enforces private no-store/noindex on successes and errors.

## Executed evidence
- RED before implementation: backend 15 FAIL; frontend 14 FAIL. GREEN backend reward ceiling 15 PASS, related backend work regressions 43 PASS, frontend filter 27 PASS, Android + work UI regressions 81 PASS (with `NODE_ENV=test`).
- Fresh disposable PostgreSQL 17.11-alpine: all **305 numbered SQL migrations** replayed successfully with `ci-apply.mjs`; **1 real DB test PASS**. Tested actor-scoped reward preview numeric ceiling, zero, combined floor/duration, and `moneyverse_app` denial of direct `work_task_catalog` SELECT. Synthetic user transaction rolled back. Only dedicated test container removed; no persistent database changes.
- Typecheck PASS; full ESLint 0 errors / 1,043 warnings; exact local backend/frontend build PASS; mobile app API contract 183 endpoints PASS; database unit 56 PASS / 4 SKIP; production dependency audit 0 known vulnerabilities (320 production dependencies). Accessible label/selector test and app-api privacy/SEO tests PASS.
- Full backend: **2,578 PASS / 119 FAIL / 496 SKIP**. Full frontend: **2,625 PASS / 53 FAIL**. Failure-name sets match preceding A 15:57 run (119/53, 0 new failures); these are nevertheless mandatory red gates, not waivers. `NODE_ENV=production` initially made React DOM tests fail due `React.act` unavailability; rerunning with `NODE_ENV=test` proved 81 related frontend tests PASS. Formatting-only edits to existing large files were discarded to protect diff scope.
- Candidate CI for checkpoint `1681ca2c2b42857e87e42b213386ffc5615312eb`: release-input/classify/policy PASS, runtime-check FAIL, build SKIPPED. Final exact-SHA CI evidence must be attached to PR after final push; no passing full CI claimed.

## Environment and release safety
- 2026-10-30 16:42 KST public Test backend `c2129625aa6629c616fb31ce790950618b8d92b2` (not candidate), Treasury overview **HTTP 200 with unverified synthetic values**, a P0 fail-closed breach. Production backend `94d38f47603e99aabc42fc8f292b89441afb9663`, Treasury overview HTTP 503 `UNVERIFIED`. No exact-SHA Test auth E2E, GitOps release eligibility, backup restore or authenticated end-to-end user-flow certification.
- **No main merge, official Test/Production deployment, production DB change, service restart or rollback.** Leave PR draft. No branch deletion: all 21 non-main remote branches had unique unmerged commits at audit; all 21 open PRs preserved. Start: 21 branches/20 PRs; end audit: 22 branches/21 PRs (including this task).
- Detailed logs: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-1625-work-reward-ceiling/`.
