# Photo upload step-up — v2026.09.22.333

## Status
Completed locally; CI and deployment pending.

## Scope
The administrator private image-byte upload endpoint mutated private storage while requiring an admin session and CSRF protection, but did not require recent reauthentication. Added `ReauthGuard` without changing the API contract, operator-role check, storage validation, or database/ledger paths.

## Verification
- Focused Vitest regression for controller guard metadata.
- Backend TypeScript typecheck.
- `git diff --check`.
