# Hourly A — KDIC public read path hardening (2026-10-09)

Status: **UNVERIFIED CANDIDATE — DO NOT MERGE OR DEPLOY**.

- Base main: `aa4ae83e581cb2c8530971bf04db0b5c2473d616`. Work branch: `auto/hourly-a-kdic-public-snapshot-20261009-0325`.
- Branch audit: 33 remote non-main branches at start, 0 open PRs; 25 ancestry/identical cleanup candidates and 8 unique branches (A: 3, C: 5). Remote deletion pending: connector lacks delete-ref and all approved remote devices were offline. Preserve all unique work.
- Frontend: carry forward the fail-closed virtual-only KDIC page and regression test; use a same-origin Next BFF and reject non-string WLD amounts. Format exact BIGINT values without Number coercion.
- Backend: the public controller now reads a dedicated DB function, not the admin overview with recent payout/user information.
- Database: new immutable 266 migration creates a SECURITY DEFINER public-only JSON projection, restricts EXECUTE to moneyverse_app and revokes PUBLIC; BIGINT amounts are text. No direct table grants or applied migration edits.
- Tests added: repository boundary/precision, BFF unavailable/precision. **Not executed**: no online Debian/miniPC; local sandbox has no GitHub network, pnpm or PostgreSQL.
- Build/lint/typecheck/unit/integration/real PostgreSQL/security/accessibility/SEO/app-api/E2E/exact-SHA isolated Test: **BLOCKED, not PASS**. Migration syntax and privilege tests remain mandatory before merge.
- Main integration: not attempted. Test/Production: no deployment; rollback not required.
- Risk: existing admin KDIC financial mutation methods directly update tables/balances; they require a separate ledger-safe transactional redesign before any production use. Never infer this candidate fixes admin payout integrity.
- Next: run exact-HEAD CI with real PostgreSQL as moneyverse_app, verify PUBLIC EXECUTE denied, table access denied, large WLD round-trip, no PII, UI tests and release gates. Recheck main and plan before merge.
