# Backend B v614 — Bond subscription ledger safety

## Before work — 2026-10-28 19:35 KST
- Baseline main: 35971c600f25869c96f1c666d4b9f58927202730; branch: auto/hourly-b-bond-subscribe-ledger-hold-v614-20261028-1935.
- Read AGENTS, README, English/Korean living plans, QA v1347, open PRs and CI. No duplicate open bond subscription PR found.
- Source-backed P0: direct member balance UPDATE and vault UPDATE, no balanced ledger receipt; API lacks CSRF and uses Number() on units.
- No production, shared database, finance ledger or other worktree writes authorized.

## In progress
- RED tests pending. Only this branch and its independent worktree may change.

## Finished
- Pending verification and CI. HOLD until exact-SHA official Test and release gates.

## In progress — 2026-10-28 19:38 KST
- Re-fetched main 35971c600f25869c96f1c666d4b9f58927202730 and re-read both living plans; no main drift.
- RED 8/13 tests failed, proving the existing POST returned HTTP 201 and service/repository still accepted unsafe subscription.
- GREEN 14/14 focused HTTP/service/repository tests pass. New POST now returns 503 without calling service; service and repository independently fail closed before SQL or Discord. Consent/CSRF guards checked; read-only holdings preserved.
- Removed unsafe direct-debit subscription implementation; no database migrations or WLD changes.
- Full test, lint/typecheck/build/security and official Test gates still pending.

## Finished — 2026-10-28 19:50 KST
- Main checked before, during and after: 35971c600f25869c96f1c666d4b9f58927202730 (unchanged). Independent worktree and branch only.
- Tracking issue #1735; Draft/hold PR #1736. No main merge, Test deployment, Production deployment or branch cleanup.
- Code: POST /api/v1/bonds/subscribe returns 503 with CSRF/consent/auth guards; service/repository independently fail closed; no SQL calls, ledger writes or Discord success notifications. Existing read-only bond holdings and market routes remain.
- RED 8 failing / 5 passing; GREEN 14/14 focused tests. Root pnpm test PASS: frontend 1,871/1,871, backend 1,941 PASS / 440 SKIP, database 46 PASS / 4 SKIP, contract 38 PASS, policy scripts PASS. Lint PASS 0 errors / 1,099 warnings. Typecheck PASS. Backend build PASS. API contract 180 endpoints PASS. Bot tests 11 PASS and audit 0 vulnerabilities. Security advisory policy 9 PASS.
- Full Next.js build FAIL: first 1GiB Node heap OOM; second 2GiB retry failed next/font Google loader TypeError. The shared host was under memory pressure; no frontend source change was made. Production dependency audit FAIL: qs Moderate GHSA-6pq8-jhm2-2vcw.
- Isolated real PostgreSQL and authenticated official Test exact-SHA were not completed. No SQL migration; no shared/live DB reads or writes during this change. QA v1347 still reports 18,000 WLD ledger drift, 235 app DML tables, 3 PUBLIC bank EXECUTE, 5 migration checksum mismatches, 20 unapplied migrations, stale official Test and unknown Production version.
- GitOps release gates FAIL/BLOCKED. Permanent ledger-atomic subscription, immutable receipt, DB ACL and frontend/Android unavailable UX require separate A/C coordination. Other bond mutation routes require independent review.
- Release decision: DRAFT + HOLD, Production prohibited. Other agents' branches, recovery refs, timers and reservations untouched.
