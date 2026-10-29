# Member support status filter — A1925

## Contract
Authenticated and consented members may filter their own recent administrator support conversations by `open`, `waiting_user`, or `resolved`. Missing `status` preserves the existing most-recent 50 behavior. A selected status examines the last 100 actor-owned threads in PostgreSQL and returns at most 50 matching rows, without fetching any other member's data. Invalid or duplicate status values fail HTTP 400 before DB access. Web selection must retain the filter, avoid opening a thread outside the filtered list, and expose an accessible filter control. Android app-api forwards status without public caching, including error responses. No migration is needed: existing `support_my_threads(actor,limit)` is a `SECURITY DEFINER` owner-filtered function.

## TDD steps
1. Add backend controller and repository tests: RED invalid status, SQL actor-scoped filter and limit.
2. Add web status filter tests: RED selected status forwarded and query preserved; no out-of-filter message read.
3. Add Android gateway tests: RED forwarded status and no-store on success/error.
4. Implement minimal backend repository/controller, web UI, app gateway cache fence.
5. Run focused tests, lint, typecheck, build, all unit tests, isolated PG ACL and CI; record exact SHA and blockers. Do not merge without official Test exact-SHA and release gates.
