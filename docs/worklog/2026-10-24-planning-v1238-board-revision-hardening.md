# Planning v1238 — F675-116 Board Revision Integrity Hardening

- **Status:** IN PROGRESS (documentation-only, release HOLD).
- **Cycle:** Previous Feature Addition v1236 → Current Feature Improvement v1238 → Next Feature Addition v1240 (provisional).
- **Source:** latest main `57f393395d16495b06187de69c17592d2c13d251` at start; predecessor Draft PR #1184 `2617b7a8b9d88247be5cc8c048eb4e9743789daf` remains unmerged. QA v1242 FAILED/HOLD.
- **Scope:** correct the v1236 proposal against actual latest `259-board-author-user-id-and-chat-search.sql`, board delete, DTO, web action and app API. Improve revision baseline, idempotency replay, conditional edits, ownership, deletion/erasure, rollout and negative tests. No runtime code, DB, WLD, Test, Production, or other worker branches changed.

## Checklist
- [x] START: miniPC/skills, latest main, GitHub PR, QA, code and planning sources inspected.
- [x] IN PROGRESS: English canonical and Korean parity updates in the four integrated planning files and two project plans.
- [x] MID: recheck main and canonical plans; reconcile conflicts and source evidence.
- [x] VERIFY: docs-only diff, backlog ID parity, no secret leakage, git diff --check, worktree clean after commit.
- [ ] FINISH: commit/push, Draft PR and GitHub issue update; final release HOLD evidence.

## Evidence and restrictions
- Latest main advances after QA v1242: three shop/docs commits. The predecessor planning Draft is not merged into main. Current update function was last replaced by migration 259 (not 048). Existing web action generates a fresh idempotency key per submission and sends no revision precondition. Legacy delete function in migration 044 sets `deleted_at` without recording request keys. No Production incidents inferred from source inspection.
- External independent reference gate: 10,000 verified deduplicated records required, cumulative accepted UNKNOWN, newly accepted 0, BLOCKED / IN PROGRESS.

## IN PROGRESS — 2026-10-24 23:06 KST
- Source-of-truth corrected to migration 259 update and migration 044 delete. EN/KO integrated master, product review and living plan updated with same ten backlog IDs. Main/plans rechecked and unchanged during work.
- No applied migration changed; release and 10,000 external reference gates remain BLOCKED.

## Verification — 2026-10-24 23:06 KST
- `git diff --check`: PASS; exactly seven docs/worklog files changed; six canonical/parity planning documents contain identical 10 P0/P1 IDs; top v1238 heading appears once in both living plans.
- Main rechecked at `57f393395d16495b06187de69c17592d2c13d251`; latest completed QA v1242 FAILED/HOLD. Source/contract findings are read-only; no runtime/DB tests claimed.
- External references: 4 publisher families consulted, 0 newly approved independent records, cumulative accepted UNKNOWN / 10,000 BLOCKED.
