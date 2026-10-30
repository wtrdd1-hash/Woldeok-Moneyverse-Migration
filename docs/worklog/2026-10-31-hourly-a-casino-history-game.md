# A — Owner Arcade Recent-History Game Filter (2026-10-31)
## BEFORE
- [x] miniPC, current main, AGENTS, README, canonical EN/KO planning, prior QA, PR/branches/CI reviewed.
- [x] Independent worktree from exact origin/main; no other workers' branches modified.
- [ ] RED tests; [ ] implementation; [ ] focused verification; [ ] full gates; [ ] exact SHA CI; [ ] Test/Production release gates.
## IN PROGRESS
Proposed bounded read-only game filter for last 20 owner-scoped casino plays. Only coin/dice, the three types actually emitted by migration 170, `all` default. Duplicate/unknown query rejected; app-api verifies upstream shape and game agreement; private no-store/noindex; UI labels scope as recent 20, never complete history. No money writes, no migration, feature defaults to existing behavior.
## FINISHED
Pending verification. Release HOLD by default.

## MID — 02:37 KST
- RED: Backend 2 FAIL / 1 PASS, Frontend 3 FAIL before implementation.
- Source correction: migration 170's `member_casino_history` returns coin/dice only; themed games are not part of this source. Restrict selectable games to those three and label scope explicitly. Do not fabricate themed history.
- GREEN: Backend 3/3 PASS, Frontend parser/app-api/UI 6/6 PASS, changed-file ESLint PASS, Backend/Frontend typecheck PASS.
- Isolated PostgreSQL 17.11: all 311 migrations applied after creating migrator role with the privilege required by existing migration 029 (isolated only); `member_casino_history` EXECUTE granted to app role, direct SELECT on coin/dice play tables denied; real PG tests 7/7 PASS; fixture ROLLBACK verified with zero residual plays/ledger transactions.
- Latest origin/main unchanged; all four canonical plan blob SHAs rechecked. No production/test/shared DB writes. Full gates and exact SHA CI pending.
