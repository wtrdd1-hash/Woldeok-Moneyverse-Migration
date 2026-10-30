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
- [x] Run isolated PG smoke, lint/typecheck/build/unit/security/SEO/a11y/app-api/full suites; record FAIL/BLOCKED honestly.
- [x] Recheck latest main/planning start/mid/pre-PR (unchanged); final SHA and CI to PR.
- [x] Release HOLD: full suites fail and official exact-SHA Test E2E BLOCKED; no merge/deploy.

## Test / release
Pending. Preserve other worktrees and all unique commits.

## Midpoint checkpoint (16:05 KST)
- RED targeted: backend 13 failed/2 passed; frontend q-indexing failed, parser missing. GREEN frontend 9 PASS; backend first pass 14 PASS/1 legacy assertion to update.
- Backend uses existing SECDEF `member_board_public_list_with_stock(50)` and `strpos(lower(title), lower($3::text))` bound literal search; never queries full archive.
- No migration, app role DML, wallet or ledger change. Other A/B/C worktrees untouched.

## Real PostgreSQL checkpoint (16:09 KST)
- Dedicated network-isolated `mv-a-1557-board-pg2` PostgreSQL 17 container; no Production/Test database connection. Full 305 migration replay BLOCKED by role-provisioning mismatches (020 privilege reconciliation). Applied through 181 with 020 skipped **for feature SQL smoke only**, NOT migration parity certification.
- 52 synthetic public posts, function returns recent 50; title WLD matches 2, literal `%_` matches 1, older-than-50 title matches 0. App role can EXECUTE reviewed SECDEF function but direct `member_board_posts` SELECT denied. No WLD/ledger writes.
- Contract package build + backend/frontend typecheck PASS after building package. Changed-file lint PASS. Formatting normalization pending.

## Final local checkpoint (16:16 KST)
- Full backend 2,576 PASS / 119 FAIL / 495 SKIP; frontend 2,616 PASS / 53 FAIL. Database 56 PASS / 4 SKIP.
- Targeted backend 15 PASS, frontend 11 PASS. Lint 0 errors / 1,043 warnings, both typechecks/builds PASS, app API contract 183 PASS, production dependency audit 0 known vulnerabilities.
- Dedicated PostgreSQL 17 SQL smoke PASS but **305 migration parity BLOCKED** at scratch role reconciliation migration 020; 52 synthetic posts, app SELECT denied; isolated container removed, no WLD mutations.
- Test and Production unchanged. No main merge, production DB change, rollout or rollback. Release HOLD.
- QA and release details in `docs/qa/2026-10-30-a1557-board-title-search*.md` and `docs/qa/2026-10-30-a1557-release-hold*.md`.
