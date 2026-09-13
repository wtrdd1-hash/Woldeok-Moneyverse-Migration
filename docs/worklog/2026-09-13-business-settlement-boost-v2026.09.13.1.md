# Worklog — Business Settlement Boost re-home v2026.09.13.1

## Selected runtime work
Confirmed PostgreSQL runtime failure in `business_settle_daily_v2` when an active business boost is evaluated. User benefit: owned businesses can settle correctly when boosts are active instead of failing at runtime.

## Baseline and concurrency
- Latest main before development: `04ca71e95a5d1e63b0a7ef834aa5bd1ecbdef827`.
- Original validated fix source: PR #164 / `12cf57ef608a2b7e0c1bb8071ca7ff8eb41ebcc4`.
- Reviewed current active runtime PRs #189 (Economy Scenario Lab) and #195 (Event Calendar); neither overlaps this migration or DB regression path.
- Compared the stale #164 base with current main. No newer migration occupies number 179 and no newer branch supersedes this fix.
- Living Project Plan was re-read before implementation and its deployment/migration rules were preserved.

## Runtime changes
- Added forward migration `179-business-settlement-v2-boost-runtime-fix.sql`; migration 178 remains immutable.
- Active boost multipliers use valid `COALESCE(...)` syntax.
- Preserved key-scoped idempotency lock, replay ownership validation, daily duplicate prevention, ledger postings and event contract.
- Added real-PostgreSQL boost regression test coverage.
- Added `sql-construct-qualification.test.ts` to prevent this SQL qualification class from reappearing in new migrations.

## Validation / deployment
- Branch: `integrate/business-settlement-boost-v2026.09.13.1`.
- PR: #196.
- CI: pending at time of this worklog update.
- Isolated Test exact-SHA: not yet verified.
- Production: unchanged; promotion is blocked until CI and exact-SHA Test validation pass.

## Remaining risk / next priority
If CI passes, deploy the exact candidate SHA to isolated Test, apply migrations on the Test database, exercise an active-boost settlement against PostgreSQL, and inspect backend logs. After this candidate is resolved, continue with Trusted Client IP #165 and Admin edit-state #160 using the same current-main re-home process.
