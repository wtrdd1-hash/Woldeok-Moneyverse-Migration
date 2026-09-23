# Board command idempotency — v2026.09.23.401

- Removed server-generated idempotency-key fallbacks from board post create/update and comment create service boundaries.
- Caller-owned UUID keys are now required consistently at both the validated HTTP DTO and service boundary.
- Added regression coverage proving missing keys fail closed before repository mutation.
- No schema, migration, privilege, ledger, session, or authorization semantics changed.
