# Backend B v555 — private conditional-response cache safety

## Before work — 2026-10-26 13:40 KST
- Base `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh remote check).
- Independent branch: `auto/hourly-b-private-etag-v555-20261026-1335`.
- Read `AGENTS.md`, `README.md`, English/Korean `PROJECT_PLAN`, open PRs, QA #1317/#1412, recent CI. QA #1412 owns frontend/security rate tiers, B #1404 owns compression, B #1392/#1368 own SSRF; no overlapping ETag changes.
- Issue: `dynamicEtag` generates validators and returns 304 for `Cache-Control: no-store` and personalized responses with credentials. A 304 without a body is unsafe as a generic response to private/no-store conditional requests. Public conditional caching must remain functional.
- Scope: Backend HTTP middleware and focused regression tests only. No API route/DTO/DB/migration/ledger changes. No Test/Production writes.
- Plan: [ ] add RED tests [ ] reproduce [ ] implement fail-safe bypass [ ] GREEN [ ] full gates [ ] CI/PR [ ] official Test exact-SHA if gates permit.
- Deployment: HOLD pending all mandatory checks.

## In progress — 2026-10-26 13:41 KST
- RED: 6/7 new isolated tests failed on baseline, demonstrating 304 for no-store/private, Cookie, Authorization and Set-Cookie. Existing public test passed.
- Real Express RED: no-store response acquired Express's implicit weak ETag even after middleware-only bypass. This confirmed the second root cause.
- GREEN: `registerDynamicEtag` disables Express's automatic validator and installs the explicit middleware; middleware skips validator generation on private/no-store, credential-bearing requests and Set-Cookie responses. Real Express integration validates public 304 and private 200.
- Focused regression: 14/14 PASS across three test files.
- Main refreshed mid-run: unchanged `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English plan rechecked. No conflicting ETag PR observed.
- [x] add RED tests [x] reproduce [x] implement fail-safe bypass [x] GREEN [ ] full gates [ ] CI/PR [ ] official Test exact-SHA if gates permit.

## Finished
- Pending.
