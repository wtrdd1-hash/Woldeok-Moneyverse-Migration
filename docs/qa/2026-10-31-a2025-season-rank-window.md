# Development A QA — 2026-10-31 20:25 cycle — season rank windows

**Verdict: P1 CODE VERIFIED LOCALLY / RELEASE HOLD.** Branch `auto/hourly-a-20261031-2025-season-rank-limits`, source main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`, repaired code SHA `cadb1561fd83265e17be96319dd26050f8567015`. Draft PR #2198.

## Scope and integrity
- Member selects Top 3/10/20 event leaderboard. Existing session/consent guards and PostgreSQL `season_event_leaderboard(uuid,integer)` EXECUTE-only read are preserved. No migrations, financial ledger changes, idempotent writes, privileges, admin access or data mutations.
- Backend binds a strict server-side rank limit, Next.js preserves selected event and accessible rank controls, Android rejects duplicate/invalid query and malformed/extra/private HTTP 200 fields. Scores and entry counts remain exact decimal strings; Android response headers are private/no-store/noindex/no-referrer.
- TDD first RED 14 backend failures and 6 frontend failures; second strict-payload RED 4 failures. Final targeted 14 backend + 32 frontend/Android PASS.

## Fresh verification on repaired code SHA
- `pnpm lint`: PASS, 0 errors / 1,050 warnings.
- `pnpm typecheck`: PASS across contract/database/backend/frontend.
- `NODE_ENV=test pnpm test`: PASS — contract 41, database 62 PASS / 4 SKIP, backend 2,800 PASS / 501 SKIP, frontend 2,808 PASS / 0 FAIL. Skipped DB tests are not counted as passes.
- `NODE_OPTIONS=--max-old-space-size=3072 pnpm build`: PASS (Backend and Next.js). Earlier 1024MB build OOM is recorded as a failed first attempt, not a product compile failure.
- `pnpm audit --prod --audit-level=high`: PASS (no high/critical production advisories); `pnpm audit --audit-level=low`: FAIL — 13 pre-existing dependency advisories (10 moderate, 3 low). This remains a release gate finding.
- PostgreSQL 17.11 DEV read-only: 312 applied migrations; app function EXECUTE true; 0 active season events, so no DEV row-level sample. Independent network-none ephemeral PostgreSQL with canonical migration-037 function and 25 synthetic participants: Top 3=3, Top 10=10, Top 20=20; app direct table SELECT false, function EXECUTE true, read-only transaction ROLLBACK, container removed.
- **P0 DEV ACL FAIL:** `moneyverse_app` direct SELECT and DELETE true on `public.virtual_consumption_event_entries`. No shared DB mutation; Production ACL not verified. Issue #993 updated.

## Release and CI
- CI on first code SHA `e8d4945` failed because two newly added tests contained lossy numeric literals; repaired in `cadb1561`. Exact repaired-SHA CI and candidate workflow results are to be recorded separately when complete.
- Official Test and Production public version both `bc8cd8a6c654af0336f550643f23049a58ee1d16` (not main or candidate). Production service CWDs point to deleted v1515 paths; `/login` advertises `x-robots-tag: index, follow`. Issue #1984 updated. No exact candidate auth E2E, independent restore, Production ACL or finance release proof.
- QA v1420 FAILED/P0: Treasury/marketplace ledger provenance, DEV ACL, backup restore and production executable identity remain release blockers. No main merge, Test/Production deployment, service restart, financial or operational DB writes, or rollback occurred.
- Branch audit before repair: 121 remote heads, 120 non-main, 112 ahead-by-commit, 8 ancestors, 0 identical head SHAs; 106 open PRs (105 Draft), 8 conflicts. No branch deletion. Existing Draft #2121 overlaps season UI/controller/gateway files but implements separate cost sorting; preserve for future conflict reconciliation.

**Final release decision: HOLD.** Local PASS does not authorize merging or promotion. Recheck exact final SHA CI, candidate build, authenticated Test E2E, ACL, finance and independent restore before any release.
