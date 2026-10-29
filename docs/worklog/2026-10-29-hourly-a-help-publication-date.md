# 2026-10-29 A — Verified help publication date and Android cache boundary

## Before
- Debian 13.6 miniPC and development PostgreSQL reachable. Main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`, isolated branch `auto/hourly-a-help-publication-date-20261029-1358`.
- Read AGENTS, README, bilingual integrated plans, QA v1365, prior A worklog, and all open PR/CI; PR #1839 overlaps the Android help cache fix and search presentation, so ordered rebase is mandatory.
- Starting 131 remote branches/127 open PRs. Subsequent complete audit: 132 remote branches, 128 open Draft PRs, 0 missing/mismatched or duplicate PR heads, 39 conflicting, 85 with historical failed checks, 130 unique non-main heads and 1 main ancestor. No deletion.

## Change and TDD
- Existing approved-only `help_public_search` and `help_public_article` already return `published_at` from immutable, independently approved PostgreSQL revisions. No new migration, grants or ledger effects.
- Display the actual timestamp in KST on public search cards and article details (EN/KO) with semantic `<time>`. Omit malformed or missing timestamps rather than inventing evidence; do not call publication date a review date.
- Android help article passthrough retains the original backend `published_at`, while help responses including error paths override upstream public cache headers with `private, no-store`.
- RED: missing date component test; Android response cache test failed on `public, max-age=86400`. GREEN: frontend 35 tests, backend 3, database contract 5 PASS. Isolated network-disabled PostgreSQL 17.11: migration 282, positive/negative fixtures, identical search/article publication timestamp, no app table DML or PUBLIC function EXECUTE PASS. Container removed.
- Full local lint PASS (0 errors, 1091 existing warnings). Initial typecheck FAIL due a test mock declared without parameters; repaired test signature. Heavy concurrent processes, 8.6GiB RAM near exhausted and 20GiB swap in use; own orphaned full build and redundant validation processes were stopped to protect shared miniPC. Full build/typecheck/test must be established by exact-SHA CI; local full gate not claimed PASS.

## Release gate
- Official Test and Production `/api/version` HTTP 200 app `b44ffd0af9e2bd6e7c2be7345b72094827078c3d`; `/help` 404, verified-help flag OFF. Candidate SHA is not deployed.
- QA v1365: historical 18,000 WLD provenance, five migration checksum mismatches, independent off-host restore and authenticated exact-SHA E2E not independently resolved. Release HOLD.
- No main merge, Test/Production deploy, live DB writes, financial changes, rollback, branch deletion, PR closure, or schedule changes. Unique work protected.
