# Development A v2026.10.23.2325 — Private P2P Recipient Search (DRAFT / HOLD)

## Scope and source of truth
- Debian 13.6 miniPC directly checked; Backend, Frontend, Discord Bot, MCP, Nginx and Docker active. Development PostgreSQL connected. No production data read or mutation.
- Starting and mid-run remote `main`: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` (rechecked before code and before integration). English `AGENTS.md`, `README.md`, `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, `INTEGRATED_PLANNING_MASTER.md`, current worklogs and PR/CI inspected.
- Isolated Worktree `/home/debian/worktrees/mv-a-recipient-search-2325` on `auto/hourly-a-recipient-search-privacy-20261023-2325`, created directly from current main. Shared main Worktree and other agents' Worktrees untouched.
- Priority: P1 wallet recipient-search privacy, separate from Draft #1023/#1026 wallet retry, B's database and C's application features. Real development DB shows 8 active member profiles matched by unescaped `%_` wildcard; literal escaped `%_` matches 0. No names/identities exported.

## TDD and changes
- RED before code: backend repository tests 3 FAIL/1 PASS, frontend BFF tests 3 FAIL; backend HTTP private cache test 1 FAIL.
- GREEN: backend `searchRecipients` bounds trimmed Unicode input to 2..40 code points, escapes SQL LIKE `%`, `_`, `\` with `ESCAPE chr(92)`, binds owner UUID, retains active users, excludes self, stable ordering and `LIMIT 10`.
- Next BFF `/api/transfers/search` mirrors bounds and sets `Cache-Control: private, no-store` for signed-in, signed-out and empty-result paths.
- Nest wallet search response adds `Cache-Control: private, no-store`, inherited by Android app-api proxy. New app-api regression proves cookie and literal query forwarding and private upstream cache propagation.
- No migration, SQL grant, money write, ledger edit, new route, new dependency or mobile application binary change. Existing Android app-api route is reused.

## Local evidence
- Focused RED/GREEN: backend 5 PASS (4 repository + 1 Nest HTTP); frontend 4 PASS (3 BFF + 1 app-api).
- Fresh full `pnpm test`: database package 15 PASS / 3 SKIP; backend 1,318 PASS / 398 SKIP; frontend 1,388 PASS. `pnpm typecheck` PASS. `pnpm build` PASS. Changed-file ESLint 0 errors / 0 warnings. `git diff --check` PASS.
- Full `pnpm lint` FAIL in unchanged `frontend/src/app/wallet/export-ledger-csv.tsx:19` (`no-control-regex`); QA Draft #1021 owns overlapping repair. `pnpm audit --prod --audit-level=high` FAIL: Next.js 16.3.8, 2 critical + 1 high advisories. Do not suppress.
- Read-only PostgreSQL: 877 ledger transactions, 1,784 postings, 0 unbalanced and 0 under-two-posting transactions; 241 public tables, app INSERT 235 and UPDATE 235. App-role privilege P0 unresolved; no production DB assertion. Actual app-role negative security tests and authenticated Test E2E not executed.

## Branch/PR/CI and preservation
- Start remote branches 11 (main + 10 non-main); before push still 11. Every one of 10 non-main remote branches has unique commits compared with main (9 ahead, 1 divergent). Zero deleted. Open PRs before new PR: 10; #1021 QA, #1023/#1026 A, #1024/#1031 B, #1027/#1030/#1032 C, #1028/#1033 planning; draft/unique changes retained. CI failures on C/B runtime and QA lint; #1026 CI/Test Candidate PASS but draft/stacked and not a production release approval.
- Current branch is an isolated new feature; no repair of another owner's PR or destructive cleanup. GitHub PR is Draft only pending complete gates.

## Release and rollback decision
- Official Test exact SHA, authenticated web/Android user flow, real app-role SQL negative tests, CI security and full lint, backup/restore, GitOps production release gate, smoke/login/version/DB are **BLOCKED/NOT RUN**.
- Main merge **NO**; Test promotion **NO**; Production deployment **NO**; DB migrations **NO**; branches deleted **0**. No production rollback needed; reverting the new branch's commits would remove only this privacy candidate.
- **PRODUCTION RELEASE HOLD**: unrelated global lint, vulnerable Next.js dependencies, DB app-role direct writes and missing official Test/Production gates. Do not claim full feature release.
