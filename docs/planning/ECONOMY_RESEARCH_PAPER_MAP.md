# Moneyverse — Economy Research Paper Map

> Version: v2026.09.23.401
> Status: canonical research-to-design mapping
> Companion: [ECONOMY_RESEARCH_PAPER_MAP.ko.md](ECONOMY_RESEARCH_PAPER_MAP.ko.md)

## 0. Purpose

This document maps selected high-confidence papers to explicit Moneyverse design decisions. The broader discovery corpus remains useful for coverage, but production policy must trace back to a smaller evidence set with a documented interpretation, boundary, and validation metric.

## 1. Axtell & Farmer (2025) — Agent-Based Modeling in Economics and Finance

Citation: Robert L. Axtell and J. Doyne Farmer, Journal of Economic Literature 63(1), 197–287. DOI: 10.1257/jel.20221319.

Finding used: ABM can represent heterogeneous behavior and market dynamics that representative-agent models omit, but model construction and validation remain non-trivial.

Moneyverse application:
- use ABM for stress testing, scenario discovery, market-impact and systemic-risk exploration;
- keep ledger truth, accounting identities, hard safety limits, and settlement rules deterministic;
- calibrate ABM against observed Moneyverse cohorts and replay data;
- require sensitivity analysis before any ABM-derived control recommendation is promoted.

Not adopted: ABM output is not treated as ground truth or autonomous authority.

Validation: scenario reproducibility, calibration error, sensitivity ranges, and divergence versus observed post-policy behavior.
## 2. Kaplan, Moll & Violante (2018) — Monetary Policy According to HANK

Citation: American Economic Review 108(3), 697–743. DOI: 10.1257/aer.20160042.

Finding used: heterogeneous households with different liquidity, wealth and marginal propensities to consume respond differently to policy; indirect general-equilibrium effects can dominate direct effects.

Moneyverse application:
- segment new, median, high-income, high-wealth and dormant-returning users;
- compute cohort-specific purchasing power and balance changes;
- test reward/sink changes against cohort-specific core-basket affordability;
- avoid tuning exclusively to aggregate average balances.

Not adopted: real-world interest-rate transmission is not copied directly into the game economy.

Validation: cohort CPI/price basket, liquid-balance percentiles, income percentiles, purchase conversion by cohort, and post-policy distribution shift.

## 3. Kaplan & Violante (2018) — Microeconomic Heterogeneity and Macroeconomic Shocks

Citation: Journal of Economic Perspectives 32(3), 167–194.

Finding used: distributional heterogeneity can materially change aggregate shock transmission.

Moneyverse application:
- simulate event-reward shocks, mass-return campaigns, dormant-balance activation, and stock-event windfalls by cohort;
- include distributional exposure in policy rollout and rollback thresholds.

Validation: shock response by cohort, balance drawdown, price response, sink uptake, and concentration metrics.
## 4. Zheng et al. (2020/2021) — The AI Economist

Citation: "The AI Economist: Improving Equality and Productivity with AI-Driven Tax Policies" (2020), arXiv:2004.13332; extended framework "Optimal Economic Policy Design via Two-level Deep Reinforcement Learning" (2021), arXiv:2108.02755.

Finding used: co-adaptive agents and planners can discover non-obvious policy responses in simulation and expose gaming behavior.

Moneyverse application:
- use two-level simulation to test reward, fee, tax-like sink, and subsidy proposals;
- include adversarial/gaming agents;
- compare learned policies with deterministic baselines;
- restrict learned policy outputs to bounded proposals, never direct ledger mutation.

Not adopted: welfare objectives from the papers are not copied as Moneyverse product objectives.

Validation: baseline comparison, exploit/gaming resilience, cohort welfare proxies, policy stability, and rollback success.

## 5. Atashbar & Shi (2022) — Deep Reinforcement Learning in Macroeconomics

Citation: IMF Working Paper 2022/259. DOI: 10.5089/9798400224713.001.

Finding used: DRL can model complex non-stationary economic systems but faces environment design, reward design, stability, and interpretability challenges.

Moneyverse application:
- RL remains a shadow/simulation lane;
- policy action spaces are bounded and versioned;
- reward functions include inflation, affordability, concentration, abuse and stability penalties;
- every candidate policy must pass deterministic validators and replay gates.

Validation: out-of-sample stability, action-bound violations, sensitivity to reward weights, and reproducibility.
## 6. Atashbar & Shi (2023) — AI and Macroeconomic Modeling: DRL in an RBC Model

Citation: IMF Working Paper 2023/040. DOI: 10.5089/9798400235252.001.

Finding used: DRL agents can approximate macroeconomic behavior in controlled environments, but learning quality depends on environment structure and stochasticity.

Moneyverse application:
- maintain deterministic benchmark scenarios alongside learned-agent scenarios;
- test policies under both deterministic and stochastic shocks;
- reject policies that perform only under one narrow simulator configuration.

Validation: benchmark regret, stochastic stress performance, variance across seeds, and policy robustness.

## 7. Atashbar (2024) — Reinforcement Learning from Experience Feedback

Citation: IMF Working Paper 2024/114. DOI: 10.5089/9798400277320.001.

Finding used: historical experience can be incorporated into policy-learning systems.

Moneyverse application:
- maintain policy-outcome memory keyed by policy version and telemetry window;
- feed prior successes, regressions and rollbacks into AI recommendation context;
- never allow historical summaries to override canonical ledger evidence.

Validation: recommendation consistency, regression recurrence rate, and evidence traceability.
## 8. Hogan-Hennessy, Xenopoulos & Silva (2022) — Market Interventions in a Large-Scale Virtual Economy

Citation: arXiv:2210.07970.

Finding used: in Old School RuneScape, a transaction tax and item sink had heterogeneous effects; the item sink was associated with luxury-good inflation while trading volume remained resilient.

Moneyverse application:
- evaluate every sink by category, not only total currency destroyed;
- monitor item price, trade volume, scarcity, substitution, and concentration;
- use causal/quasi-experimental evaluation for major sink changes;
- avoid interpreting "more currency burned" as automatically healthy.

Validation: category CPI, item-volume elasticity, before/after plus control cohort, substitution flow, and wealth-cohort effects.

## 9. Calvano et al. (2020) — Artificial Intelligence, Algorithmic Pricing, and Collusion

Citation: American Economic Review 110(10), 3267–3297. DOI: 10.1257/aer.20190623.

Finding used: Q-learning pricing agents can learn supracompetitive pricing behavior without explicit communication in repeated settings.

Moneyverse application:
- autonomous pricing systems cannot optimize revenue alone;
- add price-change ceilings, competition/fairness constraints and collusion-risk telemetry;
- preserve deterministic reference-price and affordability guardrails;
- require human approval for material price-regime changes.

Validation: price dispersion, markup drift, cross-agent price synchronization, affordability regression, and rollback trigger rate.
## 10. 2026 follow-up on algorithmic collusion

Citation: Meylahn & Schinkel, "Artificial Collusion: Examining Supracompetitive Pricing by Q-Learning Algorithms," Management Science, published online 2026. DOI: 10.1287/mnsc.2024.08557.

Finding used: not every supracompetitive outcome from Q-learning should automatically be interpreted as practical autonomous cartel behavior; mechanism details matter.

Moneyverse application:
- distinguish suspicious correlated pricing from demonstrated collusive mechanism;
- retain conservative price safeguards without over-labeling every synchronized move as collusion;
- require explainable evidence before punitive automated action.

Validation: causal/mechanistic evidence, synchronized-action persistence, exogenous-shock response, and false-positive review rate.

## 11. Evidence-to-policy rule

Every material economy policy PR or planning delta must name the supporting paper(s), the adopted insight, the non-adopted assumptions, Moneyverse-specific telemetry required, and the rollback condition. Citation alone is insufficient.

A paper can justify a simulation hypothesis or monitoring requirement; it does not by itself authorize a production parameter value.
