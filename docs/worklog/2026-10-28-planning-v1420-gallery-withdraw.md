# v1420 — Member Pending Photo Withdrawal Planning (F675-161)

**Status: FINISHED (planning only) / DRAFT / RELEASE HOLD.** 2026-10-28 18:09 KST.

- [x] Read canonical main `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, Korean counterpart; read applicable local Superpowers skills.
- [x] Confirm QA v1345 and runtime safety holds; inspect `frontend/src/app/gallery/submit/page.tsx`, `backend/src/content/member-photo.controller.ts`, repository, migration 098 and admin publication migration 127.
- [x] Complete English/Korean integrated planning and backlog with exact API/DB/locks/privacy/rollback.
- [x] Recheck main and concurrent PRs mid-cycle; record independent evidence and 10,000-reference gate.
- [x] Validate bilingual parity, document-only diff, worktree cleanliness, remote SHA and GitHub handoff.

**Baseline:** main `35971c600f25869c96f1c666d4b9f58927202730`; QA v1345 FAILED/HOLD; no authenticated official Test exact-SHA, no independent restore, data volume 97%; historical Treasury/ledger 18,000 WLD discrepancy remains. No Production/Test/DB/WLD changes are authorized in this planning run.

**Source fact:** `member_my_photo_submissions` returns only 30 items and `published` boolean; member has POST upload/submit and GET mine, but no withdraw endpoint. Migration 098 permits owner draft preview. Operator `content_set_photo_publication` can publish the same row; concurrent withdrawal must fail closed and be linearized against operator approval. This is a new proposal, not deployed behavior.

**Midpoint (18:11 KST):** main `35971c600` unchanged; no open photo-withdrawal PR; Android `/app-api/v1/photos/mine` existing contract confirmed. The spec will require photo-row locks, publication race fencing, immediate private media denial and immutable audit receipts.

**Finished planning checkpoint (18:17 KST):** [Draft PR #1727](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1727), [development issue #1726](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1726). Seven EN/KO pairs, ten backlog IDs, docs-only scope and `git diff --check` PASS; remote SHA `c52f03deb43105cd1cb46792c0e79fb60a690c3e` verified before final worklog commit. Main `35971c600` unchanged start/mid/final. PR release-input PASS, classify/verify pending; no full runtime CI, official Test or Production release. Backup/finance safety gates remain HOLD; 3 external source families, 0 newly approved, cumulative UNKNOWN/10,000. No runtime/DB/media/WLD/Test/Production edits.
