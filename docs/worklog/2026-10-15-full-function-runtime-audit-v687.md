# Full code and runtime function audit — v2026.10.15.687

## Before work — 2026-10-15 17:05–17:12 KST
- Task: reanalyze current code; test the functionality and investigate runtime errors without changing member balances or production state.
- Authority: `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `.ko.md` (current planning authority v530; v675+ planning additions do not denote live acceptance), `PROJECT_PLAN`, `DOCS_INDEX.md`, `AGENTS.md`, `docs/RELEASING.md`, API catalogue and prior acceptance v605; use latest remote main.
- Start upstream `origin/main=69bc8c14`; shared local main is 63 commits behind; isolated task worktree and branch created, no editing shared worktree.
- Observed live aliases: Production `prod-v600`, Test `test-v618-7fa3f245bbc3`. All major service process indicators active; financial integrity and function-level checks NOT implied.
- Known independent blockers: existing unmerged draft treasury PRs #862/#865/#866, and SEO PR #867. Do not merge, promote, change DB/money/feature switches or migrate based on basic health checks.
- Audit contract: gather route/controller/source inventory; isolated static/unit tests; read-only HTTP and DB contract checks; capture failures and skipped cases; compare source with deployed SHA. Operator/member authenticated flows and financial mutation tests require segregated Test and authorization.
- Checklist: [x] documentation orientation [x] isolation [ ] inventory [ ] test [ ] runtime evidence [ ] interim upstream check [ ] final report/PR.
## In progress — checkpoint 1, 2026-10-15 17:13 KST
- Mid-task refetch: origin/main remained 69bc8c14; task worktree remained clean, no edits to shared main, Test, Production or DB.
- Inventory from tracked main: 4,245 files, 163 Next page components, 33 admin pages, 82 Nest controllers, 63 Next API handlers, 422 tests/specs, 270 SQL migrations. Counts alone do not establish function coverage.
- Isolated NODE_ENV=test suites: contract 31/31, DB package 7/7, backend 1,185 passed with 391 DB-dependent skipped; frontend 1,206 passed. pnpm typecheck passed. Frontend test stderr includes jsdom navigation and HTMLCanvasElement getContext unimplemented diagnostics, which are not independently functional pass evidence.
- Deployed runtime anonymous HTTP smoke (30 paths each, Host and X-Forwarded-Proto set appropriately): prod 3001, Test 3101, other local 3203 each 25x200 / 2x307 / 2x404 / 1x401. /business and /tools/compound-interest 404 (not yet proven to be advertised links); /bank and /support redirect guest to /login; account identities 401 for anonymous (expected authorization). Initial all-308 attempt had incorrect Host/proto; it was discarded and retested correctly.
- Both backend health endpoints port 3000 and 3100 HTTP 200. Guest stock API 200; guest viewer API 401. Journal error-token search for backend/frontend last 30m returned 0, not proof of no errors or authenticated E2E.
- Read-only DEV DB SELECT: public 241 tables, 266 applied migrations, 831 transactions, 1,692 postings, 0 unbalanced transactions and 0 no-posting transactions by direction/amount aggregate. Effective app DML on 237 public tables each INSERT/UPDATE/DELETE (P0 privilege exposure relative to planned database security boundary); applies to dev DB ONLY, not proof for Production. Never claim the valid sampled posting sums prove full production conservation.
- Existing draft Treasury PRs #862/#865/#866 report separate production fiscal-vault discrepancies/unsafe code; none is merged as release evidence. No real-money operations or production-schema changes.
- Next steps: build/contract/CI checks, target code risks, read-only production/runtime provenance, final assessment, bilingual report and PR.
## In progress — checkpoint 2, 2026-10-15 17:25 KST
- During the audit upstream main advanced from 69bc8c14 to 69463989 through SEO #867. Reviewed the changed SEO files and newer integrated master; merged the remote main into this audit-only branch (60b164c8), without editing main or Treasury drafts.
- Latest-merge targeted SEO: backend 20/20, frontend 14/14. Latest tree typecheck passed. Bot dependencies installed offline in isolated worktree; 4/4 bot tests passed, but separate SponsorBlock QA script fails syntax at line 7. pnpm lint exits 0 with 1,089 warnings.
- Additional static risk confirmed: unqualified RECONCILED/0 Treasury status, PvP wager direct account_balances updates outside a unit-of-work transaction and Math.random/parseFloat, fabricated credit scoring profile/Number balance precision. Dev DB PUBLIC can EXECUTE 11 SECURITY DEFINER functions. No runtime balance movement used to prove this.
- Findings EN/KO and internal/GitHub updates prepared; release still blocked.

## Finished — 2026-10-15 KST
- Diagnostic/documentation work completed on dedicated branch. Full code acceptance **NOT completed**: production or authenticated transactional E2E cannot be claimed; 391 database tests skipped; Test not exact main SHA; no complete browser binary/mobile runtime or signed-in continuity proof. High-risk finance issues remain open.
- Checklist: [x] documentation [x] isolation [x] source/route inventory [x] baseline isolated suites [x] anonymous runtime + DEV SQL read-only [x] upstream recheck and merge [x] post-merge targeted checks [x] defect register & bilingual updates [ ] exact-SHA restored DB/auth/browser/full-function gates [ ] safe Production promotion.
- No changes to Production/Test deployments, money, databases, feature switches or shared development worktrees. Final branch/PR and push references recorded with final commit.
