# Product Planning Worklog — v2026.09.13.12

## Starting state

- Re-read current `main` at `6a2089a22f7bba70af3ce970a8c751e72539849b`.
- Re-read `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md` and related recent planning material.
- Rechecked open runtime PRs. Active work includes Stock-tagged Community discovery (#208), Account Security Center (#201), admin edit-state safety (#198), trusted-client-IP hardening (#197), business settlement fix (#196), event calendar (#195), casino planning (#192), and Economy Scenario Lab (#189).
- No open PR introduced an equivalent notification/reactivation governance contract.

## Gap selected

The repository describes notification preferences, quiet hours, season-close notices, weekly recaps and comeback missions in multiple planning documents, but lacks one authoritative implementation contract for purpose classification, consent/suppression, provider permissions, frequency safety, dedupe/idempotency, template security, deep links, minors, analytics and admin operations.

This gap was prioritized because it touches retention, security, privacy/compliance, mobile UX and monetization simultaneously without changing runtime code.

## Research

Checked on 2026-09-13:

1. KISA Illegal Spam Response Center — 2026-03-04 notice for the 7th revised anti-spam guide. Key implication: advertising-consent wording must be explicit; app-push advertising refusal should not require unnecessary complexity; promotional benefit notices do not erase consent requirements. Adoption: direct product requirement.
2. U.S. FTC CAN-SPAM law/business guidance. Key implication: commercial email needs truthful sender/subject and effective opt-out/suppression. Adoption: direct product architecture; exact legal scope remains review-required.
3. Android Developers notification runtime-permission guidance. Key implication: Android 13+ non-exempt notifications require `POST_NOTIFICATIONS`; ask permission in useful context. Adoption: direct UX/platform requirement.
4. Apple Developer notifications HIG and interruption levels. Key implication: permission and urgency levels should reflect genuine user value/urgency. Adoption: direct/reference platform requirement; no growth-driven misuse of critical/time-sensitive priority.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530. Recorded `runtime verification unavailable`. No assumption was made about Production/Test notification UI or API availability.

## Decisions

- Use server-authoritative purpose/channel preference states.
- Keep security/transactional/service messages distinct from marketing.
- Treat communication cadence limits as safety/anti-spam protections, not gameplay caps.
- Use quiet hours and digest/coalescing for optional categories.
- Make retry/replay duplicate sends impossible through deterministic message identities.
- Keep WLD/WDX market alerts educational/non-manipulative; trade count is not a success KPI.
- Keep minor personalized advertising notifications off by default under protected states.
- Keep notification transactions post-commit so provider outages cannot roll back authoritative economy actions.
- Keep private inbox/preferences `noindex`; public help content may be indexable.

## Files changed

- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.ko.md`
- English/Korean changelog for v2026.09.13.12
- English/Korean worklog for v2026.09.13.12
- English/Korean documentation indexes

## Branch / test / deployment

Branch: `docs/notification-reactivation-governance-v2026.09.13.12`.

Documentation-only. No Test or Production deployment is required for this change. Future runtime work must be separate and pass isolated Test exact-SHA backend/API/database/provider/UI/security verification before Production.

## Next priorities

1. Reconcile and validate active runtime PRs against current main.
2. Complete first-party email authentication and Account Security Center P0 security work.
3. Implement notification preferences, suppression, in-app inbox and security/transactional delivery as the first notification runtime slice.
4. On service recovery, perform Runtime Product Reality Audit and compare actual navigation/UI/API behavior with Living Specs.