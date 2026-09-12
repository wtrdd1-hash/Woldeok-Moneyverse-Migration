# Notification & Reactivation Governance v2026.09.13.12

## Why

The growth and season plans already depend on weekly recaps, comeback missions, season reminders, community notifications and account/security messages, but the repository did not contain one implementation-level contract for notification purpose, consent, suppression, quiet hours, deduplication, financial-game safety, minors, provider handling, analytics and operator controls.

## Changes

- Added `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md` as the English canonical specification and a maintained Korean counterpart.
- Defined seven purpose classes: security-critical, transactional, service-operational, product activity, season/live-ops, reactivation and marketing/commercial.
- Separated OS push permission from Moneyverse marketing consent.
- Added server-authoritative purpose/channel preference states, consent evidence and suppression behavior.
- Added quiet hours, fatigue protection, digest/coalescing, retry-safe deduplication and message idempotency.
- Added non-manipulative comeback-message rules and explicit safeguards against trade-frequency/FOMO notifications.
- Added minor-safety restrictions and lock-screen privacy requirements.
- Added template, deep-link, DB/read-model, API, scheduler, admin-console, analytics/KPI, accessibility and Definition-of-Done contracts.
- Confirmed that communication frequency controls are protection limits and do not alter the unlimited-by-default gameplay policy.

## Research checked 2026-09-13

- KISA official anti-spam center: 2026-03-04 notice for the 7th revised Information and Communications Network Act anti-spam guide. Directly adopted clearer advertising-consent wording and low-friction app-push opt-out expectations.
- U.S. FTC CAN-SPAM statute/business guidance. Directly adopted truthful commercial email labeling/header/subject and opt-out suppression architecture.
- Android Developers notification runtime-permission documentation. Directly adopted Android 13+ `POST_NOTIFICATIONS` permission handling and contextual permission request.
- Apple Developer notification HIG/interruption-level documentation. Used as official platform guidance for user permission and restrained urgency levels.

Legal interpretation beyond these product controls remains `legal review required` before commercial outbound-message launch.

## Policy impact

- No new gameplay hard cap.
- No change to WLD/WDX accounting, sink classification or market mechanics.
- No monetized notification priority in security/account surfaces.
- Private inbox/preferences remain authenticated/token-scoped and `noindex`; only public communication-help pages are search candidates.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530 during this planning pass. Runtime verification is therefore recorded as `runtime verification unavailable`; no notification implementation is assumed to exist in Production.

## Branch / PR / deployment

- Version: `v2026.09.13.12`
- Branch: `docs/notification-reactivation-governance-v2026.09.13.12`
- Change type: documentation-only
- Test server deployment: not required for this documentation change
- Runtime implementation later requires separate development branch -> isolated Test exact-SHA -> backend/API/database/provider/UI validation -> Production.

## Next priority

1. reconcile/test current runtime PRs against newest main;
2. implement P0 first-party authentication and Account Security Center safely;
3. implement first-party notification preference/suppression/in-app inbox foundation;
4. after service recovery, perform Runtime Product Reality Audit before assuming planned notification surfaces exist.