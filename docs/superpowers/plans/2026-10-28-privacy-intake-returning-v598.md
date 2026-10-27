# Privacy request first-create SQL binding — B v598
## Bounded design and acceptance
Issue #1625 reproduces SQLSTATE 42702 from unqualified INSERT RETURNING in migration 015. Preserve the immutable applied migration and existing API/session authorization. Introduce only a forward-only replacement for the SECURITY DEFINER function, numbered 286 to follow QA PR #1610's 285; do not modify live/shared DB. Fix the alias at the INSERT target, retain owner/account locking, payload-bound replay, redacted audit, and app-only EXECUTE.
## Steps
1. Write regression test asserting explicit target alias and grants, observe RED on main.
2. Reproduce migration 015 first-create 42702 on disposable isolated PostgreSQL 17.
3. Add migration 286 replacing only the function, no table changes or new direct grants.
4. Verify first create, identical and conflicting replay, two users, inactive account, app-role table denial and 20 concurrent same-key retries on isolated PG.
5. Run focused/full tests, lint, typecheck, build, security audit and remote CI; preserve Draft+hold until all gates and official Test exact-SHA pass.
## Integration risks
Main has duplicate migration 283 and QA PR #1610 proposes 285. Merge only after 283 lineage resolution and immutable applied checksums. Closed C PR #1064 addressed the same defect with conflicting migration 280; do not cherry-pick its applied-file number. No Test/Production mutation authorized.
