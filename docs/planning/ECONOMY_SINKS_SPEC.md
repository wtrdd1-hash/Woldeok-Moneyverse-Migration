# Woldeok Moneyverse — Economy Sinks Specification

> Version: v2026.09.12.5
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`
> Korean counterpart: [ECONOMY_SINKS_SPEC.ko.md](ECONOMY_SINKS_SPEC.ko.md)

## 0. Purpose

Moneyverse uses an unlimited-by-default participation model. The economy therefore needs many desirable, repeatable and scalable currency sinks instead of arbitrary play-count caps. This document defines the primary WLD and secondary-resource sinks required to keep long-term wealth meaningful while preserving player choice.

A sink must be classified correctly:

- **Hard sink:** permanently removes currency from the economy.
- **Transfer:** moves currency between users but does not reduce total supply.
- **Converter:** turns one resource into another; only the removed portion counts as a sink.

Every economy dashboard must report these separately. Player-to-player trade volume must never be counted as destroyed currency unless a fee/tax portion is actually burned or routed to a non-recirculating sink account.

## 1. Design principles

1. Spending should usually buy identity, expression, progression options, convenience, prestige, maintenance or new goals rather than raw compounding earning power.
2. The same category should support low, medium and high wealth segments.
3. High-wealth sinks should be optional prestige goals, not mandatory taxes that punish normal players.
4. Repeatable sinks should scale naturally with player ambition: more businesses, more collections, more clubs, more customization, more market activity, more city projects.
5. Permanent progression should not be erased simply to force spending.
6. Default user-facing limits remain unlimited unless a concrete integrity, security, legal or finite-stock reason exists.
7. Prices and sink strength are server policy/config, not frontend constants.

## 2. Sink portfolio targets

Moneyverse should avoid relying on one dominant sink. Initial planning target for total WLD removed over a rolling 30-day period:

| Sink family | Target share of removed WLD |
|---|---:|
| Cosmetics / collections / profile | 15–25% |
| Business expansion / maintenance | 15–25% |
| Crafting / restoration / upgrades | 10–20% |
| Market fees / listing / transaction fees | 8–15% |
| Housing / spaces / decoration | 8–15% |
| Club / social / city projects | 8–15% |
| Travel / services / convenience | 5–10% |
| Seasonal / event sinks | 5–12% |
| Other dynamic sinks | 0–10% |

These are tuning ranges, not hard caps.

## 3. Shop, cosmetics and collections

### 3.1 Permanent catalog

Always-available WLD sinks:

- profile frames;
- avatar borders;
- profile card backgrounds;
- profile music/theme packs;
- dashboard themes;
- stock-terminal skins;
- transaction-history visual themes;
- chat bubble styles;
- title effects;
- nameplate styles;
- portfolio card skins;
- business signboards;
- office furniture;
- club banners;
- collectible display cases;
- archive book covers;
- achievement showcase slots.

No gameplay payout multiplier is attached to these purchases.

### 3.2 Collection sets

Collections should create long-lived spending ladders.

Example set structure:

- Common city-life pieces: 300–1,500 WLD each.
- Uncommon themed pieces: 2,000–10,000 WLD each.
- Prestige collection pieces: 25,000–250,000+ WLD each.
- Museum-grade vanity items: 500,000 WLD+ for late-game prestige.

Completing a set grants badges, lore, display layouts, titles or visual effects, not disproportionate income bonuses.

### 3.3 Restoration and provenance

Collectibles can have optional non-power spending paths:

- reframe item;
- restore visual condition;
- engrave acquisition date;
- add showcase lighting;
- bind to a themed album;
- mint a non-transferable provenance certificate;
- rename display label.

These are repeatable cosmetic sinks.

## 4. Housing, rooms and personal spaces

Introduce personal rooms/offices/apartments as a major late-game sink.

Spending categories:

- room unlock/construction;
- floor/wall themes;
- furniture;
- lighting;
- storage displays;
- trophy walls;
- aquarium/plant/ambient objects;
- neighborhood background;
- music and ambience;
- guestbook visual upgrades;
- seasonal decorations;
- remodel fees.

Scale without a fixed wealth ceiling by using optional larger spaces and prestige layouts.

Example progression:

| Space | Example cost |
|---|---:|
| Starter room | free/low-cost |
| Studio office | 15,000 WLD |
| Loft workspace | 75,000 WLD |
| Business penthouse | 350,000 WLD |
| Skyline headquarters | 1,500,000+ WLD |

Values are tuning seeds only.

## 5. Business sinks

Businesses should absorb currency continuously without guaranteeing profit.

### 5.1 Setup and expansion

- business registration;
- location lease/permit fee;
- equipment purchase;
- interior setup;
- inventory fixtures;
- signage;
- additional operational modules;
- analytics package;
- warehouse expansion;
- extra branch opening;
- branch relocation/remodel.

### 5.2 Ongoing maintenance

Repeatable sinks:

- maintenance;
- inventory spoilage/waste;
- utilities;
- cleaning/service contracts;
- insurance-like protection fee (game system, not real insurance);
- equipment servicing;
- quality inspection;
- advertising campaign spend;
- seasonal storefront redesign;
- staffing/recruitment service cost where NPC/system-funded.

### 5.3 Prestige business spending

High-wealth optional sinks:

- flagship branch;
- landmark signage;
- premium lobby;
- corporate museum;
- custom delivery fleet skins;
- branded plaza sponsorship;
- city-event sponsorship;
- business archive hall.

Prestige upgrades should primarily affect appearance, reputation display or content access, not exponential passive profit.

## 6. Crafting, customization and item transformation

Create crafting as a resource-conversion sink.

Possible costs:

- WLD service fee;
- common material destruction;
- recipe unlock cost;
- reroll appearance cost;
- recolor cost;
- engraving cost;
- combine duplicate collectibles into higher-grade display variants;
- dismantle fee where appropriate;
- restoration fee;
- commission fee for system-crafted decorative items.

Crafting must not become hidden-probability monetization. If random output exists, odds must be disclosed and the feature must not use real-money-paid chances without separate review.

## 7. Market and trading sinks

### 7.1 Stock-market fees

Possible configurable sinks:

- execution fee;
- order placement fee for advanced order types;
- amendment/cancel fee only if needed for abuse prevention, otherwise free;
- premium analytics subscription paid in WLD if it provides convenience/visualization, not privileged hidden market information;
- historical replay scenario purchase;
- portfolio report export styling/template fee.

Transaction fees should scale with notional rather than impose play-count caps.

### 7.2 Player marketplace

If player-to-player trading is added:

- listing fee;
- successful-sale commission;
- optional featured listing fee;
- relisting fee after long expiry;
- appraisal fee for high-value collectibles.

Only the fee component is a true sink. Seller proceeds remain in circulation.

## 8. Banking and finance-system sinks

Potential non-punitive sinks:

- loan origination/service fee;
- late restructuring administrative fee with hardship safeguards;
- account customization themes;
- financial-report generation;
- premium statement archive formatting;
- safe-deposit showcase slot rent;
- optional automatic budgeting rule setup fee only if it does not block basic access.

Avoid compounding punitive debt spirals. Fees must not create impossible recovery loops.

## 9. Travel, logistics and services

Service sinks create frequent low-friction spending:

- fast travel;
- delivery/express courier fee;
- business logistics fee;
- inter-district transport;
- item shipping between display/storage locations;
- temporary storage;
- expedited cosmetic delivery;
- relocation/remodel service;
- archive retrieval service;
- event venue transport.

Basic access should remain possible without mandatory excessive fees.

## 10. Clubs and social sinks

Clubs should be a large collective sink category.

Spend on:

- club creation/branding setup;
- clubhouse rooms;
- club banners/emblems;
- club archive/history wall;
- club event hosting;
- member celebration effects;
- shared trophy case;
- club city project contribution;
- club bulletin customization;
- seasonal clubhouse decoration;
- tournament venue cosmetics.

Club contributions can combine individual WLD into a system sink rather than simply transferring currency to another user.

## 11. City and community projects

Create very large optional communal sinks for late-game wealth.

Examples:

- rebuild a district plaza;
- fund a public transit-themed monument;
- sponsor a seasonal festival;
- restore a virtual museum;
- construct community garden visuals;
- upgrade city skyline landmarks;
- fund a research observatory;
- unlock a server-wide decorative event state.

Players contribute WLD; currency is destroyed into a project ledger. When milestones are reached, participants receive recognition, titles, plaques, profile marks or access to cosmetic scenes.

These projects are ideal unlimited sinks because contribution size can scale with wealth without capping participation.

## 12. Season and event sinks

Season systems should add fresh sinks each cycle:

- season-themed cosmetics;
- commemorative collectibles;
- event housing decoration;
- archive reissue shop;
- seasonal business decorations;
- city festival contribution;
- season museum exhibit;
- next-season teaser collectible;
- themed replay scenarios;
- seasonal profile layouts.

Season currency remains separate from WLD unless a specific conversion is intentionally designed. WLD season sinks should not grant competitive leaderboard advantage.

## 13. Progression and mastery sinks

To support unlimited play without direct activity caps, progression can include optional escalating costs.

Examples:

- profession certification exams;
- specialization unlock fees;
- cosmetic mastery badges;
- training simulation access;
- advanced tutorial scenarios;
- respecialization service;
- prestige reset that keeps permanent achievements while reopening a mastery track for cosmetic prestige;
- advanced business license tier;
- portfolio research notebook upgrades.

These should unlock variety and expression more than raw multiplicative income.

## 14. Maintenance and decay policy

Maintenance can be useful but must not feel like punishment.

Allowed:

- businesses with moderate operating costs;
- cosmetic restoration;
- optional property upkeep tied to active premium spaces;
- equipment servicing when the equipment provides convenience.

Avoid:

- deleting permanent purchases for inactivity;
- draining offline users to zero;
- taking away earned profile rewards;
- maintenance so high that casual users cannot recover.

## 15. Dynamic sinks for inflation control

If inflation indicators exceed target ranges, use configurable demand-side adjustments before adding arbitrary play caps.

Possible levers:

- launch additional prestige cosmetic tiers;
- increase variety of expensive housing modules;
- city-project campaigns;
- new business branch archetypes;
- rotating collector auctions where WLD paid to the system is burned;
- vanity naming/engraving drives;
- limited-time decorative crafting recipes;
- scaled marketplace fees within published bounds;
- optional charitable/community-style contribution events in the fictional world.

Do not silently increase essential costs solely to confiscate player wealth.

## 16. Wealth-segment design

Every major sink family should have options for multiple balance segments.

Example planning bands:

| Balance segment | Typical purchase size |
|---|---:|
| New / low balance | 100–2,000 WLD |
| Early established | 2,000–20,000 WLD |
| Mid wealth | 20,000–200,000 WLD |
| High wealth | 200,000–2,000,000 WLD |
| Prestige wealth | 2,000,000+ WLD |

The product should not expose insulting labels such as “poor” or “whale”; these are internal analytics segments only.

## 17. Pricing model

Recommended pricing tools:

- fixed catalog prices for basic items;
- prestige price ladders;
- progressive construction costs for additional large properties/branches;
- user-selected contribution amounts for city projects;
- market-linked system auction prices where appropriate;
- seasonal themed catalogs;
- bundle discounts only when transparent.

Avoid opaque personalized pricing that charges different users different prices without a clear public rule.

## 18. Economy health metrics

Track at minimum:

- WLD minted per hour/day/week;
- WLD burned per hour/day/week;
- net issuance;
- hard-sink ratio = burned / minted;
- transfer volume separately;
- average/median/P90/P95/P99 wallet balance;
- top 1%/10% share of WLD;
- sink usage by category;
- number of active sink categories per user cohort;
- sink concentration: percentage of burn caused by top 3 sink families;
- days of income required for representative purchases;
- new-user D7/D30 liquid balance;
- high-wealth balance growth rate;
- business maintenance burden ratio;
- seasonal sink uptake;
- city-project contribution distribution.

## 19. Initial tuning goals

Planning targets, not hard rules:

- mature active users should have at least 5 meaningful WLD spending options at any time;
- high-wealth users should have at least 3 prestige sinks whose cost can absorb 5–25% of liquid balance voluntarily;
- no single sink family should routinely account for more than ~40% of total WLD burn;
- essential progression should remain affordable to median active users;
- net issuance can remain positive during growth phases, but acceleration must be visible in dashboards;
- if top-1% wealth share rises rapidly, add aspirational high-end sinks before punitive universal fees.

## 20. Example sink catalog backlog

P0 candidates:

1. expanded permanent cosmetic shop;
2. business registration/maintenance/upgrade spending;
3. WDX execution fee;
4. profile showcase/display purchases;
5. collection albums and restoration;
6. club creation/customization;
7. seasonal WLD cosmetic catalog;
8. first city contribution project.

P1 candidates:

9. personal room/office system;
10. furniture and remodel catalog;
11. crafting and cosmetic transformations;
12. player-market listing/sale fees;
13. advanced historical replay scenarios;
14. business branches and warehouses;
15. profession certification and prestige cosmetics;
16. museum/archive system;
17. collectible appraisal/provenance system;
18. city sponsorship projects.

P2 candidates:

19. large headquarters/property system;
20. server-wide landmark projects;
21. system-run prestige auctions;
22. high-end corporate museum;
23. club halls and cooperative construction;
24. advanced decorative manufacturing;
25. historical-season archive reissue economy;
26. branded fictional transit/logistics network customization.

## 21. Technical requirements

Every sink mutation that spends WLD must:

1. authenticate actor;
2. authorize target/resource;
3. read authoritative price/config server-side;
4. validate balance and eligibility;
5. write ledger debit and purchased/updated state atomically;
6. use idempotency for retryable mutation paths;
7. emit analytics/audit event;
8. never trust client-submitted price;
9. classify the transaction as `hard_sink`, `transfer`, or `converter`;
10. support reconciliation by transaction type and sink family.

Suggested fields on ledger metadata or normalized transaction records:

- `sink_family`;
- `sink_code`;
- `season_id` if applicable;
- `business_id`/`club_id`/`project_id` where applicable;
- `pricing_policy_version`;
- `idempotency_key`;
- `burn_amount`;
- `transfer_amount`;
- `source_context`.

## 22. Definition of Done

An economy sink feature is not complete until:

- user purpose and value exchange are documented;
- hard sink vs transfer is correctly classified;
- price comes from server policy;
- debit/state update is atomic;
- duplicate requests cannot double-charge;
- analytics are emitted;
- accessibility/error/insufficient-funds states exist;
- English/Korean docs are updated;
- economy dashboard can measure its effect;
- staging verifies expected debit and ledger reconciliation before production.

## 23. Next planning work

Highest-priority follow-up specification should include:

1. exact P0 sink SKU/catalog table with initial prices;
2. personal-space/housing feature specification;
3. city-project contribution system and recognition model;
4. business-cost curve by archetype and level;
5. economy simulation sheet/model for 30/90/180-day inflation scenarios;
6. dynamic sink tuning playbook for operations.
