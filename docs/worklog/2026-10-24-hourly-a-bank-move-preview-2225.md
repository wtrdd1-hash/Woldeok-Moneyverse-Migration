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
