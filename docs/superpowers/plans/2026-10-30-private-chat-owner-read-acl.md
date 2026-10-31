# Private Chat Owner-Scoped Read Recovery — implementation plan

**Status:** implemented as candidate only; release HOLD. **Issue:** #2053. **Owner:** Backend B v668.

## Problem and constraints
Clean PostgreSQL migration 220 revokes direct SELECT on private chat tables, but Nest repository still queried those tables. Read endpoints fail with app role. No broad GRANT; no edits to applied migrations; no user data migration; no WLD writes. Frontend C v1203 separately handles read errors as unavailable.

## Implementation sequence
1. Isolate from fresh origin/main; read AGENTS, EN/KO plans, QA and competing PRs.
2. Write failing repository tests for owner-scoped functions, denied raw table access, exact bigint cursor, and 403 mapping.
3. Add forward-only migration 313 with owner-scoped conversation, message, unread and archive functions. Bind actor to participant state, validate limit/cursor, use SECURITY DEFINER and restricted search_path, revoke raw table privileges, grant only EXECUTE to moneyverse_app.
4. Switch repository read and archive queries to functions, preserve response fields and cursor precision; map 42501 to HTTP 403 in service.
5. Run focused tests, apply 001 + all migrations 002..313 on isolated PostgreSQL 17.11, verify owner/outsider and app role. Run lint/typecheck/build, contract, security and full tests; record failures without claiming release.
6. Commit to independent branch, push Draft/HOLD PR, link C handoff. Do not merge or deploy until full gates, exact-SHA Test and provenance pass.

## Rollback
No rollback migration for applied SQL. Candidate can be withheld. Operational rollback is application release rollback after verified compatibility; do not revoke existing functions or mutate production data.
