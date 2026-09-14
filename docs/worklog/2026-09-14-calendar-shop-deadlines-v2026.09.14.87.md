# Worklog — v2026.09.14.87

## Selected runtime slice
Economy/event calendar: surface authoritative shop sale-ending deadlines so members can see expiring store opportunities without checking the shop separately.

## Baseline and concurrency
- Started from `origin/main` `def9782` after auditing recent branches and PRs.
- Active stock-alert PR #304 was the newest application work but did not overlap calendar/shop files.
- Mid-work, main advanced to `5042ea9` through merged PR #304; the branch was fast-forwarded to that exact main before final validation.
- Dependabot branches were preserved as active dependency work and were not mixed into this feature.

## Scope
- Frontend: `/calendar` now reads the existing authenticated `/api/v1/shop/catalog` and lists authoritative `sale_ends_at` deadlines.
- Backend/API/DB: unchanged; this slice reuses the existing shop read model and does not alter economy contracts.
- Planning: English canonical and Korean parity Living Project Plan updated.

## Files
- `frontend/src/app/calendar/page.tsx`
- `frontend/src/app/calendar/shop-deadlines.ts`
- `frontend/src/app/calendar/shop-deadlines.test.ts`
- `docs/planning/PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`
- matching changelog/worklog entries

## Validation
- secret scan: PASS
- raw control-byte guard: PASS
- lint: PASS with 0 errors / 11 pre-existing image warnings
- workspace typecheck: PASS
- contract tests: 23 PASS
- database migration/static parity tests: 7 PASS
- backend non-DB/local suite: 856 PASS; 354 PostgreSQL-dependent tests skipped locally and delegated to CI real-PostgreSQL service
- frontend: 61 files / 580 tests PASS
- production build: PASS
- Prisma mutation guard and `git diff --check`: PASS

## Release state
The isolated public Test runtime was still serving stale application SHA `2bb84e2b...` while GitOps declared a newer candidate, so no Production promotion is claimed. This feature must pass CI real-PostgreSQL validation and exact-SHA Test before main/Production promotion.

## Next priority
After this calendar slice, continue the next unimplemented member-facing runtime item from the Living Project Plan, with Clubs/Community discovery remaining a major gap.
