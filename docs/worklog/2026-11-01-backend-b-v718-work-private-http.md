# Backend B v718 — Member Work API pre-guard HTTP privacy

## Before work — 2026-11-01 11:32 KST
- Base `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9`; isolated `auto/hourly-b-v718-work-private-http-20261101-1135` worktree.
- Reviewed AGENTS.md, README, English/Korean project plans, QA v1435 and concurrent A/C/B/QA Draft PRs. Existing B v717 covers stocks; no overlapping Work API privacy branch identified.
- P1 source gap: `WorkController` is member-only, exposes WLD receipts, assignments and job profile, but `WorkModule` has no pre-guard response privacy middleware. Receipt decorator does not protect 401/403. Next app-api already enforces Work private headers.
- Scope: controller-scoped Nest middleware for all Work routes, success/error/HEAD; preserve public routes, authentication/consent/CSRF, DTO, SQL, balances and ledger.
- Risk: miniPC `moneyverse-mcp` cgroup near TasksMax 1027; run bounded single-process checks. Release HOLD until all exact-SHA gates PASS.

## In progress
- [x] RED real HTTP regression — 10 fail / 1 public control pass
- [x] GREEN code and focused tests — 12/12 pass with CPU affinity 0
- [x] Full checks / isolated PostgreSQL — completed with explicit failed gates below
- [x] Fresh main and planning sync — unchanged f13bbce273ffc65e8576170992d82ea00c27a1c9
- [x] Draft PR #2305 / CI failed / release HOLD

## Finished — 2026-11-01 11:55 KST
- **Code:** `WorkModule` attaches controller-scoped pre-guard private/no-store, noindex, no-referrer headers for all Work GET/POST/HEAD, including rejected 401/403, blocked 503 and successful 200/201. Unrelated public route unaffected. API route/payload, auth/consent/CSRF, SQL, applied migration, audit/ledger/WLD and grants unchanged.
- **TDD:** before fix 10 HTTP header failures / 1 public control PASS; after fix 12/12 real Nest HTTP PASS. Work suite 140 PASS / 23 SKIP, backend full 2,962 PASS / 517 SKIP (local CPU-pinned threads). Frontend Work/app-api 9 PASS. Frontend known admin console fixture: 35 PASS / 2 FAIL (#2292, QA v1435 already has separate Draft repair); full local Frontend test run failed under cgroup saturation/worker termination, so not green.
- **Static/build/contract:** full Lint PASS (0 errors / 1,022 pre-existing warnings), full Typecheck PASS, full Backend/Frontend Build PASS, Contract 41 PASS, DB package 62 PASS / 4 SKIP, app-api 184 endpoints PASS, security/release 22 PASS, QA ledger verifier unit tests 7 PASS.
- **Real PostgreSQL:** one-shot isolated `postgres:17.11`, network none, no exposed port, fresh 316/316 migrations PASS; `moneyverse_app` direct `account_balances.UPDATE`, `ledger_transactions.DELETE`, `users.SELECT` all denied. Container auto-removed. This is migration/ACL evidence, not an authenticated real-DB Work E2E.
- **Dependency audit:** production-only 0 known vulnerabilities (PASS); full dependency audit FAIL 9 (8 moderate, 1 low).
- **GitHub CI:** PR #2305 code SHA `c94cdcac310a87bd9979c5c8eec3bac52aa3350f` run 41265821646: classify/policy PASS; runtime-check FAIL. CI real PostgreSQL backend 3,584 PASS / 116 SKIP; CI Frontend 2,899 PASS / 2 FAIL in expired admin console fixtures, unrelated to this Work-only change.
- **Test gate:** official Test exact-SHA FAIL `backend_version_unverified`, `frontend_version_unverified`; authenticated Test owner/admin E2E and independent restore NOT RUN. Host release identity verifier remains previously blocked. No Production promotion authority.
- **Resource limitation:** miniPC `moneyverse-mcp` cgroup repeatedly approached TasksMax=1027. One unpinned SWC run failed thread spawn, a Work suite fork retry failed EPIPE, and full local Frontend threads run terminated. No other worker processes were killed; one own orphaned contract-check command was terminated safely, then the check reran PASS.
- **Release decision:** Draft/HOLD PR #2305 only. No main merge, Test deployment, Production deployment, shared DB or financial mutation, other-worker branch cleanup, or automation change. Existing A/C/QA/planning reservations remain enabled.
