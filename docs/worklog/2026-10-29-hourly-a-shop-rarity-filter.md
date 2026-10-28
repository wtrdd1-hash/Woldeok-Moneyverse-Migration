# Development A — Verified Shop Rarity Filter (2026-10-29 03:25 KST)

## BEFORE (v1)
- Host: Debian 13.6 miniPC, service health active; root 96% / data 98%; preserve all backup, swap, coworkers' worktrees and unmerged PRs.
- Authoritative main at start: `35971c600f25869c96f1c666d4b9f58927202730`; open PRs 90, remote branches 92 (including main). QA v1354 FAILED; 18,000 WLD drift, app DML overgrant, checksum mismatch, exact-SHA Test mismatch. RELEASE HOLD.
- Prior A PRs #1750 category, #1767 upkeep ceiling, #1771 price floor are separate unmerged Drafts; no rarity filter PR found. No migration changes or economic writes allowed.
- Read `AGENTS.md`, `README.md`, English `docs/planning/PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md` with Korean counterparts, latest QA and related shop/app-api source.

## DESIGN / PLAN (v1)
- Member/public catalog accepts optional `rarity` exact enum: `common|uncommon|rare|epic|legendary|mythic`. Empty/omitted means all. Unknown/duplicate values return 400 rather than silent broadened results.
- Filter rows after `shop_catalog_list_v2(actor)` has enforced visibility and actor-owned fields; no direct SQL table grants, no migrations, no price/stock/ledger changes. Preserve string-precision and source order.
- Add a labelled rarity selector on member `/shop/catalog` and public `/shop`, retain `q` search on submit, no false-empty fallback when API fails. Android `/app-api/v1/shop/catalog?rarity=...` forwards exact query with private no-store for owner-scoped catalog; contract documents allowed values.
- Tests first (RED): invalid/valid enum, preserved DB row fields, Android query and private cache, UI query persistence, real isolated PG read model where available. GREEN then full lint/typecheck/test/build/security/real-PG/CI. Never merge or deploy without exact-SHA official Test/auth E2E and release gates.

## IN PROGRESS
- New branch/worktree created from latest main. TDD and verification pending.

## AFTER
- Pending.

### MID checkpoint (v2, 03:30 KST)
- TDD RED: missing backend/frontend rarity modules and Android private-cache regression reproduced; GREEN: backend 6 focused PASS, frontend/app-api 29 focused PASS.
- Isolated PostgreSQL `moneyverse-test-db` (`woldeok_moneyverse_ci`, 17.11) `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app` returned six rarity groups (69/19/27/17/9/5) via `shop_catalog_list_v2(NULL)`; no live DB accessed, no SQL writes.
- Typecheck: backend/frontend PASS after correcting two strict TS errors; shared base checkout lacked installed `undici`, resolved by a workspace-local symlink to an existing same-version package, without mutating base node_modules. Lint PASS (0 errors, 1,099 pre-existing warnings).
- Contract generator: 180 Android endpoints generated; member shop catalog query includes q + exact rarity. English and Korean docs updated. SEO public query variants noindex; Android private shop catalog no-store/noindex.
- Mid-work main `35971c600f25869c96f1c666d4b9f58927202730` unchanged; integrated EN/KO plan hashes `89d03733...` / `ac9f4013...` unchanged. Full tests, build, audit, CI, Test gate pending.
