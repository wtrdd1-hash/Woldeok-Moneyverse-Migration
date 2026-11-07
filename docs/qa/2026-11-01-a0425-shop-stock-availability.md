# Development A — Stock Availability QA (2026-11-01 04:25 KST)

**Verdict:** P1 code implemented and locally verified; **RELEASE HOLD**. English is authoritative; [Korean parity](2026-11-01-a0425-shop-stock-availability.ko.md).

## Source and isolation
- Fresh `origin/main` at start, midpoint and pre-release review: `f13bbce273ffc65e8576170992d82ea00c27a1c9`. Isolated branch `auto/hourly-a-20261101-0425-stock-availability`, dedicated worktree. No changes to the original main checkout or any other worktree.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, both integrated masters, prior QA/worklogs, open PRs and release guide. Prior A/B/C/planning/QA branches remain protected.
- Start remote branches: 32. At 04:51: 35 remote heads, 32 open PRs; 35 remote non-main tracking refs audited, 34 not ancestors of main and one ancestor. Concurrent changes account for other additions; no deletion or merge performed. Open PR merge states: 18 CLEAN, 11 BEHIND, 3 BLOCKED. CLEAN does not constitute release approval.

## Product and database
- **Before:** `stockCatalogApiPath('available')` emitted `?stock=available`, but Nest ignored the parameter. A stale backend could return sold-out rows with HTTP 200 to web and Android.
- **After:** both public/member Nest catalogue handlers validate and apply the exact selector after the existing `shop_catalog_list_v2(actor)` database read; zero quantity is excluded, NULL unlimited stock retained, malformed/duplicate selectors rejected. The member web page has an accessible stock checkbox and preserves search/holdings links; web and Android reject unverified filtered HTTP 200 payloads rather than displaying fabricated availability. Android member catalogue responses are private/no-store, noindex and no-referrer.
- **Real PostgreSQL 17.11, read-only:** `SET LOCAL ROLE moneyverse_app`; function callable; 146 public rows (143 unlimited, 3 finite positive, zero sold-out) and 146 rows for a synthetic UUID. `ROLLBACK`; no row, ledger, permission or migration mutations. This data does not prove a positive sold-out fixture; regression tests exercise quantity=0.
- **P0 ACL FAIL (development only):** app role has direct SELECT/UPDATE on `public.shop_catalog` and UPDATE on `public.account_balances`. This violates least privilege and remains an independent release blocker. Do not extrapolate to Production without inspection.

## TDD and verification
- RED: backend 3 failing stock binding/handler tests; frontend 4 failing stock gateway/page tests; 1 failing holdings-link test; later 1 failing stale-web-200 test. GREEN: backend target 13 PASS; frontend targeted 9 PASS.
- Full `pnpm test` exit **0**: API contract artifacts match; contract 41 PASS; database unit 62 PASS / 4 SKIP; backend 2,953 PASS / 517 SKIP; frontend 2,908 PASS. Skipped DB integration cases are not PASS.
- Full `pnpm typecheck` exit 0; full `pnpm lint` exit 0 (0 errors, 1,022 existing warnings); full `pnpm build` exit 0 (backend, frontend, workspace); `pnpm audit --prod --audit-level=high` exit 0 (no known vulnerabilities); `git diff --check` exit 0.
- No authenticated official Test exact-SHA E2E, independent backup restore or Production runtime provenance attestation. These are BLOCKED and **must not be inferred** from local tests, synthetic actor or CI.

## Release gate and branch protection
- Public Test `/api/version` and `/frontend-version`: `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate. Production backend: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; frontend version: timestamp `1793450413898`, not a verifiable SHA. Both `/health` endpoints return 200, but that is not exact-candidate proof.
- Exact candidate CI and image build must be rechecked at final SHA. No main merge, branch deletion, Test/Production deployment, service restart, DB write or rollback. Retain all unmerged and even ancestor branches because ownership and safe replacement are not established.
- Rollback plan if future release is authorized: preserve previous immutable runtime generation, revert traffic only through documented zero-downtime release gate, verify session continuity and exact source/build/DB identity. **Not executed.**
