# Changelog — Ads Default Enabled v2026.09.13.42

Date: 2026-09-13
Change type: frontend / release policy / documentation
Runtime deployment: Test first, then Production after exact-SHA verification
Korean counterpart: `docs/changelog/2026-09-13-ads-default-enabled-v2026.09.13.42.ko.md`

## Why this changed

The reviewed AdSense integration and public-page placements already existed, but Production release automation defaulted advertising off and automatic `workflow_run` releases blanked the publisher and slot. As a result, a valid advertising implementation could disappear from the live site after an otherwise successful automatic release.

During the required mid-work repository/infra recheck, deployment operations had already consumed versions through `v2026.09.13.41`; this release therefore uses the next sequential project version, **v2026.09.13.42**.

## Changes

- Reviewed public-content advertising is default-on when no ad switch is supplied.
- `frontend/Dockerfile` defaults `ADS_ENABLED=true`.
- `frontend/src/lib/adsense.ts` defaults to enabled while preserving publisher/slot validation and explicit `ADS_ENABLED=false` shutdown.
- `frontend/next.config.ts` keeps CSP aligned with the same default-on switch and removes AdSense origins when explicitly disabled.
- Production release automation now enables the approved publisher `ca-pub-5220225531544323` and slot `2118692561` for automatic releases.
- Manual Production release also defaults ads on, with an explicit emergency/compliance opt-out.
- Isolated Test remains explicitly ad-free (`ADS_ENABLED=false`, blank AdSense identifiers) so QA cannot generate real advertising traffic.
- Added/updated regression tests for default-on behavior and explicit-off CSP behavior.
- Updated English/Korean Living Project Plan and SEO/ads operations audit.

## Placement boundaries unchanged

Default-on does not mean site-wide advertising. Existing allowlist/blocked-surface rules remain in force. Ads may appear only on reviewed public-content surfaces. Login/account, wallet/transfer, market/stocks, loans, casino/gameplay, admin, error/status and other sensitive or primary transaction surfaces remain ad-free.

## Validation evidence

Pre-documentation implementation SHA `2b984ae556cdead7f757d889dd9117b7eeb151cd` passed the reusable CI gate in Test Candidate run `34747780450`, including secret scan, lint, typecheck, build, database migrations, full tests, Prisma mutation guard and production dependency audit. Immutable Test image build followed on the same SHA. The final documentation-bearing head must repeat the exact-SHA candidate gate before merge and Production promotion.

## Rollback

Advertising can be disabled explicitly with `ADS_ENABLED=false` for an emergency policy/compliance hold, or the Production GitOps image reference can be reverted to the previous verified SHA. No database migration or data rollback is required for this change.
