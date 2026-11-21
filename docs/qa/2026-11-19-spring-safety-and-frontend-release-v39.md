# v2026.11.19.39 — Spring safety remediation / full-frontend promotion gate

**Status (2026-11-19 KST): PRODUCTION SCOPED NGINX PRIVACY HOTFIX LIVE; Java candidate TEST PASS, **NOT** merged/deployed; all-site frontend production promotion HOLD.** This report distinguishes verified actions from unproven whole-site assertions.

## Authority and source provenance
- Owner explicitly authorized full repair and zero-downtime Production promotion. Work based on mini-PC GitHub `main` `f488088bf50eb4659f59782dc0300a9c3bc74c69` with separate branch `fix/mv39-private-wallet-auth-boundary`. No edits to Gemini's active home UI worktree or PR #3301; earlier UI PR #3296 was CLOSED/UNMERGED.
- `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md` sections G442-01–07 require *every* route including administrator UI, five complete all-route QA passes, viewport/role/fixture parity, real backend/DB evidence, exact-source Test, and independent rollback. These requirements cannot be waived by owner approval alone. The current new design PR #3301 is **one homepage**, not a certified 180-route Spring-native implementation.
- Existing official public Test origin `https://test.easy-scraping.com/` was HTTP403 (Cloudflare); localhost read-only Spring test is not a substitute for public official Test identity, signed-in browser and rollback testing.

## Read-only baseline and precise reproduction
1. Base Spring `./gradlew --offline test`: **237 tests, 38 FAILED**. The other worker's UI PR #3301 baseline had the **identical 237/38** results, so UI changes were not blamed for prior Java failures.
2. Live anonymous GET `/api/wallet/overview`, `/api/wallet/balance`, corresponding `/api/v1/` aliases: HTTP200 with wallet owner/financial data, a **privacy defect**. Anonymous `/api/pension/funded/position` also returned a fabricated personal financial claim. A forged client `X-User-Id` made both wallet summary aliases respond as signed-in with an amount. Never include actual owner identifiers or private balances in GitHub reports.
3. Only release-scoped Nginx emergency repairs were promoted. Running Spring Production PID/process, PostgreSQL data/credentials, TLS and frontend static files were not changed. No signed-in financial mutations were tested on Production.

## Production Nginx emergency hotfix — LIVE, PASS
The active Nginx site file was backed up privately under `/etc/nginx/moneyverse-backups/` **before each change**, modified only after SHA comparison and under `flock`, validated with `nginx -t`, then gracefully reloaded with rollback safeguards:
- Four legacy wallet `/overview` and `/balance` aliases require HTTP401 JSON, `Cache-Control: private, no-store`, noindex. This temporarily denies even legitimate members on those legacy paths until certified backend owner scoping can replace it.
- Both wallet `/summary` aliases preserve signed browser cookies but strip client-controlled `X-User-Id`, `x-actor-user-id` and `x-internal-token`; forged random-user probes returned HTTP200 `signedIn:false`, `totalAvailableAmount:null`.
- Anonymous `/api/pension/funded/position` now HTTP401; unverifiable pension state write `/api/pension/toggle-retirement` returns HTTP503. No actual balance or receipt is exposed.
- Public homepage, Spring auth session and public stock routes remain HTTP200. The last verified live Nginx config SHA256 was `25a14d928bbe11b000ab2e3887ef6009b39c37cb9099b1f5b1f73ddd02b33934` (this identifies the active file only at that inspection, not an immutable app release). Test command `scripts/qa_mv39_wallet_pension_public.sh`: **10/10 checks PASS**.
- Reviewed source-controlled example `ops/nginx/v2026.11.19.39-sensitive-wallet-pension-privacy.conf` is for inclusion within **each server block**, not a standalone Nginx file. Do not overwrite active multi-worker Nginx configuration with this snippet. Preserve secure backup and exact config fingerprint.

## Java branch fixes — TEST ONLY
- Wallet API: no fallback fixed actor or untrusted client identity; private overview/balance require signed server session; summary returns guest null amount without session; SQL errors/missing ledger rows return 503 rather than fabricated WLD=0. `WalletService.transfer` refuses unkeyed legacy requests before DB calls, `/api/wallet/transfer` denied 503 for verified members, `/api/v1/wallet/transfer` must have signed session+CSRF+client-stable UUID `Idempotency-Key`; the canonical `economy_transfer` result must return a non-null receipt UUID. This API contract is BREAKING and requires client integration/real database proof before Production deployment.
- Pension funded position and retirement toggle: no synthetic money or success; member 503 until canonical receipt; guest 401.
- Engagement/Dopamine: no fabricated daily quests, 10,000-WLD streak payments, roulette winnings or fake receipts; signed-in unavailable 503 and guest 401.
- Enterprise, KDIC insurance, Club, Treasury SWF, derivatives, quant, FX, ventures, newspaper weekly report, crafting recipes, personal space/credits/advice: no synthetic entities/prices/returns or unposted success. Unverified features return explicit 503 until real source and receipt availability. **Fail-closed does not mean the feature has been implemented**.
- Support/chat read failure is 503 instead of invented empty inbox/0 unread.
- Media upload integration test retains real Spring login and image streaming, but seeds ephemeral H2-compatible credentials instead of calling the PostgreSQL-specific registration insert. This changes **only the test fixture**, never real registration SQL.
- `FalseSuccessRegressionTest` now explicitly rejects SQL mutations and use of `economy_transfer` without stable request keys; it permits read-only `SELECT` to determine source availability. Additional tests cover legacy header spoof, large WLD decimal preservation, fixed client idempotency UUID and missing receipt.

## Test evidence and limitations
- Full Java suite exact unmerged source: `./gradlew --offline clean test` => **243 tests / 243 PASS / 0 FAIL / 0 SKIP** across 63 XML reports. `./gradlew --offline bootJar` PASS, JAR SHA256 `a9616f2b0dea86b74236b3df6739bc38aacd056ef872df5698c67b19f548561f`.
- Frozen isolated candidate: `/srv/moneyverse-data/releases/spring-safety-v2026.11.19.39-candidate-r1/`; read-only Spring Java process `moneyverse-spring-v39-safety-test.service` bound only to `127.0.0.1:4674`, non-production test DB and no bot/ticker scheduler. Backend health 200 UP, public stock/shop 200. `scripts/qa_mv39_spring_readonly.sh`: **21/21 PASS** for 401 private requests, 503 unverified source, forged actor summary negatives, and unauthenticated POST restrictions. NO signed-in financial money movement performed.
- The frozen test static HTML is **a snapshot of the existing live site**, not the fully rewritten PC/mobile front-end. The Java binary is a branch candidate, and the official isolated Test hostname / strict exact-merged-SHA release metadata were not verified. There are still ~180 historic Next page sources; new Spring-native design full feature parity not established. The 5-language Auto/manual selector code from other PR is not merged into this branch or live Production.

## Remaining P0 blockers for full Production promotion
1. Integrate owner/Gemini PR #3301 responsive UI without overwriting it, build consistent Spring static assets with five existing locales EN/KO/JA/ZH/VI, actual session finance data, no samples, all navigation and page content.
2. Source-generated route inventory = QA evidence inventory, five complete passes of **every** route/admin screen and all 320/360/375/390/412/430/768/1024/1440 + responsive landscape/zoom/roles/interaction fixtures. Historic HTTP200 fallback is not a pass.
3. Official public Test must serve the **exact merged commit** with authentic member A/B session switching, login/logout continuity, direct API permission boundaries, authoritative DB ledger balance vs displayed data, key reuse/retry and receipt verification. DB migration/privilege and backup/rollback must pass.
4. Verify real production executable and frontend release SHA, cross-service concurrency, Nginx/Cloudflare paths including direct backend port exposure, and canary/zero-downtime rollback before switching traffic.
5. No claims that all features function merely because 503 fail-closed paths and 243 Java tests passed. Money movement and other disabled features require separate real source implementation.

**Final release decision:** user's promotion approval RECORDED. Nginx-scoped emergency privacy fix LIVE. Full Java app and full frontend Production deployment **BLOCKED BY P0 QA/RECONCILIATION GATES**; no main merge/Production app restart/Production DB write occurred in this work.
