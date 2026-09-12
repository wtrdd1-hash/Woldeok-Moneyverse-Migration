# Minor Safety, Age Assurance & Content Removal — v2026.09.12.35

## Why

The existing planning stack recognized minors, privacy and community moderation as legal gates but did not define an implementation-grade age-state, guardian-consent, minor-advertising or urgent intimate-content removal contract. Current 2026 U.S. FTC guidance and Korean PIPC enforcement make that gap material before broad community monetization.

## Added

- English canonical and Korean parity specification for minor safety, age assurance and content removal.
- Privacy-minimizing coarse age-state model.
- Korea under-14 guardian-consent gate and U.S. COPPA applicability gate.
- Minor-safe personalized-ad restrictions and monetization metrics separation.
- TAKE IT DOWN Act readiness workflow for covered U.S. operations.
- Field-level retention/deletion principles, DB/API/admin requirements, analytics and SEO boundaries.
- P0/P1/P2 delivery priorities and Test/Production release gate.

## Research reviewed on 2026-09-12

Directly adopted: FTC 2026 COPPA age-verification policy statement; FTC 2026 TAKE IT DOWN Act compliance material; 2026 Korean PIPC enforcement concerning under-14 consent/minimization/access control/deletion.

Reference/monitor: PIPC G7 child-privacy update; PIPC summary of pending U.S. COPPA 2.0; Google Search Central search-appearance documentation updated 2026-09-10.

## Revenue/legal/SEO impact

Revenue: child-restricted inventory is not eligible for personalized advertising; dashboards must measure restricted inventory separately rather than weakening privacy controls.

Legal: Korea/US applicability remains legal review required before launch. Pending legislation is not treated as enacted law.

SEO: public safety/guardian/reporting guidance may be indexable, while report status, evidence, guardian verification, age state and admin/moderation routes must remain noindex/auth protected.

## Runtime/deployment

Documentation-only. No Test deployment required. `easy-scraping.com` runtime fetch was unavailable, so runtime verification is recorded as unavailable.

## Integration

Documentation policy permits documentation-only changes to integrate directly to current `main`. No runtime code, DB, API, configuration or infrastructure is changed.

## Next priority

Implement first-party auth/security foundations, then age-state/guardian/minor-ad gates and the urgent-report/removal queue on a separate development branch with Test exact-SHA verification before Production.
