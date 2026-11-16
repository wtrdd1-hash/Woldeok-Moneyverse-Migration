# Admin system log viewer — security and runtime-readiness plan

## Unit 1 — Authorization (Spring + Next.js)
1. Add a regression test: unauthenticated request with a forged internal header is 401; unauthorized session is 403; no logs retrieved before role decision.
2. Remove unvalidated header-based privilege escalation. Require a verified signed-in admin role, preferably superadmin, on the Spring endpoint; separately require admin-console session on every Next.js server action call.
3. Verify exact failure codes and no-store semantics.

## Unit 2 — Read bounds and safe output
1. Add isolated unit tests for secrets/PII redaction, invalid source, bounded filters, missing/unreadable logs and zero lines.
2. Restrict to allowlisted file/service sources; no shell interpolation; cap per-line bytes, output size, time and count.
3. Distinguish `UNAVAILABLE`/`ERROR` from `EMPTY` in API and UI and never claim that an empty error log certifies system health.

## Unit 3 — Real-runtime traceability
1. Verify the effective frontend journald unit against active Nginx upstreams; resolve any discrepancy explicitly.
2. Run focused Gradle/Vitest, typecheck, lint/build if feasible; collect actual HTTP negative and positive evidence on isolated Test.
3. Re-fetch main, reconcile concurrent work, publish internal/GitHub update notes and a PR. Production requires exact-SHA Test plus independent release gates, not a blind restart.
