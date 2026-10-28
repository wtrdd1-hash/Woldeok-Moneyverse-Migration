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
