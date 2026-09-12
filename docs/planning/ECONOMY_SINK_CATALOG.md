# Woldeok Moneyverse — Economy Sink Catalog

> Version: v2026.09.12.7
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [ECONOMY_SINK_CATALOG.ko.md](ECONOMY_SINK_CATALOG.ko.md)

## 0. Purpose

This document converts the sink strategy into an implementation-ready catalog. It does not impose arbitrary play caps. The default product rule remains **unlimited participation**, while currency pressure is managed through optional, useful, visible and repeatable spending opportunities.

Every economy action must be classified as exactly one primary type:

- `HARD_SINK`: WLD leaves circulating player balances and is not credited to another player-owned balance.
- `TRANSFER`: WLD changes owner but remains in player circulation.
- `CONVERTER`: WLD becomes another non-WLD resource/item; whether this is a true sink depends on whether the destination can be liquidated back into WLD.

Analytics must never report `TRANSFER` volume as currency burned.

## 1. Canonical sink configuration contract

Every configurable sink must support a server-authoritative definition equivalent to:

```yaml
sink_code: SINK_PROFILE_THEME
sink_class: HARD_SINK
currency: WLD
base_price: 750
price_curve_type: FIXED
price_curve_params: {}
repeatable: true
max_per_user: null
max_global: null
starts_at: null
ends_at: null
ledger_tx_type: SINK_PROFILE_CUSTOMIZATION
reward_payload: {}
config_version: 1
enabled: true
```

Rules:

1. `max_per_user` and `max_global` default to `null`, meaning unlimited.
2. A non-null limit requires a documented protection reason: real scarcity, security, abuse prevention, integrity, stability or legal policy.
3. Prices are quoted by the server and returned with `price_version`/`config_version`.
4. A purchase request carries an idempotency key; debit, entitlement and audit record commit atomically.
5. Personalized hidden pricing based on a user's wealth is forbidden. Dynamic prices may use published/global economy or location inputs only.
6. Safety-critical education, account security and required financial-risk information are never paywalled.

## 2. Spending coverage bands

These are analytics/tuning bands, not access restrictions.

| Liquid WLD band | Typical useful spend | Product objective |
|---|---:|---|
| Starter `<10k` | 100–2,000 | frequent low-friction identity/collection choices |
| Established `10k–100k` | 1,000–25,000 | room, business, crafting, club and collection progression |
| Advanced `100k–1m` | 10,000–250,000 | branch/HQ expansion, prestige collections, shared projects |
| High wealth `1m–10m` | 100,000–2m | large spaces, museums, district sponsorship |
| Prestige `>10m` | scalable | landmarks, legacy projects, prestige auctions and patronage |

There should always be at least three attractive non-P2W spending choices in the user's current coverage band.

## 3. P0 launch sink catalog

Planning prices are tuning seeds. Runtime prices belong in versioned server config.

### 3.1 Identity, profile and collection

| Code | Item/service | Class | Initial price | Repeat | Persistence | User value | Ledger type |
|---|---|---|---:|---|---|---|---|
| ID-PAL-01 | Profile palette change | HARD_SINK | 250 | yes | applied until changed | identity | `SINK_PROFILE_CUSTOMIZATION` |
| ID-NAMEPLATE-01 | Nameplate style | HARD_SINK | 750 | catalog variants | permanent unlock | identity | `SINK_PROFILE_CUSTOMIZATION` |
| ID-THEME-01 | Dashboard theme | HARD_SINK | 2,500 | catalog variants | permanent unlock | visual identity | `SINK_PROFILE_CUSTOMIZATION` |
| ID-FRAME-PRESTIGE | Prestige frame | HARD_SINK | 7,500 | variants | permanent unlock | status | `SINK_PROFILE_CUSTOMIZATION` |
| COL-RESTORE-COMMON | Restore common collectible | HARD_SINK | 300 | yes | item state permanent | collection quality | `SINK_COLLECTIBLE_RESTORATION` |
| COL-RESTORE-RARE | Restore rare collectible | HARD_SINK | 2,000 | yes | item state permanent | collection quality | `SINK_COLLECTIBLE_RESTORATION` |
| COL-ENGRAVE | Collection engraving | HARD_SINK | 800 | yes | until re-engraved | personalization | `SINK_ITEM_ENGRAVING` |
| COL-FUSE | Duplicate cosmetic fusion fee | HARD_SINK | 1,200 | yes | new cosmetic result | collection progression | `SINK_CRAFT_FEE` |

No identity item increases job payout, stock execution quality, loan terms or league score.

### 3.2 Housing, rooms and office space

| Code | Item/service | Class | Initial price/curve | Repeat | Persistence | Value | Ledger type |
|---|---|---|---|---|---|---|---|
| HOME-ROOM-BASE | Starter room license | HARD_SINK | 5,000 | per owned space | permanent | personal showcase | `SINK_HOUSING_PURCHASE` |
| HOME-WALL | Wall/floor redesign | HARD_SINK | 1,000 | unlimited | until changed | customization | `SINK_HOUSING_RENOVATION` |
| HOME-FURN-BASIC | Basic furniture bundle | HARD_SINK | 1,500 | variants | permanent unlock | decoration | `SINK_HOUSING_RENOVATION` |
| HOME-EXPAND | Room expansion | HARD_SINK | `8,000 * 1.35^(expansion_index)` | progressive | permanent | display capacity/space, not income | `SINK_HOUSING_RENOVATION` |
| HOME-GALLERY | Private gallery wing | HARD_SINK | 75,000 | progressive | permanent | collection showcase | `SINK_HOUSING_RENOVATION` |
| HOME-PENTHOUSE | Penthouse visual tier | HARD_SINK | 250,000 | variants/upgrades | permanent | prestige/showcase | `SINK_HOUSING_PURCHASE` |

Expansion count has no arbitrary global maximum; actual room modules may be finite only where authored content is finite.

### 3.3 Business sinks

| Code | Service | Class | Initial price/curve | Repeat | Value | Ledger type |
|---|---|---|---|---|---|---|
| BIZ-REG | Business registration | HARD_SINK | 10,000 | per business | access to business content | `SINK_BUSINESS_REGISTRATION` |
| BIZ-SIGN | Signage/brand redesign | HARD_SINK | 2,500 | unlimited | identity | `SINK_BUSINESS_UPGRADE` |
| BIZ-STORAGE | Storage expansion | HARD_SINK | `6,000 * 1.4^(tier-1)` | progressive | operational flexibility, not free profit | `SINK_BUSINESS_UPGRADE` |
| BIZ-BRANCH | New branch setup | HARD_SINK | `25,000 * 1.45^(branch_index)` × public location modifier | progressive | wider business play | `SINK_BUSINESS_UPGRADE` |
| BIZ-MAINT | Scheduled maintenance | HARD_SINK | footprint/revenue policy | recurring | keeps owned facilities in normal condition | `SINK_BUSINESS_MAINTENANCE` |
| BIZ-AD | Brand campaign | HARD_SINK | 5,000 / 15,000 / 40,000 | repeat | visibility/brand objectives; no guaranteed revenue | `SINK_BUSINESS_ADVERTISING` |
| BIZ-HQ-WING | HQ wing | HARD_SINK | 200,000 × `1.4^(wing_index)` | progressive | prestige/showcase/management UI space | `SINK_BUSINESS_UPGRADE` |
| BIZ-MUSEUM | Corporate history museum | HARD_SINK | 750,000 | expandable | legacy/status | `SINK_BUSINESS_UPGRADE` |

Maintenance must not create punitive inactivity debt. A returning user cannot log in to an unrecoverable negative balance caused solely by being away.

### 3.4 Crafting and appearance conversion

| Code | Action | Class | Price | Repeat | Notes | Ledger type |
|---|---|---|---:|---|---|---|
| CRAFT-BASIC | Standard craft service | HARD_SINK | 300 | unlimited | materials separate | `SINK_CRAFT_FEE` |
| CRAFT-ADV | Advanced craft service | HARD_SINK | 1,500 | unlimited | no hidden RNG purchase | `SINK_CRAFT_FEE` |
| CRAFT-RECOLOR | Recolor/appearance change | HARD_SINK | 500 | unlimited | cosmetic only | `SINK_CRAFT_FEE` |
| CRAFT-ARCHIVE | Restore archived cosmetic recipe | HARD_SINK | 5,000 | yes | availability must be disclosed | `SINK_CRAFT_FEE` |

Randomized paid crafting with hidden probabilities is out of scope.

### 3.5 Market and marketplace

| Code | Action | Class | Pricing | Repeat | Notes | Ledger type |
|---|---|---|---|---|---|---|
| MKT-EXEC-FEE | WDX execution fee | HARD_SINK | initial 0.20%/executed side, min 1 WLD | per execution | tuning seed, not reward for trading frequency | `SINK_MARKET_FEE` |
| MKT-REPLAY-DECOR | Historical replay visual pack | HARD_SINK | 500 | variants | safety/risk learning remains free | `SINK_MARKET_TOOL` |
| UGC-LIST | Player-market listing fee | HARD_SINK | 25 + 0.10% listed value | per listing | anti-spam + sink | `SINK_LISTING_FEE` |
| UGC-SALE | Player-market sale fee | HARD_SINK | 1.0% settled sale | per sale | fee burned; sale proceeds are transfer | `SINK_MARKETPLACE_FEE` |
| UGC-PAYMENT | Buyer-to-seller payment | TRANSFER | item price | per sale | never count as burn | `TRANSFER_MARKETPLACE_PAYMENT` |

No arbitrary listing-count cap by default. Spam protection should use rate controls, minimum meaningful listing fee and anomaly detection.

### 3.6 Bank, transport and logistics

| Code | Service | Class | Price | Repeat | User value | Ledger type |
|---|---|---|---:|---|---|---|
| BANK-STATEMENT | Custom archive statement/export styling | HARD_SINK | 200 | yes | archive convenience | `SINK_BANK_SERVICE` |
| BANK-RESTRUCTURE | Optional loan restructuring service | HARD_SINK | policy fee | rare | schedule convenience; never hides total cost | `SINK_BANK_SERVICE` |
| MOVE-CITY | City transit/dispatch fee | HARD_SINK | 50–250 | yes | convenience/flavor | `SINK_TRANSPORT` |
| LOGI-DELIVERY | Business delivery service | HARD_SINK | 100 + distance/volume | yes | logistics choice | `SINK_LOGISTICS` |
| LOGI-STORAGE | External storage rental | HARD_SINK | 500/week + usage band | recurring | inventory flexibility | `SINK_STORAGE` |

Security actions, account recovery, required records and mandatory disclosures remain free.

### 3.7 Clubs and social spaces

| Code | Service | Class | Initial price/curve | Repeat | Value | Ledger type |
|---|---|---|---|---|---|---|
| CLUB-CREATE | Club charter | HARD_SINK | 7,500 | per club | social identity | `SINK_CLUB_CREATE` |
| CLUB-BANNER | Club banner design | HARD_SINK | 2,500 | variants | identity | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-ROOM | Clubhouse room | HARD_SINK | `20,000 * 1.35^(room_index)` | progressive | social/showcase space | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-TROPHY | Trophy display case | HARD_SINK | 12,000 | progressive | archive/status | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-EVENT | Club-hosted event stage | HARD_SINK | 25,000 | repeat | shared social activity | `SINK_CLUB_EVENT` |

Club contributions must show who contributed and what was burned versus merely pooled/transferred.

### 3.8 City/community projects

Community projects are scalable voluntary high-capacity sinks.

| Code | Project | Class | Funding | Recognition | Ledger type |
|---|---|---|---|---|---|
| CITY-GARDEN | Public garden restoration | HARD_SINK | 250k global goal, unlimited contribution | plaque tiers | `SINK_PROJECT_DONATION` |
| CITY-PLAZA | City plaza expansion | HARD_SINK | 1m+ staged goal | contributor wall | `SINK_PROJECT_DONATION` |
| CITY-MUSEUM | Public museum wing | HARD_SINK | 3m+ staged goal | collection exhibit credit | `SINK_PROJECT_DONATION` |
| CITY-FESTIVAL | Seasonal city festival | HARD_SINK | variable seasonal goal | event cosmetics/title | `SINK_PROJECT_DONATION` |
| CITY-LANDMARK | Landmark construction | HARD_SINK | 10m+ staged/scalable | permanent season archive | `SINK_PROJECT_DONATION` |

Contribution amount is unlimited. Recognition scales sublinearly/logarithmically so whales receive prestige without purchasing gameplay power. Example recognition score seed:

`recognition_points = floor(100 * ln(1 + contribution / 1,000))`

Do not convert recognition points to WLD, stock advantage, job payout or league score.

### 3.9 Profession and prestige

| Code | Sink | Class | Initial price | Repeat | Value | Ledger type |
|---|---|---|---:|---|---|---|
| PROF-EXAM | Profession certification exam | HARD_SINK | 1,000 | retry allowed | specialization progression | `SINK_PROFESSION_SERVICE` |
| PROF-SPEC | Specialization registration | HARD_SINK | 5,000 | when changing/adding | content path/identity | `SINK_PROFESSION_SERVICE` |
| PROF-PRESTIGE | Prestige ceremony | HARD_SINK | 25,000 × prestige tier | progressive | badge/archive cosmetics | `SINK_PRESTIGE` |
| LEGACY-PLAQUE | Career legacy plaque | HARD_SINK | 100,000 | variants | Hall-of-Fame identity | `SINK_PRESTIGE` |

Profession sinks must not require paying repeatedly merely to continue using already-earned core abilities.

### 3.10 High-wealth prestige sinks

| Code | Sink | Class | Initial price/curve | Economic power | Ledger type |
|---|---|---|---|---|---|
| PRESTIGE-HQ | Skyline headquarters | HARD_SINK | 1.5m + modular wings | none | `SINK_PRESTIGE` |
| PRESTIGE-GALLERY | Named private gallery | HARD_SINK | 2m + exhibit modules | none | `SINK_PRESTIGE` |
| PRESTIGE-SPONSOR | District sponsorship | HARD_SINK | 2.5m per campaign | none | `SINK_PROJECT_DONATION` |
| PRESTIGE-LANDMARK | Landmark patron package | HARD_SINK | 5m+ | none | `SINK_PROJECT_DONATION` |
| PRESTIGE-AUCTION | System prestige auction | HARD_SINK | dynamic reserve; all accepted bid payments burn | none | `SINK_PRESTIGE_AUCTION` |

Prestige auction reserve seed:

`reserve = max(configured_floor, 0.02 * global_P90_liquid_balance)`

This uses a public/global economy statistic, never a hidden personalized wealth price. Auction rewards are numbered trophies, display slots, naming plaques or cosmetic variants only.

## 4. Price-curve library

Runtime should support explicit curve identifiers rather than hard-coded feature logic.

- `FIXED(base)` — catalog cosmetics and simple services.
- `GEOMETRIC(base, ratio, index)` — expansion/HQ/branch growth. Example `base * ratio^index`.
- `PIECEWISE(metric_bands[])` — transparent maintenance/logistics pricing.
- `GLOBAL_INDEX(base, metric, coefficient, floor, ceiling?)` — public economy-based event/reserve pricing. `ceiling` defaults null.
- `PROJECT_STAGE(stages[])` — city project phases with visible goals.

Global dynamic pricing must expose the current price and relevant reason before confirmation. Price changes after quote creation require a new quote rather than silently debiting a different amount.

## 5. Season integration

Each season should introduce at least one new sink family, not merely inflate previous prices.

### 5.1 Main-WLD seasonal sinks

Examples:

- seasonal city festival contributions;
- themed housing renovations;
- season museum exhibits;
- commemorative engraving;
- club event stages;
- season-end `Legacy Museum` donation.

`Legacy Museum` is an unlimited voluntary `HARD_SINK`. Contributions create only archival/prestige recognition.

### 5.2 Season Token separation

Season Token (`ST`) remains separate from WLD. ST store purchases do not count as WLD burn. Dashboard metrics must report ST issuance/expiry independently.

Main WLD is never reset or forcibly deleted at season transition.

## 6. Analytics contract

Required events:

- `sink_quote_viewed`
- `sink_purchase_started`
- `sink_purchase_succeeded`
- `sink_purchase_failed`
- `sink_upgrade_completed`
- `community_project_contributed`
- `prestige_auction_bid_burned`
- `season_sink_used`

Required privacy-safe dimensions where applicable:

- `sink_code`
- `sink_class`
- `price_version`
- `currency`
- `season_id`
- `progression_band`
- `repeat_count_bucket`
- `balance_before_bucket`
- `balance_after_bucket`
- `failure_domain_code`

Never emit raw secret credentials or unnecessary personal data into analytics.

## 7. Economy dashboard and review triggers

Dashboard must separate issuance, burn, transfer and conversion.

Required metrics:

- WLD issuance by faucet/source;
- hard-sink burn by sink code/category;
- net issuance = issuance - hard-sink burn;
- hard-sink ratio;
- transfer volume;
- mean/median/P90/P95/P99 liquid WLD;
- top 1% and top 10% liquid-WLD concentration;
- hard-sink share by category and top-three concentration;
- purchase-active days per cohort;
- high-wealth median balance growth;
- first-purchase conversion and days-to-first-meaningful-sink.

Planning review triggers, not automatic player caps:

1. Rolling 7-day net issuance remains positive and exceeds 10% of circulating spendable WLD for 3 consecutive days -> economy review.
2. Top three sinks exceed 60% of all hard-sink burn -> concentration review; broaden alternatives.
3. A mandatory/near-mandatory sink exceeds 35% of burn -> friction/fairness review.
4. High-wealth cohort median balance grows at >2x the overall median growth rate over 28 days -> add/refresh voluntary high-end sinks.
5. Cohort purchase-active days fall materially while balances grow -> improve sink desirability before considering taxes.

Thresholds are calibration seeds and belong in versioned ops config.

## 8. Abuse and integrity rules

- All debits are server-authoritative.
- Purchase/debit endpoints require idempotency keys.
- Ledger amount, sink code and config version are immutable after commit.
- Marketplace sale proceeds are `TRANSFER`; only fees are `HARD_SINK`.
- Cancelling/retrying a request never doubles the burn or entitlement.
- Quote expiry and price-version mismatch return a new quote requirement.
- High-value project/auction operations receive anomaly/audit coverage.
- Admin adjustment of sink config is audited with actor, old/new value and effective time.
- No sink can silently create negative WLD unless an explicit debt product contract applies.

## 9. P0/P1/P2 rollout

### P0

Implement first:

1. profile/theme/customization;
2. collectible restoration/engraving;
3. housing room/furniture/remodeling;
4. business registration/storage/branch/upkeep;
5. WDX transaction fee classification;
6. club charter/banner/room;
7. one city project;
8. economy dashboard burn/transfer separation.

### P1

- crafting/fusion fees;
- player marketplace listing/sale fees;
- museum/archive systems;
- season Legacy Museum;
- profession certification/prestige;
- advanced housing/HQ modules.

### P2

- prestige auctions;
- rotating district sponsorship;
- multi-stage landmarks;
- community megaproject seasons;
- long-horizon legacy gallery/Hall-of-Fame systems.

## 10. Definition of Done for a runtime sink

A sink is not complete because a price button exists. Runtime implementation requires:

- product copy and visible value proposition;
- quote/confirm/pending/success/idempotent-replay/rejected UI states;
- server-authoritative price and eligibility;
- atomic ledger debit + entitlement + audit state;
- unique/idempotent mutation contract;
- `HARD_SINK`/`TRANSFER`/`CONVERTER` classification;
- versioned config with `null`/unlimited support for non-protection limits;
- analytics events and dashboard attribution;
- abuse/error/concurrency tests;
- accessibility and responsive UI verification;
- English canonical docs + Korean parity;
- real-PostgreSQL integration validation for ledger-impacting runtime work;
- exact-candidate staging deployment and QA before production;
- production reconciliation confirming burned WLD equals committed sink ledger totals.

## 11. Product principles that must not regress

1. Unlimited-by-default participation remains the baseline.
2. Sinks compete for player desire; they do not exist merely to punish wealth.
3. High-wealth sinks sell identity, space, collection and community legacy rather than economic domination.
4. Transfers are never misreported as currency burn.
5. Safety, security and required risk education stay free.
6. No sink is Pay-to-Win.
7. Every season refreshes the portfolio of desirable sinks instead of only raising old prices.
