# Woldeok Moneyverse — Product Growth & Retention Plan

> Version: v2026.09.12.1
> Status: Living product-planning companion to `PROJECT_PLAN.md`
> Date: 2026-09-12
> Korean counterpart: [PRODUCT_GROWTH_PLAN.ko.md](PRODUCT_GROWTH_PLAN.ko.md)

## 1. Product objective

Woldeok Moneyverse should become a persistent community economy game in which a member always has a useful next action: earn WLD, improve a profession, collect items, operate a business, study and trade virtual stocks, complete quests, compare progress with friends, or prepare for the next season/event.

The product must remain clearly virtual. WLD, stock positions and rewards have no promised cash value and are not real securities, deposits or investment returns.

## 2. Core player loops

### 2.1 Five-minute daily loop
1. Open the personal dashboard.
2. Review today's quest/event/watchlist changes.
3. Complete one short job or collection action.
4. Make or review one virtual-market decision.
5. Claim progress and see the next unlock.

Target: a returning user should find a meaningful action within 30 seconds and complete one useful loop within five minutes.

### 2.2 Weekly mastery loop
- complete a weekly quest chain;
- improve one profession or collection category;
- participate in a market/business challenge;
- compare results in a league/friends view;
- earn a non-cash seasonal cosmetic/title/collection reward.

### 2.3 Long-term loop
Seasonal progression should connect jobs, collections, businesses, virtual stocks and community participation. The user should build an identity and history rather than only accumulate an ever-growing WLD balance.

## 3. New-user journey

The first session should avoid presenting every system at once.

### Phase A — first 3 minutes
- choose a display identity/avatar theme;
- receive a safe starter WLD grant through the normal ledger;
- complete one guided job;
- buy one starter collection item;
- add one virtual stock to a watchlist.

### Phase B — first day
- unlock the dashboard after the tutorial checklist;
- show three recommended actions only: job, shop/collection, stock watchlist;
- introduce the first virtual-stock trade with a small capped tutorial allocation;
- show the next-day reward/quest without using punitive loss-aversion wording.

### Phase C — first 7 days
Each day introduces one major system: jobs, collections, virtual stocks, business, banking, social/league, then a weekly summary. Do not unlock high-complexity systems solely because the account exists; use verified progression conditions.

## 4. WDX virtual-stock product design

Virtual stocks should feel like a learnable game economy, not an opaque random-number generator.

### 4.1 Initial fictional universe
Use fictional issuers so the game can tune events without implying real-security investment advice. Proposed launch catalog:

| Ticker | Company | Sector | Gameplay identity |
|---|---|---|---|
| WDX-TEC | Woldeok Systems | Technology | higher volatility, event-sensitive |
| WDX-FIN | DuckBank Holdings | Finance | linked to in-game banking health |
| WDX-RET | Maple Market | Retail | shop/event demand exposure |
| WDX-LOG | BlueRoute Logistics | Logistics | business/market activity exposure |
| WDX-ENE | Hanbit Energy | Energy | cyclical/event-driven profile |
| WDX-BIO | Mirae BioLab | Health | research-event profile |
| WDX-ENT | Moonlight Media | Entertainment | community/event-sensitive |
| WDX-IND | Woldeok Composite | Index | diversified benchmark |

The catalog is a planning proposal until database/admin contracts exist.

### 4.2 Market state
Each stock needs server-defined fields for ticker, display name, sector, issue quantity, reference price, bounded volatility, intraday movement cap, market status, event sensitivity, and listing state. All price/settlement values preserve the existing integer WLD contract.

### 4.3 Price/event model
Price movement should combine bounded systemic movement, issuer/sector events, market-wide events and aggregate member activity with manipulation caps. No single account or small group should be able to generate unlimited self-reinforcing value.

Events can include product launches, supply shocks, service demand, regulation-style fictional events, earnings-style reports and sector-wide events. Event explanations should state that the market is fictional and game-controlled.

### 4.4 Trading progression
P0: watchlist + market/limit-like simple orders where supported.
P1: portfolio allocation, realized/unrealized P/L, trade journal, benchmark comparison.
P2: historical replay challenges and strategy scorecards.
P3: seasonal simulated-trading leagues with equal starting competition balances isolated from the main economy.

Competition accounts should be isolated from spendable WLD so leaderboard rewards cannot become an uncontrolled mint.

## 5. Shop and item system

The shop should provide identity, collection and strategic goals without pay-to-win economics.

### Product families
- profile frames, badges, titles and dashboard themes;
- collectible item sets with completion milestones;
- profession cosmetics and business decorations;
- seasonal cosmetics that can return through transparent rotation rules;
- utility unlocks such as additional saved watchlists or dashboard layouts only when they do not create economic advantage;
- event tokens that are earned by play and exchanged for event cosmetics/collections.

### Rotation rules
Maintain a permanent starter catalog plus a rotating weekly catalog and a clearly dated seasonal catalog. Limited inventory must have server-enforced stock and purchase limits. Never use fake scarcity or an undisclosed probability mechanism.

## 6. Progression, quests and streaks

Daily quests should contain one short action, one economy-learning action and one optional exploration action. Weekly quests should reward breadth across systems rather than repetitive farming.

Recommended progression layers:
- account level: broad feature literacy;
- profession mastery: depth in jobs;
- collector score: item-set completion;
- market mastery: safe educational milestones, not profit promises;
- business reputation: operational consistency;
- seasonal level: time-limited content progression.

A streak system, if implemented, should use a grace/recovery design rather than hard-reset punishment. Reward identity, cosmetics, small bounded utility and progression points; do not create an exponentially increasing WLD faucet.

## 7. Social and competition systems

- friend/follow relationship with privacy controls;
- opt-in weekly leagues grouped by comparable activity/progression;
- clubs/guilds with cooperative objectives and non-cash club cosmetics;
- shareable portfolio/collection/achievement cards that never expose private balances without explicit choice;
- stock-tagged community discussions;
- friend challenges based on completion, diversification or learning objectives rather than raw WLD wealth alone.

Leaderboards need anti-cheat eligibility, minimum activity, account-age rules, self-trade detection and suspicious-network/multi-account review hooks.

## 8. Acquisition strategy

### Organic discovery
Publish indexable public guides for virtual-stock concepts, jobs, collections and event rules. Each guide should lead to a specific playable action after sign-in. Public stock/company lore pages can become durable search entry pages while private portfolio/account data remains noindex.

### Referral
Use milestone-based referrals: reward only after the invited account completes verified actions across multiple days. Cap rewards per period and flag device/network/account-link patterns. Avoid paying for raw registrations.

### Share loops
Generate opt-in cards for seasonal rank, collection completion, weekly recap and virtual-stock challenge results. Shared assets must make clear that values are virtual.

### Community operations
Run themed Discord/web events, creator challenge codes with capped non-cash cosmetics, and newcomer events that pair tutorial completion with community participation.

## 9. Retention and reactivation

The product should create reasons to return without relying on spam notifications.

- personal dashboard with watchlist changes, unfinished quest, next unlock and one recommended action;
- daily/weekly/seasonal cadence with distinct objectives;
- rotating market and shop events;
- personalized comeback mission after inactivity;
- weekly recap showing progress, not only wealth;
- event calendar and advance notice for scheduled content;
- notification preferences by category and quiet-hours support;
- expired-session return path that preserves the user's intended destination after reauthentication.

Reactivation offers should be capped progression assistance, not large WLD grants that reward churn.

## 10. Economy design

Track separate sources/sinks by system. Every proposed reward must identify its funding/mint source and every durable economy feature should contribute at least one meaningful sink or maintenance cost where appropriate.

Primary sinks can include shop collections, business operating costs, listing fees, optional cosmetic crafting, event exchanges and bounded service fees. Avoid taxes or fees that make the early game feel punitive.

Monitor WLD supply, median/percentile wealth, concentration, velocity, mint/burn ratio, item supply, business profitability, stock turnover and inactive-account holdings. Policy changes should begin in proposal mode and be versioned.

## 11. Abuse prevention

Priority abuse cases:
- multi-account referral farming;
- scripted job/quest completion;
- self-trading or coordinated virtual-stock manipulation;
- marketplace wash trading;
- leaderboard boosting;
- idempotency/retry exploitation;
- reward claiming across date-boundary races;
- bot-driven inventory sniping.

Controls should favor server/database invariants, rate limits, eligibility rules, anomaly scoring and manual review tooling over client-side blocking alone.

## 12. KPI framework

### Activation
- sign-up → tutorial completion;
- time to first verified job;
- time to first shop purchase;
- watchlist adoption;
- first safe virtual-stock action;
- percentage completing the first-day checklist.

### Retention
- D1/D7/D30 retained users;
- WAU/MAU and returning-days-per-user;
- weekly quest completion;
- percentage participating in at least two systems per week;
- comeback-mission return rate.

### Economy health
- WLD mint/burn ratio and net supply change;
- wealth concentration percentiles;
- shop sink per active user;
- business net-profit distribution;
- stock turnover and concentration;
- suspicious transaction/claim rate.

### Growth
- invite → activated-user conversion;
- share-card → visit → activated-user funnel;
- organic landing page → sign-up → activation;
- 30-day retention by acquisition source.

## 13. Experiment backlog

Run controlled, reversible experiments with explicit success and guardrail metrics:

1. three-step vs five-step onboarding;
2. dashboard single recommended action vs three choices;
3. streak grace day vs no streak mechanic;
4. referral reward after day-3 verified activity vs day-7 milestone;
5. weekly league duration and cohort sizing;
6. seasonal progression pacing;
7. personalized watchlist/event recap vs generic recap.

Do not optimize only click-through or session count. Guardrails include economy inflation, abuse rate, support burden, user-reported pressure, and system error rate.

## 14. Delivery priorities

### P0 — foundation
- instrument activation/retention/economy events;
- finish watchlist/dashboard loop;
- define unique fictional stock catalog and market-event schema;
- introduce first-day/first-week progression checklist;
- define shop collection taxonomy and rotation policy;
- add referral anti-abuse design before referral rewards.

### P1 — retention
- weekly quests and recap;
- collection milestones;
- seasonal progression;
- event calendar;
- comeback missions;
- opt-in social cards.

### P2 — social competition
- friends/follows;
- activity-matched leagues;
- clubs/cooperative goals;
- isolated virtual-stock competition accounts;
- stock-tagged community loops.

### P3 — advanced simulation
- historical replay challenges;
- deeper portfolio analytics;
- strategy journal/scorecards;
- more sophisticated market events after manipulation monitoring is proven.

## 15. External product evidence used for this version

This plan uses current product patterns as directional evidence, not as requirements. TradingView's current Paper Trading product combines simulated funds, order/position tracking, multiple asset types, strategy practice, historical replay and recurring competition; this supports a learn → practice → measure → compete progression model. Current mobile-app retention benchmark material from Adjust emphasizes D1/D7/D30 measurement and shows the steepest drop occurs early, supporting first-session and first-week prioritization.

## 16. Version record

### v2026.09.12.1 — first growth-planning pass
- Added explicit acquisition, activation, retention and long-term loops.
- Added proposed WDX fictional stock universe and market/event design.
- Added shop product families, collections, rotations and non-pay-to-win rules.
- Added progression, social, league, referral and reactivation systems.
- Added KPI, abuse-prevention, economy-health and experiment frameworks.
- Added phased delivery priorities.

No runtime, database or production configuration changes are part of this documentation version.