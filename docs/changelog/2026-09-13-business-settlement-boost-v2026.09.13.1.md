# v2026.09.13.1 — Business Settlement Boost runtime re-home

- Re-homed the confirmed Business Settlement V2 boost runtime fix onto current `main` without replaying stale branch history.
- Added forward migration `179-business-settlement-v2-boost-runtime-fix.sql`; applied migration 178 remains immutable.
- Fixed the active-boost path by using valid `COALESCE(...)` syntax while preserving idempotency, ownership, daily-settlement, ledger, and event invariants.
- Restored real-PostgreSQL regression coverage for active, partial, and expired boosts.
- Added a migration test that rejects schema-qualified PostgreSQL SQL constructs outside explicit immutable legacy files.
- Base main: `04ca71e95a5d1e63b0a7ef834aa5bd1ecbdef827`; branch: `integrate/business-settlement-boost-v2026.09.13.1`.
- Production remains blocked until CI and exact-SHA isolated Test validation pass.
