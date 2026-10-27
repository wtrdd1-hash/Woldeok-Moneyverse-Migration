# v2026.10.27.2 — Market-event recent authentication recovery

**Type:** bugfix / security-contract and copy alignment. **Source:** #1515.

- Server action failures expose a typed recent-reauthentication code, while generic 401/session expiry retains its existing semantics.
- Publish and end market-event actions display a direct account security link only on an actual recent-reauthentication refusal. Users keep their draft in the original tab.
- Retired TOTP instructions in treasury, audit and the Korean planning ledger have been corrected; backend recent-reauthentication guard and DB-level operator enforcement are unchanged.
- Scope excludes schema migrations and actual market-event execution.
- QA/CI/Test/Production acceptance: see `docs/worklog/2026-10-27-admin-market-reauth-guidance-v2026.10.27.2.md`.
