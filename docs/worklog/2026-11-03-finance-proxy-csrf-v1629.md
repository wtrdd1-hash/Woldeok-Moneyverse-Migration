# v2026.11.03.1629 — Fix public HTTPS finance POST Origin handling

**Status:** Started; source/Test/Production pending.
- User requested continued recovery of Treasury, pension, Mint, Central Bank and KDIC.
- Start main `e83ad8a6d1b8d477bfbe661ea3cffd46f270509c`; isolated worktree branch `fix/finance-proxy-csrf-v1629`, preserving other active developers.
- Compared integrated plan, current v1628.1 proof, AGENTS monetary rules, issue #2366, draft PR #2551.
- Actual Production **unauthenticated** POST negative probes with canonical public HTTPS Origin and same-origin Fetch-Site yielded **403** for Treasury donate, funded NPS contribute, and funded NPS withdrawal. Correct same-origin proxy requests should pass the Origin layer and reach authenticated rejection **401**.
- Root cause: Next internal http://127.0.0.1 Request.url compared to external HTTPS Origin. Fix strict allowlisted host+Origin handling; retain cross-site 403, unauthenticated 401, one-use CSRF, UUIDv4 idempotency and canonical receipt verification.
- Never use member balances to mint or fund public payments without consent. No real transfer tests against Production; only anonymous negative HTTP and isolated DB tests.
- **Mid/final:** append source/CI/host evidence once verified.


## Intermediate: TDD and code review
- Verified Production 403 for all three normal-origin unauthenticated POST requests before changes; no money moved. PR #2551 draft consulted, not merged.
- RED: missing common validator module, Vitest failed. GREEN: strict canonical HTTPS Host/Origin and loopback request validator + three route integrations. 35 tests PASS across three files, including new proxy acceptance/401 and cross-origin 403 cases. TypeScript and scoped ESLint PASS.
- Public domains allowlist is explicit, arbitrary X-Forwarded-Host cannot substitute for the actual Host, and nonlocal URLs are rejected. Existing direct same-origin test requests still work.
- Final release evidence pending; no Production claim from source-only tests.

## v1629.1 — actual Next canary correction (interim)
- Original compiled canary still returned 403 on all three routes despite 35 synthetic tests. Local-only temporary diagnostic (no cookies, tokens, personal data) showed Next rewrote the internal request URL as `https://localhost:4246`, with genuine Host and Origin set to `easy-scraping.com`; first validator incorrectly required HTTP loopback.
- TDD real-format RED (1 fail/15 pass), then GREEN: allow actual localhost HTTP/HTTPS protocol only if canonical public Host, Origin and forwarded Host match exactly. Added two spoof-negative cases; 38 source tests PASS; temporary logging fully removed.
- Protected local-only Next canary using the existing frontend environment and backend returned 401 to each of the three legitimate same-origin unauthenticated POSTs and 403 to each forged cross-site POST. No authenticated WLD transfer or mint. Stopped canary and diagnostic services.
- GitHub CI and official exact-SHA Test/Production remain separate gates.


## v1629.2 Final: actual merged-main Test, zero-downtime Production and QA
- PR #2609 CI run 41557924378 SUCCESS; merged main SHA `702ec7fe746555943a4761b5760117376cce941b`. Rebuilt exact merged source (compiled shared contract/backend/frontend Next BUILD_ID), staged immutable Test `test-v2026.11.03.1629-702ec7fe7465` and Production `prod-v2026.11.03.1629-702ec7fe7465`.
- Official merged-main Test backend+frontend public versions match SHA and health 200; normal-origin no-session Treasury/NPS funded POST 401 each, hostile cross-origin 403 each, Treasury/blog language and sitemap 200. Strict Test runtime identity `ok:true, failures:[]`.
- Production blue-green backend 4234/frontend 4235 canaries passed source IDs, local finance 401×3/403×3, Treasury/admin pages/blog languages/sitemap 200, with previous v1628 4224/4225 kept alive. Saved Nginx backup and its SHA256, atomically switched exact six backend and fifteen frontend routes including concurrent blog routing, Nginx check/reload success. Public Production finance 401×3/403×3, frontend+backend exact SHA, health 200, strict Production identity `ok:true, failures:[]`, production-current v1629. No authenticated financial writes or currency issuance.
- Read-only live post-cutover DB 2026-11-03 ~10:27 KST: 891 ledger transactions, 1829 postings, 42 accounts; unbalanced 0, account balance mismatches 0, active Treasury unlinked 0. Member cash+bank 4,841,510 WLD preserved; Treasury and NPS escrow 0.
- Actual QA 10:28 KST exit0, public smoke 24 PASS / 0 fail / 2 login-gated not tested, dual-disk strict root 51% data35% both OK, no eligible cache. Safely removed only four inactive isolated build-generated paths, measured reclaim **4,095,483,904 bytes**, with immutable releases, DB and backups protected. Concurrent prior huge disk cleanup not attributed to this task.
- [Final English release](../releases/v2026.11.03.1629-finance-proxy-prod.md) / [Korean](../releases/v2026.11.03.1629-finance-proxy-prod.ko.md). Financial bulk payouts, KDIC claims, enterprise dividends and Mint/CB true issuance still NOT certified/funded; issue #2366 OPEN.
