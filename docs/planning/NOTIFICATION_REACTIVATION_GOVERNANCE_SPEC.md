# Woldeok Moneyverse — Notification & Reactivation Governance Specification

> Version: v2026.09.13.12
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`, `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md`
> Korean counterpart: [NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.ko.md](NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.ko.md)

## 0. Purpose

Moneyverse already plans weekly recaps, comeback missions, season-close notices, community alerts and security/account messages. This specification turns those goals into one implementable notification contract covering in-app inbox, email, web/mobile push and any future SMS channel.

The goal is not to maximize message volume. The goal is to send the smallest number of timely, understandable messages that help a user complete an intended action, protect an account, understand a service change or return to a useful activity.

## 1. Notification taxonomy

Every template must have exactly one primary purpose class:

1. `SECURITY_CRITICAL` — suspicious login, password/authenticator change, recovery, new session, security lock.
2. `TRANSACTIONAL` — purchase receipt, refund, billing failure, account export/delete status, value-changing action receipt where appropriate.
3. `SERVICE_OPERATIONAL` — maintenance, outage, migration or material service availability change.
4. `PRODUCT_ACTIVITY` — quest, job, collection, business, market-watch, community or club activity requested by the user.
5. `SEASON_LIVEOPS` — season start/end, D-14/D-7/D-3/D-1 reminders, event lifecycle and earned reward reminders.
6. `REACTIVATION` — weekly recap, comeback mission, unfinished objective, return summary.
7. `MARKETING_COMMERCIAL` — paid plan, sponsored content, promotional offer or other commercial solicitation.

A commercial purpose must never be disguised as `SECURITY_CRITICAL`, `TRANSACTIONAL`, `SERVICE_OPERATIONAL` or a generic “benefit notification”.

## 2. Channel policy

Supported product channels are planned as:

- in-app inbox: baseline channel for account users;
- email: account/security/transactional plus separately consented optional categories;
- web/mobile push: opt-in and OS-permission dependent;
- SMS: disabled by default until a concrete product need, provider, jurisdictional review and cost model exist;
- Discord: only through explicit linked-account/community preferences and platform-policy-compliant delivery.

Critical account security messages may use an available verified channel where necessary to protect the account, but this exception must not be reused for promotion.

## 3. Consent and preference model

Preferences are server-authoritative and purpose-specific. Recommended states:

`UNKNOWN`, `OPTED_IN`, `OPTED_OUT`, `REQUIRED_SERVICE`, `CHANNEL_UNAVAILABLE`, `PENDING_VERIFICATION`.

At minimum store:

- `user_id`;
- `purpose_code`;
- `channel`;
- `state`;
- `policy_version`;
- `source_surface`;
- `consented_at` / `revoked_at`;
- locale and timezone snapshot where relevant;
- proof/audit identifier without storing unnecessary sensitive payloads.

Marketing/privacy consent and advertising-message transmission consent must remain separately representable where Korean law/policy requires them. A user rejecting optional marketing must still be able to use the core service.

Opt-out must take effect across future queued optional messages, not only new scheduling requests. Preference updates need idempotency and auditable timestamps.

## 4. Korea anti-spam product requirements

Moneyverse must treat Korea commercial-message compliance as a release gate for email, push, SMS or other promotional electronic messages.

Product rules:

- do not use ambiguous consent labels such as “benefit alerts” or “information updates” when the actual purpose is advertising;
- separate marketing-related personal-data consent from consent to receive advertising messages when both are required;
- an app-push advertising opt-out path must not force unnecessary login or complex steps merely to refuse marketing;
- promotional coupons, points or similar benefits must not be used as a pretext to send advertising messages without the required prior consent;
- required sender/advertising/opt-out disclosures must be implemented for each applicable channel before launch;
- maintain evidence of consent version, acquisition source and revocation.

Reference adopted: Korea Internet & Security Agency, `불법스팸 방지를 위한 정보통신망법 안내서` 7th revision notice, published 2026-03-04. Direct adoption: clear consent purpose and low-friction opt-out. Legal applicability details remain `legal review required` before commercial launch.

## 5. United States commercial email baseline

Commercial email must be designed to support CAN-SPAM obligations including accurate sender/header information, non-deceptive subject lines, required advertising identification where applicable, a valid opt-out mechanism and suppression of future commercial email after an effective opt-out within the legally required period.

The product should operationally process opt-outs immediately when feasible rather than intentionally waiting for the outer statutory window.

Reference adopted: U.S. FTC CAN-SPAM statute/guidance. Direct adoption: unsubscribe, truthful header/subject and suppression-list architecture. SMS/robotext and state-specific obligations require separate legal review before launch.

## 6. OS notification permission and channel controls

Push permission is not equivalent to Moneyverse marketing consent.

- Android 13+ notification delivery requires the platform `POST_NOTIFICATIONS` runtime permission for non-exempt notifications.
- Permission prompts should be requested in context after explaining user value, not automatically on first paint.
- Android notification channels must map to clear categories so users can mute lower-value classes without losing critical account information where the OS permits.
- Apple interruption levels are not a growth lever. `timeSensitive` or `critical` must be reserved for genuinely urgent product needs and platform-policy-compliant use; ordinary season, social, marketing or comeback messages remain passive/normal.

## 7. Quiet hours and timing

Default optional-notification quiet hours: user-local 22:00–08:00 unless the user chooses another schedule.

Quiet hours apply to `PRODUCT_ACTIVITY`, `SEASON_LIVEOPS`, `REACTIVATION`, and `MARKETING_COMMERCIAL` by default. `SECURITY_CRITICAL` and genuinely time-critical `SERVICE_OPERATIONAL` messages may bypass quiet hours when delay would materially harm the user.

If timezone is unknown, do not infer precise location from IP solely for marketing. Use account/device timezone when available and fall back to a conservative configured service timezone.

## 8. Frequency and fatigue control

The default product does not impose arbitrary gameplay caps, but notification delivery needs protective frequency controls because attention and anti-spam integrity are safety concerns.

Suggested initial guardrails, configurable and not gameplay limits:

- reactivation: no more than 2 optional outbound messages in 7 days without a fresh user interaction;
- general product activity: coalesce repeated events into digest form where practical;
- community bursts: aggregate multiple reactions/replies into one message per conversation/window;
- season reminders: use the documented D-14/D-7/D-3/D-1 schedule rather than repeated countdown spam;
- marketing: conservative cadence, separately configurable by channel and jurisdiction;
- security: event-driven, not frequency-capped in a way that hides real attacks.

A frequency cap is a communication-safety protection and must not block gameplay, XP, quests, purchases or normal progression.

## 9. Deduplication and idempotency

Every generated message should carry a deterministic key such as:

`notification:{purpose}:{user_id}:{object_id}:{event_version}`

The scheduler must prevent duplicate sends across retries. Provider retry must reuse the logical message identity. Delivery callbacks must be idempotently recorded.

Do not send multiple messages because a worker retried, a webhook duplicated, a deployment restarted or a season settlement was replayed.

## 10. Reactivation product design

Reactivation should summarize state and offer one useful next action rather than manufacture loss aversion.

A comeback message may include:

- what changed since the last active session;
- unfinished season/story objective;
- one recommended next action;
- watchlist or business change summary using authoritative data;
- earned/unclaimed reward that already belongs to the user;
- exact event/season dates where relevant.

Forbidden patterns:

- “your money is disappearing” when it is not;
- fake countdowns;
- invented scarcity;
- repeated “urgent” language for ordinary retention;
- larger WLD grants solely because a user churned;
- suggestions to make many trades to recover losses;
- obscuring virtual/simulated/game-only status of WLD/WDX.

## 11. Financial-game notification safety

Market-related notifications must avoid encouraging compulsive or high-risk activity.

Allowed examples:

- watchlist issuer event published;
- market maintenance/settlement state changed;
- journal review reminder explicitly requested by the user;
- portfolio diversification lesson available;
- order execution/rejection receipt where implemented.

Not allowed as default growth notifications:

- “buy now before it rises”;
- “sell before you miss out”;
- repeated P/L alerts optimized to increase trade count;
- profit-guarantee or recovery language;
- personalized urgency based solely on recent losses.

Trading frequency is not a notification success KPI.

## 12. Minor safety

For `child_restricted` or other protected minor states:

- personalized advertising notifications are disabled by default;
- marketing eligibility follows the minor-safety/guardian-consent specification;
- sensitive social notifications must not expose private content on lock-screen previews by default;
- account-security alerts remain available through appropriate verified channels;
- age/guardian data is not copied into notification-provider payloads unless strictly necessary.

## 13. Template contract

Every template version must define:

- `template_code` and version;
- purpose class;
- eligible channels;
- locale;
- title/subject and body variables;
- deep-link allowlist;
- consent requirement;
- quiet-hour behavior;
- TTL/expiry;
- dedupe window/key;
- sensitive-preview policy;
- fallback channel policy;
- accessibility review status;
- legal/compliance review state where applicable.

Templates cannot contain arbitrary operator HTML/JS. Variables are typed and escaped for the destination channel.

## 14. Deep-link security

Notification links may only target allowlisted first-party routes or reviewed external destinations.

- never place session tokens, reset secrets, payment secrets or raw personal data in URLs;
- sensitive actions require normal authentication/reauthentication after navigation;
- a notification link does not confer authorization;
- expired or deleted objects must land on a safe explanatory state;
- marketing attribution parameters must not carry private financial/account identifiers.

## 15. Data model

Suggested tables/read models:

- `notification_preferences`;
- `notification_templates`;
- `notification_events`;
- `notification_deliveries`;
- `notification_suppressions`;
- `notification_digest_items`;
- `notification_provider_receipts`;
- `notification_audit_events`.

Provider tokens/endpoints should be encrypted or otherwise protected according to their sensitivity and never exposed in ordinary admin lists or logs.

## 16. API contract

Candidate APIs:

- `GET /api/v1/notifications` — authenticated inbox, cursor pagination;
- `POST /api/v1/notifications/:id/read` — idempotent read state;
- `POST /api/v1/notifications/read-all`;
- `GET /api/v1/account/notification-preferences`;
- `PUT /api/v1/account/notification-preferences` — versioned, CSRF-protected mutation;
- `POST /api/v1/account/notification-endpoints` — register verified push endpoint/device token;
- `DELETE /api/v1/account/notification-endpoints/:id`;
- email unsubscribe endpoint using a scoped, single-purpose token that cannot authenticate the account.

Admin APIs must support preview/test-send only to approved operator/test destinations before broad scheduling.

## 17. Scheduler and delivery pipeline

Recommended flow:

`domain event -> eligibility/purpose evaluation -> preference/consent check -> quiet-hours/frequency check -> dedupe -> template render -> outbox -> provider -> delivery receipt -> analytics/audit`.

Value-changing transactions must never depend on successful notification delivery. Notifications are post-commit side effects. A failed email/push must not roll back a ledger transaction that already committed.

## 18. User interface

### Notification center

Desktop: grouped list with filters for All / Account / Market / Season / Community / Billing.

Mobile: card list with large touch targets and bottom-safe navigation. Unread status uses icon/text plus styling, not color alone.

States: loading/skeleton, empty, offline/stale, partial provider failure, error, permission denied for push setup, maintenance.

### Preferences

Each optional category shows purpose and channel separately. Security/service-required messages are visibly explained rather than shown as a misleading disabled toggle.

Changing an optional preference should save without destroying unsaved changes elsewhere. Do not auto-refresh the whole page while the user edits preferences.

## 19. Accessibility

- notification preference controls require programmatic labels and visible focus;
- switches expose on/off state to assistive technology;
- toast announcements use appropriate `aria-live` without repeatedly interrupting screen readers;
- time/date strings include timezone context when ambiguity matters;
- notification content cannot rely only on red/green or icons;
- dismiss/read actions have keyboard and touch equivalents.

## 20. Analytics and KPI

Track by purpose/channel, without using raw private payloads:

- generated, suppressed, queued, sent, delivered and failed;
- open/click where legally and technically appropriate;
- unsubscribe/opt-out rate;
- notification-permission grant/deny rate;
- complaint/spam rate where available;
- digest/coalescing rate;
- duplicate-prevention count;
- reactivation return rate at D1/D7 after message;
- downstream meaningful action, not only click;
- session and support impact;
- minor-policy block count;
- provider cost per delivered message.

Guardrail: a higher click/open rate does not justify higher complaint, opt-out, error, risky-trading or minor-policy violation rates.

## 21. Monetization impact

Notifications may support subscription/billing reminders and separately consented promotions, but:

- paid placement does not override preference/quiet-hour/minor rules;
- sponsored messages must be clearly identified;
- no advertiser can buy priority in security/account notification surfaces;
- marketing delivery cost, unsubscribe rate, churn and support cost are included in profitability analysis;
- WLD/WDX ranking, market price or recommendation logic does not change because an advertiser paid for a message.

## 22. SEO impact

Private notification inboxes, preferences, unsubscribe-status pages and device endpoints are authenticated or token-scoped and `noindex`.

Public help pages explaining notification settings, unsubscribe, security alerts and communication choices may be indexable. They must not expose user-specific preference state.

## 23. Admin console

Operators may:

- search templates/config by code;
- preview rendered locale variants with synthetic/test data;
- see eligible audience count before scheduling;
- see suppression/consent/frequency estimates;
- pause/cancel future optional campaigns;
- inspect aggregate delivery failures;
- review audit history.

Operators may not:

- bypass an explicit opt-out for marketing;
- export unrestricted device tokens/contact lists;
- edit security notification history;
- use Production user addresses for casual test sends;
- automatically refresh an in-progress campaign form and discard operator input.

High-impact campaign launch requires reason capture and a final audience/purpose/channel preview.

## 24. Operational config

Config should include explicit null/unlimited semantics only where appropriate. Communication-safety limits are protection controls, not gameplay limits.

Example keys:

- `notifications.enabled`;
- `notifications.channel.email.enabled`;
- `notifications.channel.push.enabled`;
- `notifications.channel.sms.enabled=false`;
- `notifications.quiet_hours.default_start`;
- `notifications.quiet_hours.default_end`;
- `notifications.reactivation.max_7d`;
- `notifications.marketing.max_7d`;
- `notifications.digest.window_minutes`;
- `notifications.provider.timeout_ms`;
- `notifications.provider.retry_policy_version`.

Every config change is versioned and auditable.

## 25. Abuse and security

Protect against:

- endpoint registration hijacking;
- email enumeration through unsubscribe/recovery behavior;
- notification-bombing through attacker-triggerable events;
- HTML/script injection in templates/user-generated variables;
- malicious deep links;
- provider webhook spoofing;
- queue replay/duplicate sending;
- admin mass-send mistakes;
- leaking private community/financial content in lock-screen previews.

Provider callbacks require signature/authenticity validation when supported.

## 26. Definition of Done

The notification system is not release-complete until:

- purpose taxonomy and required-vs-optional rules are implemented;
- user preferences are server-authoritative and auditable;
- marketing opt-out suppresses already queued optional messages where practical;
- quiet hours and frequency controls are tested;
- dedupe/idempotency tests pass;
- security alerts cannot be repurposed for marketing;
- provider tokens/secrets are protected and redacted;
- EN/KO templates and preference UI have parity;
- desktop/mobile/accessibility states are verified;
- minor restrictions are tested;
- email/push failure does not break authoritative product transactions;
- analytics distinguish send/delivery/action from mere generation;
- legal review checklist covers Korea/US commercial messaging before launch;
- Test environment exact-SHA verification is complete for runtime implementation.

## 27. Research note — 2026-09-13

- **KISA / official anti-spam guidance / 2026-03-04** — direct adoption: explicit advertising-consent wording, low-friction app-push refusal, stronger handling of benefit/coupon notices. Source type: Korean government-affiliated security agency guidance.
- **FTC / CAN-SPAM statute and business guidance / current as checked 2026-09-13** — direct adoption: truthful sender/subject, commercial-email opt-out and suppression architecture. Source type: U.S. federal regulator/statute.
- **Android Developers / notification runtime permission / checked 2026-09-13** — direct adoption: Android 13+ runtime permission and contextual permission request. Source type: official platform developer documentation.
- **Apple Developer / notification HIG and interruption levels / checked 2026-09-13** — reference/direct adoption: user permission and restrained use of interruption priority. Source type: official platform design/developer documentation.

## 28. Delivery priority

P0: preference/consent model, security/transactional delivery, suppression, dedupe, in-app inbox and operator audit.

P1: push/email product categories, quiet hours, digesting, season lifecycle messages and comeback summaries.

P2: measured personalization and experimentation only after consent, complaint, fatigue and minor-safety guardrails are proven.

This version is documentation-only. Runtime implementation requires a separate development branch, isolated Test exact-SHA verification, backend/API/database/provider validation, then Production promotion.