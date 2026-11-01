# Backend B v714 — Owner-private shop HTTP responses

## BEFORE WORK
- Start main: `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- Scope: authenticated shop purchase history, holdings, member catalogue and mutation receipts; preserve public shop items/catalogue/cosmetics.
- Risk: route-level `@Header` is not applied to guard rejection, so pre-guard middleware must be route-scoped.
- Coordination: do not touch A/C inventory UI, SQL migrations, ledger, or existing B draft PRs.

## IN PROGRESS
- [ ] RED HTTP regression demonstrating private-route cache policy gap.
- [ ] GREEN pre-guard route-scoped privacy policy.
- [ ] Full test, build, lint, typecheck, PostgreSQL, CI and Test exact-SHA gates.

## FINISHED
- Pending.

### 09:03 KST — TDD checkpoint
- RED `shop-owner-private-http.test.ts`: 13 failures (11 unauthenticated, one consent rejection, one successful owner read), 4 public controls PASS. Header `Cache-Control` missing; observed before implementation.
- GREEN: `ShopModule` now registers pre-guard middleware for exactly ten owner-only route patterns, preserving three public shop endpoints. 17/17 HTTP tests PASS.
- No API payload, SQL, migration, WLD, ledger or shared runtime changes. `origin/main` still `f13bbce273ffc65e8576170992d82ea00c27a1c9` at midpoint. A PR #2236 and #2229 modify `shop.controller.ts`, not `shop.module.ts`.
- Broader CI/PG/official Test exact-SHA gates pending; release HOLD.
