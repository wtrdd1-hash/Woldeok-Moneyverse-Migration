# A2225 — owner-scoped bank movement preview (HOLD)

## Before work
- Debian 13.6 miniPC reachable; backend, frontend, MCP, Nginx, Docker active; root disk 94% full.
- Main `49788d09494fed3e463651945b83386e87dd47bc` fetched; read AGENTS, README, English/Korean project plans and latest open PRs. Main does not include recent Draft PR work.
- Existing `/bank/movements` writes via SECURITY DEFINER, while members cannot preview exact cash/bank balances after a movement. New read-only preview must not promise settlement.
- Isolation: new worktree and `auto/hourly-a-bank-move-preview-20261024-2225`; do not touch B/C/Gemini branches or migrations. No deletes.
- Plan: write failing service/API tests, implement owner-scoped read model and guarded GET, add web preview control and Android gateway regression, then validate and record exact SHA and release HOLD.
- Initial status: IN PROGRESS. Existing global frontend test/security failures and shared dev/production DB are release blockers; never promote without official Test exact-SHA evidence.

## In progress — RED phase
- Added owner-scoped preview tests before implementation (large exact WLD, insufficient funds, invalid input, no ledger writes, authenticated actor).
- Rechecked main SHA before implementation; no changes to applied migrations or existing PR branches.

## In progress — GREEN and security review
- TDD RED: 4/4 service tests failed before implementation because preview method was absent.
- GREEN: 5 service tests, 23 wallet HTTP route checks, 11 Android gateway tests passed; explicit owner binding, bigint overflow refusal, zero writes, cache forwarding and exact WLD strings covered.
- Backend and frontend typechecks PASS after fixing AmountInput's string callback; changed-file ESLint PASS; git diff --check PASS.
- Isolated real PostgreSQL `moneyverse-test-db` (`woldeok_moneyverse_ci`) read-only transaction as `moneyverse_app`: SELECT on account_balances YES, UPDATE NO, synthetic UUID joined account count 0, explicit ROLLBACK. No live account flow or write E2E claimed.
- Mid-work main fetch: `49788d09494fed3e463651945b83386e87dd47bc` unchanged. Other PRs and unmerged branches untouched; original migrations immutable.
- Preview is advisory only; execution still calls the existing ledger-backed idempotent POST, with authoritative balance revalidation.

## Finished — local feature implementation, release HOLD
- Implementation commit: f68b262e92059a3b3faf0655c04ccb5bddc27043; Draft PR #1185.
- Full backend 1320 PASS / 398 SKIPPED; frontend 1396 PASS / 5 FAIL; database 15 PASS / 3 SKIPPED; contract 38 PASS; bot 8 PASS.
- Full typecheck PASS; lint PASS (0 errors / 1137 warnings); API contract PASS (179 endpoints); backend build and Webpack build PASS; default Turbopack build FAIL (external symlink); audit FAIL (26 vulnerabilities, Critical2/High10).
- CI #40098172885 and Test Candidate #40098169890 FAILED at runtime-check on implementation SHA. No official Test authenticated financial E2E.
- Main unchanged on final fetch. Existing QA #1114, SEO #1099 and dependency #1097 PRs remain unmerged and protected; no duplicate repair committed.
- Final release reports: docs/releases/v2026.10.24.a2225.md and .ko.md.
- No main merge, no Test promotion, no Production deployment, no DB writes, no rollback, no branch deletion. All unmerged unique changes preserved.
- Release decision: PARTIAL / BLOCKED — Production RELEASE HOLD. Feature code implemented; required release gates not passed.
