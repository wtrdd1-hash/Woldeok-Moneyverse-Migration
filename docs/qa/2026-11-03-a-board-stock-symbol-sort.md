# Development A QA — bounded public board stock-symbol ordering

**Date:** 2026-11-03 KST. **Status:** FAIL / RELEASE HOLD. **Source main:** `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. **Code candidate:** `5abe3792d80e5f11db4dc80cc0f0d15355a3cbea`. **Branch:** `auto/hourly-a-20261103-0129-board-symbol-sort`.

## Source and behavior
- `GET /api/v1/board/public/stock-posts?sort=stock` sorts only the latest 50 verified public posts, tagged symbols ascending under PostgreSQL `C` collation, untagged last, UUID tie break. No unbounded archive search, migration, balance/item writes or table grants.
- Web GET form has an explicit labelled, keyboard-accessible sort selector and `robots: noindex` for sorted results; it fails closed if backend does not prove `sortApplied=stock` and the row ordering.
- Android app-api forwards the sort parameter, requires the marker and verifies bounded unique UUIDs and symbol ordering; unverified 200 becomes 503. Query-specific responses are `no-store`/`noindex`.

## Evidence (saved on miniPC)
- Initial TDD RED: backend 3 FAIL, frontend missing parser. Focused GREEN: backend 18 PASS, frontend 12 PASS. Additional Android malformed/duplicate order test: 3 PASS.
- `pnpm typecheck` PASS before the response marker adjustment; exact final SHA recheck required.
- `pnpm api:contract:check` PASS after updating English/Korean generated Android contract for 184 endpoints.
- Root security/release/static tests 34 PASS, contract package 41 PASS, database unit tests 72 PASS / 5 SKIP.
- Backend full at `ec99805b1bcf86fbd9e115c84b6dd0902a0944b7`: **2,986 PASS / 2 FAIL / 518 SKIP**. Both failures are pre-existing authenticated profile HTTP tests expecting 200 but getting 401; tracked separately in Draft #2265. No bypass or duplicate repair.
- Frontend full at `ec99805b1bcf86fbd9e115c84b6dd0902a0944b7`: **2,951 PASS** with `NODE_ENV=test`, 2 workers. Initial run timed out; an intermediate run without `NODE_ENV=test` produced unrelated React.act failures and was discarded, not reported as PASS.
- Lint: **0 errors / 1,027 warnings**. Backend build PASS; Next frontend build PASS, with 602 routes/pages. Production-only dependency audit 0 known vulnerabilities. Full dependency audit **9 vulnerabilities (1 low, 8 moderate), FAIL**.
- Real development PostgreSQL 17.11 READ ONLY: function `member_board_public_list_with_stock(50)` returned 1 public post and 0 stock-tagged posts. SQL stock sort executed successfully; three synthetic VALUES sorted `AAA`, `WDX`, untagged. Real multi-post ordering remains UNPROVEN.
- DEV `moneyverse_app` direct `account_balances UPDATE=true`, `user_items DELETE=true`: **P0 least privilege FAIL**. Production DB grants not measured.
- Official Test `/api/version` SHA `0c70a114da5f4cc5374bc4b80e0403a044f8546f`; Production SHA `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Neither is candidate. Exact-SHA Test authenticated E2E, rollback restore, real user flow, independent backup restore, and GitOps gate **BLOCKED**.
- Remote non-main refs **303** at audit: 285 not merged into main, 18 ancestor-merged, 0 unknown. Open PR **273**, conflicting **29**, PRs with CI failure **38**. No branch deletion; all unique changes preserved. Merge-tree conflicts with #2554, #2526, #2494 and #2448; do not force merge.

## Final verdict
Feature implemented and locally validated with bounded, fail-closed public source. **No main merge, no Test/Production deployment, no DB mutation, no rollback executed.** Release remains HOLD until exact-SHA full tests, CI, isolated Test E2E, least privilege, security audit and backup/rollback gates pass. No skipped or blocked check is counted as PASS.

Evidence directory: `/srv/moneyverse-data/tasks/mv-a-20261103-0129-board-symbol-sort/evidence/`.
