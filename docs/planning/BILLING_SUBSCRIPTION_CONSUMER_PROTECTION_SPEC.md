# Woldeok Moneyverse — Billing, Subscription & Consumer Protection Specification

> Version: v2026.09.13.6
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`
> Korean counterpart: [BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.ko.md](BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.ko.md)

## 1. Purpose

This specification converts Moneyverse real-money monetization from a conceptual revenue channel into a buildable billing contract. It applies to ad-free subscriptions, non-P2W cosmetic purchases, optional presentation conveniences, future sponsor-funded consumer offers, refunds, chargebacks and billing support.

No real-money product may grant WLD yield, improved WDX execution, cheaper loans, higher rank score, stronger random odds, faster business profit, market-moving information or any other competitive/economic advantage.

WLD and WDX remain virtual/game-only. A payment purchases only the explicitly described entitlement; it does not create cash-redemption, securities, deposit, investment, gambling or guaranteed-value rights.

## 2. Launch gates

Real-money checkout remains `planned / not implemented` until all P0 gates pass:

1. legal review for Korea and intended U.S. states/consumer scope;
2. merchant/seller identity, support and required disclosures finalized;
3. versioned product/price catalog and entitlement model implemented;
4. server-side payment-provider integration with webhook verification and idempotency;
5. cancellation, refund, dispute and failed-payment flows tested in isolated Test;
6. minor/age policy integrated with paid-product eligibility;
7. privacy/data inventory updated for billing processors;
8. analytics separates gross revenue, fees, refunds, disputes and tax from game-economy ledgers;
9. account deletion/retention behavior for legally required billing records documented;
10. support/admin tools cannot expose full payment credentials.

No Production enablement from frontend-only checkout work.

## 3. Product catalog

Each sellable real-money item uses a server-authoritative immutable price version.

Recommended entities:

```text
billing_products
billing_price_versions
billing_offers
billing_orders
billing_payment_attempts
billing_subscriptions
billing_subscription_events
billing_entitlements
billing_consents
billing_refunds
billing_disputes
billing_webhook_events
billing_support_cases
```

Minimum `billing_products` fields:

```text
product_id
product_type                 # subscription | cosmetic | convenience
name_i18n_key
description_i18n_key
entitlement_code
p2w_classification          # must be NON_P2W for launch
age_policy
availability_state
created_at
retired_at
```

Minimum immutable `billing_price_versions` fields:

```text
price_version_id
product_id
currency
amount_minor_units
billing_interval            # null for one-time
trial_duration
jurisdiction_scope
tax_display_mode
starts_at
ends_at
terms_version
refund_policy_version
```

A price already used by a completed or pending order is not edited in place. Create a new price version.

## 4. Subscription state machine

Moneyverse owns an internal subscription read model even when an external provider is authoritative for payment processing.

Recommended state machine:

`NONE -> PENDING -> TRIALING -> ACTIVE -> PAST_DUE -> GRACE -> CANCELED -> EXPIRED`

Additional terminal/exception states:

- `PAYMENT_FAILED`
- `REFUNDED`
- `DISPUTED`
- `SUSPENDED_FRAUD_REVIEW`

Rules:

- provider events never directly grant frontend trust; server webhook verification updates internal state;
- duplicate/out-of-order webhooks are idempotently absorbed;
- entitlement grant and revoke operations are independently idempotent;
- cancellation stops future renewal but does not silently erase already-paid access unless the policy explicitly requires immediate revocation;
- refund/chargeback entitlement consequences are defined per product and cannot rewrite game-economy history;
- payment status and WLD ledger status are separate domains.

## 5. Purchase and renewal UX

Before the final purchase action, show in the same decision context:

- product/service name;
- total price in transaction currency;
- billing interval for recurring products;
- whether and when it renews;
- trial end date and exact post-trial price where a trial exists;
- taxes/fees display as required by jurisdiction;
- material eligibility/age restrictions;
- material cancellation/refund conditions;
- link to applicable terms/privacy/refund policy;
- affirmative purchase CTA that clearly communicates payment obligation.

Forbidden:

- pre-checked paid add-ons;
- visual hierarchy that hides recurring billing;
- presenting a recurring plan as a one-time payment;
- fake countdowns or fake scarcity;
- bundling paid consent into unrelated privacy consent;
- requiring a cancellation reason before cancellation can complete;
- hiding cancellation behind support contact when online self-service is technically available.

## 6. Cancellation contract

Moneyverse product policy is deliberately simple even when jurisdictional rules differ.

- online sign-up must have online self-service cancellation;
- Account > Billing shows current plan, next charge date, price, cancellation state and entitlement end date;
- cancellation CTA is visible without searching help articles;
- one confirmation step is permitted for accidental-click prevention;
- save offers may be presented only after the user can clearly continue cancellation;
- cancellation reason is optional;
- completion immediately writes a timestamped cancellation event and shows confirmation;
- user receives durable confirmation through account history and supported notification channel;
- no renewal charge may be initiated after an effective cancellation cutoff;
- reactivation requires an explicit new action.

## 7. Korea-specific consumer protection baseline

Before Korea real-money launch: `legal review required`.

Product design must accommodate current Electronic Commerce Act requirements and Korea Fair Trade Commission guidance, including consumer-facing transaction information, cancellation/withdrawal rules, refunds and dark-pattern restrictions.

The February 14, 2025 dark-pattern regime is treated as an active product constraint. In particular, recurring-payment price increases and transitions from free to paid require the legally required prior consumer notice/consent flow rather than a silent renewal-path change.

The system must support:

- seller/business disclosure;
- total price and recurring terms before payment;
- order/contract confirmation;
- consumer withdrawal/refund handling within applicable statutory rules and digital-content exceptions;
- evidence of what terms and price the user saw and accepted;
- support contact and dispute intake;
- minor-purchase rules where applicable;
- Korean-language disclosure parity with the actual checkout.

Do not hard-code one universal refund window into the UI without legal classification of the sold digital product and consumption state.

## 8. United States consumer protection baseline

Before U.S. real-money launch: `legal review required` for the actual states served and offer structure.

Moneyverse must not treat the FTC's vacated 2024 Click-to-Cancel rule as currently binding law. Current design instead uses a durable baseline drawn from ROSCA, FTC Act enforcement and ongoing 2026 negative-option rulemaking:

- clear and conspicuous material recurring-payment terms before billing information is submitted;
- express informed consent before charges;
- straightforward mechanism to stop recurring charges;
- no charges after valid cancellation;
- no misleading savings, trial, cancellation or renewal claims.

State automatic-renewal laws may add notice, acknowledgment, reminder or cancellation obligations; launch review must map supported states before Production.

## 9. Payment data and security boundary

Moneyverse should minimize PCI/payment-card scope by using a reputable payment provider's hosted/tokenized payment collection where feasible.

Never store:

- raw PAN/card number;
- CVV/CVC;
- magnetic-stripe data;
- provider secret keys in source control;
- full payment tokens in ordinary logs.

Store only provider references and data necessary for accounting, support, entitlement and legal obligations.

All state-changing billing endpoints require authentication, CSRF protection where cookie-authenticated, idempotency keys, server-side product/price lookup and authorization. Client-submitted amount/currency/entitlement values are never authoritative.

Webhook processing requires:

- provider signature verification;
- raw-payload verification when provider protocol requires it;
- event ID uniqueness;
- received/processed timestamps;
- replay-safe state transitions;
- dead-letter/retry visibility;
- secret rotation plan;
- no trust in user-supplied webhook payloads.

## 10. Entitlement architecture

Payment and entitlement are separate but linked state machines.

Example entitlements:

- `AD_FREE`
- `PROFILE_THEME_PACK_2026A`
- `ROOM_COSMETIC_BUNDLE_CITY`
- `ARCHIVE_PRESENTATION_PLUS`

Entitlements must never become authoritative WLD/WDX balances.

An entitlement record includes:

```text
entitlement_id
user_id
entitlement_code
source_order_id
source_subscription_id
state
granted_at
valid_until
revoked_at
revoke_reason
```

Frontend checks entitlement through the application API. It does not trust local storage or a client-only purchase flag.

## 11. Refund, failed-payment and dispute behavior

Refunds require an explicit ledger separate from the WLD double-entry economy ledger.

Refund workflow:

`REQUESTED -> ELIGIBILITY_REVIEW -> APPROVED | REJECTED -> PROVIDER_PENDING -> COMPLETED | FAILED`

Rules:

- duplicate refund requests are idempotent;
- refund amount cannot exceed captured amount minus prior completed refunds;
- entitlement reversal follows documented product policy;
- cosmetic revocation must not delete unrelated profile/account data;
- support can issue only server-validated refund actions with reason/audit trail;
- chargebacks/disputes enter a separate review state and do not automatically suspend unrelated account access unless fraud risk justifies it;
- failed renewal must not mint or remove WLD.

## 12. Admin and support console

Billing operator views show masked/minimum necessary information:

- user/account reference;
- product/plan;
- price version/currency;
- provider transaction reference;
- payment status;
- entitlement status;
- refund/dispute history;
- consent/terms version;
- audit history.

High-risk actions such as manual entitlement grant/revoke or refund initiation require recent reauthentication, reason capture and append-only audit evidence.

No operator UI may display full card credentials or reusable payment secrets.

## 13. Analytics and profitability

Track separately:

- gross billings;
- recognized/net revenue where accounting defines it;
- payment-provider fees;
- taxes where applicable;
- refunds;
- chargebacks/disputes;
- subscription starts, renewals, cancellations and expiration;
- trial start -> paid conversion;
- failed-payment recovery;
- support contacts per 1,000 payers;
- refund rate and dispute rate;
- ARPU/ARPDAU;
- subscription conversion;
- LTV, CAC and payback period;
- ad-free subscriber retention;
- cancellation completion time and abandonment rate.

Never classify real-money payment as WLD issuance, WLD burn, hard sink or transfer. The real-money billing ledger and virtual-economy ledger remain analytically separate.

## 14. UI states and responsive contract

Billing surfaces require:

- loading/skeleton;
- empty/no-plan;
- price unavailable;
- payment pending;
- success;
- declined;
- provider unavailable;
- duplicate/idempotent replay;
- past due;
- cancellation pending/effective;
- refund pending/completed/rejected;
- offline;
- maintenance;
- permission denied.

Desktop: plan comparison may use cards/table, with purchase summary adjacent.

Mobile: one plan per card, sticky but non-obscuring final CTA, recurring terms immediately above CTA, no horizontal financial tables requiring precision tapping.

Accessibility:

- keyboard-operable checkout and cancellation;
- visible focus;
- screen-reader labels for price/interval/status;
- `aria-live` for payment-state changes where appropriate;
- errors described in text, not color alone;
- currency and interval announced unambiguously.

## 15. SEO and indexing

Indexable candidates:

- public pricing overview;
- public subscription benefit explanation;
- public refund/cancellation/help policy pages.

Must be authenticated/noindex:

- checkout;
- invoices/order history;
- payment methods;
- subscription management;
- refund request status;
- dispute/support cases;
- billing admin console.

Public pricing content must match the checkout catalog and may not advertise stale or unavailable prices. Structured data is used only when it accurately describes visible offers and current availability.

## 16. Abuse and fraud controls

Protection limits are allowed under `DEFAULT_LIMIT_POLICY.md` because they protect payment/security integrity, not ordinary gameplay.

Controls may include:

- velocity/risk checks for repeated payment attempts;
- account/device/network risk scoring;
- duplicate transaction detection;
- refund-abuse review thresholds;
- entitlement replay protection;
- promo/referral self-dealing detection;
- provider risk signals;
- temporary payment-function restriction where fraud evidence exists.

No fraud control should silently confiscate WLD or unrelated virtual assets. Economy remediation follows the separate authoritative ledger/audit process.

## 17. API and idempotency contract

Candidate API surface:

```text
GET  /api/v1/billing/products
POST /api/v1/billing/checkout-sessions
GET  /api/v1/billing/subscription
POST /api/v1/billing/subscription/cancel
POST /api/v1/billing/subscription/reactivate
GET  /api/v1/billing/orders
POST /api/v1/billing/refunds
POST /api/v1/billing/webhooks/{provider}
```

All mutations use idempotency keys or equivalent natural uniqueness. The provider webhook is not a browser-authenticated endpoint and uses provider-specific request verification.

## 18. Definition of Done

A real-money billing release is not complete until:

- Korea/U.S. legal review for launch scope is recorded;
- product and immutable price versions exist;
- checkout shows full recurring/price terms before payment;
- affirmative consent evidence is persisted;
- provider webhook signature verification and replay handling pass;
- duplicate purchase/refund/cancel operations are idempotent;
- online cancellation works end-to-end without mandatory support contact;
- failed payment, refund and dispute states are represented;
- entitlement state survives restart/reconciliation;
- payment data is excluded from WLD/WDX ledgers;
- minor/age policy gates work;
- EN/KO UI and policy text match;
- desktop/mobile/accessibility QA passes;
- Test exact-SHA validation passes before Production;
- Production has rollback/disable config and support runbook.

## 19. Research note — 2026-09-13

- **FTC, official enforcement, June 2026 — directly adopted:** recent subscription enforcement alleges hidden recurring terms, charges without authorization and difficult cancellation under FTC Act/ROSCA. This supports clear terms, consent and simple cancellation as durable requirements.
- **FTC, official rulemaking, March 2026 — directly adopted as regulatory-status correction:** FTC states the 2024 negative-option rule was vacated and opened new rulemaking. Moneyverse therefore must not cite the 2024 Click-to-Cancel rule as currently binding federal law.
- **Korea Fair Trade Commission, official guidance, February 2025 — directly adopted:** the amended e-commerce dark-pattern regime took effect February 14, 2025 and covers recurring-payment price increases/free-to-paid conversion notice/consent requirements.
- **Korea Fair Trade Commission consumer guidance — directly adopted:** e-commerce consumer withdrawal/refund rights require product-specific handling rather than a fabricated universal policy.
- **Stripe Billing documentation — implementation reference only:** subscription invoices and webhook-driven lifecycle patterns support an internal idempotent billing state machine. Stripe is not selected as a required provider by this specification.

## 20. Runtime verification

`easy-scraping.com` returned HTTP 530 during this planning pass. Runtime billing/product verification is therefore `runtime verification unavailable`.

No healthy Production billing state is assumed. This version is documentation-only and requires no Test deployment. Any runtime billing implementation must use a separate development branch -> isolated Test -> backend/DB/API/UI/security/payment-provider verification -> Production.