# Woldeok Moneyverse — Jobs & Profession Mastery Specification

> Version: v2026.09.12.26
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`, `BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md`
> Korean counterpart: [JOBS_PROFESSION_MASTERY_SPEC.ko.md](JOBS_PROFESSION_MASTERY_SPEC.ko.md)

## 0. Purpose

This specification turns Jobs and Profession Mastery into a persistent progression system rather than a reward button. The user should be able to work as often as desired, build mastery, specialize, earn identity/status, and spend WLD on certification, equipment appearance, training spaces and prestige without arbitrary daily play caps.

Core loop:

`choose profession -> accept assignment -> perform/verify -> settle reward -> gain mastery -> specialize -> spend on identity/qualification -> unlock broader work -> review performance`

WLD and profession rewards remain service-internal virtual game data. Nothing in this feature represents employment, wages, certification, vocational qualification or guaranteed income in the real world.

## 1. Product principles

1. **Unlimited by default.** Ordinary assignment starts/completions, mastery growth, profession switching and long-term specialization do not receive arbitrary daily/account hard caps.
2. **Verified effort, not button farming.** Every paid assignment has server-verifiable completion evidence or deterministic simulation state.
3. **Marginal reward controls instead of play caps.** Repeating the same low-complexity task may reduce *marginal* WLD efficiency while mastery/collection/progress can continue.
4. **No infinite compounding.** Profession level improves access, variety, identity and efficiency within bounded curves; it must not create exponentially compounding WLD.
5. **Spend to express and specialize.** Certification, uniforms, badges, workspaces, archive items and prestige are recurring sinks, not mandatory pay-to-win gates.
6. **Server authoritative.** Reward policy, difficulty, quality scoring, cooldown-like integrity controls, modifiers and sink prices are versioned policy/config.
7. **Atomic settlement.** Assignment completion, reward, XP, item inputs/outputs and analytics outcome are committed idempotently.
8. **Cross-system safety.** Jobs may feed Business, Crafting, Club, City Project and Season systems, but may not bypass their ledgers or integrity rules.

## 2. Profession families

Initial catalog:

| Code | Profession | Core activity | Early assignment | Advanced identity | Primary cross-system link |
|---|---|---|---|---|---|
| `COURIER` | City Courier | route execution | City Delivery | Logistics Specialist | Business/Logistics |
| `RETAIL` | Retail Associate | order/stock handling | Shelf Restock | Store Operations Lead | Business/Retail |
| `TECH` | Digital Technician | diagnostics/repair simulation | Device Check | Systems Specialist | Crafting/Technology |
| `CREATOR` | Media Creator | brief-based creation | Poster Brief | Creative Director | Community/Season |
| `ANALYST` | Market Analyst | learning/review tasks | Watchlist Review | Risk Analyst | WDX/Replay |
| `CRAFT` | Workshop Artisan | recipe/quality loop | Basic Assembly | Master Artisan | Crafting/Marketplace |
| `FARM` | Urban Grower | crop/resource planning | Seed Batch | Production Specialist | Business/Supply Chain |
| `LOGISTICS` | Logistics Operator | shipment planning | Route Plan | Network Planner | Business/Clubs |
| `CIVIC` | Civic Coordinator | city/community tasks | Public Notice | City Steward | City Projects |

Profession names are fictional game roles and must not imply real credentials.

## 3. Assignment lifecycle

State machine:

`AVAILABLE -> ACCEPTED -> IN_PROGRESS -> SUBMITTED -> VERIFYING -> COMPLETED -> SETTLED`

Exceptional states:

`ACCEPTED/IN_PROGRESS -> ABANDONED`
`SUBMITTED/VERIFYING -> REJECTED`
`VERIFYING -> REVIEW_HOLD`
`REVIEW_HOLD -> COMPLETED | REJECTED`

Rules:

- settlement is allowed only once;
- client timers are never authoritative;
- assignment policy version is persisted at acceptance;
- abandon does not delete audit history;
- retries return canonical state;
- verification failure gives a reason code without fabricating a payout.

Recommended deterministic key:

`job_settlement:{assignment_instance_id}:{user_id}:{policy_version}`

## 4. Unlimited play and marginal reward curve

The default configuration for ordinary assignment count is `null = unlimited`.

To stop one trivial task from dominating the economy without stopping play, each template may use a marginal WLD curve. Planning example for repeated same-template completions inside a rolling activity window:

`effective_wld = base_wld * max(floor_multiplier, 1 / sqrt(1 + repeat_index * k))`

Example defaults:

- `k = 0.08`
- `floor_multiplier = 0.35`
- mastery XP floor = `0.70`
- collection/achievement progress = unchanged unless abuse signals apply

This is a tuning model, not a fixed player limit. Users can switch task families, increase difficulty, take quality objectives, collaborate, or continue for non-WLD progression.

The UI must disclose when marginal WLD efficiency has decreased and suggest alternatives. It must never misleadingly show the original payout if the server will settle less.

## 5. Difficulty, quality and reward model

Recommended settlement model:

`gross_reward = base_reward * difficulty_factor * quality_factor * context_factor`

`net_reward = gross_reward * marginal_repeat_factor`

Planning factors:

| Dimension | Range | Meaning |
|---|---:|---|
| difficulty | 0.8–2.5 | complexity / verification burden |
| quality | 0.7–1.3 | result quality within explicit rubric |
| context | 0.8–1.2 | legitimate live-event/location/system need |
| repeat | 0.35–1.0 | marginal reward control |

Never multiply together unbounded permanent bonuses. Final payout is integer WLD using authoritative rounding policy.

## 6. Profession mastery

Each profession has:

- `mastery_xp`: unbounded historical progression value;
- `mastery_level`: derived/display level using a non-linear curve;
- `specialization_nodes`: persistent choices;
- `prestige_count`: identity/history, not exponential income power;
- `competency_badges`: achievements based on varied verified work.

Planning level curve:

`xp_required_for_next = round(250 * level^1.35)`

There is no ordinary final mastery level hard cap. UI may group levels into ranks:

Trainee -> Skilled -> Professional -> Specialist -> Expert -> Master -> Legacy

Higher ranks unlock broader task pools, cosmetics, journals, workspaces and specialization choices. Any payout efficiency improvement must be bounded and subject to economic simulation.

## 7. Specialization

Example Courier branches:

- **Urban Routing** — unlocks multi-stop planning challenges;
- **Fragile Handling** — unlocks quality-sensitive assignments;
- **Express Operations** — unlocks time-optimization tasks;
- **Network Planning** — links into Business shipment planning.

Specialization does not permanently lock the account. Respecialization is allowed through a disclosed WLD service cost and preserves history.

Suggested respecialization price:

`respec_cost = 1,000 + 500 * unlocked_specialization_nodes`

This is a `HARD_SINK` and may be tuned. The user receives flexibility, not a direct WLD multiplier.

## 8. Certification and qualification sinks

These are fictional in-game credentials.

| Sink | Target | Price seed | Repeat | Class | Value | P2W |
|---|---|---:|---|---|---|---|
| Basic Assessment | early | 750 WLD | per profession | HARD_SINK | unlocks task family | No, earnable prerequisite |
| Specialist Exam | mid | 5,000 WLD | per specialization | HARD_SINK | title + advanced tasks | No guaranteed profit |
| Mastery Portfolio Review | high | 25,000 WLD | per prestige cycle | HARD_SINK | prestige record | No |
| Respecialization | mid/high | formula | repeatable | HARD_SINK | choice reset | No |
| Uniform Recolor | all | 500 WLD | repeatable | HARD_SINK | cosmetic | No |
| Profession Badge Engraving | collector | 1,500 WLD | repeatable | HARD_SINK | profile display | No |
| Workbench Theme | mid | 4,000 WLD | repeatable variants | HARD_SINK | workspace cosmetic | No |
| Career Archive Volume | high | 50,000 WLD | repeatable by volume | HARD_SINK | permanent history display | No |
| Legacy Hall Wing | prestige | `100,000 * 1.45^n` | unlimited by default | HARD_SINK | exhibition space | No |
| City Profession Endowment | ultra-high | 250,000+ WLD | repeatable | HARD_SINK | public honor record | No |

No payment may bypass required verified mastery evidence. A user cannot buy a mastery rank outright.

## 9. Work equipment and inventory

Equipment is primarily identity, workflow choice and crafting integration.

Classes:

- uniform/cosmetic;
- reusable tool skin;
- consumable material input;
- crafted profession collectible;
- assignment-specific temporary resource.

If a tool provides gameplay utility, the effect must be bounded and obtainable through normal play. No cash-paid or WLD-purchased item may create an exclusive compounding income advantage.

## 10. Faucet / sink / transfer classification

- system-funded verified job payout: `FAUCET`;
- player-to-player commissioned transfer in a future contract system: principal = `TRANSFER`, platform fee = `HARD_SINK`;
- certification/respec/cosmetic/workspace fees: `HARD_SINK`;
- material conversion: `CONVERTER` plus any explicit fee sink;
- reserved assignment deposit: `HOLD` until settlement/cancel;
- XP/mastery: non-WLD progression, never counted as currency sink/faucet.

Admin dashboards must not call gross job activity “economic growth” without separating newly issued WLD from transfer volume.

## 11. Anti-abuse and integrity

Signals include:

- impossible completion timing;
- identical repeated result payloads where variation is expected;
- multi-account coordination to manufacture commission demand;
- replayed submission/idempotency keys with changed payload;
- abnormal completion bursts;
- task-template concentration;
- linked-account reward cycling;
- client-side timer or score tampering.

Protection response order:

1. reject impossible state transitions;
2. return canonical result for duplicate requests;
3. reduce/hold only affected reward where evidence requires review;
4. place specific account/task/cluster on `REVIEW_HOLD` when needed;
5. do not confiscate unrelated permanent assets automatically.

Security/system throttles may exist, but must be documented as protection thresholds, not ordinary play caps.

## 12. Cross-system integration

### Business

Profession mastery may unlock *operating options* or reduce informational friction, but cannot create guaranteed passive compounding. Example: Logistics Master unlocks advanced route planning UI, not a permanent +50% revenue multiplier.

### Crafting and Marketplace

Profession recipes may create tradable items. Inputs/outputs follow the crafting spec; marketplace principal remains transfer and fees remain sinks.

### Clubs

Club work campaigns accept diverse verified contributions. Repeating one template receives diminishing contribution weight rather than a daily participation ban.

### City Projects

Civic assignments can create non-WLD project progress. City donations remain separate hard sinks.

### WDX learning

Analyst tasks reward journals, diversification review and replay learning rather than raw trading profit or trade frequency.

## 13. Season integration

Season jobs are additive layers, not replacement employment.

Season 1 examples:

- complete three distinct profession families;
- pass one in-game Basic Assessment;
- create one career journal entry;
- spend WLD on one non-power profession identity sink;
- review weekly income/spending mix.

Season 2 Industrial Expansion examples:

- complete manufacturing/logistics assignments;
- support one Business supply-chain operation;
- contribute to a Club production campaign;
- unlock a profession specialization;
- complete one logistics replay/analysis challenge.

Season-end behavior:

- profession mastery, certifications, prestige, journals and cosmetics persist;
- season-specific assignment progress and season ranking archive/reset;
- no profession mastery is wiped because a season ends;
- high-rank rewards emphasize titles, frames, workspace trophies and archive entries.

## 14. UX surfaces

`/earn` should contain:

1. recommended assignment;
2. profession cards with current rank and next meaningful unlock;
3. assignment browser with filters by time, difficulty, profession and reward type;
4. active assignments;
5. mastery/specialization map;
6. certifications;
7. career archive/history;
8. payout explanation including marginal repeat factor when applicable.

Required states: loading, empty, locked-by-prerequisite, protection-throttled, review-hold, idempotent replay, rejected, completed-unsettled, settled.

## 15. Recommended data model

### `profession_definitions`
- `profession_code PK`
- `name_key`
- `policy_version`
- `active`

### `job_templates`
- `template_id PK`
- `profession_code FK`
- `base_reward_wld`
- `base_mastery_xp`
- `difficulty_policy_json`
- `verification_type`
- `marginal_reward_policy_json`
- `active_from/to`

### `job_assignment_instances`
- `assignment_instance_id PK`
- `user_id`
- `template_id`
- `policy_version`
- `state`
- `accepted_at/submitted_at/verified_at/settled_at`
- `verification_payload_hash`
- `quality_score`
- `idempotency_key UNIQUE(user_id, idempotency_key)`

### `profession_progress`
- `user_id`
- `profession_code`
- `mastery_xp`
- `prestige_count`
- `active_specialization_json`
- unique `(user_id, profession_code)`

### `profession_certifications`
- `user_id`
- `certification_code`
- `earned_evidence_version`
- `purchased_service_tx_id`
- `earned_at`

### `job_settlements`
- `assignment_instance_id UNIQUE`
- `transaction_id UNIQUE`
- `gross_wld`
- `marginal_factor_bp`
- `net_wld`
- `mastery_xp`
- `settlement_version`

## 16. API contract

P0:

- `GET /api/jobs/catalog`
- `POST /api/jobs/{templateId}/accept`
- `GET /api/jobs/assignments/{id}`
- `POST /api/jobs/assignments/{id}/submit`
- `POST /api/jobs/assignments/{id}/complete`
- `GET /api/professions`
- `GET /api/professions/{code}/progress`
- `POST /api/professions/{code}/certifications/{certCode}/purchase`
- `POST /api/professions/{code}/respecialize`

All value-changing requests require idempotency. Server returns policy version, canonical state and exact WLD/mastery settlement.

Suggested errors:

- `JOB_TEMPLATE_INACTIVE`
- `JOB_PREREQUISITE_NOT_MET`
- `JOB_STATE_CONFLICT`
- `JOB_VERIFICATION_FAILED`
- `JOB_REVIEW_HOLD`
- `JOB_IDEMPOTENCY_MISMATCH`
- `CERTIFICATION_EVIDENCE_MISSING`
- `INSUFFICIENT_WLD`
- `PROTECTION_THROTTLE_ACTIVE`

## 17. Ledger transaction types

Recommended explicit types:

- `FAUCET_JOB_REWARD`
- `SINK_PROFESSION_CERTIFICATION`
- `SINK_PROFESSION_RESPEC`
- `SINK_PROFESSION_COSMETIC`
- `SINK_PROFESSION_ARCHIVE`
- `SINK_PROFESSION_PRESTIGE_SPACE`
- `TRANSFER_JOB_COMMISSION` (future player contract principal)
- `SINK_JOB_COMMISSION_FEE` (future player contract fee)

## 18. Analytics and economy dashboard

Events:

- `job_viewed`
- `job_accepted`
- `job_submitted`
- `job_verified`
- `job_settled`
- `job_rejected`
- `job_review_hold`
- `profession_level_reached`
- `specialization_selected`
- `certification_purchased`
- `profession_sink_purchased`

Dashboard metrics:

- gross job WLD issuance;
- net job issuance after explicit sinks;
- issuance per active user / cohort;
- median/P90/P99 earned WLD per active day;
- template concentration and profession diversity;
- repeat-factor distribution;
- verification failure/hold rate;
- false-positive appeal rate where applicable;
- profession sink WLD by category;
- sink-to-job-faucet ratio;
- P50/P90/P95/P99 liquid balance by profession cohort;
- top 1%/10% wealth concentration;
- share of high-wealth users buying prestige/archive sinks.

Do not optimize for maximum task count. Primary quality metrics are diversified participation, verified completion, retention without coercion, sink coverage, and economy stability.

## 19. Admin configuration

Admin can version, preview and schedule:

- template activation;
- base reward and XP;
- difficulty/quality factors;
- marginal reward curve;
- verification mode;
- certification requirements and prices;
- sink catalog availability;
- season tags;
- protection thresholds.

Risky economy changes require impact preview, reason, audit record and step-up auth according to the Living Project Plan. Historical settlements are never rewritten when policy changes.

## 20. Definition of done

P0 is complete only when:

1. assignments are stateful and server-authoritative;
2. duplicate completion cannot double-pay;
3. ordinary play count has no arbitrary hard cap;
4. marginal-repeat policy is visible and server-calculated;
5. mastery persists and does not reset with seasons;
6. at least five profession families have complete assignment/prerequisite/reward configs;
7. certification and at least four profession sink classes are implemented through the ledger;
8. faucet/sink/transfer accounting reconciles;
9. review-hold/protection paths are auditable;
10. analytics expose issuance, sink coverage and concentration;
11. Korean UX/policy copy matches canonical English behavior;
12. exact-SHA isolated Test validation passes before Production runtime release.

## 21. Rollout

- **P0:** assignment state machine, 5+ profession families, mastery, certification, basic sinks, analytics.
- **P1:** specialization trees, profession workspaces, Business/Crafting/Club integration.
- **P2:** player commission contracts with escrow/transfer accounting, prestige halls, broader city endowments.

This document is planning-only. Runtime implementation must use a separate development branch, forward-only migrations, CI and exact-SHA isolated Test verification before Production.