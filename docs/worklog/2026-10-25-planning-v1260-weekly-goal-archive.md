# Moneyverse Planning v1260 — Verified Weekly Quest Archive
**2026-10-25 10:xx KST | Feature Addition | DRAFT / RELEASE HOLD**

## Cycle and baseline
- Previous: Feature Improvement v1258 (board reply replay/deletion integrity).
- Current: Feature Addition v1260 (F675-122 verified weekly quest history).
- Next: Feature Improvement v1262 (provisional).
- Latest authoritative remote main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; main AGENTS, README, EN canonical PROJECT_PLAN and KO comparison reviewed. Stacked on unmerged planning Draft #1248; not main.
- QA v1264 (2026-10-25 09:56 KST): FAILED/HOLD. Root disk 100% (~375MiB free), dev app direct DML 235/241, PUBLIC bank EXECUTE 3, migration 266 checksum drift/280 collision, previous frontend 6 failures and audits Critical2/High10, bot Critical1/High5. Official Test exact-SHA and isolated restore missing.
- miniPC Debian 13.6 services active, DB connected. Superpowers plugin skill list empty; installed using-superpowers, brainstorming, using-git-worktrees, writing-plans, verification-before-completion read from miniPC.

## Code-backed finding and design decision
- `frontend/src/app/quests/page.tsx` calls `GET /api/v1/engagement/early-game`; backend controller uses `early_game_weekly_goals` from migration 101.
- Function counts **current** Seoul week with no historical upper bound; catalog has 3 week-scoped verified source metrics and 1 lifetime self-reported NPC metric. Current job ranking is not an authoritative historical job attribution. No historical verified archive in inspected main.
- Proposed only: closed-week owner-private archive with immutable revision/provenance, source watermark+24h grace, frozen target/job version, unknown/unverifiable states, no false historic backfill, no member writes, no WLD effects. No overlap with A/B/C/Gemini/QA code branches; separate engineering handoff.

## Engineering backlog and acceptance
P0 ENV1260-01 SEC1260-02 REL1260-03 QUEST1260-04.
P1 QUEST1260-05 QUEST1260-06 QUEST1260-07 QUEST1260-08 QUEST1260-09 QUEST1260-10.
Planned isolated real-PG 100-way finalizer replay, 100 foreign receipts, 10,001 synthetic rows, KST Monday and late source correction, policy/job version, soft delete/merge, bigint and Android/a11y regressions; **not run**. Feature OFF; exact-SHA Test/security/restore/GitOps gate required.

## External evidence and operational boundaries
- Independent external target: 10,000 deduplicated, approved, source-classified records. Reviewed publisher families: PostgreSQL/OWASP/W3C (3); newly accepted: 0; cumulative accepted: UNKNOWN; gate BLOCKED/IN PROGRESS.
- No runtime code, DB, Test, Production, financial ledger, WLD, worker files, feature switch, or schedule modified. No merge or deployment. Records under `/srv/moneyverse-data/build-workspaces/planning-v1260-records/`.

## GitHub handoff
- Draft PR #1257 (base prior planning #1248): https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1257
- Development issue #1256: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1256
- Draft only; no main merge or runtime/Test/Production deployment.
