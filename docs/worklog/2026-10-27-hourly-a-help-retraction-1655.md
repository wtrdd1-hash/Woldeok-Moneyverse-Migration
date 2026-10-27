# Development A v2026.10.27.1655 — Verified Help Live Retraction (Draft / HOLD)

## Before work
- Direct mini-PC Debian 13.6 status: Backend, Frontend, Bot, MCP, Nginx and Docker active; PostgreSQL connected. Root 78%, data 72% used. No operational DB write.
- Main `c2a9306ddc0424438bc0ab297ea9543bb167aee6`; read AGENTS.md, README.md, English project plan and Korean companion, prior QA v2026.10.27.1625, GitHub PR/CI and integrated planning Draft v1364 (#1549). Support-hours planning is a different, unapproved scope.
- Start inventory: 362 remote branches, 354 open PRs (339 draft), 26 conflicting, 205 failed/cancelled/timed-out check rollups, 0 duplicate head SHA; 351 diverged, 8 ahead-only, 2 included-in-main branches. All preserved.
- Separate branch `auto/hourly-a-help-retraction-20261027-1655` and worktree `/srv/moneyverse-tasks/hourly-a-help-retraction-20261027-1655` from main. Six unmerged A help commits safely cherry-picked from predecessor #1551. No other worktree touched.

## In progress
- P1 reproduction: a verified help detail already open in a browser remained visibly published after a reviewer withdrew it. Expiry-only timers did not check retraction. Scope is this detail view; search-list live withdrawal and instant push are not claimed.
- TDD RED: backend controller/repository status method missing; Android status route rejected; SQL function absent. GREEN: new read-only `help_public_status` in *unapplied* migration 280; NestJS status GET, same-origin Next no-store verification, Android public read allowlist, client 30s/focus/visibility recheck and fail-closed on 404/503/receipt mismatch.
- Additional RED→GREEN: a prior article verification must not carry over to another article on client navigation. Added a publication-identity-keyed state guard and regression tests.
- No member/private content in status receipt, no direct table DML, PUBLIC EXECUTE denied, admin app-api remains denied. Existing independent approval, source expiry, replay conflict and immutable events retained.
- Isolated networkless PostgreSQL 17.11 tmpfs fixtures PASS (bootstrap, unapplied migration 280, admin, positive, negative), including retraction after publication, PUBLIC EXECUTE denial, app-role table SELECT/UPDATE denial, reviewer independence and immutable audit.
- Main re-fetched at middle: unchanged. Planning #1549 remains Draft/HOLD. Migration 280 is present in 13 *other* open PRs; no numbering or applied checksums changed.

## Final gates / release decision
- Final full local gates on final working tree: typecheck PASS; `pnpm test` PASS (backend 1,344 PASS/398 SKIP, frontend 1,444 PASS, DB 20 PASS/3 SKIP, contract 38 PASS); lint PASS with 1,132 existing warnings; NestJS build PASS; Next.js Webpack build PASS; Bot 8 PASS. Android app-api contract included in full test.
- Isolated PostgreSQL 17.11 final ACL/expiry/retraction/immutable audit PASS; no official Test deployment. Full dependency audit FAIL (2 Critical/8 High), Bot audit FAIL (1 Critical/5 High). Production gate HOLD.
- An initial duplicated verification invocation collided on a frontend build lock and an isolated Bot test initially lacked its dependency symlink; subsequent single clean full verification PASS on build/test/lint and Bot. Both failures retained in host logs. This does not clear supply-chain or release blockers.
- Final branch SHA and start/end PR inventory are recorded in the host QA report and PR after push; this committed log intentionally does not embed its own commit hash.
- Full local verification and exact candidate SHA, CI, official Test, security and release identity are recorded in the host QA report and PR. A local build/CI PASS alone never authorizes main integration or Production.
- Feature `VERIFIED_HELP_CENTER_V1` remains OFF. Official Test/Production deployment, DB migration, WLD/ledger mutation, branch deletion and rollback: none.
