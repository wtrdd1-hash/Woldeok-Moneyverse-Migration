# Woldeok Moneyverse — Detailed Product Design Specification

> Version: v2026.09.12.2
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`
> Korean counterpart: [PRODUCT_DESIGN_SPEC.ko.md](PRODUCT_DESIGN_SPEC.ko.md)

## 0. Purpose and boundaries

This document turns the growth plan into a buildable product specification. It defines player journeys, feature rules, example values, UI states, economy flows, stock-market parameters, shop SKUs, progression, social loops, live operations, abuse controls, analytics and rollout gates.

All monetary examples are planning defaults, not production constants. Final values must be versioned server/database policy. WLD, stock positions, league balances and rewards remain service-internal virtual data and do not represent real securities, deposits, investment returns, gambling value or cash redemption rights.

Design principle: every major system should answer four questions: what the user does, why they do it now, what state changes, and what gives them a reason to return later.

## 1. Product vision and target users

### 1.1 Product promise

Woldeok Moneyverse is a persistent social economy game where users build an identity through jobs, collecting, businesses, banking, virtual markets, quests and community participation. The product should feel like a living city/economy rather than a collection of disconnected menus.

### 1.2 Primary player segments

| Segment | Motivation | Risk | Product response |
|---|---|---|---|
| Explorer | discover systems/lore | feature overload | progressive unlocks and guided next action |
| Collector | complete sets/status | grind fatigue | visible set milestones and rotating non-random catalog |
| Optimizer | improve income/portfolio | exploit loops | bounded economy, transparent rules, analytics |
| Social player | friends/clubs/status | toxicity/privacy | opt-in visibility, clubs, cooperative goals, moderation |
| Market learner | virtual trading/strategy | excessive trading framing | journals, diversification goals, risk education, cooldowns |
| Returning casual | short useful sessions | falling behind | 5-minute loop, comeback missions, no hard streak punishment |

### 1.3 Non-goals

- no guaranteed-profit language;
- no real-money stock mirroring that could be misunderstood as brokerage activity;
- no pay-to-win purchase path;
- no hidden-probability monetization;
- no infinite compound-return system;
- no retention mechanic that requires punitive streak loss or manipulative urgency.

## 2. Information architecture

Primary authenticated navigation:

1. **Home** — next action, daily status, events, watchlist, recent progress.
2. **Earn** — jobs, profession mastery, quests.
3. **Market** — virtual stocks, watchlist, portfolio, replay/challenges.
4. **Business** — owned businesses, operations, inventory, settlement.
5. **Bank** — balances, savings/loan products, repayment status.
6. **Shop** — catalog, collections, seasonal exchange, inventory.
7. **Community** — posts, stock-tagged discussion, clubs, friends.
8. **Season** — season level, weekly objectives, league, rewards.
9. **Profile** — identity, titles, achievements, collections, privacy.

The dashboard must never show more than three primary recommended actions at once. Lower-priority modules appear below the fold or behind “More”.

Every feature screen needs: loading, empty, locked, partial-data, server-error, maintenance and permission-denied states. Economy mutations additionally require pending, success, idempotent-replay and rejected states.

## 3. New-user lifecycle

### 3.1 First 3 minutes

Target outcome: user understands “earn → choose → progress”.

1. Pick display name and one free profile theme.
2. Receive **5,000 WLD Starter Grant** through a dedicated ledger transaction type.
3. Complete guided job **City Delivery**: 45–90 seconds, reward 600 WLD + 80 XP.
4. Buy one starter collectible priced at 300–500 WLD.
5. Select one WDX stock for watchlist; no trade required yet.
6. Show “Tomorrow: unlock your first market lesson” teaser.

Guardrails: starter grant once per verified internal account; idempotent claim; referral rewards not paid at this stage.

### 3.2 Day 1 activation checklist

Activation is achieved when the user completes 4 of 5:

- complete 2 verified jobs;
- own 1 shop item;
- watch 1 stock;
- open portfolio tutorial;
- claim 1 quest reward.

Target reward: 250 season XP + cosmetic “First Shift” badge. Avoid large WLD bonuses.

### 3.3 D2–D7 curriculum

| Day | New concept | Required action | Example reward |
|---|---|---|---|
| D2 | virtual market | make one capped tutorial trade | 100 market XP |
| D3 | collections | complete a 2-item starter set | title fragment / 100 season XP |
| D4 | business | inspect starter business simulation | 150 business XP |
| D5 | bank | deposit into a non-speculative savings tutorial | 100 account XP |
| D6 | social | follow one user or join newcomer club | profile sticker |
| D7 | weekly recap | review earnings, spending, portfolio and goals | weekly badge + 300 season XP |

No day is permanently missable. Missed lessons move to “Recommended” rather than resetting progression.

## 4. Session and retention architecture

### 4.1 Five-minute daily loop

- 0:00–0:30: dashboard shows one personalized recommended action.
- 0:30–2:00: complete quick job/quest action.
- 2:00–3:30: review one stock/business/shop change.
- 3:30–4:30: claim progress and inspect next unlock.
- 4:30–5:00: optional social/share or tomorrow preview.

### 4.2 Weekly loop

A weekly cycle contains 5 core missions + 2 optional mastery missions. Completion threshold is 4 core missions, so missing one activity does not break the week.

Example core missions:
- complete jobs on 3 separate days;
- spend at least 1,000 WLD in valid sinks;
- make 2 virtual-market decisions on separate days;
- finish one collection milestone;
- complete one community or club activity.

### 4.3 Season model

Default planning season: 8 weeks, 50 levels.

- 1 level = 1,000 Season XP.
- Daily mission package: up to 450 XP/day.
- Weekly missions: up to 2,500 XP/week.
- Event missions: capped 1,500 XP/week.
- A player active 4 days/week should be able to reach level 40–45 without perfect completion.
- Level 50 is achievable with consistent participation, not purchase.

Rewards emphasize titles, frames, themes, collection items, profile effects and commemorative trophies. Any WLD reward is small and bounded.

## 5. WDX virtual stock market

### 5.1 Initial issuers

All issuers are fictional. Initial planning parameters:

| Ticker | Issuer | Sector | Ref price | Shares | Market cap | Base daily vol | Soft daily band |
|---|---|---:|---:|---:|---:|---:|---:|
| WDX-TEC | Woldeok Systems | Technology | 1,200 WLD | 1,000,000 | 1.20B WLD | 3.0% | ±12% |
| WDX-FIN | DuckBank Holdings | Finance | 850 WLD | 1,400,000 | 1.19B WLD | 1.8% | ±8% |
| WDX-RET | Maple Market | Retail | 620 WLD | 1,800,000 | 1.12B WLD | 2.2% | ±10% |
| WDX-LOG | BlueRoute Logistics | Logistics | 740 WLD | 1,400,000 | 1.04B WLD | 2.0% | ±9% |
| WDX-ENE | Hanbit Energy | Energy | 980 WLD | 1,100,000 | 1.08B WLD | 2.8% | ±11% |
| WDX-BIO | Mirae BioLab | Health | 1,450 WLD | 750,000 | 1.09B WLD | 4.0% | ±15% |
| WDX-ENT | Moonlight Media | Entertainment | 560 WLD | 1,900,000 | 1.06B WLD | 3.2% | ±12% |
| WDX-IND | Woldeok Composite | Index basket | 1,000 WLD | synthetic | n/a | 1.2% | ±6% |

These values are tuning seeds only. Price, share count and bands are server policy and require simulation before release.

### 5.2 Market hours

Recommended initial model: continuous in-service market with a predictable daily settlement window, not real-world exchange hours.

- Market open: 00:10–23:50 service time.
- 23:50–00:10: settlement/maintenance; new orders rejected with next-open notice.
- Candle intervals: 5m, 1h, 1d.
- Event publication windows: 09:00, 15:00, 21:00 preferred for planned content.

### 5.3 Price engine

Planning model per tick:

`return = market_factor + sector_factor + issuer_event + bounded_order_imbalance + mean_reversion + noise`

Required controls:
- each component independently capped;
- aggregate order-imbalance impact capped per account and per linked-risk cluster;
- one account cannot move reference price materially through self-cross or repeated micro-orders;
- daily soft band triggers reduced impact/liquidity before hard halt;
- hard halt only for policy-defined integrity events, not normal losses.

Price formation must be deterministic/replayable from persisted inputs where practical for auditability.

### 5.4 Orders

P0 supports:
- market buy/sell by share quantity;
- optional simple limit order after matching engine readiness;
- max 20 open orders/account;
- max single-order notional: lower of 20% of liquid WLD or policy cap;
- tutorial accounts: max 5 shares/trade for first three trades;
- server-side available-funds/share reservation;
- idempotency key mandatory for order placement/cancel where state-changing.

P1 can add good-for-day limit orders. Stop/leveraged/margin/short products are out of scope until explicit product/legal review.

### 5.5 Fees and sinks

Initial planning fee: 0.20% per executed side, minimum 1 WLD, rounded by integer policy. Half can be burned and half routed to a system treasury account for transparent economy accounting. Tutorial trades may receive fee waiver but still record hypothetical fee for learning.

### 5.6 Issuer events

Each issuer has event families with probability/operations schedule, effect range and duration.

Examples:
- WDX-TEC: product release +2% to +8%, security incident -4% to -10%.
- WDX-FIN: loan default deterioration -2% to -6%, strong repayment cycle +1% to +4%.
- WDX-RET: seasonal shop festival +2% to +6%, inventory disruption -2% to -5%.
- WDX-LOG: high business volume +1% to +5%, route outage -3% to -7%.
- WDX-BIO: research milestone +3% to +10%, failed study -4% to -12%.

Events must disclose that they are fictional game events. No event should intentionally mimic material non-public information about a real company.

### 5.7 Market mastery

Market XP rewards behaviors rather than raw profit:
- first watchlist: 50 XP;
- first trade journal entry: 75 XP;
- hold 3-sector diversified portfolio for 3 days: 150 XP;
- complete risk tutorial: 100 XP;
- review a losing trade: 75 XP;
- finish historical replay: 150 XP.

Profit leaderboard is secondary. Main market mastery ranking uses completion, diversification, journal activity and risk-adjusted challenge score.

### 5.8 Replay and league

Historical replay uses isolated replay balances and snapshots. Seasonal league uses equal non-spendable starting balance, e.g. 100,000 League WLD. League WLD cannot transfer to main WLD. Rewards are cosmetics/titles and capped season XP.

Ranking should use a combination such as total return, max drawdown and diversification rather than return alone.

## 6. Shop and item specification

### 6.1 Item classes

- **Cosmetic:** profile frame, avatar border, theme, title effect.
- **Collectible:** set item with collection score.
- **Decoration:** business/profile showcase object.
- **Utility-neutral:** extra saved dashboard layout or watchlist slot; no higher earning rate.
- **Event exchange:** item purchased with earned event tokens.

### 6.2 Example launch SKUs

| SKU | Item | Type | Price | Availability | Limit | Effect |
|---|---|---|---:|---|---:|---|
| PF-BASIC-BLUE | Blue Circuit Frame | cosmetic | 400 WLD | permanent | 1 | profile visual |
| TITLE-FIRSTSHIFT | First Shift | title | quest only | permanent | 1 | identity |
| COL-CITY-001 | Transit Card Replica | collectible | 350 WLD | permanent | 1 | City Life set |
| COL-CITY-002 | Mini Delivery Bag | collectible | 550 WLD | weekly rotation | 1 | City Life set |
| THEME-MARKET | Market Terminal Theme | cosmetic | 2,500 WLD | permanent | 1 | dashboard skin |
| DEC-BIZ-PLANT | Office Plant | decoration | 1,200 WLD | permanent | 3 | business visual |
| SEASON-S1-FRAME | Season One Frame | cosmetic | season token 80 | S1 only | 1 | commemorative |
| CLUB-BANNER-01 | Club Banner Style A | cosmetic | 5,000 club points | permanent | 1/club | club identity |

### 6.3 Shop rotations

- Permanent catalog: at least 20 low/medium-price items.
- Weekly rotation: 6–10 items; next rotation time always visible.
- Season catalog: 10–20 items with published end date.
- No item may display “only X left” unless server inventory is actually finite.
- Returning seasonal cosmetics require documented rotation policy; “exclusive forever” claims are prohibited unless genuinely permanent policy.

### 6.4 Purchases

Purchase contract validates active SKU, effective price, ownership, per-user limit, global stock, balance, event eligibility and idempotency atomically. Duplicate ownership returns a stable domain error and does not debit again.

Refund policy for virtual WLD purchases: automatic reversal only for server error/duplicate fault; ordinary buyer remorse is not guaranteed. Any real-money purchase added later requires separate refund/legal design.

## 7. Jobs and professions

### 7.1 Profession tracks

Launch candidates:
- Courier
- Retail Assistant
- Analyst
- Technician
- Creator
- Operator

Each profession has 20 mastery levels initially.

Planning XP curve: `XP_to_next = 100 + 25*(level-1) + 10*(level-1)^2` with a server table materialized for tuning.

### 7.2 Job templates

| Job | Duration target | Reward | XP | Cooldown | Risk/control |
|---|---:|---:|---:|---:|---|
| City Delivery | 45–90s | 600 WLD | 80 | 5m | beginner capped |
| Shelf Audit | 2–3m | 950 WLD | 120 | 10m | answer verification |
| Market Brief | 3–5m | 1,200 WLD | 150 | 20m | no profit prediction requirement |
| System Check | 4–6m | 1,500 WLD | 180 | 30m | higher mastery gate |

Rewards must be calibrated against median daily sinks. Jobs cannot be endlessly parallelized or claimed via client timer alone.

## 8. Business system

### 8.1 Starter businesses

Examples: kiosk, delivery office, small studio, repair shop. Business unlock at account level 8 + relevant profession level 5 + one business tutorial.

### 8.2 Business economics

Daily net result:

`revenue - inventory_cost - staffing_cost - maintenance - service_fee = net_result`

Revenue depends on business rating, inventory availability, demand index, owner activity and bounded random/event factor. No guaranteed positive return.

Starter business target: 2,000–8,000 WLD/day gross with typical 10–30% net margin when actively managed. Inactive/poorly supplied businesses can break even or lose modestly.

Settlement once/day per business with advisory locking/idempotency. Ownership must be revalidated on replayed settlement requests.

## 9. Banking and loans

Banking is a game-economy tool, not a real deposit product.

### 9.1 Savings

If interest exists, it must be bounded, policy-funded and low enough not to dominate active play. Planning example: 0.03% daily equivalent with balance cap eligible for rewards. This is an economy parameter, not promised yield.

### 9.2 Loans

Starter loan example:
- principal: 10,000–50,000 WLD;
- unlock: account level 10 + repayment tutorial;
- term: 7 or 14 days;
- flat planning service cost: 2–4% equivalent;
- one active loan initially;
- loan-funded WLD enters via a dedicated treasury/liability transaction path, not invisible minting.

Arrears reduce future borrowing limits and can trigger repayment missions, but must not lock a player out of core gameplay permanently.

## 10. Quests, achievements and progression

### 10.1 Quest taxonomy

Daily: 3 quests, 2 required for daily completion.
Weekly: 5 core + 2 optional.
Season: milestone chains across at least three systems.
Tutorial: one-time educational chains.
Comeback: inactivity-triggered, 3-step capped assistance.

### 10.2 Daily examples

- Complete 1 verified job — 80 Season XP.
- Add/review a watchlist stock and read one event card — 60 Season XP.
- Spend 300+ WLD in an eligible sink — 60 Season XP.

Daily completion bonus: 120 Season XP, no escalating WLD streak multiplier.

### 10.3 Achievements

Achievements are permanent history and should not be farmable through reversible actions. Examples: 10 distinct job days, first completed collection, first profitable and first losing trade journal review, 30-day club participation, first fully repaid loan.

## 11. Social, clubs and competition

### 11.1 Friend/follow

Follow is one-way and suitable for public creators. Friend is mutual and may expose extra activity if both users opt in. Private balance is never exposed by default.

### 11.2 Clubs

Club size planning default: 5–30 members. Club features:
- weekly cooperative objective;
- club points;
- shared cosmetic unlocks;
- announcement feed;
- role-limited moderation;
- no shared withdrawal-capable treasury at initial release.

### 11.3 Weekly leagues

Opt-in cohorts of 20–50 users. Match by account age/activity and relevant mastery tier. League scoring rotates: quest breadth, collection progress, market challenge, business efficiency. Avoid permanent “richest player” dominance.

## 12. Notification policy

Channels: in-app first; optional Discord/email only with explicit user preference and supported integration.

Notification categories:
- account/security;
- transaction/settlement;
- quest/season;
- market/event;
- social/club;
- comeback.

Default marketing/gameplay notifications are conservative. Support quiet hours and per-category opt-out. Never send repeated “you are losing your streak” pressure messages.

## 13. Economy model

### 13.1 Faucets

- starter grant;
- verified jobs;
- bounded quests;
- business revenue funded by defined system accounts/policy;
- approved events;
- loan principal through explicit liability/treasury accounting.

### 13.2 Sinks

- shop purchases;
- stock execution fees;
- business inventory/maintenance;
- marketplace/listing fees where implemented;
- cosmetic crafting;
- event exchanges;
- loan service cost/repayment flows.

### 13.3 Health targets

Initial operational guardrails, to be calibrated from real data:
- weekly net WLD supply growth per active user should remain within a bounded target band;
- no single faucet should exceed 45% of routine weekly issuance for sustained periods;
- at least 25–40% of routine earned WLD should have attractive voluntary sinks by midgame;
- top 1% and top 10% wealth concentration tracked weekly;
- median new-user liquid balance after D7 should remain enough for at least 5–10 ordinary actions;
- insolvency recovery must be possible via starter-safe jobs without new borrowing.

These are monitoring bands, not automatic policy triggers until sufficient samples exist.

## 14. Anti-abuse and integrity

### 14.1 Account abuse

Referral rewards require invited account age >= 3 days, tutorial complete, actions on >= 2 distinct days and no disqualifying risk flags. Referrer rewards are capped per week/month.

### 14.2 Market abuse

Detect self-cross, circular trading, repeated matched counterparties, burst orders, abnormal impact per notional, coordinated account clusters and suspicious transfer-to-trade patterns. Suspicious activity can be excluded from league ranking before punitive action.

### 14.3 Reward abuse

All claims have stable idempotency scope. Date-boundary rewards store eligibility period explicitly rather than trusting client date. Cooldown uses server/database timestamps.

## 15. Analytics event contract

Minimum events:
- `signup_completed`
- `tutorial_step_completed`
- `activation_completed`
- `job_started`, `job_completed`
- `shop_viewed`, `shop_purchase_completed`
- `stock_watch_added`
- `stock_order_submitted`, `stock_order_filled`
- `portfolio_viewed`
- `quest_completed`
- `season_level_up`
- `business_settled`
- `loan_started`, `loan_repaid`
- `club_joined`
- `league_joined`, `league_completed`
- `comeback_mission_started`, `comeback_mission_completed`

Events contain internal opaque user id, timestamp, feature/version and safe categorical attributes. Do not place balances, tokens or unnecessary personal data into analytics payloads.

## 16. KPI targets and diagnostics

Targets are product hypotheses and must be revised from observed cohorts.

Activation:
- >=70% of verified signups start tutorial;
- >=55% complete activation checklist;
- median time to first meaningful action <3 minutes.

Retention hypothesis:
- D1 >=35%;
- D7 >=15%;
- D30 >=8% after the product reaches stable onboarding/live-ops maturity.

Engagement:
- >=50% of WAU use at least two core systems/week;
- >=30% of WAU complete one weekly mission set;
- >=20% of market-active users maintain a watchlist.

Guardrails:
- abuse-adjusted reward error rate;
- economy reconciliation failures = 0 tolerated;
- negative balance invariants = 0 tolerated;
- unauthorized protected mutation = 0 tolerated;
- support complaints about pressure/manipulation tracked alongside retention.

## 17. Growth loops

### 17.1 SEO loop

Public indexable surfaces: game guides, fictional issuer pages, event rules, collection guides and public community index where policy allows. Each page has one relevant CTA into the exact feature after login.

### 17.2 Referral loop

Referral reward is milestone-based, not signup-based. Example:
- invitee activation: referrer gets non-cash badge progress;
- invitee D3 verified activity: both get 300 Season XP;
- invitee D7 milestone: referrer gets one cosmetic token, capped.

### 17.3 Share loop

Share cards: collection completion, season tier, weekly recap, replay challenge score. Never auto-share balances or exact private holdings.

## 18. Reactivation

Inactive 7+ days: show “Welcome Back” three-step plan:
1. review what changed;
2. complete one easy job or quest;
3. choose one next system.

Reward: 200–300 Season XP + temporary guidance, not a large WLD grant. Inactive 30+ days receives a simplified feature re-introduction if multiple systems changed.

## 19. Live operations calendar

Recommended cadence:
- daily: quest refresh, small market/event rotations;
- weekly: shop rotation, league, recap, one thematic objective;
- biweekly: larger fictional issuer/business event;
- 8-week: season reset with archived history and new cosmetics;
- monthly: economy review and parameter proposal;
- quarterly: feature mix review, stale content retirement, accessibility/UX audit.

Live-ops changes that affect money supply, stock pricing or business returns require versioned policy records and rollback plan.

## 20. Ethical design requirements

Recent finance-gamification research reports engagement and financial-literacy benefits, but also warns that gamified nudges can increase risk-taking, particularly for inexperienced users. Therefore Moneyverse must reward learning, diversification, review and progress rather than high-frequency trading or high volatility exposure.

Required rules:
- no confetti/celebration solely for making a trade;
- no “trade now before you miss out” prompts;
- no achievement for number of trades alone beyond basic onboarding;
- loss review and risk-awareness achievements have equal visibility to profit achievements;
- high-volatility assets clearly disclose in-game risk category;
- season/league scoring includes drawdown or diversification controls.

## 21. Delivery roadmap

### P0 — activation foundation

- analytics event contract;
- first-session checklist;
- dashboard recommended action;
- stock watchlist + issuer detail baseline;
- starter catalog/collections;
- daily quests;
- policy tables for economy parameters.

### P1 — retention

- weekly quests/recap;
- season 1 progression;
- business starter path;
- collection sets;
- comeback missions;
- notification preferences.

### P2 — social and market mastery

- friends/follows;
- clubs;
- weekly league;
- trade journal;
- diversified portfolio challenge;
- stock-tagged community.

### P3 — advanced simulation

- historical replay;
- strategy scorecards;
- isolated market competition balance;
- richer issuer event engine;
- policy simulation/admin tuning tools.

## 22. Definition of done for a feature

A product feature is not complete when only the UI exists. Done requires:

1. documented user goal and eligibility;
2. UI success/error/empty/locked/loading states;
3. server/database authoritative rules;
4. idempotency for value mutations;
5. analytics events;
6. abuse/rate-limit policy;
7. accessibility and mobile behavior;
8. tests for core and invalid paths;
9. staging validation against exact candidate revision;
10. English primary documentation + Korean parity;
11. changelog/worklog entry;
12. production smoke/reconciliation after approved promotion.

## 23. External evidence for this version

Current TradingView paper-trading documentation demonstrates a progression from simulated trading to order/position tracking, historical replay, measurable strategy reports and recurring competition. That supports a learn → practice → review → compete architecture, while Moneyverse keeps competition balances isolated from spendable WLD.

A 2026 systematic review of gamification in finance reports that points, badges, leaderboards and storytelling can improve engagement and financial literacy, but also identifies fatigue, cost and ethical risks. Experimental research also reports that gamified nudges can increase risk-taking, particularly under high volatility. Moneyverse therefore uses progression and social mechanics but avoids rewards that encourage trading frequency or risk exposure for its own sake.

## 24. Version record

### v2026.09.12.2 — detailed implementation-oriented planning pass

- Added explicit personas, IA and screen-state requirements.
- Added first-session, D1 and D2–D7 onboarding rules with example rewards.
- Added 8-week/50-level season pacing.
- Added fictional WDX stock parameters, market hours, price-engine constraints, order/fee/event rules and market mastery.
- Added concrete shop SKU examples, rotation and purchase policy.
- Added profession/job XP, business, banking and loan planning parameters.
- Added quest, achievement, club, league, notification and comeback rules.
- Added faucet/sink definitions, economy monitoring bands and anti-abuse controls.
- Added analytics events, product KPI hypotheses, ethical finance-gamification rules and feature Definition of Done.

This version changes documentation only. Runtime values require implementation, simulation, staging QA and the normal production promotion gates.
