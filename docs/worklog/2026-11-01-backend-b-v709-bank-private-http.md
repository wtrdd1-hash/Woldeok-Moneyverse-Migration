# Backend B v709 — private banking HTTP responses (Draft / RELEASE HOLD)

- Base: `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9` (verified at start and midpoint).
- Branch: `auto/hourly-b-v709-bank-private-http-20261101-0635` (isolated worktree).
- Priority: P1. Existing `BankController` decorated only some successful GET handlers with cache controls; `PocketController` had no response-level privacy policy. Nest guards may reject requests before handler metadata is applied.
- Change: `BankModule` now installs scoped Express response middleware for `BankController` and `PocketController` before session/consent/CSRF guards. Sets `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, and `Referrer-Policy: no-referrer` on banking reads, write receipts, and denied requests. Public/nonbanking routes are not modified.
- API contract: request and response payloads, status codes, routes, auth and CSRF behavior unchanged. HTTP response privacy headers become stricter. No database schema, SQL migration, permission, balance, ledger, idempotency, or financial transaction changes.
- TDD: before fix 6/7 HTTP assertions failed (missing headers); after fix 8/8 passed (bank standing/snapshot, pocket list, 401, 403, HEAD, unrelated public route). MiniPC MCP cgroup saturated; CPU affinity 0 and one Vitest worker avoided thread creation failures.
- Focused bank suite: 53 PASS, 18 SKIP (DB-backed tests without configured disposable PostgreSQL).
- Changed-file ESLint, workspace typecheck, backend build: PASS. Full ESLint: 0 errors, 1022 existing warnings. Full workspace build: PASS.
- Pending in this record: full backend/frontend tests, isolated real PostgreSQL, remote CI and official Test exact-SHA. They must be reported separately with exit codes; no inference from focused tests.
- Release: **HOLD** until required CI, exact-SHA official Test auth/core flows, GitOps approval, independent restore, and Production smoke gates pass. Do not merge or deploy on this local evidence alone.
- Collaboration: inspected open PRs including QA #2271, B #2266 and A #2265; no overlap with their files; preserved other worktrees, automation schedules and shared services.
