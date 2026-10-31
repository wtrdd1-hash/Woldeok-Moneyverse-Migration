# v2026.10.31.1550 — SWF admin production promotion (EN)

## START — 2026-10-31 KST
Owner ordered another full verification and Production promotion. Reviewed AGENTS.md, DOCS_INDEX.md, docs/RELEASING.md, current merged master branch, prior EN/KO SWF incident logs and PR #2165. Concurrent main #2163 is authoritative for migration 313; conflicting draft #2162 must never be merged. Work carried out on isolated miniPC worktrees, with old Test and Production immutable generations retained.

## MID — exact release and Test
- PR #2165 passed branch CI and Build Test Candidate; merged to main as `bc8cd8a6c654af0336f550643f23049a58ee1d16`. Main CI runtime-check passed.
- Rebuilt backend and Next frontend with exact main SHA, using the existing isolated dependency worktree after a new offline pnpm install hit EAGAIN thread exhaustion. Both build outputs passed.
- Staged immutable Test `test-v2026.10.31.1550-bc8cd8a6c654`. Public Test backend and frontend both reported exact main SHA. `verify-host-runtime-identity.mjs --channel test` returned `ok:true`, zero failures, guarded Treasury 503.
- Exact equivalent Test candidate had synthetic authenticated admin end-to-end GET/PUT 200 in both Nest backend and Next BFF, admin Treasury panel SSR 200 without false unavailable banner, missing CSRF and foreign Origin 403. This was on isolated disposable Test database, never an actual Production member session.

## MID — Production backup, canonical database function
- Read-only financial preflight on actual app DB `woldeok_moneyverse_dev` returned `READY_FOR_OTHER_RELEASE_GATES` (no projection imbalance or unbalanced canonical postings); separately flagged owner-accepted existing DML on accounts, account_balances and system_treasury_vaults. This is NOT full Treasury provenance certification.
- Fresh Production pg_dump archive `/srv/moneyverse-data/backups/swf-v1550-20261031/woldeok_moneyverse_dev-pre313.pgdump` was SHA-256 validated; restore TOC checked.
- Applied ONLY canonical migration `313-admin-swf-governance-scoped-write.sql` to actual Production database in one guarded transaction, including checksum record `ec89b35acea4703b0a2f51fd4669cbe4cce5f4e46807d8e57994d82996d6d1a6`. New function `admin_swf_update_policy(uuid,jsonb)` is executable by app role, raw config table UPDATE remains denied. 4 portfolios and 270 SWF events persisted, no balances/payments/orders changed.

## FINISH — zero-downtime Production web cutover
- Staged immutable `prod-v2026.10.31.1550-bc8cd8a6c654`. Started new persistent systemd `moneyverse-release-v1550-backend.service` on 4164 and `moneyverse-release-v1550-frontend.service` on 4165 BEFORE traffic switching. Confirmed production DB URL, internal API auth token and public origin match prior runtime (booleans only, no credentials logged). New backend's background schedulers and SWF financial execution remain disabled to avoid duplicates; old stable services continue background work.
- Saved exact pre-cutover Nginx config at `/srv/moneyverse-data/task-records/swf-v1550/nginx-before-prod-cutover.conf` (sha256 2fb420e49dec7527dc07dafa090044c14f9db5c9aa8361dc20c72bb98c929564). Changed only 3564→4164 and 3565→4165 Production upstreams, validated nginx -t and reloaded without terminating old processes. Pinned old `moneyverse-live-prod-backend/frontend` units to their immutable previous root so restarts do not follow the new production-current pointer.
- Atomically set `production-current` to new v1550 immutable root. Public `https://easy-scraping.com/api/version` and `/frontend-version` each returned exact SHA. `verify-host-runtime-identity.mjs --channel prod --sha bc8cd8a6...` returned `ok:true`, `failures:[]`, confirming new active historical release units, manifest, effective env BUILD_ID and public versions.
- Public Production `/`, `/status`, `/admin/treasury`, `/blog`, `/robots.txt`, `/sitemap.xml`, `/ads.txt` all HTTP 200. Unauthorized SWF GET HTTP 401; cross-origin SWF PUT HTTP 403. New Production unit error-level journal had zero entries at verification. Old stable 3564/3565 services and immutable root retained for rollback. Extra read-only verification canaries retired.

## Outstanding bounds and rollback
- 552 historical system_treasury_ledger rows lack canonical ledger_transaction_id. Public Treasury overview is deliberately HTTP 503 / PUBLIC_TREASURY_RECONCILIATION_PENDING, and SWF liquidation/rebalancing and unrelated financial settlements remain fail-closed. No invented reconciliation or grants.
- No real Production user's signed-in admin end-to-end policy mutation was attempted; earlier authenticated tests used disposable Test identities. Public anonymous/auth-negative and actual immutable-release identity were verified.
- Rollback: restore saved Nginx config, `nginx -t`, reload, repoint `production-current` to old immutable release if needed. Keep canonical 313 as forward-only additive DB migration; do not restore or rewrite financial data. Production web services are enabled for reboot; old services remain available.
- Host task record: `/srv/moneyverse-data/task-records/swf-v1550/START.md`.
