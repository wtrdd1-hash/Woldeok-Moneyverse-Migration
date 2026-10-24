# Dev A 2026-10-25 08:48 KST — Showdown practice truth / worklog

## Before work
- Host: Debian 13.6, service status ACTIVE; root filesystem at 100%, isolated data volume used; no Production or dev-live DB writes authorized.
- Canonical `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (fetched before creating branch).
- Branch: `auto/hourly-a-showdown-practice-20261025-0848`; isolated worktree on data disk.
- Baseline review: AGENTS.md, README.md, English/Korean living plans, integrated master, recent QA, all open PR titles and CI. A #1243 fortune, B #1245 SWF, C #1242 stocks untouched. Existing PR #1232 Bull/Bear, #1181 Star Drop, #1133 VIP chest avoid overlap.
- P0 discovered: `POST /engagement/dopamine/mini-showdown` trusts client-provided outcome/rolls/stake and returns fabricated WLD payout without a ledger posting; browser independently generates dice and displays 190 WLD as awarded even when request fails.
- Work: replace money-claiming showdown with authenticated server-generated **practice-only** rounds; no stakes, payouts, balance changes or stored game history. No new migration. Keep Android app-api route and CSRF. Explicitly distinguish this from ledger-backed paid game.
- Starting branch/PR counts and branch uniqueness audit to be appended; do not delete any branch.

## In progress
- [ ] Red tests for server-authoritative dice, invalid client outcome/stake refusal, frontend no false reward, app gateway CSRF contract.
- [ ] Implement backend API and Next server action, update UI, remove false monetary claims.
- [ ] Focused + full gates, isolated PostgreSQL ACL, exact SHA CI and Test verification.

## Finished
- Pending.
