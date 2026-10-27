# B v583 — Admin bank read-model evidence integrity

## BEFORE (2026-10-27 14:35 KST)
- Main SHA: `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`.
- Independent branch: `auto/hourly-b-bank-evidence-v583-20261027-1435`.
- Root cause: `GET /api/v1/admin/bank` catches database errors independently for overview, credit grades and loan book, returning fabricated zero totals or empty arrays with HTTP 200.
- Existing Frontend `/admin/bank` correctly renders an error empty state when the backend request fails. No Frontend change needed.
- Proposed contract: success returns all three authoritative read models; any read failure returns non-2xx and no financial read model, preserving authorization and DB read-only behavior.
- Constraints: no DB migration, no WLD/ledger write, no Production/dev DB access, no merge/deploy without exact-SHA Test and security gates.
- Existing PRs for bank/FX reviewed; this is a separate read-only endpoint defect.

## PLAN
- [x] RED: 3 failing unit tests reproduced three independent fabricated-success paths.
- [x] GREEN: remove all per-read fabricated fallbacks; 503 on database read failures, 403 on deliberate role refusal, 400 on malformed SQL input.
- [x] Isolated synthetic PostgreSQL 17.11 test: 5/5 PASS; 8/8 unit, 4/4 HTTP contract tests PASS.
- [ ] Final SHA full code/security/CI and exact-SHA Test gates.
- [ ] Refresh main and EN/KO plan; log integration, HOLD, cleanup decisions.

## IN PROGRESS (2026-10-27 14:42 KST)
- Main refreshed mid-task: `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`, unchanged. EN/KO plan refreshed.
- Initial RED: 3 failed/2 passed. GREEN: 8 unit PASS, 4 HTTP PASS, synthetic PostgreSQL 5 PASS.
- Full workspace `pnpm test`: backend 1,334 passed / 403 skipped, frontend 1,427 passed, contract/DB package tests also run. Skips not passes.
- Full workspace `pnpm typecheck`: PASS; `pnpm lint`: PASS with 1,131 pre-existing warnings.
- Default `pnpm build`: FAIL because Next Turbopack rejects symlinked worktree `frontend/node_modules` pointing outside root. `next build --webpack` diagnostic: PASS; do not claim default build PASS.
- Security guards `check-repository-security`, `check-control-bytes`, `reject-prisma-migrate`: PASS.
- `pnpm audit`: FAIL (2 critical, 8 high, 11 moderate, 3 low); `pnpm audit --prod`: PASS; bot audit FAIL (1 critical, 5 high).
- Bot tests first failed due missing local node_modules; linked own worktree to pre-existing dependencies and reran 8/8 PASS.
- Financial ledger, WLD balances, DB migrations and real service databases unchanged.
- Frontend already has `apiOrNull` unavailable state; no additional UI change required for this bounded failure path.
- Production HOLD: official Test exact-SHA, authenticated admin bank E2E, release gates not yet met.
