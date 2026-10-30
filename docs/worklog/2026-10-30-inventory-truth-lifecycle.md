# 2026-10-30 A 22:51 — Member Inventory Source Truth and Condition Evidence

**Status:** P1 candidate, targeted verification PASS; full gates FAIL; Draft/HOLD, no merge or release.

## Before work — 22:51–22:54 KST
- Connected to Debian 13.6 via miniPC, checked backend/frontend/Nginx/Docker/PostgreSQL active.
- Read AGENTS.md, README.md, canonical `docs/planning/PROJECT_PLAN.md`, secondary Korean `PROJECT_PLAN.ko.md`, current `docs/RELEASING.md`, previous QA and open PR/CI. Main `bf8d0d48f810932b43783d8605dce53954c60cff`.
- Existing A stock history Draft #2050 and B/Planning branches were left intact. Created isolated `auto/hourly-a-20261030-2251-inventory-truth` worktree from exact origin/main; 16 remote branches and 14 open PRs at start.
- Selected F675-185 inventory source/condition truth from v1516/v1518: existing Next inventory silently converts unavailable owner holdings into a fabricated empty shelf; Android gateway inherited upstream public cache headers. New database function not needed: existing owner-scoped `shop_my_items_v2` (migration 123) already supplies condition fields.

## In progress — 22:54–23:12 KST
- RED tests: missing inventory parser, then malformed local-time timestamps and nested owner-route privacy. GREEN: shared strict owner holding parser; unknown legacy condition fields stay unknown; duplicate IDs, malformed rows and noncanonical WLD are rejected.
- Next member page now distinguishes VERIFIED_EMPTY from UNAVAILABLE; retry UI avoids fabricated zero counts or equip controls. Added noindex metadata and default-OFF `INVENTORY_LIFECYCLE_DETAILS_ENABLED` read-only `<details>` for held expiry, effect expiry, maintenance rate, arrears, suspension. Copy explicitly denies settlement/permanence claims.
- Android gateway rejects malformed owner holdings HTTP 200 as 503, protects nested holding actions, overrides public caching/indexing/referrer on success and error. Next config and locale proxy also override global public indexing for `/inventory` and localized inventory paths.
- Nest repository regression asserts owner argument and `shop_my_items_v2($1)` rather than direct table reads; existing SessionGuard/AuthenticatedGuard/ConsentGuard unchanged. No migrations, WLD/ledger writes, new direct grants, idempotency or financial mutation.
- Isolated PostgreSQL 17.11: applied all **311** migrations; owner and foreign synthetic read, `weekly_cost=200`, app direct user_items SELECT/INSERT denied; synthetic rows rolled back (0 remaining); isolated container stopped. This is not official Test or Production DB certification.
- TDD GREEN frontend parser/page/Android 10 PASS; edge/security/locale 26 PASS; backend targeted 2 PASS; DB unit 62 PASS/4 SKIP; typecheck PASS; targeted ESLint PASS; backend/frontend build PASS; mobile contract 184 endpoints PASS; production dependency audit 0 known vulnerabilities.
- Full lint FAIL: pre-existing `frontend/src/app/api/shop/purchases/route.search.test.ts:99` parser error, 1 ERROR/1,043 WARNINGS (separate Draft #2038). Full backend 2,655 PASS/126 FAIL/501 SKIP; frontend in correct NODE_ENV=test 2,710 PASS/55 FAIL. All 126 backend and 57 frontend failure identifiers match prior A #2050 baseline; not an exemption from release gates. A first frontend run in NODE_ENV=production yielded 534 failures due to React.act unavailable and is NOT the authoritative test-mode run.
- Local isolated Next HTTP probe returned 500 without INTERNAL_API_TOKEN; nevertheless `/inventory` and `/en/inventory` HTTP responses carried `private, no-store`, `noindex, nofollow`, `no-referrer`. This is only edge-header evidence, not an authenticated E2E PASS.
- Main and canonical/secondary plans rechecked mid-run and before PR, main unchanged. No changes to other workers' worktrees/branches, services or DB.
- Fresh public read-only probes at 23:14: official Test backend/frontend version `c2129625aa6629c616fb31ce790950618b8d92b2`, Test Treasury HTTP 200 `ok:true` (P0 release violation); Production public backend/frontend `bf8d0d48f810932b43783d8605dce53954c60cff`, Treasury HTTP 503 `UNVERIFIED`. Production active backend/frontend processes still run from deleted v1515 paths while release pointers select v1935. No changes performed.
- Adjacent Backend shop holdings controller regression has 2 existing failures (16 PASS/2 FAIL across 3 files); our new repository tests 2 PASS and frontend inventory/edge tests 36 PASS. Existing failure identifiers match prior A baseline; do not misclassify adjacent failures as fixed.

## Finished — candidate verification and release decision
- Feature flag defaults OFF; existing holdings view still works when verified, while unavailable evidence cannot be misrepresented as empty. Rollback: keep flag OFF and do not merge candidate; no data rollback required.
- Mandatory full CI, exact-source official Test authentication/user flow, independent restore, financial/security readiness, Production executable provenance and GitOps release gate are NOT PASS. **No merge, Test/Production deploy, service restart or Production DB write.**
- Final branch SHA, PR, CI and final branch counts are recorded in PR and host report `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-2251-inventory-truth/` after push. All non-main branches with unique changes preserved; deleted 0.
- Next: address existing full-suite failures in separately owned repair work, certify exact SHA in isolated Test, then only reconsider integration/release after all mandatory gates PASS.
