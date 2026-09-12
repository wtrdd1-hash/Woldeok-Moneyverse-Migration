# Woldeok Moneyverse — Personal Spaces & City Projects Specification

> Version: v2026.09.12.11
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md](PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md)

## 0. Purpose

This specification turns two broad economy-sink families into buildable product systems:

1. **Personal Spaces** — rooms, offices, galleries, headquarters and decorative modules that create persistent voluntary WLD demand without selling economic power.
2. **City Projects** — voluntary community-funded hard sinks that return visible world change, social recognition and archival prestige rather than compounding income.

The global product rule remains **unlimited by default**. No arbitrary daily visit, decoration, renovation, contribution, furnishing or ownership cap is introduced for implementation convenience. A non-null limit must be justified by security, abuse prevention, real scarcity, integrity, legal policy or system stability.

## 1. Product goals

### 1.1 Personal Spaces

- give new players an affordable identity sink in the first week;
- create expandable medium/high-wealth sinks without punitive taxation;
- display collections, achievements, season trophies and business history;
- connect shop, collection, profession, business, club and season systems through display value rather than stat bonuses;
- create long-term demand through new modules/themes instead of only price inflation.

### 1.2 City Projects

- absorb large WLD volumes voluntarily;
- make spending visibly change the shared city/world;
- recognize all wealth bands without selling competitive power;
- create permanent season archives and contributor history;
- give LiveOps an inflation-response tool that does not rely on arbitrary play caps.

## 2. Personal Spaces IA and screen states

Primary path: `Profile -> Spaces`.

Secondary entry points: Home recommendations, Shop -> Space & Decor, Collection -> Display, Business -> Headquarters, Season -> Seasonal Decor, City -> My Exhibits/Sponsorships.

The Spaces landing page must show: featured space, owned spaces, unfinished renovations, recent decor unlocks, undisplayed collection items, next affordable expansion, and privacy-aware visit/share controls.

Required states: loading, no-space onboarding, empty owned space, edit mode, visitor read-only mode, partial data, save conflict, maintenance and permission denied.

## 3. Space types and price seeds

| Code | Space | Price seed | Audience | Economic power |
|---|---|---:|---|---|
| `SPACE_ROOM_STARTER` | Starter Room | 5,000 WLD | starter | none |
| `SPACE_STUDIO` | Studio | 25,000 WLD | established | none |
| `SPACE_GALLERY` | Private Gallery | 75,000 WLD | established/advanced | none |
| `SPACE_OFFICE` | Personal Office | 100,000 WLD | advanced | none |
| `SPACE_PENTHOUSE` | Penthouse | 250,000 WLD | advanced/high wealth | none |
| `SPACE_HQ` | Corporate HQ | 1,500,000 WLD | high wealth/business | none |
| `SPACE_LEGACY_HALL` | Legacy Hall | 2,000,000 WLD | prestige | none |

These are tuning seeds, not immutable runtime constants. `max_owned_spaces` defaults to `null`/unlimited. Finite authored templates are a content-availability constraint, not a generic account cap.

## 4. Expansion without arbitrary caps

Room expansion seed:

`price = round_to_100(8,000 * 1.35^expansion_index)`

Gallery wing seed:

`price = round_to_1k(75,000 * 1.45^wing_index)`

Expansion may add floor area, wall/display slots, collectible pedestals, visual room variants and layout complexity budget. It must never increase job payout, stock return, loan terms, business settlement or league score.

HQ module seeds:

| Module | Price seed | Value |
|---|---:|---|
| Reception Hall | 200,000 | brand/profile showcase |
| Archive Room | 280,000 | business history display |
| Strategy Room | 350,000 | cosmetic dashboard presentation |
| Trophy Atrium | 500,000 | season/league awards display |
| Founder Floor | 750,000 | prestige visual |
| Skyline Extension | 1,000,000+ geometric | long-horizon prestige sink |

## 5. Decor catalog contract

Every decor SKU requires:

- stable `sku`;
- localized title/description;
- content type (`furniture`, `wall`, `floor`, `display`, `light`, `trophy_mount`, `season_decor`);
- tags and search metadata;
- canonical base price;
- store-specific price/availability override support;
- ownership type (`unlock`, `stackable`, `service`);
- placement footprint/constraints;
- display category/rarity;
- source season/event;
- tradability flag;
- start/end timestamps when rotated;
- config version.

Architecture principle: durable item identity belongs in a canonical catalog, while LiveOps price/availability belongs in a store/config layer. Microsoft PlayFab Economy V2 Stores follows this pattern by allowing stores to hold items and override canonical prices/availability: https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores

## 6. Space edit/save contract

Edit loop:

1. enter Edit Mode;
2. select owned item/category;
3. preview placement locally;
4. server validates entitlement and placement schema;
5. save layout revision;
6. persist canonical versioned snapshot;
7. return canonical revision ID.

Rules:

- layout saving is free;
- purchases/recoloring/renovations are charged separately;
- same idempotency key cannot charge twice;
- stale revision returns `SPACE_LAYOUT_CONFLICT` plus current revision;
- visitor view reads the latest committed public revision;
- visibility is `private`, `friends_followers`, `club`, or `public`;
- new spaces inherit account privacy defaults rather than forcing public visibility.

## 7. Personal-space sink matrix

| Sink | Class | Price seed | Repeat | User value | Ledger type |
|---|---|---:|---|---|---|
| Wall/floor renovation | HARD_SINK | 1,000 | unlimited | visual identity | `SINK_HOUSING_RENOVATION` |
| Furniture purchase | HARD_SINK | 300–25,000 | variants | decor ownership | `SINK_HOUSING_PURCHASE` |
| Recolor service | HARD_SINK | 250–1,500 | unlimited | personalization | `SINK_HOUSING_RENOVATION` |
| Engraved plaque | HARD_SINK | 800–10,000 | unlimited | archive/status | `SINK_ITEM_ENGRAVING` |
| Room expansion | HARD_SINK | geometric | progressive | display space | `SINK_HOUSING_RENOVATION` |
| Gallery wing | HARD_SINK | geometric | progressive | collection showcase | `SINK_HOUSING_RENOVATION` |
| HQ module | HARD_SINK | geometric/catalog | progressive | prestige | `SINK_BUSINESS_UPGRADE` |
| Future player decor sale | TRANSFER + fee | market price | unlimited | liquidity | transfer + marketplace fee |

## 8. Wealth-band journey

### First 7 days

- preview Starter Room for free before purchase;
- grant one inexpensive onboarding decor item;
- recommend 300–1,500 WLD cosmetics before the 5,000 WLD room if liquidity is low;
- never aggressively recommend a purchase that would leave the player near zero liquid WLD.

### 10k–100k WLD

Studio, room expansion, themed sets and small galleries. Weekly rotations create variety; no fake scarcity claims.

### 100k–1m WLD

Gallery wings, offices, trophy displays and advanced renovations.

### 1m+ WLD

HQ, Legacy Hall, named wings and museum-grade exhibits. Rewards remain visual/archive/social.

## 9. City Projects system

Primary path: `Community -> City`.

The City screen is a persistent world-state dashboard, not a donation list.

State machine:

`DRAFT -> ANNOUNCED -> FUNDING -> FUNDED -> BUILDING -> COMPLETED -> ARCHIVED`

Emergency transitions: `FUNDING|BUILDING -> PAUSED`, then `PAUSED -> FUNDING|BUILDING|CANCELLED`.

All transitions are server-authoritative, timestamped, versioned and auditable.

Funding models:

1. `GLOBAL_GOAL` — contributions burn toward one public goal.
2. `STAGED_GOAL` — phase goals unlock visible changes.
3. `OPEN_ENDED_PATRONAGE` — no ceiling; milestones unlock archive/prestige effects.

`max_contribution_per_user` defaults to `null`/unlimited.

## 10. Launch city-project catalog

| Code | Project | Goal seed | Model | Visible result | Economic reward |
|---|---|---:|---|---|---|
| `CITY_GARDEN_01` | Riverside Garden Restoration | 250,000 | GLOBAL_GOAL | garden scene + plaque | none |
| `CITY_PLAZA_01` | Central Plaza Expansion | 1,000,000 | STAGED_GOAL | public art/event stage | none |
| `CITY_MUSEUM_01` | Moneyverse History Museum | 3,000,000 | STAGED_GOAL | archive exhibits | none |
| `CITY_FESTIVAL_S1` | Season One City Festival | configurable | GLOBAL_GOAL | season scene/cosmetics | none |
| `CITY_LANDMARK_01` | Skyline Landmark | 10,000,000 | STAGED_GOAL | permanent skyline object | none |
| `CITY_PATRONAGE` | City Legacy Patronage | open-ended | OPEN_ENDED_PATRONAGE | patron archive wall | none |

## 11. Contribution UX and transaction flow

Project page must show: story, expected visible result, current phase, total burned WLD, phase goals, next visual unlock, user's contribution, club contribution, recognition preview, history, and an explicit notice that donated WLD is permanently removed and does not produce financial return.

Flow:

1. server returns quote + project state version;
2. user enters WLD amount;
3. client shows post-contribution balance preview;
4. server validates state/version and available balance;
5. atomic ledger debit + contribution record;
6. idempotent result returned;
7. phase-completion event queued after commit.

## 12. Recognition system

Seed formula:

`recognition_points = floor(100 * ln(1 + total_contribution / 1,000))`

Recognition unlocks may include contributor badge, plaque tier, title variant, museum record, moderated naming token, patron wall band and season archive marker.

Recognition never converts to WLD, business income, stock advantage, job payout, loan terms, market priority or league points.

Do not make a raw richest-donor leaderboard the only social frame. Offer newest contributors, clubs, projects-supported count, milestone contributors and patron bands.

## 13. Example staged project — Central Plaza

- Phase 1 Groundworks: 200,000 WLD
- Phase 2 Public Art: 250,000 WLD
- Phase 3 Event Stage: 300,000 WLD
- Phase 4 Archive Plaques: 250,000 WLD

Each phase completion must create a real visible UI/world change. Completed phase requirements cannot be retroactively raised.

## 14. Season integration

Each season may have at least one optional city project. High-value donation must never be required for core season completion.

Planning schedule:

- D-21: next city-theme teaser;
- D-14: project theme reveal;
- D-7: first concept and target range;
- D-3: Legacy Museum migration rules;
- season close: seasonal contributor snapshot;
- offseason: project archive + legacy exhibit.

Season contribution records and permanent cumulative patronage are stored separately.

## 15. Recommended DB model

### `city_projects`

`id`, `project_code UNIQUE`, `title_key`, `state`, `funding_model`, `starts_at`, `funding_ends_at NULL`, `goal_wld NULL`, `config_version`, `season_id NULL`, timestamps.

### `city_project_stages`

`project_id`, `stage_no`, `goal_wld`, `visual_unlock_code`, `state`, unique `(project_id, stage_no)`.

### `city_project_contributions`

`id`, `project_id`, `user_id`, `amount_wld CHECK > 0`, `ledger_transaction_id UNIQUE`, `idempotency_key`, `project_version`, `created_at`, unique `(user_id, idempotency_key)`.

### `city_project_snapshots`

Project/version, burned total, contributors count, stage-state JSON, recognition version and timestamp.

### `user_spaces`

Owner, space type, display name, visibility, layout revision and timestamps.

### `user_space_modules`

Space, module code/index, purchase transaction ID, config version; unique module index per space.

### `user_space_layouts`

Space, revision, layout JSON, timestamp; unique `(space_id, revision)`.

If placements are normalized, every save revalidates inventory ownership server-side.

## 16. API surface

Personal Spaces:

- `GET /api/spaces`
- `POST /api/spaces/quote`
- `POST /api/spaces/purchase`
- `GET /api/spaces/:spaceId`
- `PUT /api/spaces/:spaceId/layout`
- `POST /api/spaces/:spaceId/modules/quote`
- `POST /api/spaces/:spaceId/modules/purchase`
- `PATCH /api/spaces/:spaceId/privacy`

City Projects:

- `GET /api/city/projects`
- `GET /api/city/projects/:code`
- `POST /api/city/projects/:code/contributions/quote`
- `POST /api/city/projects/:code/contributions`
- `GET /api/city/projects/:code/contributions/me`
- `GET /api/city/projects/:code/recognition`

State-changing purchase/contribution endpoints require idempotency keys.

## 17. Ledger requirements

Canonical transaction types:

- `SINK_HOUSING_PURCHASE`
- `SINK_HOUSING_RENOVATION`
- `SINK_SPACE_MODULE`
- `SINK_PROJECT_DONATION`
- `SINK_PRESTIGE`

Metadata includes feature, SKU/project code, config/price version, quote reference, actor and resulting entitlement/contribution ID.

A city contribution is a `HARD_SINK`; do not count a temporary user-controlled pooled wallet as burn.

## 18. Admin console requirements

Space administration:

- enable/disable SKU;
- create future price/config versions;
- schedule availability;
- inspect purchase/entitlement anomalies;
- no direct protected-ledger mutation.

City administration:

- create draft projects;
- define stages/goals/visual unlock codes;
- schedule announce/funding windows;
- pause/resume with reason;
- preview expected economy impact;
- inspect anomalies;
- complete/archive through auditable server actions;
- recalculate recognition from immutable contribution history;
- never silently delete contribution history.

## 19. Analytics and economy dashboard

Events:

`space_viewed`, `space_purchase_quoted`, `space_purchased`, `space_layout_saved`, `space_module_purchased`, `decor_item_purchased`, `city_project_viewed`, `city_contribution_quoted`, `city_contribution_completed`, `city_project_stage_completed`, `city_project_completed`, `recognition_tier_reached`.

Dashboard metrics:

- spaces/city burn per day and 7d;
- unique purchasers/contributors;
- median/P90 purchase/contribution;
- expansion/module frequency;
- participation by balance cohort;
- top-1% contribution concentration;
- share of total hard sink from spaces/city;
- 7d/30d repeat spending days;
- high-wealth balance growth before/after projects.

If one sink family sustains roughly >60% of total burn, review sink diversity before automatically raising prices.

## 20. Abuse, concurrency and rollback

- server-authoritative integer WLD;
- no client-supplied final price;
- no zero/negative contribution;
- rate controls only for stability/abuse, not progression caps;
- layout JSON schema/size validation;
- moderation for user-named spaces/plaques;
- detect circular-transfer patterns used to manufacture patronage narratives;
- corrections use auditable compensating ledger entries, never deleted history.

Purchase debit + entitlement must commit atomically. If downstream event publication fails, retry the event without re-debiting.

Concurrent contributions may cross a phase boundary. The transition worker must elect the next stage exactly once using transaction locking/advisory locking or equivalent. Excess funding behavior is defined in config before project launch.

## 21. Implementation phases

### P0

- canonical space SKU/config tables;
- Starter Room, Studio, basic Gallery;
- decor purchase and layout revisions/privacy;
- Garden and Plaza city projects;
- atomic WLD sink ledger;
- admin config;
- dashboard metrics.

### P1

- Penthouse/HQ;
- season decor;
- club contribution view;
- museum project;
- visitor reactions with moderation/privacy;
- richer recognition profiles.

### P2

- Legacy Hall;
- open-ended patronage;
- player decor marketplace with transfer/fee split;
- creator/UGC only after moderation/security review.

## 22. Definition of Done

Personal Spaces is complete only when pricing is server-authoritative/versioned, debit+entitlement is atomic/idempotent, arbitrary user caps default null/unlimited, layout/privacy/conflict behavior is tested, no economic power is sold, analytics reconcile with ledger, EN/KO docs are in parity, and staging covers duplicate purchase, insufficient balance, stale config, concurrent save and privacy access.

City Projects is complete only when the state machine is auditable, contributions are immutable hard sinks, contribution amount defaults unlimited, stage transitions are concurrency-safe/idempotent, recognition has no economic power, pause/cancel/reconciliation procedures exist, burn vs transfer reporting is correct, and staging covers concurrent phase crossing, duplicate contributions, insufficient balance, paused state, reconciliation and archive.

## 23. External reference notes

- Microsoft PlayFab Economy V2 Stores, docs current through 2025-05-01: canonical catalog items can be exposed through stores with overridden price/availability. This supports Moneyverse's separation of SKU identity from LiveOps store configuration. https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores
- Microsoft PlayFab Inventory Collections: multiple inventory collections can live under one player identity; useful as an architectural reference for logically separated future space inventories. https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/inventory/collections
- TradingView The Leap 2026 competitions use separate preset Paper Trading competition accounts. Moneyverse should preserve equivalent conceptual isolation between main WLD and season/competition simulation balances. https://www.tradingview.com/the-leap/

## 24. Next planning priorities

1. 50+ launch furniture/decor SKU seed catalog with price bands/tags;
2. City Project admin wireframe and permission matrix;
3. Season 1 City Project + Legacy Museum exact timeline/rewards;
4. screen-by-screen Personal Spaces frontend interaction spec;
5. sink-adoption simulation assumptions by starter/established/high-wealth cohorts;
6. migration/API implementation mapping to the repository's existing ledger/shop schema.
