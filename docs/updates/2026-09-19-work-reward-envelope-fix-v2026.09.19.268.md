# Work reward economic-command CI fix — v2026.09.19.268

## English (canonical)
Fixes the P0 `ECON-233-02` work-reward economic-command candidate after exact-head CI exposed an invalid schema qualification for the `pgcrypto` `digest` function. Migration 210 now calls the extension function through the repository's established `public.digest(...)` contract while keeping the `SECURITY DEFINER` function search path restricted and explicit.

The behavioral contract is unchanged: work reward settlement claims one immutable economic command, delegates to the authoritative work policy in the same transaction, completes the command with the settled result, and returns the persisted result on replay without a second mutation.

Release evidence required for this version: lint, typecheck, build, full tests against real PostgreSQL, exact-SHA CI, isolated Test deployment/backend health, then zero-intermediate Production promotion. Database data and secrets remain excluded from Git.
