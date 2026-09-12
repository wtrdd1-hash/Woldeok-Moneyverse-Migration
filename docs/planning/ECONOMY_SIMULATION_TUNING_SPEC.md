# Woldeok Moneyverse — Economy Simulation & Dynamic Sink Tuning Specification

> Version: v2026.09.13.4
> Status: Living implementation-oriented planning specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [ECONOMY_SIMULATION_TUNING_SPEC.ko.md](ECONOMY_SIMULATION_TUNING_SPEC.ko.md)

## 0. Purpose

Moneyverse uses unlimited-by-default participation. Economy safety therefore cannot depend on arbitrary daily play caps. This specification defines how operators measure, simulate, preview, tune, approve, deploy, observe, and roll back economy-policy changes using faucet/sink data, wealth distribution, cohort behavior and scenario projections.

This document does not authorize automatic balance mutation. Simulation is advisory. Any runtime policy write remains a separate implementation/release concern with explicit validation, audit and rollback.

## 1. Runtime reality and current gap

A current integration PR (`#189`, Economy Scenario Lab) contains a read-only deterministic projection using current M2, previous 24-hour issuance, previous 24-hour burn, a horizon of 1–365 days, and independent basis-point adjustments to issuance and sink flow. The implementation preserves WLD precision with integer strings/`BigInt`, exposes no policy write path and explicitly warns that long-horizon behavior is not modeled.

That runtime slice is a useful first layer, but it is not yet a complete economy model. The planning contract below extends it conceptually without changing runtime in this documentation pass.

## 2. Economy accounting taxonomy

Every value movement must be classified before it is used in simulation:

- `faucet`: new spendable WLD enters circulation;
- `hard_sink`: spendable WLD is permanently removed from circulation;
- `transfer`: WLD moves between player/system accounts but remains circulating;
- `converter`: one resource becomes another; only the destroyed WLD/resource component counts as a sink;
- `hold`: currency becomes temporarily illiquid but is expected to return to circulation;
- `treasury`: system-held WLD remains supply unless policy explicitly defines the account as non-recirculating.

Marketplace GMV, stock turnover and user-to-user payments are never counted as burn. Only the fee/burn portion qualifies.

## 3. Required baseline data

Each simulation snapshot must record:

- `snapshot_at`, `policy_version`, `season_id`, runtime SHA/config version where available;
- circulating/M2-like WLD supply;
- issued WLD for 1h/24h/7d/30d;
- hard-sink WLD for 1h/24h/7d/30d;
- transfer volume separately;
- hard-sink ratio = `hard_sink / faucet`;
- average, median, P90, P95 and P99 liquid balance;
- top 1% and top 10% share of liquid WLD;
- sink-family burn share and top-3 sink concentration;
- cohort purchase days and sink-family breadth;
- new-user D7/D30 liquid balance;
- high-wealth balance growth rate;
- business gross margin and maintenance burden distribution;
- marketplace fee burn, stock-market fee burn, club/city-project burn;
- season/event burn;
- protective-limit activation rate;
- marginal-reward/diminishing-return activation rate;
- anti-abuse false-positive rate where measured.

A scenario based only on aggregate M2 and one day of flow must be visibly marked `simple_projection`.

## 4. Standard scenario horizons

Operators should always be able to compare at least these horizons:

### 30 days — operational tuning
Use for short-term live-ops changes, new sink releases, reward-event adjustments and seasonal transitions. Highest confidence of the three standard horizons.

### 90 days — season/quarter stress view
Use for evaluating whether current faucet/sink balance, business profitability and wealth concentration remain sustainable over more than one event cycle.

### 180 days — structural risk view
Use for detecting long-run compounding or sink exhaustion. Results are directional only and must carry a high-model-risk warning.

Optional 7-day and 365-day views may exist, but 30/90/180 are the standard planning comparison set.

## 5. Scenario matrix

For every planning review, calculate at least:

1. **Baseline:** current observed issuance and hard sinks unchanged.
2. **Growth:** active users and faucet volume rise while sink adoption is unchanged.
3. **Sink expansion:** sink adoption/price mix improves without reducing ordinary play.
4. **Reward pressure:** campaign/season/job faucet rises temporarily.
5. **High-wealth acceleration:** P95/P99 balances grow faster than median.
6. **Low-engagement contraction:** DAU falls and fixed/maintenance sinks become disproportionately burdensome.
7. **Abuse shock:** anomalous faucet or coordinated exploitation increases issuance/transfer velocity.

Each scenario must state assumptions instead of presenting one deterministic line as a forecast.

## 6. Model layers

### Layer A — deterministic flow projection
Current simple model:

`projected_supply = current_supply + days * (projected_daily_faucet - projected_daily_hard_sink)`

This is suitable for previewing directional impact only.

### Layer B — cohort model
Split at minimum into:

- new/activation cohort;
- early established;
- mid-wealth;
- high-wealth;
- prestige-wealth;
- inactive/returning.

For each cohort model: active days, faucet/day, sink/day, purchase-day probability, sink-family mix and churn/return behavior.

### Layer C — dynamic response model
Model likely behavioral reaction to price or reward changes. Example: raising an optional prestige price should not be assumed to raise burn linearly. Use elasticity bands such as low/base/high response assumptions rather than a single guessed coefficient.

### Layer D — stochastic/stress model
When enough observed data exists, run repeated simulations with bounded distributions for activity, faucet, sink uptake, business results and event effects. Report median/P90 adverse outcome rather than one random run.

## 7. Health states and trigger bands

The following are planning triggers, not immutable rules:

### GREEN — observe
- net issuance stable or deliberately positive for growth;
- median/P90 purchasing power remains healthy;
- no rapid top-1% concentration acceleration;
- at least 5 meaningful sink choices for mature users;
- at least 3 voluntary prestige sinks for high-wealth users;
- no sink family persistently dominates roughly 40%+ of burn.

Action: no emergency adjustment. Continue content cadence.

### AMBER — proposal required
Examples:
- 30-day net issuance accelerates materially versus preceding baseline;
- P95/P99 balances rise while median is flat;
- top-1% WLD share rises across multiple observation windows;
- top-3 sink families exceed a concentration warning band;
- mature/high-wealth users run out of meaningful purchases;
- essential-progression affordability deteriorates for median/new users.

Action: create a versioned proposal and simulate before runtime change.

### RED — intervention review
Examples:
- confirmed exploit/unbounded faucet;
- reconciliation mismatch;
- extreme short-term issuance outside expected event range;
- sink change causes recovery-threatening burden on median/new users;
- manipulation or abuse invalidates economy measurements.

Action: prioritize integrity containment. Protective/security limits are allowed when they protect a concrete invariant; do not disguise them as ordinary gameplay caps.

## 8. Tuning order

When inflation or concentration rises, prefer this order:

1. add/refresh voluntary cosmetics, collections, housing, club/city and prestige sinks;
2. improve sink discoverability and value proposition;
3. expand business/logistics/crafting service costs that correspond to actual activity;
4. adjust optional high-end price ladders or project contribution curves;
5. adjust market/listing/service fees within published, tested bounds;
6. use diminishing marginal rewards for repetitive low-value farming;
7. only then consider narrower protection limits for abuse/system/market integrity.

Do not use blanket confiscatory tax, arbitrary daily action caps, or hidden ceilings as the default response.

## 9. Change-size guardrails

Economy config changes should be bounded and staged.

Default planning guardrails:

- ordinary catalog/sink price changes: usually <= ±10% per published tuning step;
- broad faucet/reward changes: usually <= ±10% per step unless correcting an exploit;
- essential new-user prices: require affordability check before any increase;
- high-end optional prestige prices may move more widely when a new tier/SKU is introduced, but should not silently reprice already-promised rewards;
- high-risk global changes should use canary/limited cohort or proposal-only mode when infrastructure permits.

These are operator change-size guardrails, not player activity caps.

## 10. Price and sink elasticity experiment

Each tunable sink should support a measured experiment record:

- `experiment_id`;
- eligible cohort;
- policy version/config hash;
- old/new price or fee;
- exposure start/end;
- purchase conversion;
- purchase days/user;
- WLD burned/user;
- retention and session guardrails;
- complaint/support rate;
- new-user affordability impact;
- P2W/competitive-integrity review result.

Do not personalize essential prices opaquely per individual. Cohort experiments must be documented and reversible.

## 11. Sink portfolio requirements

Every sink definition should include:

- name and sink code;
- function and user value;
- target wealth/user segment;
- initial price or price curve;
- repeatability;
- `hard_sink` / `transfer` / `converter` / `hold` classification;
- permanent vs duration-based value;
- P2W assessment;
- ledger transaction type;
- analytics event;
- operator config keys;
- abuse vectors;
- success/retirement criteria.

A sink is not considered successful merely because it burns a lot of WLD. It must also preserve retention, affordability and perceived value.

## 12. Economy dashboard

Minimum operator dashboard:

- faucet, hard sink, net issuance and hard-sink ratio;
- transfer volume separately;
- average/median/P90/P95/P99 liquid balance;
- top 1%/10% WLD ownership share;
- burn by sink family and top-3 concentration;
- cohort purchase days and sink-family breadth;
- high-wealth balance growth;
- new-user affordability indicators;
- protection-limit activation;
- diminishing-reward activation;
- abuse false-positive rate;
- current policy/config version;
- latest scenario snapshot and assumptions.

No dashboard may label transfer GMV as burn.

## 13. Operator workflow

1. Capture immutable baseline snapshot.
2. Identify the observed problem and affected cohort.
3. Choose 30/90/180 scenarios.
4. Preview candidate changes in read-only mode.
5. Record expected upside and guardrail risks.
6. Obtain required product/security/legal review depending on change type.
7. Implement runtime config/write path only in a separate development branch.
8. Validate on isolated Test with exact SHA/config version.
9. Roll out narrowly when practical.
10. Observe for at least the defined evaluation window.
11. Keep, iterate or roll back.
12. Record decision and evidence in changelog/worklog.

Automatic self-tuning is not enabled by this spec. It may be considered only after enough historical data proves stable thresholds, reversible controls and low false-positive risk.

## 14. Runtime/API/data contract for a future full implementation

Suggested read models/tables:

- `economy_metric_snapshots`;
- `economy_scenario_runs`;
- `economy_policy_versions`;
- `economy_tuning_proposals`;
- `economy_experiment_assignments`;
- `economy_sink_daily_stats`;
- `economy_cohort_daily_stats`.

Suggested read APIs:

- `GET /admin/economy/health`;
- `GET /admin/economy/scenario-lab/preview`;
- `GET /admin/economy/scenarios/:id`;
- `GET /admin/economy/sinks`;
- `GET /admin/economy/cohorts`.

Any future mutation API must require admin authorization, recent reauthentication/second factor as appropriate, reason capture, policy versioning, idempotency, audit evidence and rollback metadata. UI preview must never imply that a simulation has already changed live values.

## 15. UI/UX requirements

### Desktop
Use a baseline/assumption panel, 30/90/180 comparison table, wealth-distribution cards, sink portfolio chart and a clearly separated proposal area.

### Tablet/mobile
Convert wide tables into metric cards. Keep the “Run simulation” action reachable without horizontally scrolling. Long assumptions collapse into an expandable section.

### States
Define: loading/skeleton, empty/no baseline, partial metrics, stale data, invalid input, server error, permission denied, offline, maintenance and simulation-complete states.

### Accessibility
- do not encode positive/negative economy change by color alone;
- pair color with `+/-`, text and accessible labels;
- keyboard-operable inputs and visible focus;
- chart summaries available as text/table;
- result changes announced through an appropriate live region when dynamically updated.

Admin forms must not auto-refresh while the operator is editing assumptions. Background data changes should offer a non-destructive “new baseline available” notice instead.

## 16. Analytics events

Minimum events:

- `economy_scenario_opened`;
- `economy_scenario_run`;
- `economy_scenario_exported`;
- `economy_tuning_proposal_created`;
- `economy_tuning_proposal_approved`;
- `economy_policy_rollout_started`;
- `economy_policy_rollback`;
- `sink_purchase` with sink family/code and burn amount;
- `protection_limit_triggered`;
- `marginal_reward_applied`.

Never log passwords, tokens, private request bodies or unnecessary personal data.

## 17. Abuse and integrity

Before tuning based on observed economy data, exclude or separately label known abuse clusters. A faucet spike caused by exploit traffic must not be “balanced” by making ordinary users pay higher prices.

Required checks include multi-account farming, scripted rewards, duplicate/replay exploitation, marketplace wash trading, stock self-trading/circular activity and anomalous settlement behavior.

## 18. Monetization, legal and SEO impact

This specification concerns service-internal WLD and simulated/game-only assets. It does not create cash redemption, real securities, deposits or real-money investment returns.

Paid monetization must not sell a direct WLD/market/rank advantage through the tuning system. Advertising revenue metrics may be evaluated beside economy metrics, but ad spend or sponsor payments must not directly set virtual-stock prices, ranks or economic outcomes.

No new public indexable page is required. Economy scenario/admin pages are operator-only and must remain authenticated and `noindex`. Therefore direct SEO impact is neutral.

Any future real-money purchase, redeemability or regulated financial characteristic requires separate legal review before inclusion in these simulations.

## 19. Research note — 2026-09-13

### Microsoft PlayFab Economy V2 — official platform documentation — adopted as implementation evidence
Recent 2026 documentation emphasizes idempotent transactions, high-concurrency inventory/economy operations, transaction history and explicit service limits. Adopted implication: Moneyverse keeps idempotency, integer-safe accounting, paginated history/read models and system-safety limits separate from gameplay caps.

### Unity Remote Config / Game Overrides — official LiveOps documentation — adopted as operating-pattern evidence
Recent Unity documentation describes environment-specific remote settings, scheduled/targeted overrides, configuration version/hash consistency and A/B-capable LiveOps changes. Adopted implication: Moneyverse economy tuning should be versioned, environment-scoped, previewed, reversible and measured rather than encoded as ad-hoc frontend constants.

### Unity Economy service status — official documentation — reference only
Unity documentation states that new Unity Economy project sign-ups stopped on 2026-09-08 while existing configured projects continue. Moneyverse does not depend on Unity Economy; the reference is used only for LiveOps/config design patterns.

## 20. Definition of Done

This planning slice is complete when:

- English canonical and Korean counterpart exist;
- 30/90/180 standard scenarios are defined;
- faucet/hard-sink/transfer/converter/hold taxonomy is explicit;
- wealth-distribution and concentration metrics are required;
- tuning order avoids arbitrary hard caps;
- operator guardrails, experiment schema, UI states and rollback flow are defined;
- the current read-only Economy Scenario Lab is explicitly distinguished from a future full behavioral model;
- changelog and worklog record research, runtime-verification status and next steps.

Runtime implementation remains separate and requires development branch -> isolated Test -> backend/DB/API/UI verification -> Production.
