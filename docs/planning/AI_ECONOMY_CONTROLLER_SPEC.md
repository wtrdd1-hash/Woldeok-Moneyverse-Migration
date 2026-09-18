# Woldeok Moneyverse — AI Economy Controller Specification

> Version: v2026.09.17.184
> Status: Living implementation-oriented planning specification
> Date: 2026-09-17
> Parent specs: `PROJECT_PLAN.md`, `ECONOMY_SIMULATION_TUNING_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [AI_ECONOMY_CONTROLLER_SPEC.ko.md](AI_ECONOMY_CONTROLLER_SPEC.ko.md)

## 0. Purpose

This specification defines a bounded, auditable, reversible AI-assisted controller for the Moneyverse virtual economy. Its goal is to keep WLD issuance, hard sinks, purchasing power, wealth concentration, sink diversity and player experience within healthy operating ranges without falling back to arbitrary gameplay caps.

The controller is a closed-loop policy system:

`telemetry -> data-quality gate -> anomaly/state detection -> seasonal/event baseline -> candidate generation -> Scenario Lab projection -> deterministic guardrail validation -> approval/mode gate -> versioned rollout -> observation -> keep/rollback`

AI may diagnose conditions, explain causes and generate candidate policy changes, but **AI is never the final enforcement authority**. Deterministic policy constraints, authorization, version checks, audit rules and rollback conditions remain authoritative.

## 1. Non-negotiable safety boundaries

The controller SHALL NOT:

- directly write, confiscate, grant or rewrite a player's WLD balance;
- directly mutate player inventory, securities, items, loans or account-specific economic state;
- delete, rewrite or retroactively alter append-only ledger history;
- create a new currency, new economic mechanic, new sink family or paid economic advantage without human-approved product configuration; low-risk SKU variants may be generated only from explicitly approved templates and bounded policy metadata;
- personalize essential prices or impose punitive economics on an individual user;
- silently change moderation, abuse enforcement, authentication or security policy;
- use paid spending, advertising spend or sponsorship as a reason to improve a user's market/rank outcome;
- bypass legal, compliance, security or market-integrity controls.

The controller MAY adjust only explicitly allowlisted, versioned economy configuration within deterministic minimum/maximum/step/cooldown constraints.

## 2. Operating modes

### `OBSERVE_ONLY`
Read telemetry, build features, detect anomalies and calculate economy state. No recommendation and no write path.

### `RECOMMEND`
Generate a diagnosis, candidate policy changes and predicted 30/90/180-day outcomes. A human operator must approve every change.

### `SHADOW`
Run the complete decision process as if changes were applied, but do not write production policy. Compare predicted results with observed reality to measure controller quality and false-positive risk.

### `BOUNDED_AUTO`
Apply only low-risk, allowlisted configuration changes that pass all policy, data-quality, simulation, uncertainty and rollout gates. Anything outside the envelope automatically falls back to `RECOMMEND`.

### `EMERGENCY_FREEZE`
Disable economy auto-tuning immediately. Read/diagnostic functions remain available. Existing live policy remains active unless a separately authorized rollback is executed.

There is no unrestricted autonomous mode in the initial design.

## 3. Control architecture

### 3.1 Telemetry and feature pipeline

Required inputs include:

- WLD faucet, hard sink, transfer and converter flows;
- circulating/M2-like WLD supply;
- 1h/24h/7d/30d flow windows;
- average, median, P90, P95 and P99 liquid balance;
- top 1% and top 10% WLD share;
- sink-family burn and top-3 sink concentration;
- sink purchase days and sink-family breadth by cohort;
- new-user D7/D30 affordability and liquid balance;
- high-wealth balance growth;
- business margins and maintenance burden;
- marketplace/stock/service fee burn;
- season/event issuance and burn;
- diminishing-reward activation;
- protective-limit activation and false positives;
- retention/session/support guardrails;
- known abuse/exploit labels;
- season, event, campaign and maintenance calendar labels.

Every controller run stores the exact feature snapshot, policy version, config hash, model version and time window used for the decision.

### 3.2 Data-quality and reconciliation gate

No automatic policy action is permitted unless:

- required metrics are fresh;
- ledger/economy reconciliation passes;
- event/season labels are available;
- minimum observation/sample requirements pass;
- the policy registry version has not changed underneath the run;
- no unresolved critical economy-integrity incident is active.

Failure is fail-closed: the controller pauses writes and remains diagnostic only.

### 3.3 Anomaly detector

Use multiple detectors instead of one opaque score:

- short-window spike/drop detection for 1h and 24h flows;
- seasonal/weekday-aware baseline deviation;
- change-point detection for sustained regime shifts;
- cohort outlier detection for new/mid/high/prestige wealth bands;
- abuse-aware exclusion or tagging so exploit traffic does not cause ordinary-user repricing.

A confirmed or strongly suspected exploit routes to security/market-integrity incident handling. It must not be “balanced” by simply raising normal-user prices.

### 3.4 Economy state estimator

The controller produces a structured state, not just a single health score. Minimum dimensions:

- `net_issuance_state`;
- `hard_sink_ratio_state`;
- `purchasing_power_state`;
- `new_user_affordability_state`;
- `wealth_concentration_state`;
- `high_wealth_acceleration_state`;
- `sink_diversity_state`;
- `sink_concentration_state`;
- `retention_guardrail_state`;
- `integrity_state`;
- `data_confidence_state`.

A GREEN/AMBER/RED summary may be displayed, but every dimension and supporting evidence must remain inspectable.

### 3.5 Candidate generator

AI may produce a small ranked candidate set with:

- diagnosed problem;
- causal evidence and alternative explanations;
- affected cohorts;
- candidate policy keys;
- current and proposed values;
- expected benefit;
- downside risk;
- uncertainty/confidence;
- required observation period;
- rollback trigger.

The generator cannot invent a live configuration key. It must choose from the policy registry.

### 3.6 Scenario Lab / digital-twin gate

Each candidate must be evaluated against at least:

- baseline;
- growth;
- sink expansion;
- reward pressure;
- high-wealth acceleration;
- low-engagement contraction;
- abuse-shock scenarios.

Standard horizons: 30, 90 and 180 days. A simple M2/24h-flow projection must remain visibly labeled as a simple projection and must not be treated as a behavioral forecast.

### 3.7 Deterministic policy validator

The validator has final authority over whether a candidate can proceed. It checks:

- allowlist and policy class;
- min/max value;
- maximum change per step;
- maximum drift from last human-approved baseline;
- cooldown;
- minimum observation count;
- required time windows;
- permitted operating modes;
- required human approval;
- affordability constraints;
- P2W/competitive-integrity classification;
- active season-transition locks;
- rollback readiness;
- version/config hash conflict.

AI output cannot override a failed validator rule.

## 4. Multi-window and season-aware decision logic

A single hourly or daily delta is not enough for routine rebalancing.

- **1h:** sudden spike/drop and exploit detection; normally diagnostic only.
- **24h:** operational direction and live-ops impact.
- **7d:** weekday/cycle-aware trend confirmation.
- **30d:** season/event baseline and structural trend, when enough history exists.

Routine automatic adjustment should require configurable agreement across more than one window, minimum sample size and acceptable uncertainty. Known event, season launch/closing, promotional campaign, maintenance and migration windows must be tagged so expected temporary changes are not misclassified as inflation or deflation.

## 5. Objective vector

The controller optimizes a multi-objective vector rather than one opaque number:

1. net issuance and rate of change;
2. hard-sink ratio;
3. median purchasing power;
4. new-user affordability;
5. P95/P99 balance growth;
6. top 1%/10% wealth share and its derivative;
7. sink-family breadth and concentration;
8. active purchase days;
9. retention/session guardrails;
10. complaint/support rate;
11. protective-limit trigger rate;
12. anti-abuse false-positive rate;
13. model uncertainty/calibration.

No objective may justify direct balance confiscation or arbitrary normal-play caps.

## 6. Allowed initial auto-tuning surface

Low-risk allowlist candidates for `BOUNDED_AUTO`:

- optional sink discoverability and rotation weights;
- optional prestige/cosmetic/housing/business/city/museum/HQ price multipliers;
- non-essential crafting, restoration, logistics, maintenance and service-fee multipliers;
- diminishing-marginal-reward coefficients for repetitive low-value farming;
- approved sink visibility/placement schedules.

Later, after successful shadow evidence, a tightly bounded event faucet/reward multiplier may be considered. It is not part of the initial auto-write allowlist.

The controller cannot create new sink content at runtime. It may recommend new sinks to operators when existing sink breadth is inadequate.

## 7. Human approval required

Human approval remains mandatory for:

- starter WLD and tutorial economy;
- essential new-user progression prices;
- loan/credit interest, exposure and eligibility policy;
- season reward pools, rank payouts and conversion rates;
- WDX price formation and market-protection mechanics;
- currency/resource conversion rates;
- paid monetization-linked economy configuration;
- creation/removal of a currency;
- new sink definitions and any SKU with new gameplay/economic effects; low-risk cosmetic/content SKU variants from approved templates may use bounded automation;
- any change outside the current `BOUNDED_AUTO` envelope;
- global emergency economic interventions other than pausing the controller.

## 8. Sink-first tuning order

When inflation/concentration pressure is detected, the controller follows this priority:

1. improve visibility/adoption of existing voluntary sinks;
2. adjust optional high-end prestige/collection/space/city price curves;
3. tune activity-corresponding business/logistics/crafting/maintenance costs;
4. tune narrow market/listing/service fees within published bounds;
5. strengthen diminishing marginal rewards for repetitive low-value farming;
6. propose broader event/reward faucet adjustment;
7. use protective limits only for concrete security, system or market-integrity reasons.

Blanket confiscatory taxes, hidden ceilings and arbitrary daily action caps are forbidden as the default balancing response.

## 9. Initial bounded-auto guardrails

These are initial planning defaults, configurable after `wdmv-test` and historical-data validation. They are operator change limits, not player gameplay caps.

- controller observation cadence: hourly;
- routine automatic apply frequency: no more than once per policy family per 24 hours;
- low-risk automatic step: normally at most ±2% from the current value;
- cumulative automatic drift: normally at most ±5% over 7 days from the last human-approved baseline;
- production values must always remain inside policy-registry min/max;
- insufficient samples or high uncertainty => recommendation only;
- post-change evaluation checkpoints: approximately 6h and 24h, plus a 7-day retrospective;
- global/shared-price changes should prefer test/shadow validation; do not use persistent opaque personalized pricing as a canary mechanism;
- where a feature can be safely cohort-tested without discriminatory essential pricing or shared-market distortion, a limited rollout may start around 5–10% before broad rollout.

All percentages and time windows above are tunable configuration defaults, not immutable rules.

## 10. Automatic pause and fail-closed conditions

Auto-tuning pauses immediately when any configured critical condition is true:

- stale/missing required metrics;
- failed ledger/economy reconciliation;
- model/feature pipeline unavailable;
- uncertainty above policy threshold;
- active exploit/security/economy-integrity incident;
- season settlement, closing or transition lock where configured;
- policy-registry version conflict;
- duplicate/concurrent apply conflict;
- emergency freeze by an authorized operator;
- rollback-health trigger after a recent change.

The system must never “guess through” missing or contradictory accounting data.

## 11. Versioned rollout and rollback

Every applied policy change creates an immutable policy version and config hash. Rollback restores a prior configuration version; **rollback never rewrites ledger history or reverses legitimate player transactions by editing historical records**.

Required properties:

- idempotent apply and rollback;
- optimistic version/concurrency check before mutation;
- exact before/after config snapshot;
- actor/controller/model identity;
- reason and evidence;
- rollout environment and percentage;
- evaluation window;
- rollback thresholds;
- audit trail.

A circuit breaker must be able to pause further writes and restore the last safe policy version when configured affordability, retention, integrity, reconciliation or other critical guardrails breach.

## 12. Policy registry

Minimum fields:

```text
policy_key
policy_class
current_value
min_value
max_value
max_step_bps
max_drift_bps_window
cooldown_minutes
min_observation_count
required_windows
allowed_modes
requires_human_approval
rollback_thresholds
owner
reason_code
effective_from
version
config_hash
```

`null/unlimited` remains the normal default for user-facing count limits where no protective reason exists. The controller must not convert implementation convenience into a gameplay cap.

## 13. Candidate/proposal record

Minimum fields:

```text
proposal_id
controller_run_id
baseline_snapshot_id
issue_class
affected_cohorts
current_values
proposed_values
predicted_30d
predicted_90d
predicted_180d
confidence
uncertainty
anomaly_state
guardrail_results
rationale
model_name
model_version
evidence_hashes
approval_state
rollout_environment
rollout_percentage
rollback_policy
created_at
```

All material decisions should be reproducible from stored evidence.

## 14. Suggested database model

Reuse existing economy snapshot/scenario/policy tables and add:

- `economy_ai_controller_runs`;
- `economy_ai_policy_registry`;
- `economy_ai_policy_candidates`;
- `economy_ai_decisions`;
- `economy_ai_rollouts`;
- `economy_ai_observations`;
- `economy_ai_model_registry`;
- `economy_ai_guardrail_violations`;
- `economy_ai_rollback_events`;
- `economy_ai_feature_snapshots`.

Decision, audit and rollback evidence should be append-only wherever practical.

## 15. API contract

Suggested admin APIs:

- `GET /admin/economy/controller/status`
- `GET /admin/economy/controller/runs`
- `GET /admin/economy/controller/proposals`
- `POST /admin/economy/controller/proposals/:id/simulate`
- `POST /admin/economy/controller/proposals/:id/approve`
- `POST /admin/economy/controller/proposals/:id/reject`
- `POST /admin/economy/controller/pause`
- `POST /admin/economy/controller/resume`
- `POST /admin/economy/controller/rollback`
- `GET /admin/economy/controller/policies`
- `PUT /admin/economy/controller/policies/:key`

Mutation APIs require admin authorization, recent reauthentication/second factor where appropriate, reason capture, idempotency key, optimistic policy version, audit metadata and rollback metadata.

## 16. Admin console UX

Minimum operator surface:

- current controller mode and write-enabled status;
- metric freshness/reconciliation status;
- economy objective board;
- anomaly timeline with season/event overlays;
- current policy vs candidate values;
- predicted 30/90/180-day scenarios;
- guardrail pass/fail reasons;
- confidence and uncertainty;
- approve/reject controls;
- rollout/canary status;
- pause/freeze control;
- rollback action with reason + reauthentication;
- model version, feature snapshot and evidence references;
- immutable decision history.

Admin forms must not auto-refresh while an operator is editing. If a new baseline arrives, show a non-destructive “new baseline available” notice.

## 17. AI-ready sink metadata

Every sink eligible for AI tuning should expose:

```text
auto_tunable
min_multiplier
max_multiplier
max_step_bps
cooldown_minutes
elasticity_estimate
elasticity_confidence
affordability_floor
prestige_only
p2w_class
ledger_transaction_type
analytics_event
value_flow_class        # hard_sink / transfer / converter / hold
target_wealth_band
season_availability
```

This lets the controller tune approved content without inventing live content or confusing transfers with actual burns.

## 18. Worked examples

### 18.1 Inflation pressure without exploit

Observed:

- 24h issuance +20% versus event-adjusted baseline;
- hard sink approximately flat;
- P99 balance growth accelerating;
- median purchasing power stable;
- no integrity incident.

Controller behavior:

1. confirm the signal across 24h/7d and season/event labels;
2. test sink adoption/discoverability candidates first;
3. propose at most a small bounded optional high-end sink multiplier change, for example +2% if registry rules allow it;
4. test 30/90/180 outcomes in Scenario Lab;
5. if uncertainty is high, remain `RECOMMEND`;
6. if `BOUNDED_AUTO` is allowed and every guardrail passes, apply a versioned config change;
7. observe 6h/24h and run 7-day retrospective;
8. roll back the config version if health guardrails worsen.

### 18.2 Exploit-driven faucet spike

Observed:

- sudden abnormal faucet increase;
- abuse detector flags replay/duplicate reward behavior;
- reconciliation or integrity confidence deteriorates.

Controller behavior:

- pause economy auto-tuning;
- do not raise ordinary-user prices;
- route to abuse/security incident response;
- resume only after clean reconciliation and explicit safe-state criteria.

### 18.3 High-wealth sink exhaustion

Observed:

- median stable;
- P95/P99 balances rise for multiple weeks;
- high-wealth sink purchase breadth falls;
- existing high-end catalog is exhausted.

Controller behavior:

- improve discovery/rotation of approved prestige sinks;
- tune approved prestige price curves within bounds;
- recommend new museum/archive/landmark/HQ/city-project content to human operators;
- never solve the problem by confiscating balances or imposing arbitrary holding caps.

## 19. Model governance

The first implementation should combine:

- deterministic accounting and guardrail rules;
- statistical/time-series anomaly detection;
- scenario simulation;
- an AI/LLM layer for diagnosis, explanation and candidate generation.

Do **not** begin with online reinforcement learning directly experimenting on the live economy. Training/evaluation should progress through offline replay, historical backtests, shadow mode and tightly bounded policy application.

Minimum model-governance metadata:

- model/provider/name/version;
- feature schema version;
- training/evaluation period where applicable;
- calibration/error metrics;
- approved policy classes;
- last validation date;
- owner;
- rollback/fallback model;
- deprecation state.

## 20. Research-derived design rationale — 2026-09-13

### Unity Remote Config / Game Overrides
Environment-scoped configuration, targeting, scheduled overrides and percentage rollout are useful patterns for separating Test from Production and progressively releasing live-ops configuration. Moneyverse adopts versioned environment configuration, staged rollout and reversible overrides rather than hard-coded economy constants.

### Microsoft PlayFab Economy V2
Idempotent transaction identifiers and optimistic concurrency/ETag patterns support retry-safe mutation and stale-write rejection. Moneyverse adopts idempotent policy application and optimistic version checks for controller writes and rollbacks.

### Time-series anomaly-detection systems
Modern anomaly detection can return an anomaly decision together with probability or expected-bound information rather than only a raw threshold result. Moneyverse therefore stores confidence/uncertainty and requires deterministic gates before any automatic policy change.

### EVE Online Monthly Economic Reporting
Large virtual economies exhibit event and seasonal behavior. Moneyverse therefore compares multiple time windows and overlays season/event labels instead of interpreting every short-term decline or spike as a structural economy problem.

## 21. Implementation phases

### Phase 0 — accounting and data quality
Complete reconciliation, feature snapshots, season/event labels and controller read models. No policy writes.

### Phase 1 — `RECOMMEND`
Generate versioned proposals and human-readable rationale. All changes require approval.

### Phase 2 — `SHADOW`
Run the complete controller decision loop without writing policy. Measure forecast error, false positives and expected rollback triggers.

### Phase 3 — low-risk `BOUNDED_AUTO`
Enable only explicitly allowlisted optional sink/discoverability/non-essential service parameters with small change envelopes and automatic pause/rollback.

### Phase 4 — controlled allowlist expansion
Add policy families only after historical evidence demonstrates low false-positive and rollback risk. High-impact economy controls remain human-approved.

Every runtime phase must use a separate development branch, be implemented in the `@미니pc홍` environment, deploy to isolated `wdmv-test`, verify backend/DB/API/admin UI behavior and rollback, and only then be eligible for Production promotion.

## 22. Controller analytics and KPIs

Track at minimum:

- controller runs by mode;
- recommendation acceptance/rejection rate;
- guardrail rejection rate and reason;
- shadow predicted-vs-observed error by horizon;
- automatic apply count;
- rollback rate;
- time to detect / time to recover;
- policy-family cooldown usage;
- model uncertainty and calibration;
- net issuance stability;
- hard-sink ratio;
- new-user affordability;
- P95/P99 and top-1% concentration trend;
- sink diversity/concentration;
- retention/session guardrails;
- abuse/protective false-positive rate.

A controller is not successful merely because inflation falls. It must also preserve user value, affordability, retention, fairness and auditability.

## 23. Failure/QA scenarios

Before enabling any automatic write path, verify at least:

1. stale metrics -> no policy write;
2. reconciliation mismatch -> freeze;
3. duplicate apply request -> exactly-once/idempotent result;
4. concurrent policy edit -> stale version rejected;
5. model unavailable -> deterministic fallback/no write;
6. season transition lock -> configured policy families blocked;
7. exploit label -> normal-user repricing blocked;
8. uncertainty too high -> `RECOMMEND` only;
9. step/drift/cooldown violation -> candidate rejected;
10. forced rollback -> prior config restored, ledger untouched;
11. admin edit in progress -> no destructive auto-refresh;
12. unauthorized mutation -> denied and audited.


## 25. Adversarial multi-agent economy council

Moneyverse SHALL use multiple independently trained or independently adapted specialist agents rather than one monolithic economy model. The purpose is controlled disagreement: each agent optimizes a different view, attacks the assumptions of the others, and exposes hidden failure modes before any live policy is eligible for application.

### 25.1 Required specialist agents

Initial roles:

- `MACRO_AGENT`: WLD supply, inflation, purchasing power, wealth concentration and long-horizon stability;
- `PLAYER_WELFARE_AGENT`: new-user affordability, retention, perceived fairness and recovery paths;
- `SINK_COMMERCE_AGENT`: shop demand, sink adoption, price elasticity, catalog gaps and product lifecycle;
- `STOCK_FUNDAMENTAL_AGENT`: virtual-company fundamentals, sector state and long-run valuation anchors;
- `STOCK_FLOW_AGENT`: order flow, liquidity, turnover and short-horizon market pressure;
- `STOCK_MOMENTUM_AGENT`: momentum/reversal regimes and volatility state;
- `MARKET_INTEGRITY_AGENT`: manipulation, wash/self-trading, circular activity, stale market and abnormal price movement;
- `BUSINESS_AGENT`: business profitability, maintenance burden, inventory/demand and expansion economics;
- `CASINO_RISK_AGENT`: game-only casino issuance/burn effects, abuse and concentration risk; it cannot optimize real-money gambling;
- `ABUSE_AGENT`: farming, automation, multi-account and exploit distortion;
- `CAUSAL_AGENT`: asks whether an observed change was caused by policy or by confounders/events;
- `RED_TEAM_AGENT`: searches for worst-case second-order effects and Goodhart-style metric gaming;
- `AUDITOR_AGENT`: verifies evidence, model/version identity, reproducibility and policy-registry compliance;
- `JUDGE_AGENT`: summarizes disagreement and builds an admissible candidate set but cannot override deterministic guardrails.

Agents SHOULD use separate prompts, adapters/checkpoints, training slices and evaluation suites when practical. Merely assigning multiple names to the same prompt/context does not count as independent analysis.

### 25.2 Debate protocol

Each material decision uses at least three rounds:

1. **Independent proposal:** agents produce conclusions without seeing peer answers.
2. **Adversarial critique:** every proposal receives at least one opposing critique and one safety/integrity critique.
3. **Rebuttal and revision:** agents may revise estimates while retaining the original evidence and delta.

The system stores vote/disagreement matrices, supporting evidence, rejected arguments and final rationale. High disagreement is a reason to reduce automation, not a reason for the judge to average answers blindly.

`MODEL_DISAGREEMENT_HIGH`, missing evidence, correlated failure, or suspected agent collusion => `RECOMMEND` or `SHADOW`, never `BOUNDED_AUTO`.

### 25.3 Separate training and anti-collusion

Each agent registry entry records:

```text
agent_id
role
base_model
adapter_or_checkpoint
training_dataset_version
feature_allowlist
tool_allowlist
objective_vector
forbidden_objectives
evaluation_suite_version
calibration_version
last_validation_at
artifact_hash
```

Training data SHALL be split by time where applicable to reduce leakage. Agents that debate each other should not all be fine-tuned on identical preference labels. Evaluation includes intentionally conflicting scenarios, manipulation attempts, poisoned telemetry, regime shifts and unseen catalog/market states.

No agent may directly edit another agent's model weights in Production. Training and promotion are separate, versioned model-release processes.

## 26. Automatic virtual-stock price formation

The stock system may operate automatically, but AI agents SHALL NOT write an arbitrary absolute WDX price directly.

### 26.1 Price council

For each symbol/tick window the stock specialist agents independently estimate bounded components such as:

- fundamental anchor return;
- demand/order-flow pressure;
- liquidity spread/impact;
- momentum/reversal contribution;
- sector/common-factor contribution;
- event shock contribution;
- volatility regime;
- manipulation/integrity penalty;
- uncertainty interval.

The deterministic `StockPriceFormationEngine` combines only allowlisted components using a versioned formula and hard bounds. It owns rounding, integer precision, min/max price, maximum tick return, volatility clamp, circuit breaker, stale-data behavior and idempotent tick identity.

### 26.2 Automation levels

- `SHADOW`: agents calculate hypothetical ticks beside the authoritative ticker.
- `BOUNDED_AUTO`: after validation, agent-derived bounded components may feed the authoritative deterministic price engine.
- `FREEZE`: integrity/staleness/reconciliation breach stops new AI-derived components; the market follows the configured safe pause/fallback contract.

Automatic market operation requires symbol-level freshness, replay protection, manipulation monitoring, deterministic reproducibility from stored component inputs, and a full tick audit trail.

### 26.3 Market-integrity restrictions

The controller SHALL NOT:

- set prices to make a specific user's holdings gain or lose;
- use paid spend, advertising, sponsorship or user identity as a favorable price input;
- observe private holdings and then intentionally move price against a user/cohort;
- bypass circuit breakers or stale-market restrictions;
- rewrite historical prices or ledger trades after the fact.

## 27. Automatic shop pricing

The shop may use bounded automatic price optimization for explicitly eligible SKUs.

Each eligible SKU adds:

```text
auto_price_enabled
base_price
min_price
max_price
max_step_bps
max_drift_bps_7d
cooldown_minutes
minimum_sample_size
elasticity_estimate
elasticity_uncertainty
affordability_floor
protected_new_user
prestige_only
requires_human_approval
```

The commerce, welfare, macro, causal and red-team agents debate every material repricing. The deterministic validator applies the final bounds. Essential progression, starter items, paid-linked benefits and competitive/P2W-sensitive items remain human-approval-only.

The controller must evaluate conversion, WLD burn, purchase days, retention, complaint rate and cohort affordability together. A price increase is rejected when it improves burn while breaching protected affordability or welfare constraints.

## 28. Automatic product and SKU generation

Moneyverse may automatically create and publish **low-risk catalog variants** when all content and economy behavior come from a pre-approved template family.

### 28.1 Auto-publish eligible examples

After shadow evidence and operator enablement, examples may include:

- cosmetic color/theme variants;
- profile frames/background variants;
- display-case, furniture and decoration variants;
- seasonal visual variants;
- non-power collectible variants;
- vanity engraving/restoration service variants;
- prestige-only visual bundles with no new economic effect.

### 28.2 Proposal-only examples

Human approval is mandatory for:

- any new currency or conversion rule;
- any gameplay/reward multiplier;
- any item affecting stock outcomes, rank, competitive power or income compounding;
- loans/credit/interest products;
- random/chance-based paid mechanics;
- a new sink family or transaction semantic;
- a new real-money linkage;
- any SKU whose legal/compliance class is unknown.

### 28.3 Product factory pipeline

`CatalogGapAgent -> ProductDesignerAgent -> EconomyPricingAgent -> PlayerWelfareAgent -> RedTeamAgent -> Content/Schema Validator -> Scenario Lab -> Judge -> deterministic ProductPolicyGate -> Test -> limited rollout -> observe -> keep/rollback`

Every generated product stores template ID, generation inputs, localized copy version, price policy version, asset references, value-flow class, P2W classification, target cohort, simulation evidence, rollout decision and rollback status.

Generated products must not invent unavailable assets. If an asset-generation pipeline exists later, generated assets remain a separate reviewed artifact and must pass copyright/content/accessibility checks before catalog activation.

## 29. Multi-agent decision quorum

A proposal is eligible for bounded automation only if:

- mandatory safety/integrity agents return PASS;
- deterministic guards pass;
- no veto-class constraint is breached;
- calibrated uncertainty is below the policy threshold;
- model disagreement is below the configured threshold or the disagreement is explicitly resolved by evidence;
- Scenario Lab and counterfactual alternatives were evaluated;
- the proposal is reproducible from stored snapshots and model artifacts;
- rollback is executable before apply.

The judge agent does not have a tie-breaking privilege over hard constraints. A safety veto cannot be outvoted by a larger number of commercial agents.

## 30. Additional multi-agent QA

Required tests include:

- same scenario with different agent ordering to detect anchoring/order effects;
- one deliberately bad/compromised agent in the council;
- correlated-agent failure using the same wrong assumption;
- manipulated shop-demand telemetry;
- stock pump/dump and wash-trading simulations;
- sudden liquidity disappearance and stale ticker;
- product generator attempting to create a P2W item;
- price optimizer attempting to overcharge a protected cohort;
- judge hallucinating an unavailable policy key;
- rollback after an automatically published SKU;
- deterministic replay from a stored run producing the same admissibility result.

No multi-agent feature is considered production-ready merely because the agents agree. Agreement without independent evidence is explicitly treated as a correlated-risk signal.

## 24. Definition of Done

This planning slice is complete when:

- English canonical and Korean counterpart exist;
- operating modes and safety boundaries are explicit;
- AI cannot directly mutate balances, inventory or ledger history;
- multi-window/season-aware detection is required;
- deterministic guardrails override AI output;
- sink-first unlimited-by-default policy is preserved;
- bounded auto defaults, fail-closed conditions and rollback semantics are documented;
- policy registry, DB, API and admin-console contracts are defined;
- model governance, analytics and QA cases are defined;
- implementation phases require development branch -> `wdmv-test` verification -> Production;
- the historical planning baseline remains traceable to v2026.09.13.24, while implemented runtime slices record their own versioned changelog/worklog evidence;
- v2026.09.17.184 implements the bounded per-profession assignment-limit compatibility bridge and AI high-risk review path described in section 32.

The broader controller remains a living specification. v2026.09.17.184 adds real runtime capability, but **no Production activation is claimed from documentation or local tests alone**: exact-SHA isolated Test, deployment evidence and Production smoke remain mandatory.

## 31. Research reassessment — 2026-09-16

This reassessment rejects using LLM economic agents as standalone policy authorities. The design is grounded jointly in EconGym, EconAgent, the AI Economist, MALLES, Market-Bench, generative MMO ABM work, StockAgent/StockSim-style market simulators, LLM economic-behavior validation work, and classical ABM, causal-inference and robust-control literature.

### 31.1 Final architecture decision

The center of Moneyverse Economy AI is a **data-calibrated economic digital twin**, not an LLM. The twin ensembles deterministic accounting/market rules, econometric and causal models, classical ABM, learned agents and bounded LLM agents. No single model is a truth source.

- LLM agents model behavioral hypotheses and stress scenarios for consumption, saving, shop choice and trading.
- RL/MARL searches policies and adversarial behavior inside replayable simulation only.
- Real policy effects are re-estimated from observed data with A/B or switchback experiments, interrupted time-series, synthetic control/SDID or another justified causal design.
- High cross-model disagreement blocks automatic enforcement.
- An LLM judge never has enforcement authority; deterministic validation and empirical evidence remain final gates.

### 31.2 Revised agent-training strategy

Do not train a separate foundation model for every role from the start. Begin with a shared base model plus role-specific prompts/tool policies. Once sufficient Moneyverse behavior data exists, split role-specific SFT/LoRA adapters. Offline RL or preference optimization is permitted only for roles that pass replayable-simulator and holdout evaluation. Agent independence must be substantive: at least two of different data splits, adapters/checkpoints, objectives, seeds, or feature/tool allowlists should differ; renaming the same model does not create independent evidence.

### 31.3 Limits of adversarial debate

Multi-agent debate is an error-discovery and alternative-generation mechanism, not an accuracy guarantee. QA must explicitly test shared-base correlation, majority cascades, persuasive-but-wrong judges and context dilution. If debate underperforms an independent deterministic/econometric baseline, the baseline wins.

### 31.4 Reconfirmed stock, shop-price and product automation

- **Virtual stocks:** LLMs never write prices directly. A deterministic price-formation engine combines order-book/flow/fundamental/event inputs; LLM agents provide scenarios and behavioral flow only. Circuit breakers, tick bounds and stale-market locks dominate.
- **Shop pricing:** automatic moves stay within narrow approved min/max/step/cooldown envelopes. Elasticity is updated from real experiments; affordability, retention, complaint and sink-diversity regressions trigger rollback.
- **Product creation:** cosmetic/non-power variants from approved templates may progress through generate -> lint -> simulate -> Test -> limited rollout -> rollback-ready bounded auto-publish. New economic mechanics, earning multipliers, P2W, currencies/conversions, loans/interest and paid random-chance products remain human-approved.

### 31.5 Reference verification status

`EconGym`, `MALLES`, `EconAgent`, the `AI Economist`, `Generative Agents`, generative MMO ABM work, `Market-Bench`, `StockAgent`, `StockSim`, and `Tokenomics-AI/Tokenomics` are treated as verified research/public projects. The exact claimed title `EconGrowthAgent (ICLR 2024)` was not verified against a reliable primary record in this reassessment and is excluded as design evidence. Tokenomics-AI is an inference-cost/routing reference, not an economic-model reference.

## 32. Adaptive profession and daily-limit controller

Jobs/profession policy joins the same multi-model economy control loop. Limits are first-class versioned policies, not hard-coded frontend numbers.

Tunable policy keys include:

- `jobs.primary_profession_slots`: semantic number of simultaneously designated primary-profession identities; the controller may only change this inside an operator-approved range and never silently replace or demote a user's existing primary profession;
- `jobs.concurrent_active_professions`: number of professions that may be actively progressed at once;
- `jobs.assignment_daily_limit`: target semantic policy for ordinary assignment completion count; the long-term default remains `null = unlimited`, but the current P0 runtime still enforces finite per-task `work_task_catalog.daily_limit` values;
- `jobs.assignment_daily_limit_delta.<profession>`: **implemented v2026.09.17.184 compatibility bridge** over the current finite runtime. Eight allowlisted professions use a captured per-task reference baseline plus an integer delta bounded to `[-1,+2]` with a maximum one-step change per policy cycle. This key family, not an arbitrary model-generated key, is the current bounded-auto authority for assignment-count tuning;
- `jobs.rewarded_assignment_daily_limit`: planned semantic policy for assignments eligible for full WLD payout before another configured reward policy applies; default target is `null = unlimited`, and it is not implemented by v184;
- `jobs.daily_wld_budget_per_cohort`: optional cohort/system issuance protection budget, never an individual hidden confiscation rule;
- `jobs.repeat_reward_floor_multiplier`, `jobs.repeat_curve_k`, and related marginal-reward controls;
- profession-specific concurrency, reward, settlement and protective-limit keys where explicitly registered.

The preferred control order is: detect abuse/data error -> tune marginal rewards and task mix -> tune optional sinks/rewards -> rebalance profession demand -> only then consider a temporary finite daily protection limit. Inflation alone is not sufficient evidence for a hard play cap when softer controls remain viable.

**v184 runtime contract.** The compatibility controller reads the existing seven-day profession selection telemetry. With at least 40 assignments, a profession below 3% share may loosen by `+1`; a profession above 60% share may tighten by `-1` only when work exceeds 50% of issuance **and** `work.repeat_decay_percent >= 25`, proving the softer repeat-control stage was attempted first. When concentration clears, or evidence volume becomes too low, any non-zero delta moves one step toward baseline `0`. The existing sample-sufficiency, reconciliation, policy-cooldown, feature-switch, exact-proposal AI review and rollback gates remain authoritative.

### 32.1 v236 operational authority re-review

Production evidence on 2026-09-18 shows 12 active members against the fixed minimum sample of 20, so all seven current daily metric rows are insufficient even though profession telemetry contains 370 assignments. This is a reason to keep application fail-closed, not to lower the sample threshold. The controller may generate a SHADOW review for observability on a blocked proposal, but such a review must preserve `eligible=false` and must never unlock the deterministic apply path.

The registered compatibility range remains `[-1,+2]` for schema/history continuity, but bounded automatic authority is narrowed operationally while population/welfare evidence is insufficient: `0..+2` may loosen access, while `-1` is SHADOW/HUMAN-APPROVAL only. Before automated tightening is enabled, the implementation must enforce `effective_daily_limit >= 2`, require explicit expiry/re-evaluation after one policy cycle, retain soft-control-first ordering, and prove rollback plus limit-hit/abandonment/progression welfare telemetry.

AI runtime health and AI policy participation are separate states. A reachable model endpoint, enabled feature switch, successful shadow review, eligible council review, and applied bounded policy must be exposed as distinct operator evidence. Enabling AI after a weekly review window was already claimed must offer a non-authoritative health/shadow run without reopening or consuming the authoritative apply window.

A non-null daily limit may enter `BOUNDED_AUTO` only when the policy registry declares it auto-tunable and all of the following pass: multi-window evidence, minimum sample, scenario/counterfactual comparison, affordability/progression checks, integrity review, published reason code, maximum duration, automatic relaxation test and rollback readiness. The controller must evaluate both tightening and loosening; when the triggering condition clears, it should relax toward `null = unlimited` rather than preserving a stale cap.

Primary-profession slot changes are identity-sensitive. Automation may widen available slots or propose a narrower future policy, but it must not revoke an already selected profession, erase mastery, reassign a user, or make earned progression inaccessible. Any migration from a wider to narrower slot policy requires grandfathering or explicit human-approved transition rules.

Required telemetry includes per-profession active users, completion/reward issuance, repeat concentration, median/P95 daily completions, mastery progression, switch rate, abandonment, bot/abuse confidence, new-user progression time, profession shortage/oversupply, and limit-hit/relaxation rates. Every limit decision records before/after value, affected population, evidence windows, model disagreement, reason, expiry/reevaluation time and rollback threshold.

## 33. Dual classical + AI continuous control — v2026.09.16.139

Moneyverse SHALL operate two independently auditable control lanes from the same immutable economy snapshot. The goal is not to replace established economics with AI, but to keep a deterministic/classical baseline alive while learned systems search a wider behavioral and policy space.

### 33.1 Lane A — classical/deterministic baseline

Lane A includes authoritative accounting identities, ledger reconciliation, rule-based ABM, econometric/elasticity models, causal estimators, deterministic market matching and price formation, published policy formulas, constrained optimization/MPC where justified, and hard safety/integrity bounds. Lane A is the emergency fallback and must remain operational when all learned models are unavailable, stale or quarantined.

### 33.2 Lane B — AI/learned exploration

Lane B includes LLM behavioral agents, role-specialized SFT/LoRA adapters when evidence supports them, RL/MARL policy search inside replayable simulation, anomaly/cause explanation, adversarial stress agents, counterfactual policy generation, demand hypotheses, product/SKU ideation and multi-agent critique. Lane B expands search and behavioral coverage but never becomes the authority for ledger truth, direct balance mutation, historical rewriting, stock-price writes or hard constraints.

### 33.3 Parallel run contract

Each decision cycle stores one `economy_snapshot_id` and runs both lanes against that exact snapshot. Each lane must emit:

- prediction horizon and outcome vector;
- proposed policy/action and no-op alternative;
- calibrated uncertainty or model-risk estimate;
- assumptions and feature/model versions;
- expected affordability, concentration, issuance, retention and integrity effects;
- rollback trigger and observation window.

The arbiter compares direction, magnitude, uncertainty and known model coverage. It SHALL NOT average incompatible predictions merely to manufacture consensus.

### 33.4 Automatic arbitration

- agreement inside the safe intersection -> low-risk bounded action may proceed to Scenario Lab and deterministic validation;
- same direction but materially different magnitude -> choose the conservative safe intersection or lower-risk candidate;
- strong directional disagreement, high model disagreement or missing calibration -> `SHADOW`, `NO_OP` or human review;
- Lane B unavailable/stale -> Lane A continues without AI;
- Lane A cannot model a novel behavior but Lane B finds one -> AI may create a shadow hypothesis, never bypass empirical validation;
- hard integrity/security/accounting constraints override both lanes and any judge vote.

### 33.5 Continuous automatic loop

Normal loop:

`telemetry -> reconciliation -> immutable snapshot -> Lane A || Lane B -> disagreement/calibration gate -> Scenario Lab -> deterministic policy validator -> shadow/canary/bounded apply -> causal outcome evaluation -> keep/rollback -> recalibrate both lanes`

Observation may run hourly. Routine economy mutations retain policy-family cooldowns and change-size bounds. Exploit, stale-market, ledger mismatch and other integrity incidents use a separate faster deterministic containment path; AI may explain the incident but does not delay containment.

### 33.6 Domain authority matrix

| Domain | Classical/deterministic authority | AI contribution |
|---|---|---|
| Ledger/WLD | accounting, reconciliation, atomic settlement | anomaly explanation, scenario hypotheses |
| WDX stocks | order book, matching, tick bounds, price formation, circuit breaker | trader behavior, event scenarios, manipulation stress |
| Shop price | min/max/step/cooldown, elasticity baseline, affordability floor | demand hypothesis, segment response, candidate repricing |
| Product/SKU | schema, entitlement, economy class, P2W/abuse validator | approved-template ideation/copy/variant proposal |
| Jobs/limits | issuance envelope, integrity threshold, grandfathering and reset rules | adaptive behavior analysis and bounded policy candidate |
| Faucet/sink | transaction taxonomy and measured flows | portfolio/content-policy alternatives |

### 33.7 Research evidence baseline

The v2026.09.16.139 research pass created a deduplicated 11,749-record candidate corpus from OpenAlex and Crossref and committed the manifest under `docs/findings/`. The corpus is a discovery index, not a claim that every work was read in full. Production decisions rely on the smaller set of directly relevant primary references, current Moneyverse evidence, replayable tests and causal post-rollout measurements. The dual-lane decision is reinforced by EconGym's strong hybrid results, classical ACE literature, robust-control/model-uncertainty work, LLM economic-agent research, safe/constrained RL and algorithmic-pricing risk evidence.
## 34. Paired specialist council runtime — v2026.09.16.141

The AI lane is implemented as six specialist domains (`macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity`) with two independently configurable seats per domain. Each seat performs an independent pass and a rebuttal pass against only its domain peer. A domain disagreement yields abstention rather than averaging. Paired `integrity` or `welfare` vetoes are safety-critical; two paired-veto domains also veto the council. The resulting council record is append-only and carries all 12 final seat artifacts.

Every domain/seat can use a separate OpenAI-compatible endpoint/model/adapter. Shared defaults are operational conveniences, not evidence of independence. Production independence requires materially different model families, checkpoints/adapters, training splits, objectives or tool/feature policies. The classical lane remains authoritative and continues when the AI council is disabled, incomplete, unavailable or abstains.

Runtime storage is separated from the application disk: `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs}` is the preferred local AI root. Models are not required to be resident simultaneously; local inference must use bounded concurrency.
