# Product Planning Worklog — v2026.09.13.6

Date: 2026-09-13
Branch: `docs/billing-subscription-consumer-protection-v2026.09.13.6`

## Inputs reviewed

- current `main` SHA `4ed57f4fcd2d640e6d04afd26317cd018a534e32` at start and mid-work;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- `PRODUCT_DESIGN_SPEC.md`;
- `SEASON_SYSTEM_SPEC.md`;
- `DEFAULT_LIMIT_POLICY.md`;
- `ECONOMY_SINKS_SPEC.md`;
- `MONETIZATION_COMPLIANCE_SEO_SPEC.md`;
- open PR state, including Account Security Center PR #201 (`v2026.09.13.5`);
- current public service reachability for `easy-scraping.com`.

## Gap selected

The repository already has broad monetization and compliance principles, but real-money subscription/product billing still lacked one canonical implementation-oriented specification tying together price versioning, consent, subscription lifecycle, provider events, entitlements, refunds, disputes, fraud controls, responsive UX, accessibility, analytics and legal launch gates.

This gap was selected instead of duplicating current account-security work in PR #201.

## Research performed

Fresh official/current sources were prioritized.

1. FTC official enforcement, June 2026: subscription schemes with hidden recurring terms, unauthorized charges and difficult cancellation. **Directly adopted** for disclosure, consent and cancellation product requirements.
2. FTC official negative-option rulemaking, March 2026. **Directly adopted** to correct regulatory status: the 2024 Click-to-Cancel rule was vacated and should not be represented as current binding federal law.
3. FTC Chegg enforcement, September 2025, and Uber enforcement/current case materials. **Corroborating reference** for simple cancellation and no post-cancellation charges.
4. Korea Fair Trade Commission official February 2025 guidance on the amended E-Commerce Act dark-pattern regime. **Directly adopted** for recurring-price increase/free-to-paid notice/consent design.
5. Korea Fair Trade Commission e-commerce consumer-protection guidance. **Directly adopted** for withdrawal/refund architecture and against one fabricated universal refund window.
6. Stripe Billing subscription/invoice documentation. **Implementation reference only** for webhook/invoice lifecycle patterns; no payment provider was selected.

## Main decisions

- Keep real-money billing completely separate from WLD/WDX virtual-economy ledgers and sink/faucet reporting.
- Use immutable product/price versions so historic orders remain reproducible.
- Treat provider webhooks as authenticated server-to-server input, with signature verification, event uniqueness and replay-safe processing.
- Separate payment state from entitlement state; both require idempotent reconciliation.
- Adopt simple online self-service cancellation as Moneyverse policy regardless of minimum jurisdiction-specific obligations.
- Preserve a conservative `legal review required` gate for Korea/U.S. launch scope, including state-level U.S. automatic-renewal requirements.
- Use payment-data minimization and hosted/tokenized collection where feasible; never store raw PAN/CVV in Moneyverse.
- Keep paid products strictly non-P2W.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530 during the pass. Runtime verification status: `runtime verification unavailable`.

No Production billing status was inferred from documentation.

## Files changed

- `docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`
- `docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.ko.md`
- English/Korean changelog for `v2026.09.13.6`
- English/Korean worklog for `v2026.09.13.6`
- English/Korean documentation indexes

## Validation/deployment

Documentation-only change. No Test deployment is required. No backend, DB, API, frontend runtime, config, infrastructure or Production mutation was performed.

Any billing implementation must follow separate development branch -> isolated Test exact-SHA -> backend/DB/API/UI/security/provider validation -> Production.

## Concurrency

`main` remained at `4ed57f4fcd2d640e6d04afd26317cd018a534e32` during the initial and mid-work checks. PR #201 is concurrent runtime account-security work and uses version `v2026.09.13.5`; this documentation pass therefore uses the next sequential version `v2026.09.13.6` and does not alter PR #201.

## Next priorities

1. reconcile/validate Account Security Center runtime work;
2. first-party local-email authentication P0 implementation and security QA;
3. decide payment provider and merchant/legal launch scope before billing schema implementation;
4. build billing catalog/admin configuration only after those decisions;
5. run Runtime Product Reality Audit on service recovery.