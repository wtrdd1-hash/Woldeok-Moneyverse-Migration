# Billing, Subscription & Consumer Protection v2026.09.13.6

Date: 2026-09-13

## Why

The existing monetization specification defined ad-free subscriptions and paid cosmetics at a policy level, but did not yet provide a complete implementation contract for product/price versioning, recurring-billing state, provider webhooks, entitlement reconciliation, refunds, disputes and consumer cancellation.

## Changes

- Added `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md` as the English canonical billing specification and a maintained Korean counterpart.
- Defined launch gates for Korea/U.S. real-money products and marked jurisdiction-specific interpretation `legal review required`.
- Defined immutable product/price-version records, subscription state machine, payment attempts, consent evidence, webhook events, entitlements, refunds and disputes.
- Separated real-money billing accounting from WLD/WDX virtual-economy ledgers and sink/faucet metrics.
- Added simple online self-service cancellation, optional cancellation reason and durable cancellation confirmation.
- Added Korea dark-pattern/e-commerce requirements and corrected U.S. regulatory status: the FTC's 2024 Click-to-Cancel rule is not treated as currently binding after being vacated; ROSCA/FTC Act enforcement and current 2026 rulemaking are used as the durable baseline.
- Added server-authoritative checkout, webhook signature verification, idempotency, payment-data minimization and admin masking requirements.
- Added responsive/accessibility states, SEO indexing rules, analytics/KPI, fraud controls and Definition of Done.
- Runtime verification: `easy-scraping.com` returned HTTP 530, so `runtime verification unavailable`.

## Research references reviewed

- FTC official subscription enforcement, June 2026 — direct adoption for clear recurring terms, informed consent and simple cancellation.
- FTC negative-option rulemaking, March 2026 — direct adoption for current regulatory-status correction.
- Korea Fair Trade Commission e-commerce dark-pattern implementation guidance, February 2025 — direct adoption.
- Korea Fair Trade Commission e-commerce consumer-protection guidance — direct adoption.
- Stripe Billing subscription/invoice documentation — implementation reference only; no provider selection decision.

## Revenue / legal / SEO impact

- Revenue: enables measurable ad-free/cosmetic monetization without P2W; adds refund/dispute/support cost metrics to margin analysis.
- Legal: lowers recurring-billing dark-pattern risk but does not replace legal review for the actual Korea/U.S. launch scope.
- SEO: public pricing/help pages may be indexable; checkout, payment history, subscription management and billing admin remain authenticated/noindex.

## Change management

- Version: `v2026.09.13.6`
- Branch: `docs/billing-subscription-consumer-protection-v2026.09.13.6`
- Change type: documentation-only
- Test deployment: not required for this documentation change
- Runtime implementation: separate development branch -> isolated Test exact-SHA -> backend/DB/API/UI/security/provider validation -> Production

## Next priority

1. land/reconcile the Account Security Center runtime slice without weakening auth boundaries;
2. design billing catalog/admin configuration records only after provider/legal decisions;
3. implement first-party authentication P0 security work;
4. perform Runtime Product Reality Audit immediately when service access returns;
5. keep real-money monetization disabled until billing/legal launch gates pass.