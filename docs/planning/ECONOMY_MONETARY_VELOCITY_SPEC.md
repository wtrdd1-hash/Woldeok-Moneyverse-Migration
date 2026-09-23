# Moneyverse — Monetary Velocity & Reward Pacing Specification

> Version: v2026.09.23.401
> Status: implementation-oriented living product specification
> Baseline: v2026.09.23.398 work-reward reset plan
> Korean companion: [ECONOMY_MONETARY_VELOCITY_SPEC.ko.md](ECONOMY_MONETARY_VELOCITY_SPEC.ko.md)

## 0. Purpose

Moneyverse must not control inflation by blocking ordinary play. It must control the rate at which newly created WLD enters circulation and continuously compare that issuance with real hard sinks, circulating money supply, prices, and wealth distribution.

The current product direction remains unlimited-by-default for ordinary job participation and mastery. However, a job that resolves instantly and can be repeated indefinitely is an effectively unbounded faucet even when marginal rewards decay. Reward pacing therefore needs a server-authoritative time and settlement model in addition to repeat decay.

## 1. Core policy

1. Ordinary participation and mastery remain unlimited by default.
2. Newly minted WLD is paced by server-authoritative work duration, verification, settlement, and marginal reward curves.
3. Client-side timers never authorize settlement.
4. Transfers between users are not sinks; only destroyed currency counts as a hard sink.
5. Economy control is based on multiple signals, never on one global faucet/sink ratio.
6. Permanent hard caps are a last-resort protection mechanism, not the primary balance tool.
7. Every automated policy change is versioned, bounded, reversible, and auditable.
## 2. Work duration model

Each job template defines server policy fields for expected work duration and settlement mode. The server records `accepted_at`, `eligible_submit_at`, `submitted_at`, `verified_at`, and `settled_at`. A task cannot mint WLD before `eligible_submit_at`, even if a modified client submits immediately.

Recommended settlement modes:
- `ACTIVE`: requires interaction/progress checkpoints while time passes.
- `ASYNC`: work completes after a server deadline and may be collected later.
- `VERIFY`: submission is immediate but settlement waits for deterministic or moderated verification.
- `BATCH`: several low-value actions are aggregated into one periodic settlement.

Template duration must reflect reward magnitude and complexity. The objective is not artificial waiting; it is to prevent a one-click action from becoming a high-frequency minting loop.

## 3. Reward pacing

`net_reward = base_reward × quality_factor × repeat_factor × issuance_factor`

`repeat_factor` reduces rewards when one user concentrates on the same trivial template. `issuance_factor` is a bounded server multiplier derived from economy telemetry. Mastery XP may decay more slowly than WLD so play can continue after monetary efficiency falls. The UI must show expected duration, current reward range, and any active diminishing-return reason.

Policy changes affect new assignments; already accepted assignments preserve their captured policy version unless an integrity incident requires explicit cancellation.
## 4. Economy telemetry

Compute hourly, daily, 7-day, and 30-day windows for gross WLD faucet by source, hard sink by category, net currency creation, active circulating supply, dormant balances, velocity proxy, P50/P90/P95/P99 liquid balance, top 1%/10% concentration, percentile job income, marketplace price indices where trade depth is sufficient, template concentration, repeat distribution, and new-user purchasing power against a core basket.

Do not use a single target such as "sinks must equal faucets every day." A growing economy may temporarily create net currency. Decisions must consider money-supply growth, price movement, wealth concentration, and new-user affordability together.

## 5. Automatic control order

When issuance pressure is high:
1. stop exploits, duplicated settlement, and abnormal automation;
2. reduce reward efficiency of the concentrated source;
3. increase job variety and redirect recommendations;
4. activate or rotate desirable hard sinks, especially prestige/cosmetic sinks for wealthy cohorts;
5. adjust bounded `issuance_factor` for new assignments;
6. only then consider temporary finite reward windows with expiry and auto-relaxation.

Do not solve inflation by confiscating balances, rewriting past settlements, or globally disabling jobs.

## 6. Cohort protection

Economy policy distinguishes new, median, high-income, and high-wealth cohorts. High-wealth sinks primarily target optional prestige and collection demand. Core progression, mobility, and first certifications remain affordable to new and median users.
## 7. Simulation and release gate

Replay normal mixed activity, one-click spam, bot-like bursts, 10× concurrency, weak/strong sink adoption, high-wealth accumulation, new-user influx, stock/market shocks, and restart/idempotent retry scenarios. Compare the proposed policy against the current policy in shadow simulation.

Promotion requires no ledger divergence, no duplicate settlement, bounded impact on median-user income, and no regression in new-user core-basket affordability.

## 8. API and data contract

Required fields include `policy_version`, `expected_work_seconds`, `eligible_submit_at`, `settlement_mode`, `base_reward`, `repeat_factor`, `issuance_factor`, `net_reward`, `reason_codes`, and canonical settlement timestamps.

Economy control APIs are server/admin only. Public clients receive only fields needed to display the user's own assignment and summarized policy effects; control endpoints and abuse thresholds are not part of the public client contract.

## 9. Reference basis

The existing research corpus contains 11,749 deduplicated candidate records collected from OpenAlex and Crossref. It is a discovery corpus, not a claim that all records were fully reviewed. Current validation also uses EVE Online Monthly Economic Reports and the AI Economist literature on simulation-based policy evaluation. Operational decisions still require Moneyverse telemetry and replay evidence.

## 10. Acceptance criteria

P0 requires: no instant-repeat job can mint unlimited WLD per unit time; every paid job has a server-authoritative duration or verification boundary; retries are idempotent; faucet/sink/money-supply/wealth telemetry is queryable; controls are reversible and versioned; affordability and median income are release metrics; web/mobile share canonical timing fields; English/Korean parity; and exact-SHA Test evidence before runtime promotion.

This specification does not authorize production deployment by itself.

## 11. Distribution, sink side-effects, and data-quality controls

Economy telemetry must expose cohort-specific affordability and price pressure for new, median, high-income, and high-wealth users. A single global price index is insufficient when consumption baskets and liquidity differ.

Scenario replay must include dormant-balance reactivation, returning high-wealth users, large event payouts, and synchronized reactivation campaigns because existing balances can create demand shocks without a contemporaneous faucet increase.

Sink evaluation is category-specific. Item removal, transaction taxes, prestige purchases, and service fees can have different effects on price, scarcity, and volume. A sink is not considered successful solely because nominal currency destruction increased.

Seasonality and activity-cycle effects must be separated from structural inflation signals. Economy datasets and dashboards carry source version, extraction timestamp, correction/revision marker, and policy version so retroactive data fixes do not silently rewrite prior operational conclusions.

Where feasible, policy changes use causal or quasi-experimental evaluation rather than post-change correlation alone. The default comparison package is pre/post plus untreated/control cohort, policy-version exposure, and confidence/uncertainty metadata.

## 12. Canonical paper-backed controls

The detailed research-to-design mapping is canonical in `ECONOMY_RESEARCH_PAPER_MAP.md`. The following controls are now explicitly paper-backed:

- cohort affordability and balance-distribution telemetry: Kaplan, Moll & Violante (2018), Kaplan & Violante (2018);
- ABM stress testing with deterministic ledger authority: Axtell & Farmer (2025);
- two-level/adversarial policy simulation with bounded outputs: Zheng et al. (AI Economist, 2020/2021);
- RL shadow operation, bounded action spaces, reward-sensitivity tests, and deterministic validation: Atashbar & Shi (2022, 2023) and Atashbar (2024);
- category-specific sink side-effect measurement and causal evaluation: Hogan-Hennessy, Xenopoulos & Silva (2022);
- algorithmic pricing ceilings, affordability constraints, synchronization telemetry and human approval: Calvano et al. (2020), with false-positive/mechanism caution informed by Meylahn & Schinkel (2026).

Every material economy-policy change must name the supporting paper(s), adopted insight, non-adopted assumptions, telemetry, acceptance threshold, and rollback condition. Literature can motivate the policy hypothesis but cannot substitute for Moneyverse replay and exact-version runtime evidence.
