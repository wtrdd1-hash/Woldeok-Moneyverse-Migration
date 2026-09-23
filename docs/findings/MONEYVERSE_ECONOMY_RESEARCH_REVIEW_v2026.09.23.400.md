# Moneyverse Economy Research Review — v2026.09.23.400

Date: 2026-09-23
Scope: expanded evidence review for Moneyverse monetary, job-reward, market, sink, and AI-economy planning.
Corpus: `MONEYVERSE_ECONOMY_REFERENCE_CORPUS_v2026.09.23.400.csv`

## 1. Corpus expansion

The previous deduplicated discovery corpus contained 11,749 records. This cycle collected 6,879 Crossref candidates and 17,291 OpenAlex candidates across virtual economies, game inflation, agent-based macroeconomics, heterogeneous-agent monetary policy, reinforcement learning, market microstructure, pricing, transaction-tax interventions, labor incentives, fraud/bot economics, and digital-twin policy simulation.

After DOI-first and normalized-title fallback deduplication, the combined corpus contains **31,289 unique candidates**, a net increase of **19,540** records.

This remains a discovery corpus. Inclusion does not mean every paper was read in full or adopted.

## 2. Topic coverage

Title-keyword classification gives at least:
- virtual/game economy: 2,109
- inflation/money/monetary/currency: 3,393
- agent-based/multi-agent: 3,115
- reinforcement learning/AI: 4,216
- market microstructure/auction/tax: 432
- wealth/inequality/heterogeneous distribution: 1,100
- fraud/bot/abuse: 315
- pricing/behavioral/virtual goods: 1,844

2026 alone contributes 1,019 candidate records in the merged corpus; 2023–2025 remain the largest recent cohorts.

## 3. High-confidence findings

### 3.1 Virtual-economy control cannot be one-dimensional
EVE Online's 2026 Monthly Economic Reports track faucets, money supply, price indices, production, mining, destruction, active ISK delta, and velocity. Month-to-month data show these signals can move in different directions: for example, May faucets rose strongly, July money supply fell while the Mineral Price Index declined, and February reported declining ISK velocity. Moneyverse should therefore avoid a single "faucet minus sink" controller.

### 3.2 Sink interventions can have side effects

Research on Old School RuneScape market interventions found that a transaction tax and item sink did not simply reduce all trading activity; the item sink was associated with higher prices for luxury goods while trading volume remained resilient. Sink design therefore needs item/category-specific price monitoring and causal evaluation.

### 3.3 Distribution matters

HANK and heterogeneous-agent research from the Federal Reserve, IMF, ECB, and BIS shows that households with different wealth, income, debt, consumption baskets, and marginal propensities to consume respond differently to policy. Moneyverse should track new, median, high-income, and high-wealth cohorts separately rather than optimize only an aggregate average.

### 3.4 Excess balances can transmit into prices

Federal Reserve research on excess savings finds that the distribution and drawdown of accumulated wealth can materially amplify consumption and inflation. In Moneyverse, dormant-to-active balance reactivation, returning whales, event rewards, and mass reactivation campaigns should be treated as potential demand shocks even if the current-day faucet is unchanged.

### 3.5 ABM is useful but not authoritative

The 2025 Journal of Economic Literature review documents growing use of agent-based models across macro, finance, markets, and public policy while also emphasizing modeling challenges. Moneyverse should use ABM/LLM/RL lanes for stress testing and policy discovery, but ledger truth and hard constraints remain deterministic.

### 3.6 RL policy systems need stability gates

IMF work on deep-RL macro models reports both near-optimal behavior and unstable learning cases. RL/LLM-based policy suggestions therefore require holdout evaluation, bounded actions, shadow replay, rollback, and deterministic validation before any effect on rewards or prices.
## 4. New planning implications

1. Add cohort-specific inflation and purchasing-power metrics rather than one global CPI.
2. Add dormant-balance activation and returning-user liquidity shocks to scenario replay.
3. Add category-specific sink elasticity checks; a sink can raise scarcity/luxury prices.
4. Track currency velocity or a practical proxy alongside money supply.
5. Separate seasonal activity changes from structural inflation signals.
6. Require data-quality/version metadata on economy dashboards because economic datasets can be revised retroactively.
7. Treat reward issuance, asset destruction, production, and trade depth as separate dimensions.
8. Evaluate policy effects causally where feasible instead of assuming a post-change correlation is caused by the intervention.
9. Preserve cohort affordability constraints when tuning rewards or sinks.
10. Keep AI/ABM/RL as bounded recommendation/simulation layers rather than authoritative ledger controllers.

## 5. Evidence hierarchy

Tier A: official first-party economic reports and raw datasets; central-bank/IMF/BIS/AEA research; peer-reviewed or high-quality working papers with reproducible methods.

Tier B: platform/game developer design posts, conference papers, preprints, and well-documented empirical case studies.

Tier C: broad discovery candidates used to locate relevant work but not sufficient alone for a production policy decision.

Production tuning requires Moneyverse telemetry, exact policy versioning, replay/shadow comparison, and post-change measurement regardless of external evidence.

## 6. Conclusion

The expanded corpus strengthens rather than reverses v399. Unlimited ordinary participation remains compatible with economic stability only when currency issuance per unit time is bounded, sinks are measured as true destruction, distributional effects are explicit, velocity and prices are monitored, and automated policy changes are simulated and reversible.
