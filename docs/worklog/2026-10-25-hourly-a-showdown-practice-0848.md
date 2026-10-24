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

### Midpoint checkpoint — 2026-10-25 08:55 KST
- Re-fetched canonical main `c9a868b1e622341e2daa8b936ddf0988eda9988e`; integrated planning master and English/Korean plans SHA unchanged.
- Remote branch audit: 125 non-main refs with 125 unmerged unique tips; 0 fully merged refs eligible for deletion. Open PR count 120 at baseline, known conflicts #1143/#1110/#1107; all preserved.
- RED verified: backend new tests 2/2 FAIL against client-authoritative WLD payout, frontend 3/3 FAIL against fabricated local dice/reward.
- GREEN focused: backend new 2 PASS; frontend new + legacy 7 PASS; backend auth E2E 13 PASS; Android gateway + server action 3 PASS; initial workspace typecheck PASS.
- Corrected accidental overwrite of existing arcade action file **before any commit** by restoring the main file and adding a dedicated isolated server action module. Existing casino coin/dice actions preserved.
- No migration, DB write, main change, Test/Production promotion or other-worker deletion. Root disk still 100%, data volume 96 GiB free.
