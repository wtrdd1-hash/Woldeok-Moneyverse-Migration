# v1420 — Member Pending Photo Withdrawal Planning (F675-161)

**Status: BEFORE WORK / DRAFT / RELEASE HOLD.** 2026-10-28 18:09 KST.

- [x] Read canonical main `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, Korean counterpart; read applicable local Superpowers skills.
- [x] Confirm QA v1345 and runtime safety holds; inspect `frontend/src/app/gallery/submit/page.tsx`, `backend/src/content/member-photo.controller.ts`, repository, migration 098 and admin publication migration 127.
- [ ] Complete English/Korean integrated planning and backlog with exact API/DB/locks/privacy/rollback.
- [ ] Recheck main and concurrent PRs mid-cycle; record independent evidence and 10,000-reference gate.
- [ ] Validate bilingual parity, document-only diff, worktree cleanliness, remote SHA and GitHub handoff.

**Baseline:** main `35971c600f25869c96f1c666d4b9f58927202730`; QA v1345 FAILED/HOLD; no authenticated official Test exact-SHA, no independent restore, data volume 97%; historical Treasury/ledger 18,000 WLD discrepancy remains. No Production/Test/DB/WLD changes are authorized in this planning run.

**Source fact:** `member_my_photo_submissions` returns only 30 items and `published` boolean; member has POST upload/submit and GET mine, but no withdraw endpoint. Migration 098 permits owner draft preview. Operator `content_set_photo_publication` can publish the same row; concurrent withdrawal must fail closed and be linearized against operator approval. This is a new proposal, not deployed behavior.
