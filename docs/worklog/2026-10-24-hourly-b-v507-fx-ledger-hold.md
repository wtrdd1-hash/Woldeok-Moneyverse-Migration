# Backend B v507 — FX WLD mutation safety hold

## Before work
- 2026-10-24 14:31 KST: Debian 13.6 miniPC status and commands checked. File read MCP returned empty; server shell read `AGENTS.md`, `README.md`, both living plans and Superpowers instructions.
- Starting main: `49788d09494fed3e463651945b83386e87dd47bc`. Independent worktree `auto/hourly-b-fx-wld-write-failclosed-v507-20261024-1435`.
- Reviewed open A/C/QA/planning PRs and recent CI. P0 #1129: FX member swaps and forward margin/settlement directly mutate `account_balances` without authoritative ledger postings; production/dev DB sharing #1053 prohibits direct DB testing.
- Scope: immediate **fail-closed containment**, not a ledger implementation. Reject all four member-WLD-changing FX commands at both service and repository entry points; retain read-only FX views and reserve telemetry. API returns 503 and never claims successful settlement. No schema, migrations, WLD writes, or deployment.
- Follow-up required: independently design ledger-first SECURITY DEFINER functions, member receipt/idempotency and isolated PG concurrency verification before re-enabling.

## In progress
- [ ] Add RED tests proving all four unsafe commands are rejected before any SQL or notifications.
- [ ] Implement minimal service and repository fail-closed guards.
- [ ] Verify focused and full gates, CI, candidate SHA; document BLOCKED exact-SHA Test.

## Finished
- Pending.

### Implementation checkpoint
- RED: eight new safety assertions failed against original service/repository behavior. Original backend test command also hit missing contract dist; installed frozen dependencies and will build contract before focused rerun.
- GREEN implementation: explicit 503 safety hold in both service and repository before any FX WLD-changing DB command. Existing legacy success-path unit tests updated to assert fail-closed behavior. Read-only FX and reserve administration unchanged.
- GREEN: `pnpm --filter @moneyverse/backend exec vitest run src/admin/fx/fx-ledger-hold.test.ts src/admin/fx/fx.service.test.ts` = 17/17 PASS. Validation for below-minimum WLD amount remains unchanged before the 503 guard.
- Existing C #1130 and A #1127 overlap neither FX service nor repository. FX admin PR #1128 remains Draft; do not modify its worktree or branch.

## Finished — 2026-10-24 14:41 KST
- [x] TDD RED: 8/8 new checks failed on original code, then GREEN: focused FX 17/17 PASS.
- [x] Code: `fx-ledger-safety.ts` raises HTTP 503; service and repository call it for WLD→USD, USD→WLD, forward creation/margin and forward settlement. No DB query, connection, or success notification occurs for a blocked valid command.
- [x] Build: `pnpm build` PASS. `pnpm typecheck` PASS. `pnpm lint` PASS with 0 errors / 1,137 existing warnings.
- [x] `pnpm test` local: contract 38 PASS; database 15 PASS/3 SKIP; backend 1,321 PASS/398 SKIP; frontend 1,395 PASS/5 FAIL (locale 1, SEO 3, login touch target 1; unrelated existing QA/A ownership). No shared DB credentials or writes used.
- [ ] Production dependency audit: FAIL, 2 HIGH (`body-parser`, `multer`), owned by existing A/QA dependency PRs.
- [ ] Real isolated PostgreSQL integration, authenticated FX E2E and 100-way concurrency: BLOCKED until ledger-backed functions are implemented; no SQL migration in this containment change.
- [ ] Official Test exact-SHA: BLOCKED. Public Test `/api/version` returned `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, not this candidate SHA.
- [ ] GitHub required CI: pending at time of PR creation; see PR checks for final outcome.
- [ ] Merge and Production GitOps: NOT ATTEMPTED. This is an interim containment only; #1129 remains OPEN, and four FX member money-moving commands are intentionally unavailable until authoritative ledger settlement exists.
- Branch cleanup: none. Other A/C/QA/Gemini branches, worktrees, tasks and reservations untouched.
- Latest main re-fetched mid-run and before PR: `49788d09494fed3e463651945b83386e87dd47bc` unchanged. English plan primary, Korean plan secondary; both checked.

### API and DB contract
- Valid requests to `POST /api/v1/fx/swap/wld-to-usd`, `POST /api/v1/fx/swap/usd-to-wld`, `POST /api/v1/fx/forward/contract` and `POST /api/v1/admin/fx/forward/settle` return HTTP 503 instead of falsely confirming an unposted WLD transfer.
- Existing read-only FX portal, wallet/contract reads and reserve telemetry are unchanged. No schema, applied migration, ledger row, or runtime environment was modified.
- This branch is NOT a final fix for #1129: an approved forward-only additive migration, SECURITY DEFINER owner/ledger/idempotency contract, frontend unavailable UX and exact-SHA Test E2E remain required.
