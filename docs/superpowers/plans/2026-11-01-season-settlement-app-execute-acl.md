# Season settlement app EXECUTE lockdown — implementation plan

**Goal:** Close the confirmed P0 SQL authorization gap (#2357) without modifying existing applied migrations, settlement data, or runtime services.

**Scope decision:** Migration 321 revokes EXECUTE from PUBLIC and moneyverse_app on public.season_settle_rewards(uuid). No new operator entrypoint or season lifecycle change is introduced; the existing v727 HTTP fail-closed PR #2358 remains a separate dependency. The migration deliberately does not redefine the function or alter settlement rows. An operator-safe implementation remains blocked until its deadline, audit, idempotency, and ledger contract is reviewed.

## TDD and implementation tasks

1. Create a Vitest source-level contract test for a forward-only migration 321 and forbidden PUBLIC/app grants. Run RED on the untouched main-derived branch.
2. Add an isolated PostgreSQL 17.11 integration harness that applies the entire current migration sequence and proves that moneyverse_app cannot execute the SQL function, while the migrator owner retains the intended ability. Prove RED before adding 321.
3. Write only the new migration, preserving existing function body, owner, schema, and historical checksums. Re-run focused tests and isolated PG; compare privilege and function metadata before/after.
4. Run repository lint/typecheck/build/test, security/app API/DB checks and official exact-SHA checks as available. Record failures and skips precisely. Re-fetch origin/main and both planning documents at mid-work and before any integration.
5. Open Draft/HOLD PR with evidence, link issue #2357, and do not merge/deploy unless all release gates pass. Leave A/C/QA/Gemini worktrees and all scheduled tasks untouched.

**Acceptance:** fresh isolated PG reports app EXECUTE=false, no PUBLIC EXECUTE, migrator owner intact, direct app invocation SQLSTATE 42501, and no DB financial mutation. This is an incremental DB boundary fix, not completion of the broader settlement lifecycle issue.
