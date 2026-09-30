# Treasury, Tax, and Engagement Research Review — v2026.10.01.492

> Status: EVIDENCE INPUT / planning support
> Date: 2026-10-01
> Canonical language: English
> Korean counterpart: [TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.ko.md](TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.ko.md)
> Product authority: adopted only where explicitly referenced by PROJECT_PLAN / ADMIN_TREASURY_MANAGEMENT_SPEC.
> Runtime claim: none.

## 1. Question

How should Moneyverse collect more varied virtual taxes/fees without making ordinary play feel punitive, and how can treasury revenue become a visible source of new activity rather than an idle balance?

This is a targeted source review, not a claim of exhaustive manual review of a large corpus.

## 2. Directly checked reference patterns

### 2.1 EVE Online — separate order friction from settlement tax

CCP's current support article separates:
- a broker fee charged when non-immediate orders are created;
- a seller sales tax charged after sale;
- bounded reductions through Broker Relations / Accounting and standings.

Source:
- EVE Online Support, “Broker Fee and Sales Tax,” updated 2026-03-02:
  https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax

Moneyverse implication:
- keep marketplace sale tax separate from listing/broker/reprice fees;
- make fees visible before commitment;
- if gameplay mastery reduces fees, apply it only to designated service fees with a public floor rather than making high-level players tax-exempt.

### 2.2 Old School RuneScape — transaction tax plus item-removal intervention

The OSRS community wiki documents the Grand Exchange tax and an item-sink mechanism in which part of collected value supports purchases of selected items that are then removed. The exact current game parameters are not adopted as Moneyverse defaults.

Source:
- OSRS Wiki, “Grand Exchange” tax/item sink section:
  https://oldschool.runescape.wiki/w/Grand_Exchange

A peer-reviewed-style research preprint studied the OSRS intervention with causal inference and reported:
- no meaningful trading-volume effect at the studied tax boundaries;
- luxury-good price inflation associated with the item sink;
- no trade-volume reduction from the item sink in the studied setting.

Source:
- Hogan-Hennessy, Xenopoulos & Silva, “Market Interventions in a Large-Scale Virtual Economy”:
  https://arxiv.org/abs/2210.07970

Moneyverse implication:
- do not treat tax volume or nominal sink amount as proof of success;
- measure item-category price, trade volume, substitution, concentration and affordability;
- an item-buyback/salvage program can be fun and useful, but it needs allowlists, reference-price bands and manipulation controls.

### 2.3 New World — taxes connected to settlement upkeep and projects

Amazon Games' settlement/governance material explicitly connected settlement taxes/fees to territory upkeep and Town Projects. Later releases adjusted tax pooling/rates and upkeep economics.

Sources:
- “Making Your Mark on Aeternum: Settlements and Governance”:
  https://www.newworld.com/en-gb/news/articles/making-your-mark-on-aternum-settlements-and-governance
- “Brimstone Sands Release” territory-economy changes:
  https://www.newworld.com/en-us/game/releases/brimstone-sands-release
- “Season 1 — Fellowship & Fire” revenue/upkeep changes:
  https://www.newworld.com/en-us/game/releases/season-one-fellowship-and-fire

Moneyverse implication:
- collected treasury revenue should visibly fund community/city projects, public services and maintenance-like programs;
- the player should be able to see the connection between pooled revenue and unlocked public outcomes;
- central pooling plus bounded program allocation is safer than allowing one private player group to control the whole treasury.

### 2.4 Guild Wars 2 — explicit market fees and visible treasury upgrades

ArenaNet support documents a 5% non-refundable Trading Post listing fee and 10% exchange fee after sale. These exact values are not adopted for Moneyverse.

Source:
- Guild Wars 2 Support, “Missing Gold”:
  https://help.guildwars2.com/hc/en-us/articles/222384087-Missing-Gold

The Guild Wars 2 Wiki documents guild treasury contributions used for guild upgrades that unlock buildings, benefits and guild missions.

Sources:
- https://wiki.guildwars2.com/wiki/Guild_upgrades
- https://wiki.guildwars2.com/wiki/Guild_hall

Moneyverse implication:
- distinguish listing friction from successful-sale taxation;
- use a public treasury/project meter so pooled contributions have visible unlocks;
- favor collective project progress and mission unlocks over “pay more tax, get more personal power.”

## 3. Design conclusions adopted into v492

1. **Separate tax classes by economic behavior.**
   Sale tax, listing/broker fee, reprice fee, business profit tax, luxury/property tax and temporary event levies have different purposes and telemetry.

2. **Protect ordinary/new users.**
   P2P transfer remains 0% by default. Baseline rewards/refunds remain non-taxable. Minimum taxable bases and starter fee waivers prevent nuisance friction.

3. **Use treasury as a recyclable pool, not as fake burn.**
   Treasury-held WLD remains supply. Healthy eligible surplus should fund useful player activity under reserve/reconciliation gates.

4. **Make spending visible.**
   Treasury Today, public-project progress, “where it goes” allocation and public contract pools let members see why the fiscal system exists.

5. **Turn fiscal flow into gameplay.**
   City/community matching, public procurement contracts, seasonal public works, fee-relief events, item buyback/salvage and civic weekly challenges create new actions instead of passive redistribution.

6. **Reward participation breadth, not tax amount.**
   No richest-taxpayer leaderboard. No tax-funded lottery. No competitive advantage proportional to tax paid.

7. **Measure side effects causally where possible.**
   Evaluate price/volume/substitution, cohort burden, retention, participation breadth, payout concentration, abuse and reserve health before keeping a policy.

## 4. Specific v492 fun mechanics justified by the review

- **Treasury Today meter:** makes pooled fiscal flow legible.
- **City/community matching:** treasury matches verified member contribution within caps.
- **Public contracts:** treasury posts bounded tasks for crafting, logistics, maintenance and diversified professions.
- **Public works unlock chain:** community milestones unlock non-P2W visual/functional public outcomes.
- **Fee-relief festivals:** healthy treasury temporarily covers designated public-service fees.
- **Item salvage drive:** treasury buys allowlisted oversupplied items within safe price bands and destroys/converts them.
- **Accounting/Commerce mastery:** reduces designated service/listing fees only, never purchased for real money.
- **Civic archive/title rewards:** based on breadth of verified project participation rather than WLD tax paid.

## 5. Risks retained as open implementation questions

- fee/tax stacking can create excessive effective burden even when each line item looks small;
- listing/reprice fees may reduce legitimate price discovery if tuned too high;
- treasury matching can be farmed by related accounts without identity/risk controls;
- public procurement can become a price floor or manipulation target;
- direct WLD subsidies can reactivate dormant supply and increase inflation;
- item buybacks can raise scarce/luxury prices;
- fee discounts can become veteran advantage if they affect core progression rather than optional market services.

These risks are release-gated by simulation, Test replay, reconciliation and exact-SHA evidence rather than resolved by this research note alone.
