# 2026-09-14 — Product planning worklog v2026.09.14.66

## Starting state

Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

Starting `main`: `1d5ad140d93bb3142b6684c7f5901e9e67377059`

Reviewed before planning:
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- recent collection/SEO/monetization growth specifications surfaced from repository search
- current production homepage, getting-started guide and announcements surface.

Rechecked `main` before writing. It remained `1d5ad140d93bb3142b6684c7f5901e9e67377059`; no concurrent change needed reconciliation at that checkpoint.

## Selected gap

Existing implementation planning already covers notification taxonomy, permission/consent storage, quiet hours, frequency, deduplication, deep links, provider delivery and legal gates. Expanding those implementation details would conflict with the current documentation priority.

The consumer-growth gap was instead defined as:

**When and why does a user permit Moneyverse to interrupt them, what message is valuable enough to deserve that permission, and does the message preserve the exact reason to return through D7/D30?**

Chosen canonical loop:

`first value → chosen future thread → contextual return-permission offer → real meaningful change → minimal message → exact-context return → meaningful action → D7/D30 continuity`

## Planning decisions

Created `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC` with these decisions:

- optional notification permission is earned after value, not requested on first paint;
- permission is tied to a user-chosen thread such as a collection, season, fictional company/world, profession/project or requested recap;
- no outbound D1 message is required when nothing meaningful changed;
- D7 weekly recap is a stronger general retention candidate than generic daily reminder spam;
- growth messages use recognize → explain → bound → continue;
- click/open is not activation; exact-context return and meaningful action are the downstream target;
- on-surface/in-app continuity is preferred before outbound interruption;
- marketing/sponsored communication is separated from product continuity;
- no meaningful WLD/WDX reward for permission, open or click;
- lock-screen/private-state exposure and phishing/impersonation are high-risk review areas.

## Funnel / cohort changes

Added lifecycle funnel:

`meaningful choice → permission-quality moment → category opt-in → useful state change → message → context-preserved return → meaningful action → D7/D30`

New/modified KPI:
- permission explanation → category opt-in;
- OS grant where applicable;
- D7/D30 permission retention;
- mute/unsubscribe/revocation;
- message → meaningful return;
- context-preserved return;
- D7/D30 after message;
- natural-return vs message-assisted return;
- retained-user contribution by lifecycle-message cohort;
- spam/privacy/phishing/ATO/fake-account guardrails.

## Experiment backlog

1. Value-earned contextual permission timing vs generic early prompt.
2. Category-specific opt-in vs generic all-notifications ask.
3. Meaningful change + one action vs generic comeback message.
4. Exact-context destination vs generic home landing.
5. Weekly recap vs scheduled generic daily reminder.

Each experiment uses downstream retention plus opt-out/complaint/privacy/security guardrails; CTR/open rate alone is not success.

## External research — 2026-09-14

Direct adoption/reference:
- Android Developers, Notification runtime permission, updated 2026-09-01: request in the context of app functionality and explain value transparently.
- Discord Mobile Notifications Settings 101, updated 2026-07-31: separate app-level decisions from OS presentation and preserve granular user control.
- Apple Human Interface Guidelines / User Notifications: timely high-value notification design; explicit marketing permission; no use of Time Sensitive priority for marketing.
- KISA anti-spam guide, 7th revision, published 2026-03-04: no ambiguous “benefit alert/information” advertising-consent wording; no unnecessary login/complexity for app-push advertising refusal; benefits/coupons do not remove consent requirements.
- KISA government-impersonation email warning, 2026-05-19: official-looking branding/links can be used to steal passwords.
- FTC CAN-SPAM baseline: non-deceptive commercial email identity/subject and functioning opt-out.

Reference only:
- vendor re-engagement uplift claims were excluded from Moneyverse forecasts.

## Runtime Product Reality Audit

Runtime verification: available on 2026-09-14.

Observed:
- homepage has strong game-only WLD disclosure;
- wallet, minigames, exchange, shop and quests are prominent quick links;
- multiple sponsored advertisement placements exist;
- monthly news is unpopulated;
- lobby can look quiet;
- guide remains strongly finance/wealth oriented;
- announcements page has no published notice while carrying a sponsored placement.

No visible public consumer loop currently demonstrates `follow chosen thread → opt into useful return update → exact-context return`.

Runtime code/copy was not modified.

## Security / abuse / privacy

High:
- Moneyverse notification impersonation / phishing / ATO;
- private-state leakage on lock screens/shared devices;
- commercial messaging disguised as required/service communication.

Medium:
- notification fatigue/coercive retention;
- multi-account notification reward farming;
- analytics overcollection.

Minimum conditions include canonical-domain consistency, privacy-minimized previews, public-safe fields, separate commercial purpose/consent, easy opt-out, no meaningful WLD/WDX reward for permission/open/click, and no session/recovery/private-economy data in attribution payloads.

Actual outbound messaging, personalized sensitive push/email, commercial campaigns and deep links require separate development/security/privacy/fraud/legal QA when implemented.

## Legal notes

Korea: KISA 2026-03-04 anti-spam revision is treated as a current consumer-messaging guardrail. Exact applicability to each channel/campaign remains legal-review required.

United States: CAN-SPAM remains the baseline for commercial email. Apple/Android rules are platform guidance/policy and do not replace legal review.

## Files planned for this version

- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-permission-to-return-v2026.09.14.66.md`
- `docs/changelog/2026-09-14-permission-to-return-v2026.09.14.66.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.66.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.66.ko.md`

## Validation / release state

- English canonical + Korean counterpart parity maintained.
- Documentation content itself requires no runtime test.
- No runtime, DB, API, authentication, scheduler, infrastructure or security-code change.
- No Test/Production deployment should be triggered by this documentation-only update.
- Runtime verification was available separately and recorded above.
- Final `main` SHA is recorded after atomic tree/commit/ref update.
