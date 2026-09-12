# Woldeok Moneyverse — Player Marketplace & Crafting Specification

> Version: v2026.09.12.16
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`, `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`
> Korean counterpart: [PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md](PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md)

## 0. Purpose

This specification turns the existing marketplace/crafting sink ideas into a buildable player-economy system. The system must create useful WLD sinks and player-to-player value exchange without introducing arbitrary participation caps, pay-to-win power, hidden-probability monetization, or unsafe financial framing.

The core loop is:

`earn/collect -> keep/use -> craft/customize -> list -> buy/sell -> display/collect -> craft again`

The marketplace is not a securities exchange and does not support cash redemption. WLD and items remain service-internal virtual records.

## 1. Product principles

1. **Unlimited by default.** No fixed listing-count, purchase-count, crafting-count, or lifetime-trade cap exists by default. Security throttles and integrity holds are separate protection controls.
2. **Correct economic classification.** Buyer-to-seller payment is `TRANSFER`; only listing, sale, appraisal, crafting, restoration and other system fees are `HARD_SINK`.
3. **Server authority.** Item ownership, tradability, price quote, fees, escrow state, settlement, recipe inputs and outputs are validated on the backend.
4. **Atomic outcomes.** A buyer cannot be charged without receiving the item, and a seller cannot receive proceeds while retaining the sold item.
5. **Idempotent writes.** Every state-changing request carries an idempotency key or deterministic operation key.
6. **No hidden power market.** Competitive or economically dominant power items are not tradable merely because a marketplace exists.
7. **No hidden-probability paid loop.** Any randomized crafting must disclose probabilities and cannot create a real-money-paid chance loop without separate product/legal review.
8. **No fake scarcity.** A listing may be unique because a user actually listed one item; system catalogs cannot claim scarcity unless inventory is genuinely finite.
9. **Transparent fees.** The UI displays seller proceeds and buyer total before confirmation.
10. **Learning before speculation.** Market education, transaction history, fee explanation, scam warnings and risk guidance remain free.

## 2. Item ownership and tradability model

Every item definition and item instance must resolve to an explicit transfer policy.

### 2.1 Canonical transfer policies

| Policy | Meaning | Marketplace | Direct transfer | Example |
|---|---|---|---|---|
| `ACCOUNT_BOUND` | permanently bound to one account | no | no | season rank trophy |
| `SYSTEM_ONLY` | exists only as a system entitlement | no | no | account theme entitlement |
| `TRADABLE_SINGLE` | unique item instance | yes | optional future | signed collectible |
| `TRADABLE_STACK` | fungible stackable item | yes | optional future | common crafting material |
| `TRADABLE_AFTER_COOLDOWN` | transfer allowed after integrity delay | after time | after time | newly crafted prestige cosmetic |
| `SEASON_RESTRICTED` | season rules decide | config | config | current-season collectible |
| `CLUB_BOUND` | belongs to club inventory | club-only flow | no personal trade | club banner trophy |

Transfer policy is server data, never inferred from frontend category names.

### 2.2 Item instance fields

Recommended minimum item-instance contract:

```text
item_instance_id
catalog_item_id
owner_type            USER | CLUB | SYSTEM_ESCROW
owner_id
quantity
transfer_policy
bound_reason nullable
crafted_by_user_id nullable
crafted_at nullable
season_id nullable
provenance_version
condition_state
appearance_variant
custom_label nullable
tradable_after nullable
metadata_version
created_at
updated_at
```

For unique items, provenance history must survive transfers. Do not overwrite the creator/acquisition lineage when ownership changes.

## 3. Marketplace scope

### 3.1 P0 market type

P0 uses **fixed-price player listings** only.

Included:

- browse/search/filter/sort;
- item detail and provenance summary;
- create listing;
- cancel listing;
- buy listing;
- seller proceeds history;
- buyer purchase history;
- price-history summary;
- fee preview;
- moderation/integrity hold states.

Excluded from P0:

- leverage, credit, margin or shorting;
- real-money settlement;
- item lending;
- blind loot auctions;
- Dutch/English auctions;
- off-platform payment links;
- direct user-defined contract scripting.

P1 may add buy orders only after fixed-price settlement and anti-manipulation telemetry are stable.

### 3.2 No arbitrary listing cap

There is no ordinary per-account maximum active listing count by default. Scale is controlled with:

- meaningful listing fees;
- server request-rate protection;
- pagination/indexing;
- duplicate-spam detection;
- abnormal automation detection;
- payload and batch size protections.

Any future active-listing safety ceiling must be categorized as infrastructure protection and remain distinct from gameplay progression.

## 4. Listing lifecycle

Required states:

`DRAFT -> ACTIVE -> RESERVED -> SETTLEMENT_PENDING -> SETTLED`

Alternative terminal paths:

- `ACTIVE -> CANCELLED`
- `ACTIVE -> EXPIRED`
- `ACTIVE -> BLOCKED`
- `RESERVED -> ACTIVE` when reservation expires without payment settlement
- `SETTLEMENT_PENDING -> REVIEW_REQUIRED` on integrity failure
- `REVIEW_REQUIRED -> SETTLED | CANCELLED`

### 4.1 State rules

- `DRAFT`: client/server preview only; no item moved yet.
- `ACTIVE`: item/quantity is escrowed and publicly searchable.
- `RESERVED`: one purchase attempt temporarily owns settlement priority.
- `SETTLEMENT_PENDING`: buyer funds and listing state are locked inside the settlement transaction.
- `SETTLED`: ownership transferred, seller proceeds credited, fees burned, immutable settlement record written.
- `CANCELLED`: unsold escrow returned to seller.
- `EXPIRED`: unsold escrow returned automatically.
- `BLOCKED`: listing hidden due to policy/integrity review; ownership remains safely tracked.

A reservation timeout is system-concurrency protection, not a gameplay limit. Planning seed: 30 seconds, configurable.

## 5. Listing and sale economics

Existing sink-catalog seeds remain the starting point.

### 5.1 Listing fee

Planning formula:

`listing_fee = max(25 WLD, ceil(list_price * 0.001))`

Classification: `HARD_SINK`
Ledger type: `SINK_LISTING_FEE`

Purpose:

- low-friction currency sink;
- deters meaningless spam listings without capping legitimate sellers;
- scales with high-value listings.

The fee is quoted before listing and is not refunded for ordinary seller cancellation. A system fault that prevents the listing from ever becoming active must reverse it idempotently.

### 5.2 Sale fee

Planning seed:

`sale_fee = ceil(sale_price * 0.01)`

Classification: `HARD_SINK`
Ledger type: `SINK_MARKETPLACE_FEE`

Seller receives:

`seller_net = sale_price - sale_fee`

The buyer-to-seller principal is recorded as `TRANSFER_MARKETPLACE_PAYMENT` and must never be counted as burned WLD.

### 5.3 Optional appraisal service

High-value collectibles may use an optional system appraisal:

`appraisal_fee = max(250 WLD, ceil(reference_value * 0.0025))`

Classification: `HARD_SINK`
Value: provenance/price-range report only; no guaranteed resale value.

Appraisal is never required to sell an ordinary item unless a future fraud policy documents a concrete integrity reason.

## 6. Price discovery without price controls

The product should not impose arbitrary price ceilings/floors on normal tradable collectibles.

Provide information instead:

- last 20 settled sales where privacy/safety allows;
- rolling median;
- P25/P75 price band;
- 7-day and 30-day settled volume;
- current active-listing count;
- condition/variant filters;
- clear warning when a listing is far outside recent settled ranges.

Reference values are advisory. They do not guarantee value or block a user from choosing a different price unless an integrity hold is triggered by documented abuse policy.

## 7. Atomic marketplace settlement

A successful purchase is one logical transaction.

Recommended transaction order:

1. authenticate buyer;
2. validate listing is `ACTIVE` or valid buyer reservation;
3. confirm buyer != seller;
4. lock listing row/version;
5. revalidate escrow ownership and quantity;
6. calculate current fee policy from listing's locked fee/config version;
7. validate buyer available WLD;
8. debit buyer principal;
9. burn sale fee from settlement amount or seller proceeds according to policy;
10. credit seller net proceeds;
11. transfer item from escrow to buyer inventory;
12. mark listing `SETTLED`;
13. write marketplace settlement, ledger references and item provenance event;
14. emit analytics/outbox event;
15. commit once.

Any failure before commit rolls back all economic mutations.

### 7.1 Idempotency

Recommended operation keys:

- create listing: `market_list:{seller_id}:{client_operation_uuid}`
- cancel listing: `market_cancel:{listing_id}:{client_operation_uuid}`
- buy listing: `market_buy:{buyer_id}:{listing_id}:{client_operation_uuid}`
- settlement: deterministic `market_settle:{listing_id}:{settlement_version}`

Same key + same payload returns original result. Same key + different payload returns conflict.

## 8. Escrow design

When a listing becomes `ACTIVE`, the tradable item/quantity moves to logical system escrow.

Escrow rules:

- seller cannot use, craft, destroy, relist or transfer escrowed quantity;
- escrow never becomes a system-owned economic asset; it is custodial state for settlement;
- cancel/expire returns the exact instance/quantity and provenance;
- unique-item custom metadata is immutable while escrowed;
- maintenance jobs reconcile orphaned escrow rows against listings;
- reconciliation never invents replacement inventory silently.

Recommended logical owner:

`owner_type = SYSTEM_ESCROW`, `owner_id = listing_id`

## 9. Crafting system

Crafting is primarily a `CONVERTER` plus explicit WLD hard-sink service fee.

### 9.1 P0 recipe categories

1. **Recolor** — change cosmetic variant; output remains same power/value class.
2. **Restoration** — improve visual condition state of collectible.
3. **Engraving** — add/change user-visible inscription metadata.
4. **Duplicate fusion** — consume duplicate cosmetics/collectibles for a deterministic upgraded display variant.
5. **Furniture assembly** — consume materials + fee to create housing decor.
6. **Archive reconstruction** — consume archive fragments + higher service fee to create an older cosmetic variant under published rotation policy.
7. **Business decor fabrication** — creates signs, displays, office fixtures and branch decorations.

### 9.2 Recipe contract

```yaml
recipe_code: CRAFT_CITY_DISPLAY_01
version: 1
enabled: true
season_id: null
inputs:
  - item_code: MAT_CITY_METAL
    quantity: 4
  - item_code: MAT_CITY_GLASS
    quantity: 2
wld_fee: 1200
output:
  item_code: DEC_CITY_DISPLAY_01
  quantity: 1
transfer_policy: TRADABLE_SINGLE
randomized: false
cooldown_seconds: null
max_per_user: null
starts_at: null
ends_at: null
```

`max_per_user` and `cooldown_seconds` default `null`. If present for integrity or true content reasons, the reason must be documented.

### 9.3 Craft transaction

One craft operation atomically:

- verifies recipe/config version;
- verifies input ownership and quantities;
- validates item instances are not escrowed/locked;
- burns WLD service fee;
- consumes material quantities;
- creates output with provenance;
- records recipe/version and creator;
- emits analytics/outbox event.

If output creation fails, WLD and inputs roll back.

### 9.4 Deterministic-first policy

P0 recipes are deterministic. Randomized recipes may be considered later only when:

- odds are explicitly shown before confirmation;
- no hidden pity/reset behavior exists;
- expected material/WLD cost is documented;
- failure outputs are useful and not pure loss where practical;
- real-money-paid chances remain out of scope without separate review.

## 10. Materials and duplicate economy

Duplicate ownership is allowed where the item definition supports meaningful use.

Material sources may include:

- job/business content rewards;
- dismantling owned eligible duplicates;
- season/event objectives;
- city-project participation cosmetics converted only when explicitly allowed;
- system shop material packs purchased with WLD where non-P2W;
- player marketplace transfers for tradable materials.

### 10.1 Dismantling

Dismantling converts an item into materials and may charge a small service fee.

Example seed:

`dismantle_fee = max(50 WLD, floor(reference_material_value * 0.01))`

Dismantling is irreversible after confirmation. The UI must show exact outputs for deterministic dismantles.

## 11. Crafting sink catalog expansion

Initial additional sink seeds:

| Code | Service | Class | Price seed | Repeatability | User value | Ledger type |
|---|---|---|---:|---|---|---|
| `CRAFT-DISMANTLE` | Dismantle service | HARD_SINK + CONVERTER | 50+ WLD | unlimited | converts duplicate to materials | `SINK_CRAFT_FEE` |
| `CRAFT-REPAIR-PRESTIGE` | Prestige collectible restoration | HARD_SINK | 5,000 WLD | per damaged/variant state | museum quality | `SINK_COLLECTIBLE_RESTORATION` |
| `CRAFT-ENGRAVE-PRESTIGE` | Premium engraving | HARD_SINK | 3,000 WLD | unlimited | provenance display | `SINK_ITEM_ENGRAVING` |
| `CRAFT-FURN-SET` | Furniture set assembly fee | HARD_SINK | 2,500 WLD | unlimited | housing expression | `SINK_CRAFT_FEE` |
| `CRAFT-BIZ-SIGN` | Custom business display fabrication | HARD_SINK | 4,000 WLD | unlimited | business identity | `SINK_CRAFT_FEE` |
| `CRAFT-ARCHIVE-RESTORE` | Archive cosmetic reconstruction | HARD_SINK | 7,500 WLD | recipe availability | legacy collection | `SINK_CRAFT_FEE` |
| `MARKET-APPRAISE` | Provenance appraisal report | HARD_SINK | formula | unlimited | information/archive | `SINK_MARKETPLACE_SERVICE` |
| `MARKET-FEATURE` | Featured listing visual placement | HARD_SINK | 500 WLD / placement window | repeat | discovery only | `SINK_MARKETPLACE_SERVICE` |

Featured placement changes discovery, not settlement priority, price, or item quality.

## 12. Season integration

### 12.1 Current-season items

Each seasonal item declares one of:

- permanently account-bound;
- tradable during season;
- tradable only after season archive;
- tradable after a configured integrity delay;
- convertible to archive materials but not tradable.

Season rank rewards default `ACCOUNT_BOUND` to protect prestige integrity.

### 12.2 Season crafting

Each season should introduce:

- 5–10 deterministic themed recipes;
- at least one housing/business decor recipe family;
- one duplicate-conversion path;
- one archive reconstruction path revealed before season close;
- one WLD crafting sink family that does not grant competitive power.

### 12.3 End-of-season continuity

At D-14/D-7/D-3/D-1, the UI must show:

- recipes that expire;
- recipes that move to archive rotation;
- which items become tradable after archive;
- which materials persist;
- which season currencies cannot enter marketplace settlement;
- next-season crafting teaser.

Season Token and League WLD are never marketplace payment currencies.

## 13. Personal spaces and city-project integration

Crafted furniture and collectibles can be displayed in Personal Spaces if the user owns the item and the space layout references a valid entitlement.

City-project integrations:

- project milestones may unlock recipes globally;
- contributions may grant account-bound recipe badges, not tradable economic power;
- city-project WLD donations remain `HARD_SINK` and never become seller proceeds;
- community-project crafted monuments are account/club display objects according to policy.

## 14. Search, discovery and UX

Marketplace navigation:

1. **Discover** — recent, collection gaps, seasonal/archive categories.
2. **Browse** — category, tag, condition, season, price, seller status filters.
3. **Item detail** — item definition, instance provenance, settled-price context, active listings.
4. **Sell** — select item/quantity, enter price, preview fees/net proceeds, confirm escrow.
5. **My listings** — active/reserved/sold/expired/cancelled/review states.
6. **History** — purchases, sales, fees and item provenance changes.
7. **Craft** — recipes, owned inputs, missing inputs, exact fee/output preview.

Required states on all mutation screens:

- loading;
- stale quote/version;
- insufficient WLD;
- item no longer available;
- listing already sold;
- item locked/escrowed;
- policy restricted;
- review required;
- idempotent replay success;
- recoverable server error.

Do not use urgency text like “buy now or lose everything.” Real listing expiry may be shown factually.

## 15. Anti-abuse and integrity

### 15.1 Blocked patterns

- self-purchase;
- direct self-trade through known linked accounts when confidence meets review policy;
- circular trading intended to fabricate volume/value;
- rapid reciprocal trades with no meaningful ownership duration;
- listing price manipulation designed to poison reference-price analytics;
- duplicate settlement attempts;
- item duplication through race conditions;
- escrow bypass;
- seller cancelling an already reserved/settling listing;
- bot listing floods;
- laundering suspicious rewards through item transfers.

### 15.2 Risk signals

Store signals separately from automatic punishment:

- repeated counterparties;
- account/linkage risk cluster;
- price deviation from settled distribution;
- unusual cancel/relist frequency;
- high circular-flow score;
- abnormal settlement velocity;
- repeated same-item round trips;
- recent account + high-value trade combination;
- administrator/manual ownership adjustment involvement.

A risk signal may place listing/proceeds into review but must not silently confiscate unrelated permanent assets.

### 15.3 Proceeds hold

A temporary proceeds hold is allowed only as an integrity protection, not a normal gameplay cap. The UI must show the review state. Release/cancel decisions are auditable.

## 16. Recommended database model

### 16.1 Marketplace tables

`marketplace_listings`

- `id`
- `seller_user_id`
- `item_instance_id` nullable for stack listing
- `catalog_item_id`
- `quantity`
- `unit_price_wld`
- `listing_fee_wld`
- `sale_fee_bps`
- `state`
- `config_version`
- `reserved_by_user_id` nullable
- `reserved_until` nullable
- `created_at`, `expires_at`, `settled_at`, `updated_at`
- `version` for optimistic concurrency

`marketplace_settlements`

- `id`
- `listing_id`
- `buyer_user_id`
- `seller_user_id`
- `gross_wld`
- `sale_fee_wld`
- `seller_net_wld`
- `buyer_ledger_tx_id`
- `seller_ledger_tx_id`
- `fee_ledger_tx_id`
- `item_transfer_event_id`
- `idempotency_key`
- `settlement_version`
- `created_at`

`marketplace_price_history`

Materialized/read model derived from settled trades; never the source of ownership truth.

`marketplace_integrity_cases`

Tracks review state, evidence references, disposition and operator audit metadata.

### 16.2 Crafting tables

`crafting_recipes`

- recipe code/version;
- availability window;
- season scope;
- WLD fee;
- transfer policy of output;
- deterministic/randomized metadata;
- enabled/config version.

`crafting_recipe_inputs`

- recipe/version;
- catalog item/material code;
- quantity.

`crafting_recipe_outputs`

- recipe/version;
- output item code;
- quantity/variant;
- disclosed probability when randomized.

`crafting_operations`

- user;
- recipe/version;
- WLD fee ledger tx;
- consumed item references;
- output item references;
- idempotency key;
- created timestamp;
- result state.

Applied database migrations remain immutable; runtime implementation must add forward-only migrations.

## 17. API contract

Recommended endpoints:

- `GET /api/marketplace/listings`
- `GET /api/marketplace/listings/:id`
- `POST /api/marketplace/listings`
- `POST /api/marketplace/listings/:id/cancel`
- `POST /api/marketplace/listings/:id/buy`
- `GET /api/marketplace/me/listings`
- `GET /api/marketplace/me/history`
- `GET /api/marketplace/items/:catalogItemId/price-history`
- `GET /api/crafting/recipes`
- `GET /api/crafting/recipes/:code`
- `POST /api/crafting/recipes/:code/craft`
- `POST /api/crafting/items/:itemInstanceId/dismantle`

Mutation responses return authoritative post-commit balances/inventory state where practical; clients must not synthesize balances by arithmetic.

## 18. Admin console

Administrator tools need:

- search listing/settlement by user, item, listing, ledger tx or idempotency key;
- freeze/unfreeze listing with reason;
- inspect escrow ownership;
- inspect price-history outliers;
- review integrity cases;
- configure fee bps/floors with versioning;
- enable/disable recipes and availability windows;
- preview recipe economy impact;
- reconcile orphaned escrow/settlement mismatches in read-only mode before any repair;
- execute audited repair workflows only through approved server functions;
- export marketplace burn vs transfer metrics.

Admins must not directly edit protected ledger rows or silently create ownership.

## 19. Economy dashboard

Marketplace/crafting dashboard metrics:

- marketplace GMV (`TRANSFER` principal);
- listing-fee burn;
- sale-fee burn;
- appraisal/featured-service burn;
- crafting-fee burn;
- material destruction by item family;
- craft output count/value proxy;
- active listings;
- unique sellers/buyers;
- sell-through rate;
- median time to sale;
- median/P90 listing price by item family;
- 7d/30d price index;
- top 1% seller GMV share;
- top 10% seller GMV share;
- repeat-counterparty share;
- suspected wash/circular volume excluded from clean price index;
- cancellation/relist rate;
- escrow reconciliation errors;
- settlement idempotent replay count;
- crafting adoption by wealth cohort;
- sink contribution by starter/established/advanced/high-wealth/prestige cohorts.

Do not treat gross marketplace volume as currency sink.

## 20. Analytics events

Minimum events:

- `marketplace_opened`
- `marketplace_search_performed`
- `marketplace_listing_quote_viewed`
- `marketplace_listing_created`
- `marketplace_listing_cancelled`
- `marketplace_listing_expired`
- `marketplace_purchase_started`
- `marketplace_purchase_settled`
- `marketplace_purchase_conflict`
- `marketplace_integrity_hold`
- `craft_recipe_viewed`
- `craft_started`
- `craft_completed`
- `craft_failed`
- `item_dismantled`
- `craft_input_missing`

Events must use IDs/categories and economic amounts, not unnecessary personal content such as free-text engraving text.

## 21. Configuration model

Example server config:

```yaml
marketplace:
  enabled: true
  listing_count_limit: null
  listing_fee:
    fixed_floor_wld: 25
    bps: 10
  sale_fee_bps: 100
  reservation_seconds: 30
  default_expiry_days: 7
  price_warning_deviation_multiplier: 5
  featured_listing_fee_wld: 500
  integrity:
    self_trade_block: true
    circular_trade_review_enabled: true
crafting:
  enabled: true
  craft_count_limit: null
  deterministic_first: true
  require_idempotency_key: true
```

`listing_count_limit` and `craft_count_limit` are `null` by default. Request-rate controls belong to infrastructure/security config, not progression config.

## 22. Rollout phases

### P0 — deterministic safe economy

- tradability flags;
- fixed-price listings;
- escrow;
- atomic settlement;
- listing + sale hard sinks;
- deterministic recipes;
- dismantling;
- history/audit;
- basic integrity checks;
- admin read/search/freeze tools;
- economy metrics.

### P1 — richer discovery and seasonal economy

- price-history UI;
- featured visual placement;
- provenance appraisal;
- season/archive recipes;
- personal-space crafted items;
- improved integrity graph signals;
- marketplace notifications/watchlists.

### P2 — advanced exchange after evidence

Only after P0/P1 telemetry proves safe:

- buy orders;
- deeper collection-market analytics;
- club inventory exchange under strict policy;
- advanced crafting commissions.

No P2 feature bypasses the atomic ledger/escrow model.

## 23. Validation and Definition of Done

A runtime implementation is not complete until all of the following pass:

- no arbitrary user-facing listing/crafting hard cap was introduced;
- tradability is server-authoritative;
- buyer/seller/self-trade authorization tests pass;
- listing escrow prevents double-use;
- simultaneous buyers produce exactly one settlement;
- duplicate buy/list/cancel requests are idempotent;
- buyer debit, seller credit, fee burn and ownership transfer reconcile exactly;
- failed transactions roll back all dependent mutations;
- fee classifications report `HARD_SINK` separately from `TRANSFER`;
- crafting input consumption/output creation is atomic;
- deterministic recipes return exact documented outputs;
- randomized crafting, if later enabled, exposes odds and passes separate review;
- abuse signals do not silently confiscate unrelated assets;
- database migration parity passes on real PostgreSQL;
- English/Korean documentation remains aligned;
- exact candidate SHA is deployed to isolated Test;
- Test verifies backend startup, marketplace API health, concurrency, idempotency, ledger reconciliation and representative user flows;
- only the exact verified revision may be promoted to Production.

## 24. Research basis

This design intentionally follows several current implementation lessons rather than copying any one product:

- Microsoft PlayFab Economy V2 documents catalog/inventory separation, inventory transfers, atomic multi-operation inventory batches, transaction history and idempotency for retry-safe writes.
- Current PlayFab Economy V2 guidance treats crafting as inventory conversion built from explicit add/subtract/transfer/purchase operations rather than hidden client-side state.
- EVE Online's 2026 Monthly Economic Reports continue to separate faucets and sinks in economic analysis, reinforcing the need to keep Moneyverse marketplace transfer volume separate from actual currency destruction.

External service limits are references for reliability patterns only. Moneyverse gameplay limits remain governed by `DEFAULT_LIMIT_POLICY.md`.