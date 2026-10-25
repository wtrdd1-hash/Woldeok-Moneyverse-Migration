# B v532 — Discord broadcast authentication boundary (P0 conditional security; HOLD)

Date: 2026-10-25 KST. Owner: Backend/API/security B. Branch: `auto/hourly-b-discord-secret-failclosed-v532-20261025-1435`.
Start main: `40d9b96ea02e06d7d0f100d0afdf21fcb30cf295`. Main advanced during execution; rebase against latest main before PR. English planning canonical, Korean supplemental; both reviewed. QA v1269: FAILED/HOLD. Related source audit: `docs/findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md` (conditional default-secret finding). Distinct from open B PR #1140, which covers the host blog cron caller, and from C notification truth work.

## Security finding and scope

`POST /api/discord/broadcast` accepted a checked-in fallback credential if environment secrets were absent, and a cookie-authenticated administrator could submit cross-origin POST without an Origin gate. The local bot listener on `127.0.0.1:3099/broadcast` accepted any POST without verifying the supplied secret. These are source-verified trust-boundary defects; unauthorized Production use has **not** been demonstrated.

- Browser gateway now accepts a **configured** `INTERNAL_API_SECRET` of at least 32 UTF-8 bytes for machine callers, using SHA-256/timing-safe digest comparison. The blog `CRON_SECRET` and historical static fallback no longer authenticate Discord broadcasts. Same-origin administrator requests require matching `Origin` and non-cross-site Fetch Metadata. Existing admin session checks remain.
- A **separate** `DISCORD_BROADCAST_SECRET` of at least 32 bytes is required for forwarding to the bot. Missing/weak outbound configuration returns 503, not a simulated delivery. No secret is included in responses or logs.
- Bot loopback webhook checks the dedicated secret **before reading the request body**. Missing/weak configuration returns 503; invalid/missing credential returns 403. Valid requests retain existing Discord delivery behavior.
- No DB, migration, ledger, WLD, or public API URL changes. Transport contract changes: `x-internal-secret` to bot is mandatory; operators must provision the same dedicated secret to the frontend server and bot via protected deployment configuration. Rotate any legacy shared/static credentials with coordinated rollout. Do not log actual secret values.
- Unauthenticated member-side broadcast attempts remain forbidden; a member cannot claim a verified jackpot or treasury event merely by posting from the browser. Administrator browser flow remains available when the dedicated bot secret is configured. Production configuration **not** changed in this run.

## Red/green and validation

- RED: frontend 4/5 failed against original implementation; bot test failed without authentication helper. Additional RED: legacy blog cron secret was incorrectly accepted (1/6 failed).
- GREEN: frontend broadcast security tests 6/6; bot auth tests 2/2; existing bot suite 8/8.
- Contract build PASS; frontend/backend typecheck PASS after fixing a test-only nullability assertion; backend build PASS; full ESLint PASS with 0 errors (1122 existing warnings).
- Backend unit 1313 PASS / 398 SKIPPED; database package 15 PASS / 3 SKIPPED (not real PostgreSQL integration).
- Frontend suite 1402 PASS / 6 FAIL (existing i18n, SEO, login touch target, finance statistics failures; full suite NOT PASS).
- Frontend webpack build eventually returned exit 0 after a concurrent Next build lock attempt; default build and independent exact-SHA Test remain unverified. No authenticated financial E2E or isolated PostgreSQL security proof.
- QA v1269 security still reports Critical 2 / High 10, app role DML on 235/241 public tables, 3 PUBLIC bank EXECUTE functions and migration 266 mismatch. Production/Test release gates remain BLOCKED.

## Merge and rollout HOLD

Draft PR only. No main merge, no Test/Production deployment, no bot restart, no DB write, no branch deletion. Required: reviewed dedicated-secret provisioning on both services, bot HTTP integration/negative tests on exact candidate SHA, full frontend suite, dependency audit, CI, isolated PG/financial E2E and official Test exact-SHA + GitOps release attestation. A successful local focus test or image build does not authorize Production. Preserve A/C/Gemini/QA branches and scheduled jobs.
