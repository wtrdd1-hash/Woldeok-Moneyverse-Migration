# A2225 — Verified member shop category filter (DRAFT / HOLD)

## Before work
- 2026-10-28 22:29 KST Debian 13.6 miniPC reachable; services and PostgreSQL reported active.
- Base: `35971c600f25869c96f1c666d4b9f58927202730` (`origin/main`); isolated worktree `auto/hourly-a-shop-category-20261028-2225`.
- Read AGENTS.md, README.md, English/Korean living and integrated plans, QA v1350 and open PR inventory.
- Existing `shop_catalog_list_v2(actor)` returns a bounded actor-aware catalog including `category`; no schema, ledger, grant or applied-migration changes necessary.
- Existing member UI searches by text but cannot select a category; existing API search does not accept category. This task is distinct from open shop price-sort/range/upkeep PRs.
- Safety: real DB shares live service; never write to it. 98% data disk and QA finance/security/migration/Test failures prohibit release.

## Plan / TDD
- [x] RED: backend category validation/selection and Android query/privacy tests; frontend category selector regression.
- [x] GREEN: server-side exact category filter, categories option list, member SSR select with query preservation, app-api private cache fence.
- [ ] Verify focused tests, lint, typecheck, build, full unit/DB and CI where available; record exact SHA.
- [ ] Re-fetch main and planning, protect unmerged work, open Draft PR; no merge/deploy without every gate.

## In progress
- Initial source inspection completed; implementation not yet validated.

## Finished
- Source implementation complete; release blocked. See final verification below.
- RED tests written before implementation: exact category, injection rejection, string precision, Android forwarding/private cache.
- GREEN implementation: existing actor-bound PostgreSQL catalog function, exact category selection, member UI form, Android query forwarding and private cache fence. No new migration or money mutation.

## Checkpoint 1 — 22:34 KST
- Focused RED: Android member catalog 200/401/500 responses incorrectly inherited `public, max-age=3600`; frontend category helper absent. Backend RED initially blocked by unbuilt contract; built contract before GREEN.
- Focused GREEN: backend 3 PASS; frontend catalog + Android gateway 63 PASS. Typecheck PASS after correcting a Vitest callback tuple type.
- API contract artifacts regenerated for additive `categories` response. `api:contract:check` compares against committed HEAD; expected to fail until the generated contract is committed.
- Initial full lint PASS; initial `pnpm test` stopped at expected contract drift; initial build interrupted due duplicate remote command invocation. No successful full-gate claim yet.

## Final verification checkpoint — 2026-10-28 22:45 KST
- Draft PR #1750 source SHA 489b2eda6d4a4ee6f27f521aa7b84b1fe693021f.
- Full tests PASS: backend 1942 (441 skipped), frontend 1875, database 46 (4 skipped), security/release scripts 23. API contract: 180 endpoints, regenerated artifacts match.
- Typecheck, lint, production builds and root security audit PASS; 1 moderate advisory, no High/Critical. Bot 11 tests and bot audit PASS after installing isolated bot dependencies. First bot test failed due to missing local modules, then corrected.
- Network-isolated synthetic PostgreSQL 17.11 PASS: actor-scoped function, exact category and bigint string; direct catalog table SELECT denied. Not full migration-schema or official Test certification.
- Current main remains 35971c600f25869c96f1c666d4b9f58927202730. Latest unmerged EN/KO planning v1428 reviewed. CI Runtime Check still in progress at checkpoint.
- QA v1350 blocks release: historical 18000 WLD drift, broad DB DML, public bank EXECUTE, migration parity, backup restore and official Test SHA. Test version cfb13272; Production version unknown. Data disk 98%.
- Start remote branches 70 (including main), open PRs 68; later 72 and 69 (concurrent agents included). Incident recovery refs 352 valid; none deleted. No merge, deployment, DB write or service restart.
- Rollback if authorized later: revert app-only change; no migration to reverse. Production RELEASE HOLD.
