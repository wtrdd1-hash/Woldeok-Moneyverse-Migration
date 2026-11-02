# QA — 2026-11-02 A0925 Public Board Image Proof Repair (DRAFT / HOLD)

## Authority and scope
- Latest `origin/main` at start/mid: `a8541927c3a351d980454c66e95a3356c47e0722`; parent Draft PR #2350 at `aaab7abd8a8036ced77f4469aa86f354ed61b610`.
- Existing `withImage=1` public-board feature belongs to PR #2350, **not a new feature** in this repair. No duplicate feature PR was submitted. Repair adds source proof on filtered empty results, canonical case-insensitive UUID deduplication, SSR fail-closed verification, HEAD semantics and no-referrer response policy.
- No migrations, new table privileges, financial writes, member identity reads or ledger mutations. Existing `public.member_board_public_list_with_stock(50)` remains the only source; no global history claims.

## TDD and evidence
- Repair RED: Backend HTTP 1 FAIL/12 PASS; Frontend 4 FAIL/20 PASS (missing echo, unverifiable empty, mixed-case UUID, HEAD, SSR).
- Repair GREEN targeted: Backend 23 PASS; Frontend 26 PASS. See task `evidence/repair-*red.log` and `evidence/repair-*green.log`.
- Full test on merged-main verification workspace: Backend 2,988 PASS / 518 SKIP; Frontend 2,948 PASS; DB 62 PASS / 5 SKIP; Typecheck PASS. Skips are not passes.
- Build/lint/contract exact final branch SHA and CI: see final PR evidence; this file must not be used as proof of official Test.
- Dependency audit in same workspace: production-only 0 known, all dependencies 9 findings (1 low, 8 moderate) — **FAIL**.

## Real PostgreSQL read-only probe
- Debian 13.6 / DEV PostgreSQL 17.11, role `moneyverse_app`, database `woldeok_moneyverse_dev`.
- `member_board_public_list_with_stock(integer)` EXECUTE=true, 1 recent public post / 1 with image; filtered count 1; transaction READ ONLY and ROLLBACK.
- P0 least-privilege violation remains: effective `member_board_posts SELECT`, `account_balances UPDATE`, `user_items DELETE` all true in DEV. No inference about Production. See #993.

## Release blockers
- Parent PR #2350 unmerged; stacked repair cannot be merged independently or promoted. Main and other unmerged work must be reconciled without discarding unique commits.
- Exact final SHA official Test Backend/API/DB/authenticated user E2E, independent backup restore, full security audit and GitOps release gates NOT PASS; Production HOLD.
- No main merge, Test/Production deployment, restart, DB mutation, rollback, or branch deletion authorized.

### Stacked-branch verification caveat
The merged-main verification workspace had a clean full build and lint (0 errors / 1,027 existing warnings). After resetting the isolated repair branch to parent #2350 for a clean stacked diff, the first TypeScript run encountered **stale `.next/types` references** to newer-main pension routes. Per AGENTS.md, deleting only this worktree's ignored `frontend/.next` and rerunning `pnpm typecheck` gave PASS. No source file or applied migration was changed to suppress the failure. Official Test currently advertises `510dbe6bf4d5...`, not this repair SHA.
