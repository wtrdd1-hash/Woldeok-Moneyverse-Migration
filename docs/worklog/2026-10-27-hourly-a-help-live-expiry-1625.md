# Development A — Verified Help Live Expiry Truth (2026-10-27 16:25 KST)
Status: engineering candidate / DRAFT / RELEASE HOLD. English canonical; Korean companion adjacent.

## Baseline and ownership
- Debian 13.6 mini-PC connected directly; backend/frontend/bot/MCP/nginx/Docker active and PostgreSQL connected at start.
- Fresh origin/main SHA c2a9306ddc0424438bc0ab297ea9543bb167aee6, verified before/mid implementation. Main policy AGENTS, README, English canonical and Korean planning and latest QA reviewed. Latest planning v1364 (#1549) is a separate Draft/HOLD support-hours proposal, not an approved implementation or main change.
- Branch auto/hourly-a-help-live-expiry-20261027-1625 in independent worktree from fresh main. Previous A help commits safely cherry-picked; original #1546 and all B/C/Gemini/QA worktrees preserved.
- Start audit: 359 remote branches (358 non-main), 351 open PRs (336 Draft), 26 conflicting, 205 with failed/cancelled/timed-out checks, 351 diverged/5 ahead-only/2 included in main, zero duplicate remote Head SHAs, zero missing locally at this snapshot. No deletion (unique unmerged changes protected).

## P1 bug and implementation
- Existing published help SQL enforces expiry at query time, but a read can become stale before NestJS serializes its response; an open web search/detail tab could retain the old verified copy indefinitely.
- TDD RED: backend 2 failures for expired/malformed search and expired article; frontend results and detail missing module failures. GREEN: Backend rechecks absolute expiry before search/detail response, shared by public Android app-api; KO/EN search and article detail use one-shot timers and visibility/focus refresh to remove expired content/source links without polling.
- Existing NEW/unapplied migration 280, least-privilege SECURITY DEFINER read, independent reviewer, immutable event receipts, canonical money strings and feature flag OFF remain unchanged. No new schema, ledger or operational DB mutation.
- Isolated networkless PostgreSQL 17.11 with ephemeral tmpfs: bootstrap + migration 280 + admin/positive/negative fixtures PASS. PUBLIC EXECUTE denied; moneyverse_app direct table SELECT/UPDATE denied; expired/unapproved public rows absent; independent approval, stale replays, immutable audit tested. Container removed.
- Local tests, build and security evidence are stored under /srv/moneyverse-data/reports/Moneyverse-A-2026-10-27-1625-* and are authoritative only for this candidate.

## Release hold
- Full supply-chain audit fails (2 Critical/8 High); Bot audit fails (1 Critical/5 High), production-only workspace audit PASS. Other open PRs reuse migration 280. Official Test public SHA 6f697e74... and Production public SHA 6a989b5a... do not match the candidate/main; official exact-SHA authenticated Test E2E, restore, full route-ledger, accessibility and GitOps promotion remain unverified.
- No main merge, Test/Production deployment, feature activation, operational DB/ledger write, rollback or branch deletion. Only fully merged branches may be cleaned after unique-commit proof.

## Final local verification (16:39 KST)
- Fresh after final code change: typecheck PASS, pnpm test PASS (Backend 1341 PASS/398 SKIP, Frontend 1436 PASS, DB 19 PASS/3 SKIP, contract 38 PASS), lint PASS (0 errors/1132 warnings), Backend build PASS, Next.js Webpack build PASS.
- First Webpack build with 1024MiB heap FAILED OOM; rerun with 3072MiB heap PASSED. No test result from the failed build is counted as a pass.
- Bot tests 8 PASS; full pnpm audit FAIL (2 Critical/8 High), Bot npm audit FAIL (1 Critical/5 High), production-only pnpm audit PASS.
- Route inventory generated: 171 pages, 35 admin, 32 dynamic. Actual five-pass route ledger absent, therefore BLOCKED. Exact-SHA official Test auth/E2E, independent restore and GitOps remain BLOCKED.
- Pre-commit origin/main rechecked unchanged; candidate is Draft/HOLD only. No branch deletions.
