# v2026.11.14.2208 — Production Admin API-Origin Compatibility Incident

## Before work — 2026-11-14 18:06 KST
- Owner-supplied `/admin` screenshot contains Next.js digest `237831372`. Production frontend journald at 18:05:52 KST confirms `ApiError: API responded 404` under `/admin/page.js`, with the exact digest.
- Accessed authorized mini-PC MCP first. Captured active `moneyverse-release-v1546-*` services, Java Spring port 4550, NestJS port 4500, Next.js port 4501, and Nginx wiring. Legacy `moneyverse-backend` is inactive, but the actual release backend is active.
- Inspected AGENTS.md, DOCS_INDEX.md, current-documentation status, integrated planning authority, release procedures and backend/frontend source. Existing shared development worktree `feat/spring-all-domains-expansion` has a modified `spring-backend/gradlew`; do not touch it.
- `origin/main` baseline: 6a37d5688b5dc8591686b24793465e46f106dcc0; deployed code symlink is `prod-v2026.11.14.1217-43ab5a5110`. Isolate this incident on `fix/admin-spring-api-compat-v2208-20261114`.
- Runtime frontend environment mistakenly sets `API_ORIGIN=http://127.0.0.1:4550`. Spring 4550 returns 404 for `/api/v1/auth/session`, `/api/v1/admin/security`, `/api/v1/auth/policy`, `/api/v1/admin/controls`, `/api/v1/stocks`. Nest 4500 returns the expected authenticated 401 or successful 200 for the same endpoints with the frontend internal token.
- Safety boundaries: do not weaken admin authentication, do not modify user money/ledger/SQL, do not edit immutable release contents or another agent's worktree, and do not expose tokens/cookies in logs.

## In progress
- [x] Added a strict loopback-scoped API compatibility gate. Spring 4550 failed while Production Nest 4500 and official Test Nest 3100 passed the four legacy-route checks.
- [x] Reproduced old production digest in isolated production origin and its absence in warm standby frontend 4511; bank/chat/stock/login were probed without an authenticated session.
- [x] Rechecked `origin/main`; preserved another developer's active Spring worktree and the immutable release artifacts. Emergency runtime configuration rollback proceeded under a continuously active standby rather than an untested new source deployment.
- [x] Recorded midpoint, completion, English canonical and Korean secondary update/release documents on a separate task branch.
- [ ] Authenticated administrator browser E2E, OTP and sensitive financial command checks; full same-SHA official Test deployment and release-gate certification remain pending.

## Midpoint — 2026-11-14 18:13–18:15 KST
- Independently reran API-origin contract probes. RED Spring `:4550`: HTTP 404 for public auth policy (guard exit 1). GREEN Production Nest `:4500`: 200 policy, 401 anonymous auth session, 401 anonymous admin security, 200 public stock list (guard exit 0). Official Test Nest `:3100` using its own frontend internal token also passes all four probes (exit 0).
- Started a separate read-only-probed frontend canary `:4511` from the immutable existing Production frontend build, with only `API_ORIGIN=:4500` changed. Previously deployed `:4501` still yielded digest `237831372` in `/admin` and error responses on bank/chat. Canary returned `/admin` without that digest and redirected unauthenticated bank/chat to sign-in, preserving access control; basic stocks/login GET returned 200.
- Prepared the persistent standalone service `moneyverse-admin-api-restore-v2208-frontend.service` at `:4511`, referencing the existing identical immutable build, with final override file `/etc/moneyverse/prod-v2208-admin-api-restore.env`. HTTP smoke remains good. The previous Production `:4501` process remains alive for immediate rollback.
- Nginx config backed up to `/etc/nginx/backups/moneyverse.before-admin-api-origin-20261114-1818-v2208`; public edge is NOT switched yet at this checkpoint.
- Scope: this is an emergency API-origin configuration rollback with no application code rebuild, schema migration, balance write, session revocation, auth bypass, or Spring service restart. Do not claim authorized admin end-to-end QA or exact-SHA release/Test certification from anonymous probes alone.

## Finished — 2026-11-14 18:18 KST
- Root cause conclusively matched exact screenshot digest `237831372` to NextJS `ApiError 404` caused by pointing the frontend at an incompletely migrated Spring backend.
- TDD: the token-destination URL test initially failed (3 PASS/1 FAIL), then passed after anchored loopback hostname-and-port validation (4 PASS/0 FAIL). `bash -n` passed. Live API guard failed for Spring 4550 (expected) and passed for Nest Production 4500 and official Test 3100.
- Kept original frontend 4501 alive while starting separately validated 4511. Backed up Nginx, switched routing to 4511, configured the canonical 4501 service through `/etc/systemd/system/moneyverse-release-v1546-frontend.service.d/v2208-admin-api-origin.conf`, restarted and checked 4501, then atomically restored the original Nginx upstream to 4501. The standby remains enabled as fallback.
- Post-change public cURL: `/admin` 200 without original digest, `/bank`/`/chat` 307 login redirect, `/stocks`/`/login` 200, `/health`, `/health/spring`, `/api/version` 200. Canonical runtime environment verified `API_ORIGIN=:4500`. No matching new 404 in its inspected journal after 18:17 KST.
- No immutable source artifact modification, financial or DB write, session revocation, administrator authentication bypass or Spring shutdown. The official Test application's source SHA differs from Production/main, so this operation is a runtime configuration restoration, **not** a new fully Test-certified source release. Authenticated operator/OTP/sensitive commands still require independent QA.
- One Python-client check received transient public HTTP 403 on all paths; direct Nginx and a subsequent public cURL returned expected responses. Cause unconfirmed.
- Initial isolated `/tmp` workspace was cleaned up externally after the first checkpoint, but its `3c58fea750` commit remained safe on GitHub. Restored the same task branch in persistent worktree `/home/debian/moneyverse-worktrees/admin-api-restore-v2208` without touching competing worktrees.
