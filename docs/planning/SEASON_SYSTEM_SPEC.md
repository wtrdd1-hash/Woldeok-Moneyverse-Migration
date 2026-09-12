# Woldeok Moneyverse — Season System Specification

> Version: v2026.09.12.3
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`
> Korean counterpart: [SEASON_SYSTEM_SPEC.ko.md](SEASON_SYSTEM_SPEC.ko.md)

## 0. Purpose

This document defines the Moneyverse season system as a complete product and operations loop rather than a simple battle-pass layer. A season must create a fresh reason to return without invalidating permanent player identity, accumulated learning, collections, or long-term account history.

The season system must answer five questions for every player:

1. What is new this season?
2. What can I accomplish before it ends?
3. What remains mine after the season ends?
4. What do I receive when the season closes?
5. Why should I care about the next season?

The design must avoid pay-to-win, excessive urgency, punitive streak loss, and compounding economic advantage across seasons.

## 1. Season lifecycle

### 1.1 Default cadence

Initial planning cadence:

- **Preseason:** 7 days
- **Active season:** 8 weeks / 56 days
- **Closing window:** final 24 hours of the active season
- **Settlement lock:** 30–60 minutes after season close
- **Verification window:** up to 24 hours for ranking/abuse review
- **Off-season / transition:** 1–3 days depending on content rollout needs

The exact schedule must be stored in server configuration and persisted by `season_id`; it must not depend only on frontend clocks.

### 1.2 State machine

Required season states:

`DRAFT -> ANNOUNCED -> PRESEASON -> ACTIVE -> CLOSING -> LOCKED -> VERIFYING -> REWARDED -> ARCHIVED`

Emergency branches:

- `ACTIVE -> PAUSED`
- `PAUSED -> ACTIVE`
- `PAUSED -> CANCELLED`
- `VERIFYING -> REVERIFYING`

State transitions must be server-authoritative, timestamped, auditable, and idempotent.

### 1.3 Transition rules

- `ANNOUNCED`: next-season theme and start date visible; no XP earned yet.
- `PRESEASON`: preview page, reward track, new content teasers and catch-up information visible.
- `ACTIVE`: season XP, season quests, league and seasonal store enabled.
- `CLOSING`: countdown highlighted; risky configuration changes frozen.
- `LOCKED`: season-scoped ranking mutations and seasonal transfers disabled.
- `VERIFYING`: anti-abuse checks and final ranking snapshots run.
- `REWARDED`: rewards become claimable or are auto-delivered.
- `ARCHIVED`: season becomes read-only history.

## 2. Season identity and theme

Each season requires a strong product theme that affects content, visuals and goals, not only the banner.

### 2.1 Season 1 — First Capital

Theme: establish the first stable personal economy.

Core experiences:

- first profession mastery milestones;
- first WDX portfolio and market journal;
- first starter business;
- city-life collection set;
- beginner club cooperation;
- education around budgeting and diversification.

Featured reward identity:

- `S1 Pioneer` title;
- `Founding Ledger` profile badge;
- `First Capital` profile frame;
- city-map collectible set;
- season trophy variants.

### 2.2 Season 2 — Industrial Expansion

Theme: businesses, logistics and production networks expand across the Moneyverse.

Planned additions:

- new fictional issuer `WDX-MFG — Woldeok Manufacturing`;
- new fictional issuer `WDX-INF — Metro Infrastructure`;
- manufacturing and logistics job variants;
- workshop and warehouse business archetypes;
- industrial collection series;
- club cooperative production objectives;
- new business analytics dashboard challenge.

The next season must introduce at least one meaningful new content axis and one returning-system variation; it should not be only a new reward skin.

## 3. Participation and eligibility

### 3.1 Participation

All eligible authenticated accounts automatically receive a season profile on first season-related activity. A manual “Join Season” gate is not required unless legal/product policy later requires explicit participation.

Eligibility defaults:

- account created successfully;
- not suspended/restricted from competitive systems;
- season terms/version acknowledged when required;
- server time inside valid participation window.

### 3.2 Mid-season joiners

Players joining after season start must not be permanently locked out of completion.

Catch-up baseline:

- join days 1–14: no catch-up multiplier;
- join days 15–28: +15% season XP on eligible non-repeatable catch-up missions;
- join days 29–42: +30%;
- join days 43–49: +45%;
- final 7 days: +60% on catch-up mission XP only.

Catch-up multipliers must not apply to competitive league score or repeatable economy payouts.

### 3.3 Returning players

A player absent for 14+ days receives a return bundle containing:

- personalized season recap;
- 3 catch-up missions;
- one cosmetic or collection-choice token;
- no large WLD grant;
- recommended next action based on unfinished season milestones.

## 4. Season level and XP economy

### 4.1 Default structure

- 50 season levels.
- 1,000 XP per level for initial release.
- Total to level 50: 50,000 XP.
- XP is season-scoped and never converts to WLD.

### 4.2 XP sources

Planning budget for 8 weeks:

| Source | Maximum | Design role |
|---|---:|---|
| Daily missions | 25,200 XP | regular light engagement |
| Weekly missions | 20,000 XP | broader system exploration |
| Season story missions | 8,000 XP | themed progression |
| Event missions | 6,000 XP | live-ops variety |
| Catch-up missions | variable/capped | late entry recovery |

A normal 4-days-per-week player should reach level 40–45. Level 50 should require consistent participation but not perfection.

### 4.3 XP anti-grind rules

- no XP for raw trade count;
- no XP for repeatedly buying/selling the same item solely to farm actions;
- no XP for self-transfer loops;
- repeatable missions have daily/weekly caps;
- duplicate request/replay must return the original result, not a second reward.

## 5. Reward track

### 5.1 Reward philosophy

Season rewards should prioritize:

1. identity and prestige;
2. collection completion;
3. convenience without earning-power advantage;
4. content access/preview;
5. small bounded economy rewards.

The next season must never become easier to dominate merely because a player ranked highly in the previous season.

### 5.2 Free track

Moneyverse should initially launch with a fully usable free track. Example milestones:

| Level | Reward |
|---:|---|
| 1 | season profile marker |
| 5 | 300 WLD + sticker |
| 10 | themed collectible |
| 15 | profile accent |
| 20 | season token bundle |
| 25 | title fragment |
| 30 | business decoration |
| 35 | themed collectible |
| 40 | full season title |
| 45 | animated profile effect |
| 50 | season completion trophy + frame |

Total WLD in the entire reward track must remain small relative to normal 8-week earned income.

### 5.3 Optional premium track policy

If a paid track is introduced later, it must be cosmetic/collection focused.

Forbidden premium benefits:

- higher job payout;
- higher stock return;
- better price execution;
- lower loan cost;
- exclusive competitive information;
- league starting balance advantage;
- faster business profit generation;
- purchasable leaderboard points.

Allowed examples:

- alternate frame art;
- additional profile effects;
- extra decorative variants;
- soundtrack/theme pack;
- duplicate-free cosmetic choice box.

## 6. Seasonal currency and store

### 6.1 Currency

Planning currency: `Season Token` (`ST`).

Properties:

- earned only from season missions/events/level milestones;
- non-transferable;
- non-purchasable with WLD at launch;
- cannot be traded between players;
- cannot convert to WLD;
- persisted in a separate season balance ledger.

### 6.2 Issuance budget

Target total earnable per regular season: 500–700 ST.

A consistent player should afford 60–75% of the season catalog, requiring meaningful choices while avoiding impossible completion pressure.

### 6.3 Example seasonal SKUs

| SKU | Item | Price | Limit | Carryover value |
|---|---|---:|---:|---|
| S1-PF-PIONEER | Pioneer Frame | 80 ST | 1 | permanent cosmetic |
| S1-TITLE-CAPITAL | First Capital title | 60 ST | 1 | permanent title |
| S1-COL-MAP-A | District Map A | 35 ST | 1 | permanent collectible |
| S1-COL-MAP-B | District Map B | 35 ST | 1 | permanent collectible |
| S1-DEC-LEDGER | Founding Ledger desk prop | 70 ST | 1 | permanent decoration |
| S1-THEME-CITY | First Capital dashboard theme | 120 ST | 1 | permanent cosmetic |
| S1-CLUB-BANNER | Founders club banner | 100 ST | 1/club | permanent club visual |

### 6.4 Currency expiry

Default policy:

- 20% of unused ST, capped at 100 ST, converts to `Legacy Token` at season archive;
- remaining ST expires;
- Legacy Token can buy only archived cosmetics/collection items, not economy power;
- conversion happens once through an idempotent settlement operation.

This creates continuity without encouraging infinite hoarding.

## 7. Seasonal quests and achievements

### 7.1 Quest layers

- daily: 2–4 light actions;
- weekly: 5 core + 2 optional mastery actions;
- season story: 8–12 chapters;
- event: limited-time themed tasks;
- mastery: long-horizon non-expiring within the active season.

### 7.2 Example Season 1 story chapters

1. First Paycheck
2. Build a Budget
3. Know Your Market
4. Diversify
5. Open for Business
6. Join the City
7. Review Your Decisions
8. Capital Week Finale

### 7.3 Anti-FOMO policy

- missed daily tasks do not destroy streak progress;
- key story quests remain available until the season closes;
- final-week catch-up opens prior missed story chapters;
- limited event cosmetics must have a documented future archive/rotation policy.

## 8. Competitive league and rank

### 8.1 Isolation from main economy

Season market league uses separate `League WLD` with equal starting balance, e.g. 100,000 League WLD.

It must never borrow the player's main WLD, main portfolio or paid inventory.

### 8.2 Ranking model

Suggested composite score:

- 45% risk-adjusted return;
- 25% maximum-drawdown score;
- 15% diversification score;
- 15% learning/journal completion.

Raw profit alone must not determine rank.

### 8.3 Rank tiers

Example:

- Bronze
- Silver
- Gold
- Platinum
- Diamond
- Capital Master

Rank rewards are primarily cosmetic/prestige.

### 8.4 Top-rank reward cap

The value gap between participation and top-rank economy rewards must remain narrow.

Example final rewards:

| Result | Permanent reward | Economy reward |
|---|---|---:|
| Participated | S1 Participant badge | 100 WLD |
| Top 50% | Bronze season mark | 150 WLD |
| Top 20% | Silver frame variant | 250 WLD |
| Top 5% | Gold title + trophy | 400 WLD |
| Top 1% | `S1 Capital Master` title + animated frame | 500 WLD |
| Rank 1–10 | numbered trophy variant | still max 500 WLD |

Prestige grows strongly; WLD advantage does not.

## 9. Reset and persistence matrix

Season transitions must explicitly define what resets.

| System | Season end policy |
|---|---|
| Account level | keep |
| Profession mastery | keep |
| Main WLD balance | keep |
| Main bank/debt | keep |
| Main stock holdings | keep unless separate market policy says otherwise |
| Owned businesses | keep |
| Collections | keep |
| Titles / profile cosmetics | keep |
| Club membership | keep |
| Season XP / level | archive then reset |
| Season Tokens | partial Legacy conversion then expire |
| League WLD | reset completely |
| League ranking score | archive then reset |
| Seasonal quest state | archive/read-only |
| Seasonal shop availability | close/archive |
| Season badge/trophy | permanent |

No permanent user asset may be reset merely because a season ends unless the system was explicitly marked season-scoped before the user acquired it.

## 10. Season closing and settlement

### 10.1 Closing notifications

Required user-facing schedule:

- **D-14:** season-end date, incomplete major goals, next-season first teaser.
- **D-7:** reward-track progress projection and catch-up recommendations.
- **D-3:** seasonal store reminder and next-season theme reveal.
- **D-1:** exact closing time, settlement lock explanation, unclaimed rewards summary.
- **H-1:** final non-intrusive banner; no manipulative alarm-style messaging.

### 10.2 Lock window

During `LOCKED`:

- league orders disabled;
- league ranking mutations disabled;
- season-token spending disabled after configured cutoff;
- final snapshots created;
- main economy remains available unless a shared integrity dependency requires a narrow lock.

The product must clearly distinguish “season league locked” from “service unavailable”.

### 10.3 Snapshot data

Final snapshot must include at minimum:

- `season_id`;
- user ID;
- final season XP/level;
- quest/achievement completion;
- league score inputs;
- rank/tier;
- seasonal currency balance;
- earned but unclaimed rewards;
- abuse-review status;
- snapshot timestamp/version.

### 10.4 Tie-breaking

Recommended order:

1. higher composite score before rounding;
2. lower max drawdown;
3. higher diversification score;
4. earlier timestamp reaching final score;
5. true tie -> shared rank, identical reward tier.

Never use additional spending as a tie-breaker.

## 11. Anti-abuse verification before rewards

High-rank rewards must enter `PENDING_VERIFICATION` before final issue.

Checks include:

- self-trading or circular-trading clusters;
- repeated counterparties beyond policy threshold;
- impossible action frequency;
- duplicate idempotency keys with mismatched payload;
- referral/multi-account linkage signals;
- season-boundary timestamp manipulation attempts;
- abnormal score jumps;
- staff/admin modifications requiring audit review.

A review must not silently confiscate unrelated permanent assets. Only affected seasonal rank/reward state is held unless separate abuse policy applies.

## 12. Reward delivery

### 12.1 Delivery model

Every season reward assignment needs a deterministic key such as:

`season_reward:{season_id}:{user_id}:{reward_code}`

The key must be unique at database level where practical.

### 12.2 Unclaimed rewards

Default policy:

- earned track rewards auto-deliver at archive if still unclaimed;
- choice rewards move to mailbox for 30 days;
- if a choice reward expires, convert to a predefined non-random fallback collectible/token;
- no earned permanent reward disappears without a published rule.

### 12.3 Re-settlement

If a ranking defect is found:

- create a new settlement version;
- do not mutate the original snapshot silently;
- compare previous vs recalculated awards;
- issue missing rewards idempotently;
- reclaim only clearly invalid seasonal rewards under published policy;
- maintain operator audit trail.

## 13. Next-season preview and continuity

### 13.1 Reveal schedule

Default reveal cadence:

- D-21: cryptic visual/theme teaser;
- D-14: season name and broad theme;
- D-7: headline feature + first new stock/business/job;
- D-3: reward-track preview and season calendar;
- D-1: full patch notes, reset matrix and launch time.

### 13.2 Next-season reward preview

The preview page must show:

- free-track headline rewards;
- final level reward;
- ranked prestige rewards;
- seasonal store sample items;
- what is cosmetic vs economy-related;
- which assets are permanent;
- which currencies expire;
- exact season dates.

### 13.3 Consecutive-season recognition

Continuity rewards should be status-focused:

- 2 consecutive seasons: profile streak marker;
- 4 seasons: legacy badge variant;
- 8 seasons: archive showcase slot/title;

Do not provide permanent income multipliers for attendance streaks.

## 14. Season archive and Hall of Fame

Each archived season receives a read-only page containing:

- season theme/art;
- date range;
- major content introduced;
- personal final level/tier;
- earned season badges;
- personal recap metrics;
- top verified league players;
- historical reward catalog;
- patch/operations summary.

Hall of Fame visibility must respect profile privacy settings. Users may hide public ranking identity while retaining personal archive history.

## 15. UX requirements

### 15.1 Season home

Must show:

- current season name/theme;
- time remaining;
- current level and XP to next;
- up to 3 recommended season objectives;
- reward-track preview;
- weekly progress;
- league status;
- next major event.

### 15.2 Required UI states

- preseason preview;
- active normal;
- active catch-up eligible;
- reward claimable;
- reward claimed;
- closing countdown;
- season locked/settling;
- reward verification pending;
- season ended;
- archived season;
- next season announced;
- emergency paused.

### 15.3 Countdown ethics

Countdowns must convey schedule information, not simulate false scarcity. Do not use flashing warnings, fake inventory scarcity, or repeated full-screen interruptions to pressure engagement.

## 16. Backend/data model requirements

Suggested entities:

- `seasons`
- `season_configs`
- `season_user_progress`
- `season_xp_events`
- `season_missions`
- `season_user_missions`
- `season_reward_definitions`
- `season_reward_grants`
- `season_currency_accounts`
- `season_currency_ledger`
- `season_league_entries`
- `season_final_snapshots`
- `season_abuse_reviews`
- `season_archives`

Minimum season config fields:

- `season_id`
- `slug`
- `name`
- `state`
- `timezone`
- `preseason_at`
- `starts_at`
- `closing_at`
- `lock_at`
- `ends_at`
- `reward_release_at`
- `archive_at`
- `xp_curve_version`
- `reward_table_version`
- `currency_policy_version`
- `league_policy_version`
- `content_manifest_version`

All state-changing season APIs must enforce authorization, effective season state, input validation, server time, idempotency where relevant and ledger invariants.

## 17. API surface planning

Read APIs:

- `GET /season/current`
- `GET /season/current/progress`
- `GET /season/current/rewards`
- `GET /season/current/missions`
- `GET /season/current/store`
- `GET /season/current/league`
- `GET /season/next/preview`
- `GET /season/archive`
- `GET /season/archive/:seasonId`

Mutation APIs:

- `POST /season/rewards/:rewardId/claim`
- `POST /season/store/purchase`
- `POST /season/choice-rewards/:rewardId/select`

Operator mutations must be separate, strongly authorized and audited.

## 18. Scheduler and operations

Required automated jobs:

- season state transition scheduler;
- daily/weekly mission rollover;
- closing notification scheduler;
- final snapshot job;
- ranking calculation;
- abuse-review candidate generation;
- reward release;
- unclaimed reward auto-delivery;
- currency conversion/expiry;
- archive finalization.

Each job must be safe to retry and must expose execution status/metrics.

## 19. Admin console

Operators need:

- season calendar editor before activation;
- content/reward preview;
- config diff view;
- mission enable/disable with reason;
- emergency pause;
- season extension control;
- ranking recalculation preview;
- reward-release gate;
- abuse-review queue;
- user season progress lookup;
- settlement job status;
- config/audit history.

Dangerous operations require fresh admin authentication and existing high-risk admin safeguards.

### 19.1 Configurable without application deployment

Safe config examples:

- season dates before `CLOSING` freeze;
- mission availability windows;
- XP values within validated bounds;
- catalog availability;
- announcement text/assets;
- reward quantities within policy caps;
- event schedule.

Not safely mutable after activation without explicit migration/versioning:

- ledger semantics;
- reward ownership model;
- score formula meaning after competitive play begins;
- settlement idempotency scheme;
- fundamental currency conversion semantics.

## 20. Season economy controls

Before season launch, operations must approve a reward budget.

Track:

- WLD issued through season rewards;
- WLD burned by seasonal sinks;
- ST issued/spent/expired;
- average WLD reward per active player;
- top 1%/10% season reward concentration;
- share of total monthly WLD issuance caused by the season;
- average end-of-season liquid balance change.

Initial policy target: direct season WLD rewards should remain a minority of normal earned income and should not materially shift inflation by themselves.

If economy health worsens, reduce future reward issuance or increase optional cosmetic sinks; never retroactively delete legitimately earned balances.

## 21. Analytics and KPIs

Core events:

- `season_viewed`
- `season_joined`
- `season_mission_started`
- `season_mission_completed`
- `season_level_up`
- `season_reward_claimed`
- `season_store_purchase`
- `season_catchup_started`
- `season_preview_viewed`
- `season_league_entered`
- `season_archive_viewed`

Primary KPIs:

- season participation rate;
- D1/D7/D30 retention split by season participation;
- median season level;
- level-50 completion rate;
- weekly mission completion rate;
- catch-up completion rate;
- reward claim rate;
- seasonal store conversion using earned ST;
- league participation and repeat participation;
- next-season preview -> next-season activation conversion;
- season inflation contribution;
- abuse hold/reversal rate.

Guardrail KPIs:

- excessive session-length increase;
- excessive trade-frequency increase;
- user reports of pressure/confusion;
- support contacts around expiry/reset;
- economy concentration changes.

## 22. A/B experiments

Allowed examples:

- 6 vs 8 recommended weekly objectives;
- next-season teaser timing D-14 vs D-10;
- catch-up mission presentation style;
- reward-track horizontal vs milestone-map UI;
- personalized next objective vs fixed objective list.

Never A/B test hidden odds, deceptive scarcity or undisclosed economic disadvantages.

## 23. Failure, extension and emergency policy

### 23.1 Extension

A season may extend only for material service disruption or major launch failure. Extension must:

- be globally consistent;
- update server schedule/config;
- preserve already earned progress;
- be publicly announced with exact new end time;
- avoid silently changing reward requirements.

### 23.2 Emergency pause

Pause when ranking/economy integrity is at risk. During pause:

- affected scoring stops;
- user progress already earned remains;
- status page/banner explains affected systems;
- unrelated core service can remain online.

### 23.3 Cancellation

Cancellation is last resort. If unavoidable:

- preserve permanent earned cosmetics where safe;
- provide a fair published fallback reward based on verified progress;
- do not issue massive WLD compensation;
- archive incident reason and settlement version.

## 24. Season launch checklist

Before every season:

- season config validated;
- reward catalog validated;
- XP budget simulation passed;
- economy issuance budget approved;
- all reward IDs unique;
- server-side idempotency verified;
- season currency cannot transfer to main WLD;
- league starts equal for all eligible users;
- catch-up math tested;
- reset/persistence matrix verified;
- D-14/D-7/D-3/D-1 messaging scheduled;
- next-season preview content prepared;
- abuse rules enabled;
- admin console rollback path tested;
- archive template ready;
- analytics schema verified;
- accessibility/mobile states tested;
- English/Korean content parity checked.

## 25. Definition of Done

The season system is not considered implementation-complete until:

1. lifecycle state machine is server authoritative and restart-safe;
2. season progress/reward writes are transactionally safe and idempotent;
3. reset vs persistence behavior is covered by automated tests;
4. season reward budget and currency ledger reconcile;
5. ranking snapshot and tie-breaks are deterministic;
6. abuse review can hold rewards without damaging unrelated assets;
7. next-season preview and closing UX exist for all required states;
8. missed rewards follow documented auto-delivery/mailbox policy;
9. scheduler jobs are observable and retry-safe;
10. staging validates exact season transitions using accelerated test dates;
11. production rollout has rollback/re-settlement procedures;
12. English-primary and Korean-parity documentation is complete.

## 26. Planned seasonal roadmap

### Season 1 — First Capital

Focus: onboarding, professions, budgeting, first portfolio, starter businesses, collections.

### Season 2 — Industrial Expansion

Focus: manufacturing/logistics, new issuers, business networks, club cooperative objectives.

### Season 3 — Innovation Cycle

Candidate focus: technology/research issuers, creator/technician mastery, product-launch events, research collection sets.

### Season 4 — City Alliance

Candidate focus: clubs, cooperative city goals, community projects, shared cosmetic landmarks.

Every future season proposal must specify theme, gameplay changes, new content, reward identity, economy budget, reset impacts, abuse risks and carryover into the following season before approval.
