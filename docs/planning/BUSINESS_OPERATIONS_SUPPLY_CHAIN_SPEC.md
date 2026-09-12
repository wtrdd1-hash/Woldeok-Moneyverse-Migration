# Woldeok Moneyverse — Business Operations & Supply-Chain Specification

> Version: v2026.09.12.25
> Status: Implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`
> Korean counterpart: [BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.ko.md](BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.ko.md)

## 0. Purpose

The current business feature is a long-horizon economy asset, but the product needs a richer operating loop than fixed purchase cost + daily revenue + operating cost. This specification turns businesses into an active supply-chain system that creates decisions, repeatable sinks, collection value and seasonal content without becoming a risk-free compounding instrument.

Core loop:

`choose business -> procure inputs -> store inventory -> operate -> satisfy demand -> settle -> reinvest/customize -> expand branch/network -> review performance`

Business systems must remain service-internal virtual gameplay. They are not real companies, deposits, securities, franchises, employment, investment contracts or guaranteed-income products.

## 1. Product principles

1. **Unlimited by default.** No arbitrary daily operating-count, branch-count, inventory-history, procurement-count or business-ownership cap is introduced only for convenience. Numeric limit fields support `null = unlimited` wherever practical.
2. **No guaranteed yield.** Revenue depends on demand, stock availability, quality, service state, operating choices and costs.
3. **Sinks are explicit.** Every monetary flow is classified as `HARD_SINK`, `TRANSFER`, `CONVERTER`, `HOLD` or `FAUCET`.
4. **Permanent growth does not equal exponential money power.** Expansion mainly adds capacity, variety, prestige, analytics and operational options. Marginal earnings must not compound without counter-costs.
5. **Configuration is server-authoritative.** Prices, demand coefficients, costs, recipes, operating windows and sink rates are versioned policy/config, not client constants.
6. **Every value mutation is ledgered and idempotent.** Client retries cannot double-buy, double-settle or duplicate inventory.
7. **Absence is recoverable.** A returning player should not discover that weeks of offline maintenance automatically caused catastrophic debt.

## 2. Business archetypes

Initial canonical archetypes:

| Code | Business | Primary loop | Typical inputs | Primary outputs | Planning entry cost |
|---|---|---|---|---|---:|
| `KIOSK` | Neighborhood Kiosk | retail | packaged goods | consumer sales | 25,000 WLD |
| `DELIVERY_OFFICE` | Delivery Office | logistics | fuel/service capacity | shipment fulfillment | 50,000 WLD |
| `SMALL_STUDIO` | Creative Studio | services | materials/time slots | design/media orders | 75,000 WLD |
| `REPAIR_SHOP` | Repair Shop | services/crafting | parts | repair contracts | 90,000 WLD |
| `CONVENIENCE` | 24h Convenience Store | retail | food/daily goods | retail demand | 300,000 WLD |
| `ORGANIC_FARM` | Smart Organic Farm | production | seeds/nutrients | produce/materials | 500,000 WLD |
| `LOGISTICS` | Smart Logistics Company | logistics | fleet capacity | route service | 1,200,000 WLD |
| `WORKSHOP` | Manufacturing Workshop | production | raw materials | components | 600,000 WLD |
| `WAREHOUSE` | Distribution Warehouse | storage/logistics | storage slots | fulfillment capacity | 750,000 WLD |

Entry prices are tuning seeds, not immutable guarantees. Existing implementation values remain historical policy until a versioned migration/policy change is separately approved.

## 3. Business lifecycle/state machine

Required states:

`PLANNED -> REGISTERED -> ACTIVE -> PAUSED -> ACTIVE`

Optional operational branches:

- `ACTIVE -> DEGRADED -> ACTIVE`
- `ACTIVE -> RENOVATING -> ACTIVE`
- `ACTIVE -> TRANSFER_PENDING -> ACTIVE`
- `ACTIVE -> CLOSED`
- `PAUSED -> CLOSED`

`CLOSED` is terminal for the business instance but historical ownership, settlement and audit data remain immutable/readable.

State transitions are server-authoritative, timestamped and audit logged.

## 4. Procurement and inventory

### 4.1 Inventory model

A business can hold stackable business inventory by SKU/material. Inventory is not WLD and must not be counted as money supply.

Recommended records:

- quantity on hand;
- reserved quantity;
- average or batch acquisition cost for analytics;
- provenance/source transaction;
- expiry/quality when a content type explicitly needs it;
- storage location/branch.

### 4.2 Procurement modes

P0:

- **System supplier purchase:** goods bought from an NPC/system supplier. WLD paid to the system is a `HARD_SINK` unless a treasury-funding policy explicitly records otherwise.
- **Internal production conversion:** raw material + WLD service fee -> output material. Raw materials are `CONVERTER`; service fee is `HARD_SINK`.

P1:

- **Player-market procurement:** WLD paid to another player is `TRANSFER`; listing/settlement fees remain `HARD_SINK`.
- **Club/project procurement:** only if ownership and abuse rules are defined; never silently pool withdrawable member WLD.

### 4.3 No arbitrary procurement cap

Normal procurement count and amount are unlimited by default. Protections may block or throttle only for:

- duplicate idempotency requests;
- insufficient balance/storage;
- true finite stock;
- detected bot/abuse patterns;
- system backpressure;
- market-integrity holds.

These protections must expose reason codes and must not be mislabeled as economy balancing.

## 5. Storage and capacity

Base storage differs by archetype. Capacity expansion is a recurring sink rather than a permanent global hardcap.

Planning curve:

`storage_upgrade_cost(n) = base_cost * 1.40^(n-1)`

Example base costs:

| Archetype | Base upgrade cost |
|---|---:|
| Kiosk | 6,000 WLD |
| Delivery Office | 10,000 WLD |
| Studio | 12,000 WLD |
| Convenience Store | 20,000 WLD |
| Farm | 25,000 WLD |
| Workshop | 30,000 WLD |
| Logistics Company | 50,000 WLD |

Expansion count has no arbitrary product maximum. An actual technical ceiling may exist only when storage architecture has a proven safe boundary; it is a system-safety limit and must be separately documented.

Ledger type: `SINK_BUSINESS_STORAGE_UPGRADE`.

## 6. Demand model

Business demand is a server-computed index, not a client-supplied number.

Planning formula:

`effective_demand = base_demand * city_factor * season_factor * category_factor * service_factor * bounded_event_factor`

Recommended normalized components:

- `base_demand`: archetype/config baseline;
- `city_factor`: 0.75–1.25 planning range;
- `season_factor`: 0.80–1.20;
- `category_factor`: reflects aggregate category supply/consumption;
- `service_factor`: 0.50–1.10 based on fulfillment/quality;
- `bounded_event_factor`: policy-defined fictional events only.

The ranges are tuning seeds, not user activity caps.

A user's spending, club status or paid cosmetics must not secretly improve demand.

## 7. Operating sessions

Businesses operate through sessions/batches rather than a client timer that directly creates money.

Example flow:

1. user selects an operating plan;
2. server validates business state and available inputs;
3. required inventory is reserved;
4. server creates an `operation_run` with config version and expected completion window;
5. completion revalidates state and server time;
6. consumed inputs are finalized;
7. gross revenue and costs are calculated;
8. ledger settlement posts exactly once;
9. analytics and audit events are emitted.

Normal operation-run count is unlimited. Repeating the same fastest plan may have lower marginal demand or increasing operating friction; the system should balance output through economics rather than a daily click cap.

## 8. Revenue and settlement

Planning settlement:

`gross_revenue = fulfilled_units * effective_unit_price`

`net_result = gross_revenue - input_cost_basis - service_cost - maintenance_cost - logistics_cost - platform_fee`

Where appropriate, `input_cost_basis` is analytical rather than an additional sink because the original procurement spend was already classified when paid.

### 8.1 Faucet classification

If revenue is paid by the system, only the system-funded revenue portion is a `FAUCET`. Do not count gross sales funded by another player as new issuance.

### 8.2 Settlement idempotency

Recommended deterministic key:

`business_settlement:{business_id}:{operation_run_id}:{settlement_version}`

Database uniqueness should prevent a second economic settlement for the same version.

## 9. Business sinks catalog

All values below are planning defaults.

| Code | Sink | Class | Price/curve | Repeat | Player value | P2W? | Ledger type |
|---|---|---|---|---|---|---|---|
| `BUS-REG` | Registration | HARD_SINK | 10,000 WLD + archetype entry price where applicable | per business | ownership access | No | `SINK_BUSINESS_REGISTRATION` |
| `BUS-STOR` | Storage expansion | HARD_SINK | base × 1.40^n | unlimited | capacity | No direct yield guarantee | `SINK_BUSINESS_STORAGE_UPGRADE` |
| `BUS-BRANCH` | New branch | HARD_SINK | 25,000 × 1.45^branch_index × region_factor | unlimited | new operating location | No direct yield guarantee | `SINK_BUSINESS_BRANCH` |
| `BUS-RENO` | Remodel | HARD_SINK | 5,000–150,000 | repeatable | visuals/layout | No | `SINK_BUSINESS_RENOVATION` |
| `BUS-BRAND` | Branding package | HARD_SINK | 2,500–50,000 | repeatable | logo/signage/theme | No | `SINK_BUSINESS_BRANDING` |
| `BUS-AD` | Advertising campaign | HARD_SINK | 5,000 / 15,000 / 40,000 seed tiers | repeatable | temporary discovery/demand opportunity | Must be bounded | `SINK_BUSINESS_ADVERTISING` |
| `BUS-MAINT` | Preventive maintenance | HARD_SINK | config by asset condition | repeatable | avoids degradation | No | `SINK_BUSINESS_MAINTENANCE` |
| `BUS-LOGI` | System logistics service | HARD_SINK | distance × weight × service tier | repeatable | moves inventory | No | `SINK_BUSINESS_LOGISTICS` |
| `BUS-CERT` | Certification/specialization | HARD_SINK | 15,000–250,000 | repeatable paths | identity/content unlock | No cash multiplier | `SINK_BUSINESS_CERTIFICATION` |
| `BUS-ARCH` | Company archive/museum | HARD_SINK | 100,000–750,000+ | repeatable wings | prestige/history | No | `SINK_BUSINESS_ARCHIVE` |
| `BUS-HQ` | Headquarters wing | HARD_SINK | 200,000 × 1.45^n | unlimited authored expansion | prestige/space | No | `SINK_BUSINESS_HEADQUARTERS` |
| `BUS-PROTECT` | Business protection service fee | HARD_SINK | risk/config based | repeatable | bounded recovery path | No positive EV promise | `SINK_BUSINESS_PROTECTION_FEE` |

Advertising may improve discoverability or bounded demand temporarily, but it must never provide a guaranteed positive return or become a simple `pay X -> receive >X` faucet.

## 10. Branch network

A business may open multiple branches. Default maximum branch count is `null`.

Each branch has:

- region;
- storage/inventory;
- operating state;
- service score;
- demand snapshot;
- local costs;
- cosmetic identity;
- settlement history.

Branch costs grow progressively so network expansion is a long-term sink. Branches should introduce management complexity and diversification rather than purely multiplicative passive income.

Recommended branch cost:

`branch_cost = 25,000 * 1.45^existing_branch_count * region_factor`

`region_factor` is transparent/configured by region and never personalized secretly to user wealth.

## 11. Logistics

### 11.1 Shipment lifecycle

`DRAFT -> QUOTED -> RESERVED -> IN_TRANSIT -> DELIVERED`

Failure branches:

- `RESERVED -> CANCELLED`
- `IN_TRANSIT -> DELAYED -> DELIVERED`
- integrity error -> `REVIEW_REQUIRED`

### 11.2 Shipment pricing

Planning formula:

`logistics_fee = base_fee + distance_units * distance_rate + quantity_weight * weight_rate + priority_fee`

System carrier fees are `HARD_SINK`. Player-carrier payment is `TRANSFER`, while platform/insurance/service fees are sinks.

### 11.3 No pay-to-win instant teleport

Paid logistics tiers may change delivery time or presentation but may not create extra inventory or bypass settlement integrity. Season competitive modes may normalize logistics conditions where wealth would otherwise dominate ranking.

## 12. Maintenance and degradation

Maintenance creates a recurring sink without punishing absence excessively.

Suggested condition bands:

- `GOOD`
- `WORN`
- `DEGRADED`
- `SERVICE_REQUIRED`

Condition should worsen primarily through completed operation/use, not raw wall-clock absence.

Returning after a long absence must not automatically create unlimited negative debt. If an inactivity cost exists, it should pause, cap by a published recovery rule, or convert to a recoverable maintenance state rather than silently compound forever.

Maintenance restores condition and is a `HARD_SINK`.

## 13. Advertising and discovery

Campaign examples:

- Local Flyer — 5,000 WLD
- District Campaign — 15,000 WLD
- City Campaign — 40,000 WLD
- Seasonal Brand Event — configurable 75,000+ WLD

Campaign effect is bounded and server-defined, such as increasing discovery probability or an additive demand opportunity. No guaranteed ROI language is allowed.

Analytics must compare advertising spend, incremental fulfilled demand and post-campaign retention without encouraging compulsive spend.

## 14. Contracts and orders

P1 business contracts create goals rather than fixed passive dividends.

Contract fields:

- contract type;
- requested output/service;
- quantity/quality;
- deadline/window;
- reward funding source;
- penalty or forfeiture policy;
- season/event linkage;
- config version.

System-funded contract rewards are faucets and require issuance budgets. Player-funded contracts are transfers and require escrow/HOLD semantics.

Contract attempts are not arbitrarily capped, but duplicate contracts and circular self-funded reward loops are prohibited.

## 15. Specialization and prestige

Businesses can specialize in non-P2W identity/content branches such as:

- sustainable operations;
- premium service;
- logistics excellence;
- artisan production;
- archive/heritage;
- neighborhood community brand.

Certification fees are sinks. Specialization may unlock recipes, visuals, contract categories, analytics and prestige. It must not stack into infinite multiplicative WLD bonuses.

High-wealth prestige examples:

- Corporate History Museum — 750,000 WLD;
- Skyline Headquarters — 1,500,000 WLD+;
- Founder Archive Wing — `250,000 × 1.45^n`;
- City Business Patronage — 250,000+ WLD;
- Landmark Sponsorship — 5,000,000+ WLD.

Prestige gives records, plaques, displays, titles and public historical visibility, not better stock execution or league score.

## 16. Business protection contract

A Business Protection Contract is a fictional game recovery service, not real insurance.

It may cover defined fictional events such as:

- shipment loss simulation;
- equipment incident;
- temporary event disruption.

Required rules:

- fee source and recovery funding source are recorded separately;
- expected value must not be presented as guaranteed profit;
- claims are deterministic from persisted event state;
- duplicate claims are idempotently rejected;
- user-caused intentional loss loops are excluded/flagged;
- coverage cannot apply retroactively after the player knows an event outcome.

## 17. Season integration

### Season 1 — First Capital

Business goals:

- register first starter business;
- complete first procurement;
- fulfill first operation;
- review a profit/loss statement;
- make one optional visual renovation;
- complete one budgeting mission.

Rewards emphasize badge, business sign, desk decoration and season XP rather than large WLD.

### Season 2 — Industrial Expansion

Add:

- `WORKSHOP` and `WAREHOUSE` archetypes;
- production recipes/components;
- multi-branch logistics objectives;
- club cooperative production projects;
- `WDX-MFG` / `WDX-INF` themed fictional events;
- industrial furniture/office collection sinks.

Season business progress that is explicitly seasonal archives/resets; permanent ownership, branches, inventory and normal business history persist unless a specific item is marked seasonal before acquisition.

## 18. Season transition communication

- **D-14:** unfinished seasonal business objectives, next-season business teaser.
- **D-7:** new archetype/recipe/logistics preview.
- **D-3:** seasonal business cosmetics and archive sinks.
- **D-1:** exact cutoff for season-scoped contracts, persistence/reset matrix and unclaimed rewards.

No ordinary permanent business is wiped merely because the season changes.

## 19. Database model

Recommended canonical tables/entities:

### `business_instances`

- `id uuid pk`
- `owner_user_id uuid`
- `business_type_id uuid`
- `status text`
- `region_code text`
- `policy_version bigint`
- `created_at timestamptz`
- `closed_at timestamptz null`

### `business_branches`

- `id uuid pk`
- `business_id uuid`
- `branch_index bigint`
- `region_code text`
- `status text`
- `storage_level bigint`
- `condition_code text`
- `created_at timestamptz`

Unique: `(business_id, branch_index)`.

### `business_inventory_balances`

- `business_branch_id uuid`
- `item_code text`
- `quantity bigint`
- `reserved_quantity bigint`
- `version bigint`

No negative available quantity.

### `business_procurements`

- `id uuid pk`
- `business_branch_id uuid`
- `source_type text`
- `item_code text`
- `quantity bigint`
- `wld_amount bigint/string-safe contract`
- `classification text`
- `idempotency_key text`
- `created_at timestamptz`

Unique owner/request scope for idempotency key.

### `business_operation_runs`

- `id uuid pk`
- `business_branch_id uuid`
- `operation_code text`
- `state text`
- `config_version bigint`
- `started_at timestamptz`
- `eligible_complete_at timestamptz`
- `completed_at timestamptz null`
- `settlement_version bigint null`

### `business_settlements`

- `id uuid pk`
- `operation_run_id uuid`
- `settlement_version bigint`
- `gross_revenue bigint`
- `system_faucet_amount bigint`
- `hard_sink_amount bigint`
- `transfer_amount bigint`
- `net_result bigint`
- `ledger_transaction_id uuid`
- `created_at timestamptz`

Unique: `(operation_run_id, settlement_version)`.

### `business_shipments`

Stores origin, destination, state, quantity summary, quote, classification, reservation, timestamps and integrity status.

### `business_policy_versions`

Stores demand formula parameters, operating costs, sink pricing, logistics rates, maintenance rules and effective interval. Historic settlements always reference the version used.

## 20. API contracts

P0 read:

- `GET /api/businesses`
- `GET /api/businesses/:id`
- `GET /api/businesses/:id/branches`
- `GET /api/businesses/:id/inventory`
- `GET /api/businesses/:id/operations`
- `GET /api/businesses/:id/settlements`

P0 mutations:

- `POST /api/businesses/register`
- `POST /api/businesses/:id/procure`
- `POST /api/businesses/:id/storage/upgrade`
- `POST /api/businesses/:id/operations/start`
- `POST /api/businesses/:id/operations/:runId/complete`
- `POST /api/businesses/:id/maintenance`
- `POST /api/businesses/:id/branding/purchase`
- `POST /api/businesses/:id/branches/open`

P1:

- shipment quote/create/cancel;
- system/player contracts;
- advertising campaigns;
- certification/specialization;
- archive/museum/headquarters expansion.

Every value-changing POST requires authenticated ownership/authorization, server price validation and idempotency.

## 21. Error taxonomy

Stable domain errors should include:

- `BUSINESS_NOT_FOUND`
- `BUSINESS_NOT_OWNED`
- `BUSINESS_STATE_INVALID`
- `BUSINESS_POLICY_VERSION_INVALID`
- `INVENTORY_INSUFFICIENT`
- `INVENTORY_RESERVATION_CONFLICT`
- `STORAGE_INSUFFICIENT`
- `BALANCE_INSUFFICIENT`
- `OPERATION_NOT_READY`
- `OPERATION_ALREADY_SETTLED`
- `IDEMPOTENCY_CONFLICT`
- `TRUE_STOCK_EXHAUSTED`
- `MARKET_INTEGRITY_HOLD`
- `SYSTEM_BACKPRESSURE`

Do not use `DAILY_LIMIT_REACHED` as the normal business-balancing mechanism.

## 22. Admin configuration

Admin configuration must separate content identity from live policy values.

Editable/versioned values:

- entry/registration costs;
- storage/branch curves;
- procurement supplier prices;
- demand factors;
- operation input/output definitions;
- system-funded revenue budgets;
- logistics pricing;
- maintenance condition thresholds/costs;
- advertising packages/effect bounds;
- seasonal availability;
- protection-contract fee/coverage policy.

High-risk monetary config changes require preview, reason, audit record and effective time/version. Historical settlement data is never rewritten.

## 23. Economy dashboard

Required business metrics:

- gross system-funded business issuance;
- business hard-sink total;
- business transfer volume;
- business converter volume;
- net issuance attributable to business system;
- sink by registration/storage/branch/maintenance/logistics/advertising/prestige;
- median/P90/P95/P99 owner liquid WLD;
- business ownership and active-operation cohorts;
- median payback estimate by archetype and cohort;
- operating margin distribution;
- branch count distribution without treating high branch count as abuse by itself;
- inventory turnover;
- stockout rate;
- fulfilled-demand rate;
- advertising spend vs incremental demand;
- top-1%/10% business asset concentration;
- inactive-return recovery rate;
- duplicate/idempotency rejection rate;
- settlement reconciliation error count.

A business economy where faucets dominate sinks for several cohorts is a tuning signal, not justification for an arbitrary play cap.

## 24. Analytics events

Minimum events:

- `business_registered`
- `business_procurement_completed`
- `business_storage_upgraded`
- `business_branch_opened`
- `business_operation_started`
- `business_operation_completed`
- `business_settlement_posted`
- `business_maintenance_purchased`
- `business_ad_campaign_started`
- `business_shipment_created`
- `business_shipment_delivered`
- `business_certification_purchased`
- `business_prestige_sink_purchased`
- `business_return_recovery_started`

Analytics events are not authoritative ledger evidence.

## 25. Abuse/integrity controls

Detect/investigate:

- duplicate completion requests;
- impossible completion timing;
- inventory duplication/reservation races;
- circular player procurement designed only to farm rewards;
- self-funded contract loops;
- repeated linked-account counterparty rings;
- advertising/refund loops;
- price/config mismatch attempts;
- branch/settlement race conditions;
- admin config manipulation without audit evidence.

Abuse signals trigger review/protection. They must not silently rewrite unrelated permanent assets.

## 26. Implementation phases

### P0 — active business core

- business instance/branch model;
- system procurement;
- inventory reservation;
- operation runs;
- atomic settlement;
- storage expansion;
- maintenance;
- business dashboard/read model;
- explicit faucet/sink classifications.

### P1 — supply chain

- logistics/shipment lifecycle;
- advertising;
- certifications;
- system contracts;
- additional production archetypes;
- season integrations.

### P2 — player economy integration

- player-market procurement;
- player-funded escrow contracts;
- club cooperative production;
- richer manufacturing chains;
- business museum/headquarters prestige catalog.

## 27. Definition of done

A business release is not complete until:

1. every WLD movement is classified and reconciled;
2. duplicate mutation retries are proven idempotent;
3. inventory cannot become negative or duplicate under concurrency;
4. historic settlements retain their policy version;
5. no ordinary business loop depends on a client timer alone;
6. no arbitrary daily business-action hardcap is required for economy balance;
7. sink/faucet/transfer dashboard metrics exist;
8. owner and admin UX include loading/empty/error/locked/review states;
9. English-primary docs and Korean parity are updated;
10. runtime implementation, if created, passes separate branch CI and exact-SHA isolated Test validation before Production.

## 28. External design references reviewed

- Microsoft PlayFab Economy V2 separates catalog items from Store-specific price overrides, supporting the same product identity with contextual pricing/config. Moneyverse should likewise separate business service/SKU identity from live policy prices.
- PlayFab Inventory APIs support idempotency for write operations; Moneyverse business purchases, procurement and settlement retries require equivalent exactly-once economic behavior at the application/database boundary.
- EVE Online's August 2026 Monthly Economic Report continues to expose economic activity and price trends as observable economy data. Moneyverse should diagnose business inflation through issuance, sinks, inventory turnover and concentration rather than hiding it behind arbitrary player caps.
- TradingView Paper Trading and historical replay keep learning/simulation distinct from real financial exposure. Moneyverse business/market education should remain explicitly virtual and should not frame virtual outcomes as investment returns.

## 29. Known implementation drift to reconcile separately

Current repository history includes seeded `daily_limit` values in existing work-task migrations and fixed daily-revenue business data. This specification does not rewrite applied migrations. Follow-up implementation work must classify those values under `DEFAULT_LIMIT_POLICY.md`, migrate forward where necessary, and preserve old migration immutability.

This document is planning-only. It does not authorize a direct Production database or runtime change.