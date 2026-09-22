# v2026.09.23.381 — Stock operator idempotency contract

Required caller-owned UUID idempotency keys on manual stock price changes, market-event publication, and corporate actions. The existing admin frontend already supplies a fresh key for each submission, so the user flow is unchanged while retries can no longer silently receive a server-generated key. Added DTO validation regression coverage. No schema, migration, privilege, or ledger mutation changed.
