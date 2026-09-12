# Banking & Financial Services Planning — v2026.09.12.17

Date: 2026-09-12
Type: Documentation / product specification
Runtime impact: None

## Added

- New implementation-oriented `BANKING_FINANCIAL_SERVICES_SPEC.md`.
- Unlimited-by-default savings-pocket and service rules.
- Explicit faucet/transfer/hard-sink/converter/hold classification for banking flows.
- Savings goals and non-power customization sinks.
- Transparent deposit-interest funding modes and anti-abuse rules.
- Aggregate-exposure-based virtual lending instead of arbitrary loan-count caps.
- Loan repayment, arrears, hardship and restructuring state model.
- Game-only explainable credit reputation inputs and forbidden inputs.
- Virtual-bond service-fee, maturity and early-exit contracts.
- Financial reports, archive books, vault/display services and escalating prestige sinks.
- Virtual Business Protection Contract design with explicit payout source and anti-abuse controls.
- Season 1/2 banking-content integration and season-end persistence rules.
- Recommended ledger transaction types, data model, APIs, admin dashboards, analytics and abuse tests.

## Economy impact

This revision expands recurring WLD sinks without imposing normal-player activity caps. It also requires banking principal movement, interest issuance, service fees and protection settlement to be reported separately so transfers cannot be misreported as currency destruction.

## Safety

All products remain in-service virtual mechanics. They are not real deposits, loans, securities, insurance or investment products. Basic financial understanding is not paywalled, and debt design prioritizes recovery rather than compounding punitive fees.

## Deployment

Documentation only. No Test deployment is required for this revision. Any runtime implementation derived from this specification must use a separate development branch, forward-only migrations where needed, exact-SHA isolated Test deployment, backend/API/database/ledger validation, and only then Production promotion.
