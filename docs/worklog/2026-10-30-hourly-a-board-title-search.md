# A — Public board recent-title search (2026-10-30)

Status: **IN PROGRESS / DRAFT / RELEASE HOLD**. English canonical; Korean companion follows.

## Baseline and ownership
- Baseline main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; 19 remote branches, 18 open PRs. No overlapping open PR for public board title search.
- Separate `auto/hourly-a-20261030-1557-board-title-search` worktree; protect dirty A support-message-search worktree, B blog/NPS, C privacy/board-adjacent work.
- PostgreSQL business read must stay inside existing `member_board_public_list_with_stock(50)` SECURITY DEFINER function; no migration or direct table access. Search is **only among latest 50**, never global.

## Implementation checklist
- [x] Read AGENTS/README/English+Korean planning and QA; review branches/CI.
- [x] RED backend test for title filtering, SQL binding, invalid/duplicate params (13 fail, 2 baseline pass).
- [x] GREEN backend service/controller code; DB ACL verification pending.
- [x] RED/GREEN Next.js search UI with accessible form and noindex query states (9 targeted frontend PASS).
- [x] Android app-api q forwarding, no-store and noindex regression (1 PASS); EN/KO docs pending.
- [ ] Run isolated PG, lint/typecheck/build/unit/integration/security/SEO/a11y/app-api/full suites.
- [ ] Recheck latest main/planning mid and pre-integration; record exact SHA, CI, release gate.
- [ ] Release HOLD unless all required gates PASS. No destructive cleanup, main merge or Production changes without evidence.

## Test / release
Pending. Preserve other worktrees and all unique commits.

## Midpoint checkpoint (16:05 KST)
- RED targeted: backend 13 failed/2 passed; frontend q-indexing failed, parser missing. GREEN frontend 9 PASS; backend first pass 14 PASS/1 legacy assertion to update.
- Backend uses existing SECDEF `member_board_public_list_with_stock(50)` and `strpos(lower(title), lower($3::text))` bound literal search; never queries full archive.
- No migration, app role DML, wallet or ledger change. Other A/B/C worktrees untouched.
