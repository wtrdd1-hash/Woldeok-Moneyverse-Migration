# Development A — Member support subject search (2026-10-30)

**Status: P1 code candidate; release HOLD.** Baseline main `62c6cd038951d65c94b709302bdaec6e75b080b6`. Branch `auto/hourly-a-support-subject-search-20261030-0325` is isolated from main and other agents. Read AGENTS, README, both living plans, recent QA, open PRs, branches and CI before coding.

## Problem and design

The authenticated support page had status selection but no subject search. Existing RED tests were present but did not match the current controller/UI. Added a bounded literal case-insensitive subject search (`q`, 1–80 characters) combined with optional `status`. The query is parameterized, runs over `support_my_threads(actor,100)` and returns up to 50; it cannot search older threads or another user's rows. `%` and `_` are literal characters, not SQL wildcards. Reject arrays, control characters, invalid statuses and overlong input before SQL. The selected conversation must belong to the returned list; stale/forged IDs never trigger an extra message fetch.

Next.js displays a keyboard-accessible GET search input, preserves filters in links and discloses the recent-100 scope. NestJS and Android app-api enforce private/no-store and noindex. No schema change, new grant, ledger mutation, WLD amount or irreversible migration. The app gateway preserves session and query parameters. Rollback: revert candidate code; existing owner-scoped PostgreSQL functions remain unchanged.

## Verification and release decision

RED backend and frontend tests reproduced the missing behavior. Targeted backend search/status 7 PASS; targeted web/Android 6 PASS. PostgreSQL 17.11 isolated container, no exposed network: 304/304 migrations applied, 108 synthetic threads, owner boundary, literal search, latest-100 cutoff and direct-table-read denial PASS. Whole-repo gates, exact-SHA CI and official Test require independent evidence; **do not merge or promote without every mandatory gate passing**. Prior P0 Treasury truth/Frontend SHA and migration/backup evidence remain release blockers. Other agents' unmerged PRs are preserved.
