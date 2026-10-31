# Development A — Stock availability filter (2026-11-01 04:25 KST)

## Before work
- Source: `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`, freshly fetched; separate `auto/hourly-a-20261101-0425-stock-availability` worktree.
- Repository: `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, `INTEGRATED_PLANNING_MASTER.md` and Superpowers workflows reviewed. English is canonical; Korean parity remains secondary.
- Observed bug: `stockCatalogApiPath('available')` builds `?stock=available`, while Nest `ShopController.catalog` never binds the `stock` query parameter. Existing `filterShopStock` and unit tests are not proof the HTTP route filters. Android gateway forwards the query without checking the returned rows.
- Scope: member shop catalogue availability-only filtering through Next.js → NestJS → existing `shop_catalog_list_v2(actor)` PostgreSQL function → Android app-api. Do not touch applied migrations, money, privileges or writes.
- Constraints: separate worktree, TDD red/green, actor-scoped reads, null stock = unlimited, quantity 0 = unavailable, no false-empty on source errors, exact SHA gates and release HOLD until all proven.
- Start remote branches: see host `automation-worklogs/a0425-branches-start.txt`; all unique unmerged changes preserved.

## In progress
- [x] Add failing backend route-binding/controller, web and Android gateway regression tests (RED: backend 3 FAIL; frontend 4 FAIL; holdings links 1 FAIL).
- [x] Bind/validate `stock` on public/member Nest endpoints, implement accessible member web stock checkbox, preserve owner shelf search, verify Android 200 payload and private headers (GREEN: backend 13 PASS; frontend targeted 5 PASS; shelf 5 PASS).
- [x] Re-fetch main and integrated plans; main unchanged `f13bbce2` at all checks. Full typecheck, lint, unit, build, API contract and production dependency audit PASS. Real PostgreSQL owner-function read PASS. Official Test exact-SHA authenticated E2E, independent restore and release identity BLOCKED. Initial API contract artifact ordering drift corrected with stable generated EN/KO/JSON files.

## Finished — P1 CODE VERIFIED / RELEASE HOLD
- Code checkpoint SHA `150a1763ad0f0b0850f55823fa62c58dc3952d61`; subsequent stale-backend web fail-closed correction pending final commit SHA. Draft PR #2254.
- Changed: Nest stock query binding, web stock checkbox/holdings link retention, shared strict filtered-response validator for web and Android, Android privacy headers, regression tests, generated mobile API contract EN/KO, QA and release documentation. No applied migration, privilege, ledger or item mutation.
- Full `pnpm test` exit 0: contract 41 PASS, DB 62 PASS / 4 SKIP, Backend 2,953 PASS / 517 SKIP, Frontend 2,908 PASS. Full `pnpm build` exit 0, typecheck exit 0, lint 0 errors / 1,022 warnings, production dependency audit 0 known vulnerabilities. Exact final SHA CI is a separate pending gate.
- Real DEV PostgreSQL 17.11 read-only with `moneyverse_app`: catalog 146 (143 unlimited, 3 finite available, 0 sold-out), synthetic member 146; ROLLBACK. App role still has direct UPDATE on shop_catalog and account_balances (P0 least-privilege blocker). No real sold-out DB fixture; regression tests cover that branch.
- Public official Test backend/frontend SHA `bc8cd8a6...` vs candidate; Production backend SHA `353c6d5d...`, frontend timestamp ID `1793450413898`; exact-SHA authenticated Test E2E, independent backup restore, Production identity and GitOps release gate unproven. Production HOLD.
- Start remote heads 32; final snapshot 35; open PR 32. Non-main refs: 34 unmerged, one ancestor, all preserved. Branch deletion 0, main merges 0, Test/Production deployment 0, service restarts 0, operational DB writes 0, rollback 0. Other developers' worktrees untouched.
- Detailed evidence: `docs/qa/2026-11-01-a0425-shop-stock-availability.md`, Korean parity, `docs/updates/2026-11-01-a0425-stock-release-hold.md`; host `artifacts/a0425/` contains RED/GREEN/full gates.
