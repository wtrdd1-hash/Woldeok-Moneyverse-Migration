# Development A — Owner Wallet Activity Direction Filter (2026-10-30 05:03 KST)

**Status:** P1 targeted implementation verified; full release gates **FAIL / HOLD**. No main merge, Test promotion, Production deployment, live database mutation, or branch deletion.

## Source and isolation

- Canonical main at start/mid: `62c6cd038951d65c94b709302bdaec6e75b080b6`. Read `AGENTS.md`, `README.md`, both `docs/planning/PROJECT_PLAN*` and integrated masters, previous QA and open PRs.
- Branch `auto/hourly-a-wallet-direction-20261030-0503` from that main in an isolated worktree. Starting remote refs: 31 branches including main; 25 open PRs. Protected all other developer/QA/planning work.
- Scoped away from B auth/session/cache, C market/alerts, QA monetary input bounds #1940, and unmerged planning wallet bookmarks #1937. No new migration, grant, finance mutation, account status change or idempotency path.

## P1 user flow and security contract

- On `/wallet/activity`, authenticated members may select **all, incoming, outgoing, neutral** while retaining period (`all`, `7d`, `30d`) and 50-row signed cursor pagination. Changing direction resets the cursor; each page retains the chosen filters.
- `GET /api/v1/wallet/activity?period=30d&direction=out` rejects malformed and duplicate direction values with HTTP 400. Owner/session/period/direction are HMAC-bound before any SQL; legacy signed `all` cursors remain compatible.
- PostgreSQL groups only the authenticated owner's cash/bank ledger postings, computes exact signed numeric deltas, filters in `HAVING` **before** `LIMIT 51`, and returns WLD as integer strings. Neutral includes internal cash↔bank movements with zero net owner delta. No new SQL migration, direct DML grant, ledger write or finance policy changes.
- Android `/app-api/v1/wallet/activity` forwards the same query and forces `private, no-store` plus `noindex` even when the upstream is cacheable. Web route has private SEO metadata and accessible filter navigation.

## QA evidence (isolated MiniPC)

- RED → GREEN: new Nest repository/service/cursor/controller tests initially **3 FAIL**, Android/navigation tests **2 FAIL**; after implementation focused backend **8 PASS**, frontend **6 PASS**.
- HTTP authenticated-controller boundary **4 PASS**; page rendering/accessibility **2 PASS**; Android/SEO/route targeted suite **53 PASS**.
- Disposable PostgreSQL 17.11, **304/304 migrations applied**. Synthetic 70 owner transactions + 1 foreign; owner in/out/neutral counts **24/23/23**, no foreign rows, signed integer string `9007199254740993`, 51+20 keyset paging, 0 unbalanced fixture transactions, app role no direct ledger INSERT/UPDATE. Real-PG test **1 PASS**. Test fixture is synthetic; no production ledger claims.
- `pnpm typecheck` **PASS**; local `pnpm build` **PASS**; production dependency audit **0 known vulnerabilities**; database tests **56 PASS / 4 SKIP**; changed-file lint **0 errors**.
- **Global failures:** full lint **3 errors / 1053 warnings** in unrelated stale-tab component; backend full **2615 PASS / 240 FAIL / 457 SKIP**; frontend full **timeout 90s** (no full result); `pnpm test` / `api:contract:check` **FAIL** on existing NPC affinity generated-contract drift (QA Draft #1927). Generated artifacts restored, not bundled into this feature.
- Official Test exact SHA authenticated backend/API/DB/user-flow E2E, independent restore, source-backed Treasury/ledger provenance, and production GitOps gate: **BLOCKED**. Do not infer a release PASS from local build or targeted tests.

## Release and rollback

- **HOLD** all main merge/Test/Production promotion until complete CI, exact-SHA official Test E2E and finance/backup gates are proven. No live DB SQL or data writes. Rollback is to leave the feature branch unmerged; if later released, revert the application-only commit with no schema rollback.
- No branch deleted; preserve all unmerged and historic refs. Evidence: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0503-wallet-direction/`.
