# v2026.09.22.347 — Safety emergency action step-up

## English canonical
- Require recent reauthentication for administrator emergency-content takedown actions.
- Preserve existing session, consent, admin-session, CSRF, operator DB actor-check, and API contracts.
- Add a controller metadata regression test so the sensitive-action boundary cannot silently lose step-up authentication.

## Validation
- Focused Vitest: 1/1 passed.
- Backend TypeScript typecheck passed.
- `git diff --check` passed.
