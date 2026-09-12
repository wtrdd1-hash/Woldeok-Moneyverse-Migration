# 2026-09-12 — Trusted client IP security fix

Update version: `2026.09.12-10`

## Finding

`requestClientKey` preferred `CF-Connecting-IP`, but when that header was absent it trusted the first `X-Forwarded-For` entry under the same deployment switch. The frontend also relayed `X-Forwarded-For` to the internal API. This violated the planning requirement that the stored origin IP be resolved from a trusted proxy chain.

## Implementation order

1. Re-read the current V2 specification and implementation plan.
2. Isolate the change in `fix/trusted-client-ip-v2026.09.12.10` from `origin/main` using a separate worktree.
3. Remove `X-Forwarded-For` from backend identity resolution.
4. Validate trusted edge and socket values with Node `net.isIP`.
5. Stop relaying `X-Forwarded-For` through both frontend internal API paths.
6. Update security tests and run focused verification.
7. Push the candidate, run CI/test-candidate, deploy exact SHA to staging, verify backend behavior, then and only then promote Production.

## Rollback

Revert the exact application commit and promote the previously verified immutable image SHA through the normal GitOps flow. No database rollback is required because this change does not modify schema or stored rows.
