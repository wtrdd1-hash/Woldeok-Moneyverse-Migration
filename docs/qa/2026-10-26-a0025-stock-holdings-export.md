# QA — A0025 Owner-Only Current Virtual-Stock Holdings CSV (2026-10-26, RELEASE HOLD)

## Scope and environment
- Direct miniPC MCP system status and shell: Debian 13.6, backend/frontend/Discord/MCP/Nginx/Docker ACTIVE. Initial root filesystem 98% used (~2.1GiB free), data disk 66% used.
- Independent worktree `/srv/moneyverse-data/worktrees/hourly-a-stock-portfolio-export-20261026-0025`; branch `auto/hourly-a-stock-portfolio-export-20261026-0025`; starting/mid/pre-release authoritative `origin/main` SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Read `AGENTS.md`, `README.md`, EN/KO `docs/planning/PROJECT_PLAN*` and `INTEGRATED_PLANNING_MASTER*`, previous A2325 QA/worklog, recent B/C/planning PRs and CI. English canonical, Korean secondary. No other worktree or applied migration modified.
- This is a **current-position snapshot**, not a transaction receipt, settlement confirmation, dividend proof or historical trade report. No WLD mutation or new migration.

## Implemented P1 member flow
- Backend `GET /api/v1/stocks/portfolio/export` guarded by Session/Authenticated/Consent, obtains actor only from session, calls existing `stock_my_positions(p_actor)` via stock portfolio repository; rejects malformed/oversized (>100) rows and invalid canonical integer strings with 503 instead of fabricated empty/successful snapshots. Response `{scope:'current_holdings_only',holdings:[...]}`, `private,no-store`, `noindex,nofollow`.
- Web `GET /api/stocks/portfolio/holdings.csv` checks signed-in viewer and server-side API; emits UTF-8 BOM, exact integer strings, quote/control/formula escaping, explicit current-holdings-only label, safe fixed attachment filename. 401 for guest, 503 for unknown auth/upstream/invalid data, private/no-store/noindex/nosniff for all responses. Accessible 44px-minimum link on `/stocks/portfolio` when holdings load.
- Android `/app-api/v1/stocks/portfolio/export` forwards member cookie to the same authenticated JSON endpoint and enforces private/no-store/noindex even for error responses. EN/KO mobile contract and schema reference generated: 180 endpoints. Android-native UI is not part of this repository.
- Existing PostgreSQL owner-scoped SECURITY DEFINER function reused, app-role direct table access still denied. No production data writes, ledger updates, schema changes, new grants or feature switch changes.

## TDD and local verification
- RED witnessed: Backend 3/3 failed due to absent handler; Frontend 2 test suites failed due to missing CSV/route files.
- GREEN: Backend focused **3 PASS**; Frontend CSV/web route/Android gateway **16 PASS**. Typecheck **PASS**. Lint **PASS** (0 errors, 1,128 existing warnings). Backend and frontend build **PASS** after correcting isolated dependency layout; initial Next Turbopack build failure was caused by symlinked `node_modules` outside the worktree root. Mobile API contract check **PASS** on committed feature SHA; 180 documented endpoints.
- Full `pnpm test`: Backend **1,316 PASS / 398 SKIPPED**, Frontend **1,403 PASS / 6 FAIL** (SEO/i18n 3, login touch-target 1, calculator register link 1, admin M2 telemetry 1). Database package **15 PASS / 3 SKIPPED**; Contract package **38 PASS**; Discord bot **8 PASS** after copying existing dependency tree into this isolated worktree. Skipped tests are not PASS.
- Security gate **FAIL**: production dependencies 2 High; full workspace 2 Critical / 10 High / 11 Moderate / 3 Low; bot 1 Critical / 5 High. No dependency remediation attempted in A because B/C/QA own overlapping security and UI changes. Existing global failures block integration despite feature-focused PASS.

## Real isolated PostgreSQL evidence
- `moneyverse-test-db` PostgreSQL 17.11, DB `wdmv_v761_test_acl`, **281 applied migrations**, separate from the Production-linked `woldeok_moneyverse_dev` database on port 5433.
- In one isolated transaction, migrator inserted one synthetic stock position for an existing test user. With `SET LOCAL ROLE moneyverse_app`, `stock_my_positions` returned **OWNER_ROWS=1; PRECISE=true** (quantity 2, average cost 7, market value exactly quantity×price); unrelated actor returned **FOREIGN_ROWS=0**; actual joined Backend SELECT returned **EXACT_JOIN_ROWS=1**.
- `moneyverse_app` direct `virtual_stock_positions` SELECT **false**, ledger INSERT **false**. Explicit `ROLLBACK`; post-check `POST_ROLLBACK_POSITIONS=0`. Production DB writes **0**. This is an isolated SQL+ACL test, **not** an authenticated official Test HTTP E2E.

## Branch/PR audit, release blockers and rollback
- Starting remote heads **201**, open PRs **197**. Mid-audit remote heads **202** (201 non-main); all 201 non-main tips locally resolvable and have commits absent from main, duplicate tip/tree/last patch groups **0** (2 empty last patches); no deletion. Three known conflicting open PRs **#1107, #1110, #1143** protected; 194 other open PRs reported mergeable, but no unverified unique changes removed.
- Candidate feature SHA `ba34408ba59999533fc4e78324e8bc14b70ff5bd`; final docs SHA/PR and CI evidence recorded on Draft PR after push. Official public Test `/api/version` HTTP 200 SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production HTTP 200 SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither matches candidate. Authenticated Test exact-SHA owner/foreign/CSV E2E and GitOps gates **NOT PASS**.
- **RELEASE HOLD**: no merge, official Test promotion, Production deployment, DB migration/write, service restart or branch deletion. After a future authorized merge, rollback by reverting the endpoint, web CSV/link, app-api private header path and EN/KO contract as a unit; no migration rollback. Confirm auth/privacy/CSV/version and DB read ACL after any approved release.

**Final: PARTIAL / BLOCKED — feature implemented, integration and Production prohibited until every required gate passes.**
