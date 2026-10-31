# Development C v1246 — Member business source evidence

## Before work — 2026-11-01 04:50 KST
- Main: `f13bbce273ffc65e8576170992d82ea00c27a1c9`; isolated branch `auto/hourly-c-business-owner-evidence-v1246-20261101-0445`.
- MiniPC: Debian 13.6; 7/7 core services active; development PostgreSQL reachable. No shared worktree modified.
- Read AGENTS.md, README.md, README/README.ko.md, canonical PROJECT_PLAN.md and PROJECT_PLAN.ko.md; inspected current 32 open PRs, A #2254, B #2255, QA #2248, and current CI. Existing C #2250 is stock league, not business ownership.
- P1 verified source defect: `/businesses` treats failed `/api/v1/businesses/my-v2` as `[]`, falsely says no businesses; unvalidated numeric strings can throw `BigInt` and break the page; purchase UI can be offered without verified ownership/equity evidence. Existing backend uses owner-scoped PostgreSQL `business_my_ownerships_v2(uuid)` and `business_equity_standing(uuid)` functions; no DB migration needed.
- Scope: verified read-model parser and explicit unavailable vs verified empty, fail-closed purchase/activation, accessible retry and responsive states. Preserve all existing DB functions and authenticated mutation endpoints; do not claim settlement receipts from projected daily amounts.
- Release policy: all exact-SHA gates required; otherwise Draft/HOLD, no merge, no Test/Production promotion.

## In progress
- [x] TDD RED: stub implementation reproduced 4 assertion failures; inventory contract change reproduced 1 failure; date-string compatibility reproduced 1 failure.
- [x] Implement strict owner/catalog/equity/unlock/holdings parsers, fail-closed UI, 44px retry, screenreader alert, private page noindex metadata. Found legacy `/shop/inventory` route does not exist: switched to authenticated `/shop/holdings` and `catalog_id` source. Focused parser + UI 9 PASS; focused ESLint PASS; Frontend Typecheck PASS after building contract.
- [ ] Verify focused and full gates, isolated PostgreSQL, HTTP and official Test if possible.

## Midpoint — 2026-11-01 04:55 KST
- Re-fetched origin/main: `f13bbce273ffc65e8576170992d82ea00c27a1c9` unchanged. Canonical English and Korean planning files remain unchanged in main. No conflict with active A/B/QA PRs.
- API/DB contract: Nest `GET /api/v1/businesses/my-v2` reads `business_my_ownerships_v2(uuid)`; `GET /api/v1/business-equity` reads `business_equity_standing(uuid)`; `GET /api/v1/shop/holdings` reads `shop_my_items_v2(uuid)`. No new SQL privileges or ledger writes.
- Pending: full SHA gates, isolated PostgreSQL and official Test; release remains HOLD.

## Finished
- PENDING.
