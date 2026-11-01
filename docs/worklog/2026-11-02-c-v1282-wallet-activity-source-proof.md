# C v1282 — Owner wallet activity source validation

## BEFORE WORK — 2026-11-02 03:48 KST
- miniPC Debian 13 service health: seven active; development PostgreSQL connected.
- Baseline `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Reviewed `AGENTS.md`, README/English+Korean guides, canonical English/Korean planning, open PRs/CI and A/B/QA worktrees. Root checkout has a separate pre-existing modification to `implementation_plan.md`; this task uses a new isolated worktree.
- Gap: `/wallet/activity` validates calendar-filtered responses but renders arbitrary non-calendar HTTP 200 payloads as owner ledger activity. `transactions.length`, `map` and `formatMoment` can fail on malformed data. Forged or mismatched directions and pocket values can be presented as confirmed records. Existing NestJS GET `/api/v1/wallet/activity` is session-bound and uses owner-scoped repository with `private, no-store` and `noindex`; reuse that contract, no DB schema or ledger writes.
- No overlap found with active A/B/C/QA PRs; do not touch their branches.

## IN PROGRESS
- [x] Write RED tests for malformed non-calendar owner activity pages (03:50 KST: 6 UI failures and missing pure validator; 2923 other frontend tests passed).
- [x] Validate bounded page, cursor, ISO timestamps, unique UUIDs, directions and exact signed WLD amounts before rendering. Focused GREEN 24/24, Backend owner HTTP contract 4/4, focused ESLint and full typecheck PASS (03:54 KST).
- [x] Preserve legitimate owner activity and independently verified page-only summaries; malformed responses show retry and unknown rather than false-empty.
- [ ] Verify focused, full and isolated gates on exact HEAD; record failures without waiver.
- [ ] Refreshed origin/main at 03:55 KST: unchanged `510dbe6b`; canonical English/Korean plans unchanged at v1518. Publish Draft PR, preserve evidence and HOLD until all gates PASS.

## FINISHED
Pending.
