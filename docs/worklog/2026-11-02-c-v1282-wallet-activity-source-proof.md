# C v1282 — Owner wallet activity source validation

## BEFORE WORK — 2026-11-02 03:48 KST
- miniPC Debian 13 service health: seven active; development PostgreSQL connected.
- Baseline `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Reviewed `AGENTS.md`, README/English+Korean guides, canonical English/Korean planning, open PRs/CI and A/B/QA worktrees. Root checkout has a separate pre-existing modification to `implementation_plan.md`; this task uses a new isolated worktree.
- Gap: `/wallet/activity` validates calendar-filtered responses but renders arbitrary non-calendar HTTP 200 payloads as owner ledger activity. `transactions.length`, `map` and `formatMoment` can fail on malformed data. Forged or mismatched directions and pocket values can be presented as confirmed records. Existing NestJS GET `/api/v1/wallet/activity` is session-bound and uses owner-scoped repository with `private, no-store` and `noindex`; reuse that contract, no DB schema or ledger writes.
- No overlap found with active A/B/C/QA PRs; do not touch their branches.

## IN PROGRESS
- [x] Write RED tests for malformed non-calendar owner activity pages (03:50 KST: 6 UI failures and missing pure validator; 2923 other frontend tests passed).
- [x] Validate bounded page, cursor, ISO timestamps, unique UUIDs, directions and exact signed WLD amounts before rendering. Focused GREEN 24/24, Backend owner HTTP contract 4/4, focused ESLint and full typecheck PASS (03:54 KST).
- [x] Preserve legitimate owner activity and independently verified page-only summaries; malformed responses show retry and unknown rather than false-empty.
- [x] Verify focused, full and isolated gates; record failures without waiver. Final exact-HEAD rerun follows final documentation commit.
- [x] Refreshed origin/main at 03:55 and 03:59 KST: unchanged `510dbe6b`; canonical English/Korean plans unchanged at v1518. Published Draft PR #2418; preserve evidence and HOLD until all gates PASS.

## FINISHED — 2026-11-02 04:05 KST (DRAFT/HOLD)
- Feature implemented: all/all-7d-30d owner ledger reads are now runtime-validated before render; bounded pagination/cursor, UTC timestamps, UUID uniqueness, exact signed WLD pockets and direction are checked. Unknown source shows a retry button and screen-reader status instead of a fabricated empty/confirmed ledger. Existing NestJS owner-scoped GET and SQL read remain the authority; no DB or financial writes.
- TDD: RED reproduced 6 non-calendar UI failures plus missing validator, then GREEN focused 24/24. Full frontend 2946 PASS; full ESLint 0 errors / 1027 warnings; full typecheck PASS; full frontend+backend builds PASS; Backend 2978 PASS / 2 FAIL / 518 SKIP (existing `profile-private-response.http.test.ts` expects 200, receives 401, outside this branch and owned by other QA/C work). Backend wallet HTTP contract 4/4 PASS. Database package 62 PASS / 5 SKIP; app-api contract 184 endpoints PASS; security scripts 19 PASS.
- Disposable PostgreSQL 17.11: isolated network-disabled container; all 322/322 migrations applied. `moneyverse_app` ledger SELECT true, ledger INSERT false, owner read query executed with 0 synthetic rows. Container removed; not proof of authenticated end-to-end financial flow.
- Security: production HIGH+ audit PASS; full audit FAIL (1 low + 8 moderate). Full-route QA FAIL (missing `artifacts/qa/full-route-ledger.json`). No waiver or fake evidence.
- Direct isolated Next HTTP probe (without `INTERNAL_API_TOKEN`) returned HTTP 200 error boundary, `X-Robots-Tag: index, follow` and `Referrer-Policy: strict-origin-when-cross-origin`; not an authenticated flow proof. Sent evidence to existing header owner PR #2225, no overlapping middleware changes.
- Official exact-SHA Test identity preflight (authorized sudo, read-only) BLOCKED: Test backend/frontend still `510dbe6b...`, not this candidate. No authenticated browser E2E, mobile viewport measurement, session continuity, complete CI or independently restored release evidence. PR #2418 remains DRAFT/HOLD.
- Midpoint main unchanged; re-fetch before any possible merge. Merged SHA: NONE. Official Test deployment: NONE. Production deployment/GitOps: NONE. Rollback: NOT NEEDED. No other branch/worktree/PR deletion; preserve unique unmerged changes and core five schedules.
- Verification repair: an added accessibility test introduced six `no-useless-escape` lint errors on the first final-SHA sweep (04:06 KST); corrected the test string literals, confirmed focused ESLint PASS, and will rerun all gates on the new SHA.
- Full gates must be rerun on final committed HEAD; report exact SHA and gate outcomes in PR comment and external task record.
