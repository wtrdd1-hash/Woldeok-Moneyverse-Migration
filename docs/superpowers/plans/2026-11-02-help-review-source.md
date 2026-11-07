# Verified Help Review Queue Source Integrity — v1279

## Decision and contract
The admin review queue already uses Nest session, consent, AdminGuard, AdminSessionGuard, role checks and `public.help_admin_queue(actor,session)` SECURITY DEFINER. A new endpoint or table would duplicate authority. Fix the actual consumer: a malformed HTTP 200 currently reaches `.map`, displays unverified source/permission values, or throws. Keep feature flag OFF by default and all writes on existing protected actions. Treat an invalid batch as unavailable, not as an empty list.

## Implementation plan
1. Add RED tests for `parseHelpReviewQueue(unknown)` with valid zero rows, one verified draft, malformed list/flags, invalid ID/price-independent version, invalid URL/digest/date/state, duplicates and expiry. Run focused test to observe failure.
2. Add pure bounded parser in `frontend/src/app/admin/help/review-evidence.ts`; expose derived `reviewCurrent` based on strict UTC timestamp. Reject the whole response on inconsistency.
3. Wire `frontend/src/app/admin/help/page.tsx` to `apiOrNull<unknown>` and parser. On null, render a `role=alert` retry link, never draft/publish/retract controls. For expired draft, show warning and suppress publish, not retract. Keep existing `noindex`, responsive grid and accessible labels.
4. Add server-rendered page regression tests for invalid data and verified empty. Run focused RED/GREEN, lint/typecheck/build, API contract, full suites, security and isolated PostgreSQL as capacity permits. Do not promote without every required gate and exact-SHA Test proof.
5. Re-fetch origin/main during work and before any merge; log SHA and leave draft PR if blocked. English canonical and Korean supplemental worklogs.

## Rollback
Revert the two application files and tests; no schema, financial ledger, migration or deployment mutation. Existing `VERIFIED_HELP_CENTER_V1` OFF remains emergency feature hold.
