# A0325 QA — owner-only stock watchlist CSV (2026-10-26 KST)

**Decision: PARTIAL / BLOCKED. Production RELEASE HOLD.** No merge, Test promotion, Production deployment, migrations or Production DB writes.

## Source, scope and integration
- Authoritative `origin/main` at start/mid: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English project plan and Korean counterpart reviewed alongside AGENTS.md, README.md and integrated master.
- Worktree: `/srv/moneyverse-data/worktrees/a0325-stock-watchlist-export`; branch `auto/hourly-a-stock-watchlist-export-20261026-0325`.
- Feature: guarded `GET /api/v1/stocks/watchlist/export` reads only the session actor via existing PostgreSQL `stock_my_watchlist(uuid)`, returns up to 100 complete active watchlist entries, rejects >100 rather than silently truncating. Frontend `GET /stocks/watchlist/export` validates fields and integer-string prices, quotes CSV cells and neutralizes formula injection; private headers, UTF-8 BOM and keyboard-accessible link. Android `GET /app-api/v1/stocks/watchlist/export` forwards the cookie, exact integer strings and noindex/no-store headers. No schema or financial write changes.
- Distinct from C's unmerged #1308 watchlist persistence and A's unmerged #1346 portfolio CSV. No other worker branch modified.

## RED/GREEN and full gate evidence
- RED: 2 backend failures (missing method), frontend route import failure; SEO metadata test failed before fix. GREEN: backend 2/2, frontend/Android/SEO 15/15 on implementation checkpoint.
- Full suite (pre-final-document SHA): backend **1,315 PASS / 398 SKIPPED**; database **15 PASS / 3 SKIPPED**; contract **38 PASS**; frontend **1,401 PASS / 6 FAIL** (SEO 3, login a11y 1, registration link 1, admin M2 telemetry 1). The 6 failures remain **BLOCKING**, not ignored.
- Typecheck **PASS**; lint **PASS with 0 errors / 1,128 warnings**. Initial Turbopack build failed due to a worktree-only `node_modules` symlink outside filesystem root; after an offline `pnpm install` inside this worktree, standard `pnpm build` **PASS** (Next.js 16.4.2). No global dependency changes.
- `pnpm audit --prod`: **FAIL (High 2)**; full `pnpm audit`: **FAIL (Critical 2 / High 10)**; bot `npm audit`: **FAIL (Critical 1 / High 5)**. No security PASS claim.
- Real isolated PostgreSQL 17.11 `wdmv_v761_test_acl`, 281 applied migrations: transaction inserted one temporary watchlist record; as `moneyverse_app`, owner lookup **1**, other-user lookup **0**, integer-string precision **PASS**, direct watchlist table SELECT **DENIED**, ledger INSERT **DENIED**; `ROLLBACK` and zero remaining fixture rows. **No Production DB writes.**
- Official Test `/api/version` `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` and Production `/api/version` `6a989b5ac0c6155587d43426d64f6def6b62c917`, both different from candidate. Official exact-SHA authenticated login/DB/finance E2E **BLOCKED**; no Test/Production promotion.

## Branch / PR / infrastructure safety
- Audit snapshot: 215 remote branches (214 non-main); all 214 non-main refs had commits absent from main, zero duplicate tips or trees; no safe deletion. 210 open PRs before this PR; 208 drafts. Known conflicting PRs #1107, #1110 and #1143 remain untouched. No unique unmerged work discarded.
- Debian 13.6 connected; backend/frontend/bot/nginx/docker active. Root filesystem 99% (1.6 GiB available), data volume 69%: operational capacity risk. No cleanup of other workers' worktrees.
- Rollback: no production changes to roll back. If ever merged, revert this feature commit and keep the prior release image; verify GitOps rollback image availability before release.
- Final exact SHA and final rerun status are recorded in the PR and worklog. **Do not merge on focused PASS or build-only CI.**
