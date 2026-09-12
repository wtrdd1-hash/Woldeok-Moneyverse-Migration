# Jobs & Profession Mastery — v2026.09.12.26

Date: 2026-09-12

## Added

- Added `JOBS_PROFESSION_MASTERY_SPEC.md` with Korean parity.
- Reframed Jobs as a verified assignment -> settlement -> mastery -> specialization loop instead of a reward button.
- Applied unlimited-by-default policy to ordinary assignment count, profession switching and long-term mastery growth.
- Added marginal same-template reward decay instead of arbitrary daily play caps.
- Added nine initial profession families and persistent mastery/prestige design.
- Added certification, respecialization, cosmetic, workspace, archive and prestige-space WLD sinks.
- Added `FAUCET`, `HARD_SINK`, `TRANSFER`, `CONVERTER` and `HOLD` accounting rules.
- Added atomic/idempotent settlement, anti-abuse signals, review-hold policy and server-authoritative state machine.
- Added Business, Crafting, Club, City Project, WDX learning and Season 1/2 integration.
- Added DB entities, API contracts, ledger transaction types, analytics, admin configuration and P0 definition of done.

## External references reviewed

- TradingView Bar Replay / Replay Trading: learning on historical data is kept separate from live trading execution and can use configurable simulated capital/commission.
- TradingView demo/Paper Trading overview: virtual-money practice and recurring simulated competitions are separated from real financial exposure.
- Microsoft PlayFab Store/Catalog model: stable catalog identity can be separated from operational pricing/config.

## Validation

Documentation-only. No runtime, API, database migration or deployment behavior changed. Test-server deployment is not required for this documentation revision. Runtime implementation must use a separate development branch and exact-SHA isolated Test validation before Production.