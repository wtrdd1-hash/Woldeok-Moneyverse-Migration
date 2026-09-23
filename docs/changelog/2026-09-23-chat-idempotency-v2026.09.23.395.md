# v2026.09.23.395 — Chat message idempotency

- `POST /api/v1/chat/conversations/:id/messages` now requires a caller-owned UUID `idempotencyKey`.
- Removed server-side UUID fallback so a timeout retry cannot silently become a second message command.
- Existing web chat already sends a generated UUID for each message submission, so the normal user flow is unchanged.
- Added DTO contract regression coverage for missing, malformed, and valid UUID keys.
- No database schema, migration, privilege, or ledger behavior changed.
