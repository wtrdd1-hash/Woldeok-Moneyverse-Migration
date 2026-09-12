# Changelog — Community & Market Integrity v2026.09.12.21

Date: 2026-09-12

## Added

- New implementation-oriented `COMMUNITY_MARKET_INTEGRITY_SPEC.md`.
- Stock-tagged discussion disclosure rules and fictional-market labeling.
- Report categories, idempotent report contract and anti-mass-report safeguards.
- Separate community moderation and market-integrity capability state machines.
- Unlimited-by-default normal posting with documented spam/security throttles instead of daily content quotas.
- Deterministic self/circular-trade, coordinated-pump, fake-liquidity and malicious-report investigation signals.
- Requirement that reports, reactions, sentiment and follower counts do not directly change WDX prices.
- Appeals, reason-coded enforcement, evidence minimization and moderator/admin console requirements.
- DB/API, analytics, season, club, sink and rollout contracts.

## Safety and economy

- Community popularity does not mint WLD, alter WDX prices, improve loan/job/business terms or add season score.
- WLD cannot be used to buy moderation relief, appeal priority or market-hold removal.
- Optional community cosmetics may act as hard sinks only when WLD is actually destroyed.

## Validation

Documentation-only revision. No runtime/API/database/migration/ledger/deployment behavior changed. Test deployment is not required for this document update. Runtime implementation must use a separate development branch and pass exact-candidate Test validation before Production.