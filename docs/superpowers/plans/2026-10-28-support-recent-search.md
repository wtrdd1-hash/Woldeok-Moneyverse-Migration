# Member support recent-subject search — bounded implementation plan

1. Add failing repository/controller tests for literal substring search, owner-bound function call, 100-row prefilter cap, invalid/overlong search rejection, and unchanged default 50.
2. Add failing frontend tests for query normalization, selection safety, search scope copy and preserving q in thread links; add Android gateway test for query passthrough and no-store.
3. Implement query-aware owner-only repository method and controller, web form and safe thread selection, and gateway cache fence. No new DB role grants or schema migration.
4. Verify RED→GREEN, focused and full backend/frontend tests, typecheck, lint, build, API contract, isolated PostgreSQL, security checks and exact-SHA official Test when available.
5. Re-fetch main and plans, audit PR/branch/CI, push Draft PR with evidence and HOLD if any gate fails; never deploy or remove unique branches.
