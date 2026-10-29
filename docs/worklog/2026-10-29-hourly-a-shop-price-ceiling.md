# 2026-10-29 A0025 — Verified WLD price ceiling for shop catalogue (candidate / HOLD)

## Scope and authority

- Source: fresh `origin/main` `35971c600f25869c96f1c666d4b9f58927202730`; separate `auto/hourly-a-shop-price-ceiling-20261029-0025` worktree. Read `AGENTS.md`, `README.md`, both `PROJECT_PLAN` languages, both integrated planning masters, prior QA and all open PRs. The English documents remain canonical; Korean is the second language. Existing shop-category, stock, price-order, and in-stock PRs are unmerged and preserved.
- P1: members and visitors can submit an optional **canonical nonnegative 64-bit WLD maximum price** on `/shop`, combined with existing keyword search. `GET /api/v1/shop/catalog`, `/shop/public-catalog` and legacy `/shop/items` validate `maxPrice` before their existing SQL read. A repeated, negative, decimal, exponent, noncanonical, or out-of-range ceiling returns 400. Filtering is over the **server-authoritative PostgreSQL function output** using `BigInt`, not a client-owned price or `Number`.
- A filtered catalogue must not hide an existing member's VIP status. An unfiltered member catalogue read supplies entitlement when visible items are filtered. Android `/app-api/v1/shop/catalog?maxPrice=...` forwards the exact query, with `private, no-store` for member shop paths. Public catalog remains public. No new database functions, table grants, migrations, ledger writes, or idempotency behavior changes.
- Small-host build reliability: Next.js default 15 prerender workers aborted during 609-route generation (SIGABRT). Set `experimental.cpus=2`; exact source build then succeeded. This is a build-worker budget, not a runtime route or database change.

## RED / GREEN and verification

- RED: backend price/parser/controller tests failed before implementation; frontend query and Android cache tests failed; VIP regression and build-worker-budget test failed before fixes.
- GREEN: focused backend 20 PASS, frontend 35 PASS, worker-budget 1 PASS. Full tests and build are rerun on the final commit SHA; do not infer CI or Test success from this entry.
- Initial full local gates before worker fix: backend 1,959 PASS / 440 SKIP; frontend 1,881 PASS; database 46 PASS / 4 SKIP; lint 0 errors (1,099 existing warnings); typecheck PASS; Android API contract PASS; bot test PASS; root security audit 0 High/Critical (9 Moderate/3 Low); bot audit 0. Initial Next build failed at static generation (SIGABRT); after capping workers, the production build passed.
- Isolated PostgreSQL 17.11 synthetic fixture: `moneyverse_app` cannot `SELECT` the backing table; a SECURITY DEFINER function returns canonical bigint strings; the compiled filter preserves values above `Number.MAX_SAFE_INTEGER` and rejects overflow. This **does not** certify the full production schema, actual member ACL, or official Test authenticated E2E.

## P0 storage response and release gate

- Data disk was 99% full (~3.3 GiB free). Six **A-owned, ignored, untracked** old `.next` build caches were verified not to be referenced by active worktree processes and removed; no Git refs, tracked files, DB, Docker volumes, backups, or other developers' worktrees were removed. Free space rose to ~7.4 GiB (97% used), then ~6.1 GiB after this candidate build. Root disk remained ~95% used.
- QA v1352: historic member cash/ledger drift 18,000 WLD (18 of 19 accounts), application role UPDATE/DELETE on 235 tables, 3 PUBLIC bank-function grants, 5 migration checksum mismatches and 20 source unapplied migrations. No unsupported corrective finance writes.
- Official Test `/frontend-version` is `cfb13272beea53c4d8c20eff7f379b6f66343033`, not this candidate. Production reports a numeric build id, not a verifiable Git SHA. Exact-SHA Test auth/E2E, full-schema ACL, independent restore, and GitOps release gate remain BLOCKED. No main merge, Test/Production promotion, finance migration, rollback, or branch deletion. Existing 352 recovery refs and all unique unmerged commits must remain preserved.

## Integration and rollback

Draft PR only. Recheck latest main, planning and all PRs immediately before any integration; rerun full gates on the resulting exact SHA. Release is **HOLD** even if candidate CI passes. Rollback before merge is simply leaving the branch unmerged; after merge, revert the application change, with no data migration to reverse. Storage cleanup removed only reproducible build artifacts.
