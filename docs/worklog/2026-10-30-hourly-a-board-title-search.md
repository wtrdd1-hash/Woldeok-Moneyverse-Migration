# A — Public board recent-title search (2026-10-30)

Status: **IN PROGRESS / DRAFT / RELEASE HOLD**. English canonical; Korean companion follows.

## Baseline and ownership
- Baseline main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; 19 remote branches, 18 open PRs. No overlapping open PR for public board title search.
- Separate `auto/hourly-a-20261030-1557-board-title-search` worktree; protect dirty A support-message-search worktree, B blog/NPS, C privacy/board-adjacent work.
- PostgreSQL business read must stay inside existing `member_board_public_list_with_stock(50)` SECURITY DEFINER function; no migration or direct table access. Search is **only among latest 50**, never global.

## Implementation checklist
- [x] Read AGENTS/README/English+Korean planning and QA; review branches/CI.
- [ ] RED backend test for title filtering, SQL binding, invalid/duplicate params.
- [ ] GREEN backend repository/service/controller; verify actorless public surface and DB ACL.
- [ ] RED/GREEN Next.js search UI with accessible form and noindex query states.
- [ ] Android app-api parity and negative tests; update EN/KO API notes if needed.
- [ ] Run isolated PG, lint/typecheck/build/unit/integration/security/SEO/a11y/app-api/full suites.
- [ ] Recheck latest main/planning mid and pre-integration; record exact SHA, CI, release gate.
- [ ] Release HOLD unless all required gates PASS. No destructive cleanup, main merge or Production changes without evidence.

## Test / release
Pending. Preserve other worktrees and all unique commits.
