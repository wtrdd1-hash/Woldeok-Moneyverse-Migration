# Changelog — v2026.09.14.77 Cross-Surface Continuity & Intent-Handoff Growth

Date: 2026-09-14
Change type: documentation only
Runtime/code change: none

## Added
- Added `CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md` and Korean counterpart.
- Defined the consumer growth gap as fragmented intent across public web, signed-in web/native app and Discord/community surfaces.
- Added the funnel `qualified entry → authored intent → optional safe handoff → destination intent recognition → meaningful action → D1/D7 continuity → D30 unified history`.
- Defined separate channel roles rather than requiring feature duplication across surfaces.
- Added cross-surface activation, retention, acquisition, SEO, monetization and trust/safety KPIs.
- Added five experiments covering contextual handoff, optional linking, install pressure, unified continuation history and monetization placement.

## Security / privacy / abuse guardrails
- Preserved existing OAuth/session/RBAC/admin/ledger/privacy/community boundaries.
- Marked malicious deep links/invites, account-link hijacking, private-state leakage and referral/install/link farming as HIGH risks.
- Kept raw handoff/install/link actions ineligible for meaningful WLD/WDX rewards.
- Required public-safe data, private-by-default continuation and minimized cross-surface analytics.
- Recorded verified platform/app links as a future implementation QA trigger, not a code change.

## Research notes
Directly adopted or referenced current evidence from Xbox cross-device continuity, Discord GDC 2026/Social Layer, Android App Links security guidance, KISA’s 2026-05-19 phishing warning, PIPC’s 2026-07-27 behavioral-data enforcement and FTC 2026 subscription enforcement.

## Runtime reality
Public Production web was verified. Native app UX and an end-to-end Discord→web/app contextual handoff were not independently verifiable, so cross-surface intent continuity remains an unverified growth hypothesis.

## Release state
- Documentation only.
- No PR requested; intended for direct fast-forward update to the latest `main` after final synchronization check.
- No runtime, DB, API, auth, migration, scheduler, infrastructure or security-code modification.