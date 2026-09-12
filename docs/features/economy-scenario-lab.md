# Economy Scenario Lab

> Candidate version: `v2026.09.12.14`
> Scope: P3 read-only simulation slice

## Purpose

The Economy Scenario Lab is the first implementation slice of the P3 long-term expansion roadmap. It lets an authenticated administrator explore deterministic supply scenarios without changing balances, ledger entries, policy knobs, database rows, or production configuration.

The model starts from the authoritative administrator economy dashboard: current M2, the latest 24-hour issuance, and the latest 24-hour burn. The operator can vary issuance and sink flows in basis points and select a horizon from 1 to 365 days.

## Safety boundary

- The endpoint is protected by the existing administrator session/role guard chain.
- It performs no database writes and adds no migration.
- WLD values remain integer strings and are projected with `BigInt`; authoritative amounts are never converted to JavaScript floating-point values.
- The result is explicitly a projection, not an automatic recommendation or policy proposal.
- The model does not call the policy-application path and cannot mutate the ledger, balances, shop prices, rates, rewards, or limits.
- Supply is floored at zero when a simplistic constant-flow projection would cross below zero, and the result records that model boundary.
- Horizons above 90 days carry an explicit high-model-risk advisory.

## API

`GET /api/v1/admin/economy/scenario-lab/preview`

Query parameters:

- `days`: integer 1–365, default 30.
- `issuanceChangeBps`: integer -10000–50000, default 0.
- `sinkChangeBps`: integer -10000–50000, default 0.

A basis-point change is applied independently to the latest observed 24-hour issuance and burn. `-10000` means a 100% reduction; `50000` means a 500% increase over the observed baseline.

## Model contract

For each simulated day:

```text
projected issuance = observed 24h issuance × (10000 + issuance change bps) / 10000
projected burn     = observed 24h burn     × (10000 + sink change bps) / 10000
projected net      = projected issuance - projected burn
projected M2       = max(0, current M2 + projected net × days)
```

Integer division intentionally truncates fractional WLD because WLD is an integer-unit system. This first model does not claim to forecast behavior, market reflexivity, demand elasticity, policy responses, seasonality, or user growth.

## UI

The administrator path `/admin/economy/scenario-lab` provides a GET-only form and result cards. The existing `/admin/economy` page links to it. The page is `noindex` and uses the same administrator-console gate as other economy operations.

## Future gates

Any move from read-only simulation toward recommendations or automatic policy execution requires separate product wording, safety, data-quality, operating-cost, legal, authorization, audit, rollback, and staging review. Simulation output must never be treated as authority for an economy write by itself.
