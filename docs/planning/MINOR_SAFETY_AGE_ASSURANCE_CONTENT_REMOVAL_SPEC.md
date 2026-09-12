# Woldeok Moneyverse — Minor Safety, Age Assurance & Content Removal Specification

> Version: v2026.09.12.35
> Status: Living implementation-oriented product/compliance specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `COMMUNITY_MARKET_INTEGRITY_SPEC.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
> Korean counterpart: [MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.ko.md](MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.ko.md)

## 0. Purpose

Moneyverse combines accounts, community UGC, virtual finance/game systems, notifications and future advertising. Those surfaces require an explicit minor-safety and age-assurance contract instead of a generic “legal review” note.

This specification defines a privacy-minimizing age-state model, parental-consent gate where legally required, age-sensitive feature/advertising rules, emergency content-removal intake, retention/deletion rules, SEO boundaries and implementation acceptance criteria.

This document is product engineering guidance, not legal advice. Jurisdiction-specific launch decisions remain **legal review required**.

## 1. Governing principles

1. Collect the least age-related data needed to select a lawful product mode.
2. Do not collect government ID, biometric data or exact birth date merely because an age band is useful.
3. If stronger age assurance is legally or risk-justified, isolate the evidence flow and retain the minimum verification result rather than raw evidence where possible.
4. Child/teen state must never be used as an engagement or monetization targeting signal.
5. Under-age uncertainty fails toward the safer product mode, not toward personalized advertising or unrestricted social features.
6. Safety restrictions are protection-purpose controls and are permitted exceptions to the unlimited-default gameplay policy.
7. Age checks do not replace authentication, authorization, abuse prevention, moderation or parental-consent requirements.

## 2. Account age-state model

Persist a coarse policy state, not an unnecessary copy of identity evidence.

Suggested states:

- `age_state = unknown`
- `age_state = adult_confirmed`
- `age_state = teen_confirmed`
- `age_state = child_restricted`
- `age_state = guardian_consent_pending`
- `age_state = guardian_consent_verified`
- `age_state = verification_required`

Suggested metadata:

- `age_policy_version`
- `jurisdiction_policy_code`
- `assurance_method`
- `assurance_provider_ref` where needed
- `verified_at`
- `expires_at` only when re-verification is justified
- `guardian_consent_version`
- `guardian_consent_at`

Do not expose these fields publicly or include them in analytics payloads that do not need them.

## 3. Korea policy gate

For Korea, the service must treat collection/use of personal information from a child under 14 as a legal-consent boundary requiring verified legal-representative consent where applicable. The service should request only the minimum representative information needed for that consent flow and document the lawful basis and retention period.

Product defaults before launch review:

- if the service cannot lawfully complete the required representative-consent flow, do not complete a personal-data account for the affected child;
- marketing and behavioral-ad consent must never be bundled into required account consent;
- age/guardian evidence is not reused for unrelated profiling;
- purpose-completed evidence is deleted or irreversibly minimized according to the retention schedule;
- API authorization and access-control tests must cover child/guardian state, not only UI hiding.

## 4. United States policy gate

COPPA coverage and actual-knowledge rules require a separate launch review. For users known to be under 13, personal-information collection, use and disclosure must follow the applicable COPPA notice/parental-consent rules.

The February 2026 FTC age-verification policy statement supports age-verification processing without prior parental consent only under stated conditions, including sole-purpose use, prompt deletion, limited disclosure, clear notice, reasonable safeguards and reasonable accuracy assessment. Moneyverse must not treat that enforcement policy as permission to retain identity evidence for unrelated purposes.

`COPPA 2.0` proposals or other pending legislation are tracked as **monitor/reference**, not implemented as enacted law until legally effective.

## 5. Age-assurance UX

### 5.1 First-party low-data path

Prefer an age-band or birth-year screen only when it is sufficient for the jurisdiction and product decision. Do not pre-fill, infer or manipulate the answer.

Required UI states:

- default form;
- explanation of why age is requested;
- privacy link near the input;
- invalid/incomplete state;
- safer-mode result;
- guardian-consent-required state;
- verification-provider handoff state;
- verification failure/retry;
- support/escalation path.

The flow must not use dark patterns such as making the adult option visually dominant or repeatedly prompting a restricted minor to change the answer.

### 5.2 Higher-assurance path

If higher assurance becomes necessary:

- use a provider only after privacy/security/vendor review;
- prohibit vendor reuse for advertising, identity graphing or model training unless separately lawful and explicitly approved;
- contractually require confidentiality/security and defined deletion;
- receive a minimal result such as age band/threshold pass where practical;
- avoid storing raw ID images, face templates or biometric samples in Moneyverse systems;
- provide fallback/manual review only when it can be operated safely.

## 6. Minor product mode

A minor-safe mode should reduce risk without turning ordinary play into a punitive experience.

Default restrictions pending legal review:

- no personalized/behavioral ads for child-restricted accounts;
- no sale/share-style advertising data flow based on minor activity;
- no public display of exact age/birthday;
- conservative profile discoverability and DM defaults;
- stronger anti-contact, block/report and moderation controls;
- no financial-outcome marketing language;
- no targeted prompts designed to increase trading frequency, gambling-like engagement or compulsive use;
- no real-money purchase path for minors until parental/payment/legal policy is separately approved;
- quiet-hour and notification-frequency protections where implemented.

The virtual-stock, bank and economy UI must continue to state that WDX/WLD are simulated/game-only and not real financial products.

## 7. Advertising and monetization impact

Age state is a monetization gate.

`child_restricted` and equivalent high-risk states:

- personalized advertising: **off**;
- cross-context behavioral profiling for ads: **off**;
- sponsored content must remain clearly labeled and contextually selected if allowed;
- ad measurement should use the minimum data necessary;
- no ads adjacent to buy/sell, loan/repayment, report/block, guardian-consent or safety CTAs;
- no economic advantage may be sold through age-gated monetization.

Revenue dashboards must separate adult-eligible inventory from restricted inventory rather than pressuring product teams to weaken age/privacy controls to preserve fill rate.

## 8. Community content safety and removal

Moneyverse requires a dedicated intake path for urgent harmful-content complaints, separate from ordinary quality/spam reports.

Minimum report classes:

- sexual/intimate imagery shared without consent;
- content involving or apparently involving minors;
- credible threats or doxxing;
- impersonation/account takeover;
- harassment/stalking;
- self-harm emergency escalation where policy requires;
- illegal-content category determined by jurisdiction/legal policy.

### 8.1 TAKE IT DOWN Act readiness

For U.S. operations, create a legal-review-backed process for requests covered by the TAKE IT DOWN Act and preserve the ability to remove a reported intimate image/video and known identical copies within the statutory window when the request is valid and the platform is covered.

Implementation requirements:

- dedicated public request form reachable without login;
- request receipt timestamp and immutable case ID;
- minimal claimant/contact data;
- content locator(s) and structured attestations required by policy;
- high-priority moderation queue;
- decision and removal timestamps;
- known-copy matching only with privacy/security review;
- appeal/escalation path;
- preservation of minimum legal/audit evidence without retaining prohibited content longer than necessary;
- operator runbook and after-hours escalation.

Do not require a victim to publish additional sensitive information to prove the request.

## 9. Data retention and deletion

Create a field-level retention inventory for:

- age-screen result;
- verification-provider reference;
- guardian contact/consent evidence;
- moderation request data;
- removed-content fingerprints where legally/security justified;
- case audit events.

Rules:

- raw verification evidence is not retained by Moneyverse by default;
- verification-only data is deleted promptly after the result is established unless a documented requirement needs longer retention;
- guardian data is used only for consent/safety functions authorized by policy;
- account deletion/export workflows must understand minor/guardian records;
- backups must honor eventual deletion/anonymization policy;
- logs must not contain raw IDs, biometric material, intimate content or unrestricted report bodies.

## 10. Database/API contract

Recommended entities:

- `account_age_policy_state`
- `guardian_consents`
- `age_assurance_events`
- `safety_reports`
- `content_removal_cases`
- `content_removal_actions`

Security requirements:

- parameterized queries/fixed reviewed DB functions only;
- least-privilege roles;
- actor-scoped reads;
- support/operator masking by default;
- high-risk evidence access requires purpose, reauthentication and audit;
- idempotent report creation where retryable;
- server-authoritative feature gates;
- no client-provided `is_minor=false` bypass.

## 11. Admin console

Provide queues rather than a generic unrestricted user-data browser.

Required views:

- age/guardian verification exceptions;
- urgent content-removal queue;
- SLA/age-of-case indicator;
- restricted evidence preview;
- action history;
- reason-coded outcomes;
- escalation/legal-review status;
- deletion/retention timer.

Input forms must not auto-refresh while an operator is typing. Updates should be user-triggered or non-destructive patches.

## 12. Analytics

Track privacy-safe operational events:

- `age_gate_started`
- `age_gate_completed`
- `age_gate_restricted`
- `guardian_consent_started`
- `guardian_consent_completed`
- `safety_report_submitted`
- `safety_report_triaged`
- `content_removed`
- `content_copy_removed`
- `content_removal_appealed`

Do not send exact date of birth, guardian contact data, raw evidence or sensitive report text to general analytics.

KPIs:

- age-gate completion/error rate;
- verification false-reject/manual-review rate;
- guardian-consent completion time;
- urgent-report acknowledgement time;
- valid-removal time;
- known-copy removal success rate;
- appeal/reversal rate;
- restricted-account personalized-ad exposure incidents (target: zero);
- retention-policy deletion success rate.

## 13. SEO and indexation

Public safety/privacy information should be discoverable; private case and account data must never be indexed.

Indexable candidates:

- safety center;
- child/teen privacy overview;
- reporting instructions;
- content-removal request instructions;
- community standards;
- parental/guardian help page.

Noindex/auth-protected:

- report status pages;
- evidence upload URLs;
- guardian verification pages;
- account age-state pages;
- moderation/admin queues;
- private appeals.

Use canonical public URLs, meaningful titles/headings, server-rendered status where practical and structured data only when it accurately matches visible content. Do not create doorway pages or mass-generated thin safety pages for search traffic.

## 14. Testing and Definition of Done

Before runtime release:

1. unit tests for age-state policy transitions;
2. API/BOLA tests for guardian/minor boundaries;
3. SQL-injection tests on age/report/admin inputs;
4. child-restricted ad-personalization negative test;
5. server-side feature-gate bypass tests;
6. deletion/retention tests including backup restore behavior;
7. report creation/duplicate/idempotency tests;
8. urgent-removal SLA workflow drill;
9. mobile/desktop accessibility QA for age and reporting flows;
10. screen-reader labels, visible focus, keyboard operation and non-color-only status;
11. analytics payload inspection for prohibited personal data;
12. SEO test confirming private routes are noindex/auth protected.

Runtime work must use a separate development branch -> isolated Test exact-SHA deployment -> backend/DB/API/UI/security validation -> Production promotion. This documentation-only version requires no Test deployment.

## 15. Rollout priority

### P0 before broad public/community monetization

- coarse age-state model;
- Korea under-14 consent decision and implementation path;
- U.S. COPPA applicability decision;
- minor-safe advertising gates;
- public urgent content-removal intake;
- moderation SLA/runbook;
- retention inventory;
- legal review checklist.

### P1

- vetted higher-assurance provider if actually required;
- guardian account/consent management UX;
- known-copy removal tooling after privacy/security review;
- safety-center public documentation and SEO.

### P2

- automated risk routing with human override;
- aggregate safety transparency metrics;
- region-specific policy expansion.

## 16. Research record — 2026-09-12

**Directly adopted**

- U.S. FTC, 2026-02: COPPA age-verification enforcement policy statement — sole-purpose age verification, prompt deletion, limited disclosure, notice, security and reasonable-accuracy conditions.
- U.S. FTC, 2026: TAKE IT DOWN Act compliance guidance — covered-platform removal process and 48-hour requirement for valid requests.
- Korea PIPC, 2026-02 enforcement release: under-14 collection without legal-representative consent was sanctioned; the release also emphasizes minimal collection, API access control and deletion after purpose/retention expiry.

**Reference / monitor**

- Korea PIPC, 2026-07: G7 privacy authorities highlighted child online privacy as a current priority.
- Korea PIPC, 2026-04 summary of U.S. COPPA 2.0 Senate action: treated as legislative monitoring, not enacted-law baseline.
- Google Search Central, updated 2026-09-10: structured-data/search-appearance documentation used only for public safety/help-page SEO; private case data remains excluded.

## 17. Runtime verification

`easy-scraping.com` could not be fetched successfully during this planning pass. Runtime verification is therefore **unavailable**. No healthy Production or Test behavior is assumed from documentation alone.
