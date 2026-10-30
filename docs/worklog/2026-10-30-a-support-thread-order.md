# Development A — owner-private support conversation ordering

## Before work — 2026-10-30 18:31 KST
- Base `origin/main`: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` (verified remotely).
- 27 remote branches, 26 open PRs at inspection; no destructive cleanup, protect unique changes.
- Read `AGENTS.md`, `README.md`, canonical `docs/planning/PROJECT_PLAN.md` and Korean counterpart, latest Development A QA and worklog, PRs and CI. Separate task worktree.
- Scope: P1 owner-private support conversation ordering (newest default; oldest within newest 100 only), combined with existing status and literal subject filters; Next.js + NestJS + PostgreSQL SECURITY DEFINER read + Android app-api. No new migration, no balance mutation.
- Safety: reject invalid/duplicate sort query, preserve default behavior and owner function, fail closed for malformed Android oldest-first results, private no-store/noindex. Do not claim historical all-time oldest.
- Release: feature candidate only; full CI and official Test exact SHA required, Production HOLD until all release gates PASS.

## In progress — 2026-10-30 18:33 KST
- RED: backend 3 expected failures, frontend 2 expected failures; then GREEN targeted backend 10 PASS, frontend/Android 8 PASS.
- Isolated PostgreSQL 17.11 successfully applied 305 migrations. The first real DB run exposed an unused `$2` SQL parameter in the oldest-first query (`42P18`); correcting query to pass the bounded limit as `$2`, with no migration change.
- Remote main rechecked unchanged `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`. No operations on other worktrees or deployments.

- [x] RED tests: API, owner-scoped SQL, web, Android gateway.
- [x] GREEN minimal implementation.
- [x] Regression, typecheck, lint, build, isolated PostgreSQL, CI; full CI fails and remains HOLD.
- [x] Recheck main/plan and record branch/SHA/Test/Production/rollback evidence.

## Finished — 2026-10-30 18:43 KST — code candidate, release HOLD
- Code head before this final log: `1a4caefa690687ed4f3d815e10fd63eea42a4f71`. Final docs commit SHA is recorded in the PR and host report. No changes to `origin/main` (`9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`), applied migrations, ledger or deployed stacks.
- Scope: owner-scoped PostgreSQL function `support_my_threads(actor,100)`, Nest optional `sort=oldest` (duplicate/invalid rejected), Next.js form/link/a11y, Android gateway verified ascending response or 503; newest default preserved. 50-row cap; oldest only among newest 100, never all-time. No migration and no direct table grant.
- TDD: backend RED 3, frontend RED 2, then targeted backend **10 PASS** and frontend/Android **9 PASS** at code head. Isolated PostgreSQL 17.11 **305 migrations applied**, 1 owner/stranger/ACL test PASS, synthetic transaction ROLLBACK, dedicated container removed. Initial DB query failed because `$2` was unbound; repaired and retested.
- Local gates: contract build PASS; typecheck PASS; lint **0 errors / 1043 warnings**; backend build PASS; frontend production build PASS (a concurrent duplicate attempt failed on build lock, then the primary build exited 0); mobile API contract **183 endpoints PASS**; Prettier changed-test files PASS; database unit **56 PASS / 4 SKIP**; security/release **20 PASS**.
- Full suites **FAIL**: backend **2566 PASS / 119 FAIL / 496 SKIP**, frontend **2610 PASS / 53 FAIL**. Failure names identical to the previous A candidate logs (119/53); not independently proven clean on current main. Exact-SHA GitHub runtime CI FAIL on first code head; later head checks pending at this checkpoint. Never interpret policy CI PASS as release certification.
- Read-only official Test `/frontend-version` = `c2129625aa6629c616fb31ce790950618b8d92b2`, Production = `94d38f47603e99aabc42fc8f292b89441afb9663`, neither candidate. Test `/api/treasury/overview` HTTP 200 while Production HTTP 503; official exact-SHA authenticated Test E2E, independent backup restore and GitOps promotion not certified.
- Branch audit: 27 remote branches/26 open PRs at start, 28 remote branches/27 open PRs after this PR; 27 non-main branches with unique commits, none safe to delete. No merge, deletion, force close, Production/Test deployment, service restart, operational DB changes or rollback. PR #2026 remains DRAFT/HOLD.
- Rollback if needed: remove optional sort parameter or revert the isolated feature PR; no persistent state changes to reverse. Production promotion is prohibited until full CI, exact-SHA official Test, auth/DB/privacy/E2E and GitOps gates PASS.
