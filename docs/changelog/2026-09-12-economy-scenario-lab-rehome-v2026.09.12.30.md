# v2026.09.12.30 — Economy Scenario Lab re-home

- Re-homed the existing Economy Scenario Lab runtime slice onto current `main` without replaying stale planning history.
- Backend: restores the read-only scenario projection helper, validation tests, and administrator preview API.
- Frontend: restores `/admin/economy/scenario-lab` plus the Economy Operations entry point.
- Precision: authoritative WLD values remain integer strings and projections use `BigInt`.
- Safety: no database migration, ledger/balance mutation, policy write, recommendation engine, or automatic policy application was added.
- Base main at re-home start: `8b6666f46a2b56cd261604c322d116f0e004cfe2`.
- Candidate branch: `integrate/economy-scenario-lab-v2026.09.12.30`.
- Production remains blocked until CI and exact-SHA isolated Test validation succeed.
