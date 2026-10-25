# Development A — verified work payout receipts (2026-10-25 13:25 KST)

## Before work
- Authoritative remote main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Isolated branch: `auto/hourly-a-work-verified-receipts-20261025-1325`; separate data-disk worktree.
- Reviewed AGENTS.md, README.md, English canonical and Korean secondary plans, integrated master, QA v1268, previous A1225, current PR/branch/CI inventory.
- 146 remote heads / 145 non-main and 142 open PRs per QA v1268. Recheck exact current inventory in evidence snapshot `a1325/remote-branches-start.tsv` and `open-prs-start.json`.
- Prior conflicts #1107/#1110/#1143, all non-main work protected. No branch deletion authorized.
- Host Debian 13.6 services active; root 100% used, ~177MiB free; data disk ~91GiB free. No root-heavy builds or destructive cleanup.
- QA release blockers: six frontend tests, security Critical2/High10, prod deps High2, shared live DB on 5433, app-role excessive DML, migration 266 checksum mismatch, exact-SHA Test and backup restore missing.
- Current work screen renders `work_my_receipts` rows as paid even if `transaction_id` is NULL. PostgreSQL function explicitly allows null for zero-cap rewards. This is a **potentially misleading UI contract**, not a claim of live financial loss.
- Target P1: authenticated, read-only, ledger-verified **recent 20 work receipts** with exact WLD and EXP, separate verified/unverified/EXP-only statuses; no minting, no migration, no live DB writes.
- No overlap with B treasury, C stock/notification, QA, or planning reading list; no change to existing worker branches.

## In progress
- [ ] TDD red/green for owner-scoped ledger verification query and BigInt aggregates.
- [ ] Add guarded Backend GET, frontend `/work/earnings` and `/work` navigation; Android app-api contract and tests.
- [ ] Verify on isolated PostgreSQL, negative ACL, auth, privacy, accessibility, SEO and failure states.
- [ ] Re-fetch main/plans at mid and pre-integration, full gate evidence, record blockers and release decision.

## Finished
- Pending. No integration or Production promotion without exact-SHA complete PASS.
