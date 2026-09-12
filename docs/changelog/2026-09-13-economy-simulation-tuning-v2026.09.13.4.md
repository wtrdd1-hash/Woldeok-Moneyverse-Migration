# Economy Simulation & Dynamic Sink Tuning v2026.09.13.4

## Why

The Economy Sinks specification explicitly listed a 30/90/180-day inflation model and dynamic sink tuning playbook as unfinished planning work. Current PR #189 provides a useful read-only Economy Scenario Lab, but its constant-flow projection intentionally does not model cohorts, wealth concentration, elasticity, abuse contamination or rollout/rollback policy.

## Changes

- Added `ECONOMY_SIMULATION_TUNING_SPEC.md` and Korean counterpart.
- Defined 30/90/180-day standard scenario horizons and baseline/growth/sink-expansion/reward-pressure/high-wealth/low-engagement/abuse scenarios.
- Standardized `faucet`, `hard_sink`, `transfer`, `converter`, `hold`, and treasury accounting semantics.
- Required average/median/P90/P95/P99 balances, top-1%/10% wealth share, sink concentration, cohort purchase days, protection-limit activation, diminishing-reward activation and false-positive metrics.
- Defined GREEN/AMBER/RED operator trigger bands without turning planning thresholds into user-facing hard caps.
- Added tuning order that prefers desirable voluntary sinks, discoverability, service costs, prestige price curves and diminishing marginal rewards before narrow integrity limits.
- Added bounded/config-versioned operator change guardrails, elasticity experiments, rollout/rollback flow, future DB/API/read-model contracts, responsive/admin UX and accessibility requirements.
- Explicitly aligned the planning contract with the read-only Economy Scenario Lab in PR #189; no runtime policy write or automatic self-tuning is authorized.

## Research — checked 2026-09-13

- Microsoft PlayFab Economy V2 official documentation (2026): adopted for idempotency, transaction history, high-concurrency design and separation of platform safety limits from product/gameplay rules.
- Unity Remote Config / Game Overrides official documentation (2026): adopted for environment-scoped/versioned LiveOps config, targeted overrides, measurement and reversible tuning patterns.
- Unity Economy service-status documentation: reference only; Moneyverse does not depend on Unity Economy.

## Service verification

`https://easy-scraping.com` returned HTTP 530 through the available external fetch path. Runtime Product Reality Audit remains `runtime verification unavailable`; no Production health is inferred.

## Monetization / legal / SEO

- Monetization: no P2W or paid WLD/market/rank advantage is introduced. Economy tuning remains independent from sponsor/ad spend.
- Legal: WLD and WDX remain virtual/simulated/game-only. Any future cash redemption, real-money economic characteristic or financial-product change requires separate legal review.
- SEO: operator economy/scenario pages remain authenticated and `noindex`; direct SEO impact is neutral.

## Version / integration

- Version: `v2026.09.13.4`
- Branch: `docs/economy-simulation-tuning-v2026.09.13.4`
- Documentation-only: yes
- Test server required: no for this documentation change
- Runtime implementation gate: separate development branch -> isolated exact-SHA Test -> backend/DB/API/UI verification -> Production

## Next priorities

1. Land/validate the current read-only Economy Scenario Lab runtime slice without adding policy writes.
2. Add authoritative metric snapshots and cohort/sink read models before any dynamic-policy automation.
3. Implement first-party account/auth security and finish exact-SHA Test security QA.
4. Run Runtime Product Reality Audit immediately when Production/Test access is healthy.
5. Continue closing core user-visible gaps while preserving unlimited-by-default play.
