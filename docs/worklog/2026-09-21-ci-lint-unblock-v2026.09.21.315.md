# CI lint unblock — v2026.09.21.315

## Scope
Development B release-blocker repair against main 67d2795af1ba587224be612ff95399efc06ead71.

## Changes
- Removed 31 ESLint errors blocking runtime exact-SHA gates without weakening CI policy.
- Preserved public prop contracts and marked intentionally unused values/imports explicitly.
- Replaced stock discussion any casts with bounded literal unions.
- No database migration, ledger mutation, authorization policy, or API contract changed.

## Verification
- pnpm lint: pass (0 errors; existing warnings only).
- pnpm typecheck: pass.
- pnpm build: pass.
- git diff --check: pass.

Real PostgreSQL, full tests, security checks, and exact-SHA isolated Test remain required before integration.
