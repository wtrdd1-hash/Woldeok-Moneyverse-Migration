# 2026-09-14 — Permission-to-return lifecycle growth v2026.09.14.66

## Summary

Added a consumer-growth specification for earning notification/return permission only after Moneyverse has created a real reason for the user to come back.

The selected gap is not notification infrastructure. The repository already has a detailed implementation-oriented notification governance specification. The missing layer was the consumer loop from first value → chosen future thread → contextual permission → useful change → exact-context return → meaningful action → D7/D30.

## Added

- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md`
- English/Korean changelog and worklog for v2026.09.14.66.

## Consumer-planning changes

- Defined the promise: “Tell me only when something I chose is genuinely worth returning for.”
- Moved optional notification permission after a durable authored choice instead of first paint/onboarding.
- Added a return-value hierarchy: requested continuity → meaningful personal progress → broad product updates → commercial promotion.
- Defined D1/D3/D7/D14/D30 notification/return behavior without forced daily reminders.
- Added message structure: recognize → explain → bound → continue.
- Required exact-context return rather than generic-home landing as the growth objective.
- Preferred in-app/on-surface continuity before outbound interruption.
- Separated product continuity from commercial messaging and sponsored inventory.
- Added permission-quality, return-quality, business-quality and trust/safety KPI.
- Added five experiments covering permission timing, category-specific opt-ins, meaningful-change comeback copy, exact-context destinations and weekly recap vs generic daily reminders.

## Security / abuse / privacy

High risks recorded:
- notification impersonation/phishing/ATO;
- private-state leakage on lock screens/shared devices;
- marketing disguised as service/benefit communication.

Medium risks recorded:
- notification fatigue/coercive retention;
- bot/multi-account notification-reward farming;
- analytics overcollection.

No existing authentication/session/RBAC/admin/ledger/privacy boundary is weakened.

## Research notes

Research date: 2026-09-14.

Directly adopted/reference sources:
- Android Developers notification runtime permission, updated 2026-09-01: contextual permission requests and responsible use.
- Discord Mobile Notifications Settings 101, updated 2026-07-31: user-controlled in-app and OS notification layers.
- Apple Human Interface Guidelines/User Notifications: timely high-value information, explicit marketing permission and no abuse of time-sensitive interruption.
- KISA anti-spam guide 7th revision, 2026-03-04: explicit advertising-consent wording and low-friction app-push opt-out.
- KISA government-impersonation phishing warning, 2026-05-19: trusted-brand impersonation and credential-theft risk.
- FTC CAN-SPAM baseline: truthful commercial email identity and working opt-out.

Vendor uplift claims were not used as Moneyverse forecasts.

## Runtime reality audit

Runtime verification was available on 2026-09-14.

Observed:
- homepage clearly states WLD/rewards are game-only;
- wallet/game/exchange/shop/quest shortcuts remain prominent;
- multiple sponsored placements already exist;
- monthly news and announcements remain effectively unpopulated;
- the public lobby can look quiet;
- the getting-started guide remains finance/wealth heavy.

The public runtime does not visibly expose a consumer loop of “follow this chosen thread → opt into one useful update → return to the exact thread.” This remains a product-growth hypothesis; no runtime copy or behavior was changed.

## Release state

Documentation only. No runtime, DB, API, authentication, scheduler, infrastructure, security-code, Test or Production configuration change.
