# v2026.11.14.2208 — Production Admin API-Origin Compatibility Incident

## Before work — 2026-11-14 18:06 KST
- Owner-supplied `/admin` screenshot contains Next.js digest `237831372`. Production frontend journald at 18:05:52 KST confirms `ApiError: API responded 404` under `/admin/page.js`, with the exact digest.
- Accessed authorized mini-PC MCP first. Captured active `moneyverse-release-v1546-*` services, Java Spring port 4550, NestJS port 4500, Next.js port 4501, and Nginx wiring. Legacy `moneyverse-backend` is inactive, but the actual release backend is active.
- Inspected AGENTS.md, DOCS_INDEX.md, current-documentation status, integrated planning authority, release procedures and backend/frontend source. Existing shared development worktree `feat/spring-all-domains-expansion` has a modified `spring-backend/gradlew`; do not touch it.
- `origin/main` baseline: 6a37d5688b5dc8591686b24793465e46f106dcc0; deployed code symlink is `prod-v2026.11.14.1217-43ab5a5110`. Isolate this incident on `fix/admin-spring-api-compat-v2208-20261114`.
- Runtime frontend environment mistakenly sets `API_ORIGIN=http://127.0.0.1:4550`. Spring 4550 returns 404 for `/api/v1/auth/session`, `/api/v1/admin/security`, `/api/v1/auth/policy`, `/api/v1/admin/controls`, `/api/v1/stocks`. Nest 4500 returns the expected authenticated 401 or successful 200 for the same endpoints with the frontend internal token.
- Safety boundaries: do not weaken admin authentication, do not modify user money/ledger/SQL, do not edit immutable release contents or another agent's worktree, and do not expose tokens/cookies in logs.

## In progress
- [ ] Add an API compatibility regression gate for frontend-to-backend release wiring and prove RED (Spring 4550) / GREEN (Nest 4500).
- [ ] Test a separate canary frontend using the existing immutable artifacts and corrected API origin; prove `/admin` anonymous redirects to login and no Next digest; ensure bank, chat, stocks read paths are not regressed.
- [ ] Recheck latest `origin/main`, compare official Test backend/frontend authentication and release identity, then use a zero-downtime cutover only if required Test gates and session-continuity checks are confirmed.
- [ ] Record midpoint / final evidence, English internal + GitHub reports, and Korean second-language documents. Publish the isolated task branch and PR without disturbing concurrent Spring work.

## Finished
- PENDING: no production changes or successful test/deployment claims at this checkpoint.

## Midpoint — 2026-11-14 18:17–18:20 KST
- Independently reran API-origin contract probes. RED Spring `:4550`: HTTP 404 for public auth policy (guard exit 1). GREEN Production Nest `:4500`: 200 policy, 401 anonymous auth session, 401 anonymous admin security, 200 public stock list (guard exit 0). Official Test Nest `:3100` using its own frontend internal token also passes all four probes (exit 0).
- Started a separate read-only-probed frontend canary `:4511` from the immutable existing Production frontend build, with only `API_ORIGIN=:4500` changed. Previously deployed `:4501` still yielded digest `237831372` in `/admin` and error responses on bank/chat. Canary returned `/admin` without that digest and redirected unauthenticated bank/chat to sign-in, preserving access control; basic stocks/login GET returned 200.
- Prepared the persistent standalone service `moneyverse-admin-api-restore-v2208-frontend.service` at `:4511`, referencing the existing identical immutable build, with final override file `/etc/moneyverse/prod-v2208-admin-api-restore.env`. HTTP smoke remains good. The previous Production `:4501` process remains alive for immediate rollback.
- Nginx config backed up to `/etc/nginx/backups/moneyverse.before-admin-api-origin-20261114-1818-v2208`; public edge is NOT switched yet at this checkpoint.
- Scope: this is an emergency API-origin configuration rollback with no application code rebuild, schema migration, balance write, session revocation, auth bypass, or Spring service restart. Do not claim authorized admin end-to-end QA or exact-SHA release/Test certification from anonymous probes alone.
