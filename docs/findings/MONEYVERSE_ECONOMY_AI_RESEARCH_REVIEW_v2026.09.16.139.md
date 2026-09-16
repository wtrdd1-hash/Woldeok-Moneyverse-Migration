# Moneyverse Economy AI research review — v2026.09.16.139

Date: 2026-09-16  
Scope: research/planning evidence for the Moneyverse dual classical+AI economy controller.  
Corpus manifest: `MONEYVERSE_ECONOMY_AI_REFERENCE_CORPUS_v2026.09.16.139.csv`

## 1. Corpus construction

This pass built a broad bibliographic candidate corpus rather than claiming that every record was read in full.

- OpenAlex: 15 themed searches were attempted at up to 1,000 records each. Rate limiting stopped later searches; 8,788 unique OpenAlex work IDs were retained.
- Crossref: six complementary searches returned 3,000 raw records. DOI-first and normalized-title deduplication added 2,961 records not already represented.
- Final deduplicated candidate corpus: **11,749 records**.
- The committed CSV contains one normalized row per retained record with source, record ID/URL, title, year, DOI, citation count where available, and type.
- Candidate collection is intentionally broad. Inclusion in the CSV is not an endorsement and is not equivalent to full-text review.

The OpenAlex API searches title, abstract and full text where available and exposes metadata, topics and citation relationships. Crossref supplies independent DOI/publication metadata. Core design decisions below use primary papers, major proceedings, NBER/AEA/PMLR/ACL sources, official project documentation and reproducible implementations rather than raw search rank alone.

## 2. Automated thematic screen

A title-pattern screen was used only to organize the candidate pool; categories overlap and therefore do not sum to the corpus total.

| Theme | Candidate matches |
|---|---:|
| Classical / agent-based computational economics | 1,210 |
| AI / reinforcement-learning policy | 1,553 |
| LLM / generative agents | 272 |
| Markets / stocks / microstructure | 242 |
| Pricing / retail / supply chain | 730 |
| Causal policy evaluation | 398 |
| Virtual / game / token economy | 160 |
| Digital twin / robust / constrained control | 906 |

The remaining records are broad adjacent material or did not match the conservative title screen. Median publication years ranged from 2016 for classical ABM to 2024 for the LLM-agent subset, which reinforces the need to preserve mature economic/control methods while adding newer AI methods.

## 3. Core references adopted

The review uses these as high-value design anchors, together with related citations in the corpus:

- Tesfatsion, *Agent-Based Computational Economics: A Constructive Approach to Economic Theory* — classical interacting-agent baseline and constructive validation.
- Delli Gatti et al./Handbook surveys of agent-based macroeconomics — mature ABM macro-policy patterns.
- Hansen & Sargent, *Robust Control and Model Uncertainty* — do not optimize as if one model were true.
- Arkhangelsky et al., *Synthetic Difference-in-Differences* — causal post-rollout policy evaluation.
- Achiam et al., *Constrained Policy Optimization* — separate objective maximization from hard constraints.
- Calvano et al., *Artificial Intelligence, Algorithmic Pricing, and Collusion* — autonomous pricing can learn undesirable coordination without explicit communication.
- Zheng et al., *The AI Economist* — nested agent/planner RL can search policy in simulation but must be evaluated against strategic adaptation.
- Park et al., *Generative Agents: Interactive Simulacra of Human Behavior* — memory/reflection/planning architecture for behavioral agents.
- Li et al., *EconAgent* — LLM-enhanced heterogeneous macro agents with memory and perception.
- Horton et al., *Homo Silicus* — LLMs can be useful simulated economic actors, but they are computational hypotheses about human behavior.
- Mi et al., *EconGym* — broad economic testbed; hybrid AI guided by classical economic methods performs strongly on complex tasks.
- Xu et al., generative ABM for MMO economies — direct game-economy evidence for LLM player agents and emergent market behavior.
- Zhang et al., *StockAgent* — LLM investor agents for market-response simulation rather than direct authoritative price writing.
- Zheng et al., *Market-Bench* — LLM retailers can bid, price and market goods, but agent performance is highly uneven and winner-take-most behavior appears.
- Ludwig, Mullainathan & Rambachan, *Large Language Models: An Applied Econometric Framework* — LLM outputs require validation samples and leakage/error controls before econometric use.

## 4. Architecture conclusion

Moneyverse should run **two independent analytical/control lanes continuously**.

### Lane A — classical / deterministic

Authoritative accounting identities, ledger reconciliation, rule-based ABM, econometric elasticity/forecast models, causal estimators, order-book matching and price formation, bounded optimization/MPC, published policy equations and deterministic safety limits.

This lane is the stable baseline and emergency fallback. It must remain capable of operating if all learned models are unavailable.

### Lane B — AI / learned

LLM behavioral agents, role-specialized adapters, RL/MARL policy search inside replayable simulation, anomaly explanation, counterfactual generation, product/SKU ideation, demand hypotheses, adversarial agents and multi-agent critique.

This lane expands the search space and detects nonlinear/novel behavior, but it is not the final authority for balances, ledger history, stock prices or hard constraints.

## 5. Automatic arbitration

Both lanes consume the same immutable feature snapshot and emit versioned predictions, uncertainty and candidate actions.

- If both lanes agree in direction and magnitude is inside the safe intersection, a low-risk policy may become eligible for bounded automation.
- If they agree in direction but differ materially in magnitude, use the conservative intersection or the lower-risk action.
- If they disagree strongly, do not average them blindly: move to `SHADOW`, `NO_OP` or human review and collect more evidence.
- If AI fails or is stale, Lane A continues operation.
- If Lane A lacks a behavioral model but AI detects a novel scenario, AI may create a shadow proposal; it cannot bypass empirical validation.
- Hard safety/integrity constraints always dominate both lanes.

## 6. Continuous control loop

`telemetry -> reconciliation -> immutable snapshot -> Lane A + Lane B in parallel -> disagreement/calibration gate -> Scenario Lab -> deterministic validator -> shadow/canary/bounded apply -> causal outcome evaluation -> keep/rollback -> recalibrate both lanes`

Routine monitoring may run hourly, while ordinary policy mutation remains slower and cooldown-bound. Incident/integrity controls use their own faster deterministic path.

## 7. Domain decisions

- Virtual stocks: deterministic order-book/price engine is authoritative; AI supplies trader behavior, event scenarios and manipulation stress tests.
- Shop prices: classical elasticity/constraints and AI demand hypotheses both vote; bounded automatic repricing requires agreement/evidence and affordability guardrails.
- Product creation: AI may generate approved low-risk cosmetic/non-power variants; deterministic schema, entitlement, pricing, abuse and economy-impact validators must pass before Test and limited rollout.
- Jobs/professions/daily limits: classical issuance and integrity thresholds define the admissible envelope; AI analyzes behavior and proposes adaptive changes. Finite limits remain temporary, reversible and automatically relaxable toward `null = unlimited`.
- Economy faucets/sinks: accounting taxonomy and ledger facts are deterministic; AI helps choose among policy alternatives and content responses.

## 8. Training decision

Do not train many foundation models from scratch. Start with shared base models plus differentiated roles/tools/data views. Build Moneyverse-specific behavior, experiment and replay datasets first. Promote only roles with enough data to dedicated SFT/LoRA adapters, then consider offline RL/preference optimization inside replayable simulation. Every promoted model requires registry versioning, holdout evaluation, calibration and rollback.

## 9. Evidence standard

The 11,749-record corpus supports breadth, not certainty. A production policy must cite the smaller set of directly relevant primary evidence, current Moneyverse runtime data, reproducible simulation and causal post-rollout measurements. No model, paper count or agent vote substitutes for current ledger truth or observed user outcomes.
