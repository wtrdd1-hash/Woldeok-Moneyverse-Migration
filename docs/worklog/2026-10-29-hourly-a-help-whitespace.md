# A1525 — Verified help whitespace-tolerant search

## Before work
- Baseline origin/main: 95a8fdb85f6670cac9e52e16383711ac94924e93; isolated branch: auto/hourly-a-help-whitespace-20261029-1525.
- System: Debian 13.6; active backend/frontend/bot/nginx/Docker; dev DB reachable; root 69%, /tmp 34%.
- Prior QA v1366/v1367 and open PRs checked; #1850 candidate build failed in next/font, not proven source regression.
- Preserve all existing branches/PRs; do not modify main worktree, financial tables, applied migrations, or production.
- Goal: canonicalize user-entered whitespace before existing published-only SECURITY DEFINER help search, with web, NestJS, Android app-api and real PostgreSQL regression proof.
- State: STARTED; no tests or deployment yet.

## In progress
- Pending RED tests, minimal implementation, exact-SHA verification and mid-run main reconciliation.

## Finished
- Pending.

## Mid-work — 2026-10-29 15:31 KST
- RED: missing shared helper test failed before implementation; then GREEN: shared contract 41 PASS, NestJS 1,966 PASS/440 SKIP, Next 1,918 PASS. Targeted action and controller tests passed again after correcting `use server` directive placement.
- Added one shared Unicode-whitespace normalizer, NestJS public help controller canonicalization for both web and Android, Next server action canonicalization, accessible UI hint, isolated PostgreSQL positive/negative fixture. Raw >100 codepoints still rejected before normalization.
- Isolated PostgreSQL 17.11 targeted help fixtures PASS: published-only, category isolation, draft excluded, direct SELECT/UPDATE denied; ACL result f|f|t. Separate full migration replay 293 SQL files PASS (002-294); no applied migration edited.
- Changed-file ESLint PASS. Full-repository ESLint was stopped because concurrent development agents left only ~200MiB available RAM and the broad scan was consuming ~587MiB for >2min; this is NOT a full lint PASS.
- Remote main advanced during work: 95a8fdb85 -> 95fbf6c70 (v1452 news scheduler docs/planning). Integrated English and Korean master reread. Candidate must rebase/revalidate before PR integration.
- QA v1367 read-only: 139 non-main remote branches, 136 Draft PRs, 82 mergeable unique, 56 conflict, 1 main ancestor; 5 historical checksum mismatches, 19 reconciliations/18,000 WLD, ledger imbalance 0. No branch cleanup permitted.
- Remaining gates: full typecheck/build, app-api, DB unit, bot, exact SHA CI and candidate build, official authenticated Test. `mv-task` A1525 gates started; release remains HOLD.
