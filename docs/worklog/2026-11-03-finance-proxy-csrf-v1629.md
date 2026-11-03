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
