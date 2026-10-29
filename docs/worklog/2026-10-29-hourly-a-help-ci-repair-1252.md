# 2026-10-29 12:52 KST — A verified-help CI fixture repair (HOLD)

## Failure reproduction
- Parent feature: Draft PR #1833, source SHA `aade0c0907e11877f657ca649af5d1d276a06467`.
- GitHub runtime CI #40813840213 **FAILED** and candidate #40813817855 **FAILED**, because the isolated CI PostgreSQL service applied migrations but never loaded the synthetic help fixture. The original database test assumed the fixture had already been inserted and expected one approved English article; it actually received an empty result. This is a deterministic test setup failure, not evidence of an application fallback failure.
- The original Draft PR and all co-worker branches remain untouched.

## Repair
- Created new `auto/hourly-a-repair-help-ci-20261029-1252` worktree from exact main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`, cherry-picked the original feature and repaired only the isolated PostgreSQL test harness.
- The fixture is loaded inside a transaction using the schema-owner connection, then `SET LOCAL ROLE moneyverse_app` verifies real application privileges and the approved-only search function. The transaction is always rolled back; the fixture never persists.
- Fixture writes are disabled unless both DB URLs are loopback and the database is the disposable CI name, plus explicit GitHub Actions or isolated-test opt-in. No live DEV/Test/Production data is changed.
- No migration, finance ledger, app grants, feature flag or application source changes.

## Evidence and remaining gates
- Recreated a fresh PostgreSQL 17.11 disposable Docker database and applied 293 immutable migrations through 294; the three isolated real-PostgreSQL assertions passed, and help article count remained zero after rollback.
- `pnpm typecheck`, `pnpm lint` (0 errors; 1,091 existing warnings), `pnpm test` (backend 1,961 pass/443 skipped without DB env, frontend 1,918 pass), `pnpm build`, `pnpm audit --prod --audit-level=high` (0 high/critical, 1 moderate) passed locally.
- Full CI with real database and candidate image build require fresh exact repair SHA GitHub runs. Official Test authenticated E2E, financial provenance, 5 migration checksum mismatches and independent off-host restore remain blocked. Do not merge or promote.
- Original #1833 must not be closed or its branch deleted merely because this repair PR exists; any supersession requires exact-code and owner review.
