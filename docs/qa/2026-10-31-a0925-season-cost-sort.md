# A 09:25 — Member Season Event Cost Ordering — QA Evidence

## Scope and provenance
- Branch: `auto/hourly-a-20261031-0925-season-cost-sort`; baseline main `761a55a094fb9dd383d213e817305e68c79fa23c` checked before, mid, and pre-PR.
- Read-only season event discovery: authenticated/consented Nest GET with `sort=cost_asc|cost_desc`; default SQL order unchanged; web accessible links; Android app-api rejects ambiguous query and unverified 200 order. `cost_wld` stays canonical integer string and BigInt comparator; stable original order for ties.
- Database: reuse `public.season_active_events()` from migration 037 with `SECURITY DEFINER` and existing `moneyverse_app` EXECUTE. No new SQL, table grants, finance mutations or idempotency changes.

## Reproduced RED and GREEN
- RED: backend 3 failures, frontend 2 failures (after offline dependency installation). GREEN: backend 3/3, frontend utility + Android 4/4, web server-page 2/2. Initial page-test mock leakage fixed in the test itself; final 2/2.
- Workspace typecheck PASS; backend build PASS after building the contract first; changed-file ESLint 0 errors. Full lint and full tests were retried separately after the first run was interrupted by remote worktree cleanup and concurrent timeouts; see final gate status below.

## Isolated real PostgreSQL 17
- Fresh ephemeral PostgreSQL 17-alpine with `--network none` and no published port. Applied 311 numbered SQL files (002 through 312) after core initialization.
- Synthetic three event rows cost 5/10/100 in an existing active season, inside a transaction; `moneyverse_app` function EXECUTE=true, direct table SELECT=false, returned exactly 3 rows and canonical amounts. ROLLBACK: synthetic rows 0, ledger postings 0. Container removed. No live DB read/write.
- Large integer precision 9007199254740992/9007199254740993 is proven in backend and Android regression tests, not in PostgreSQL seed: SQL `virtual_consumption_events_cost_wld_check` disallows such synthetic costs.

## Operational constraints
- Initial worktree under `/srv/moneyverse-data/worktrees/` was removed by an external cleanup while long-running tests were executing. The pushed commit was preserved; recovered the same branch into `/home/debian/moneyverse-a-20261031-0925-season-cost-sort`. No other branch modified or deleted by A.
- Official exact-SHA authenticated Test, full backup restore, GitOps release, smoke/login/version and Production DB checks are not performed. No evidence of their PASS. Production promotion is prohibited.
- Open PRs/branch inventory and unique commit audit are retained outside the repository in `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0925-season-event-cost-sort/`.

## Final gates
- Targeted: PASS (9/9). Real PostgreSQL targeted: PASS. Full lint, full unit/integration, local frontend build, exact SHA CI and candidate image: see final PR comment/worklog for authoritative results.
- Integration: HOLD until full required gates, exact-SHA authenticated Test, security/ACL, independent restore and GitOps release proof pass.

### Gate snapshot 09:46 KST
- Full ESLint: exit 0, 0 errors / 1,049 warnings. Security/policy script 41 PASS; API contract 184 endpoints verified; DB unit 62 PASS / 4 SKIP; backend full 2,781 PASS / 501 SKIP.
- Full `pnpm test`: exit 124 (190-second timeout) during frontend; **not PASS**. Local frontend build 52-second attempt exit 124; longer build and GitHub exact-SHA gates were still in progress. Do not infer PASS.
- Test public Treasury remains unsafe HTTP 200, Production 503; official Test SHA differs from candidate. GitHub issue #1917 and #1984 updated. Release HOLD.
