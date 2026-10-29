# Release decision — A0325 support search: HOLD

The member support search candidate is **not approved for main merge or production**. Targeted backend/web/Android and isolated PostgreSQL checks passed, but whole-repo lint, backend/full frontend tests, generated mobile contract and official Test exact-SHA E2E did not pass. The prior Treasury/Frontend version P0 and backup/financial integrity gates remain unresolved. No DB migration, financial mutation, operational deployment or rollback occurred. Revert the code-only candidate to roll back if necessary; keep other agents' branches intact.
