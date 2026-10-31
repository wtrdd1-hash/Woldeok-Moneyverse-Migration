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
- [ ] Re-fetch main and integrated plans, run full checks, real PostgreSQL, CI and official Test where possible. Midpoint main unchanged `f13bbce2`. Typecheck PASS; lint 0 errors / 1022 warnings. Initial full test gate BLOCKED by mobile API contract artifact drift (unrelated stock schema property ordering); generated EN/KO/JSON artifacts updated and stable across two generations; re-run after checkpoint commit.

## Finished
- Pending; no merge, release or branch deletion authorized without all gates.
