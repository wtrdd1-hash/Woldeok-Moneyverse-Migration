# Woldeok Moneyverse — Identity-Safe Merchandising & Transparent Rotation Growth Spec

> Version: v2026.09.15.96
> Status: Living consumer-growth specification
> Date: 2026-09-15
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`, recent brand/trust/acquisition growth specs
> Korean counterpart: [IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.ko.md](IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, migration, scheduler, infrastructure or security-code change

## 1. Gap selected

The latest `main` materially expanded the consumer shop surface: authoritative sale-ending deadlines now appear in the event calendar, marketplace holdings can be filtered by recent acquisition, first-party web local login was integrated, and cosmetic/convenience sinks were expanded. Production also exposes a large Store 2.0 catalog.

The largest remaining growth gap is no longer “does the shop have things to buy?” It is:

**Can rotating cosmetics and deadlines create aspiration, identity and healthy return visits without turning Moneyverse into wealth-status shopping, casino/profit prestige, fake scarcity, or countdown-driven pressure?**

Current public Store 2.0 already contains many healthy expressive items, but it also contains identity copy such as `주식 투자왕`, `100만 WLD 클럽`, `카지노 럭키스타`, `머니 메이커`, `골드 마스터` and `가상경제의 거물`. Even though WLD/WDX are game-only, these labels can make wealth, profit, speculation or casino outcomes look like the main form of prestige. That conflicts with the newer product direction: identity, mastery, collection, contribution, history and community should outgrow raw balance accumulation.

This spec therefore focuses on the consumer contract around merchandising and rotation, not on shop APIs, stock tables, catalog schemas, schedulers or pricing engines.

## 2. Consumer promise

**“Spend because an item says something about who you are or what you did — not because a timer, loss fear or wealth ranking pressures you.”**

Healthy merchandising should answer:
- Why would I want this even if nobody told me it was scarce?
- What identity, collection, memory or community story does it express?
- If it rotates out, do I understand exactly when and what that means?
- If I miss it, can I keep enjoying Moneyverse without feeling punished?
- Does purchase timing avoid implying real investment, guaranteed value or status based mainly on wealth/casino outcomes?

## 3. Merchandising hierarchy

### Tier A — expression-first
Default promotional priority:
- profile frames and visual themes;
- room/office/gallery cosmetics;
- collection presentation skins;
- profession identity cosmetics;
- season participation memories;
- project/community contribution marks;
- lore/world-themed items;
- accessibility or layout convenience that creates no economic advantage.

### Tier B — earned-context prestige
Prestige may reference an authentic accomplishment when it is not primarily wealth, profit or gambling based:
- profession chapter completed;
- collection curated;
- community project contributed to;
- season archive participation;
- educational replay/mastery milestone;
- newcomer mentoring or constructive community contribution where abuse controls exist.

### Tier C — high-risk prestige framing
Do not make these the default aspiration ladder:
- raw WLD wealth tiers;
- profit or P/L superiority;
- casino wins or streaks;
- “diamond hands” or loss-chasing identity;
- debt usage or leverage status;
- spending volume as social rank;
- claims that a cosmetic proves investment skill or financial competence.

Existing runtime labels in this category are product-copy risk signals, not instructions to delete runtime items in this documentation-only run. Any future copy/catalog revision requires its normal product/legal/QA process.

## 4. Transparent rotation contract

A rotating item should have a truthful, stable consumer explanation:
1. **availability:** available now / scheduled later / no longer available;
2. **authoritative end:** show the server-authoritative removal date/time when known;
3. **timezone clarity:** render the deadline in a user-understandable local time while preserving the authoritative source;
4. **meaning of expiry:** explain whether expiry ends purchase eligibility, event earning, token exchange, or only featured placement;
5. **no fake reset:** a countdown must not reset or extend invisibly to create urgency;
6. **no invented stock scarcity:** do not claim “only N left” unless a real server-authoritative stock limit exists;
7. **no guaranteed permanent exclusivity:** if an item may return, avoid “never again” language;
8. **grace where appropriate:** event earning can end before a short redemption/curation grace period so a user does not have to panic-spend at the final minute.

A deadline is information, not a retention weapon.

## 5. First visit / activation impact

### First 30 seconds
The shop should not become the first explanation of Moneyverse. New users should first understand the persistent community-world promise and game-only boundary.

If a shop preview appears, show one representative expressive item and why it exists: identity, collection or memory.

### First 3 minutes
Do not ask a new user to compare dozens of prices or limited items. A first shop preview can answer:
- what kinds of things can be collected;
- whether items change gameplay power;
- what can be previewed without buying;
- whether rotating items can return.

### First session
A first purchase is not required for activation. Activation remains a meaningful product action and next-goal formation. The shop can support that goal after the user understands value.

## 6. D1 / D3 / D7 / D14 / D30 return logic

### D1 — remember my taste
Return to the exact theme/collection/profession interest the user expressed. Do not lead with “sale ending” unless the user explicitly followed that item/category.

### D3 — contextual discovery
Show at most one relevant adjacent item/set/editorial story. Prefer “this fits the path you chose” over “buy before it disappears.”

### D7 — progress before purchase pressure
A weekly recap can show:
- what was collected or curated;
- what identity changed;
- one transparent upcoming rotation;
- whether an unfinished set still matters without requiring purchase.

### D14 — voluntary breadth
Users may follow a second theme, season or profession collection. `Later`, `hide` and preference changes should not reduce rewards or status.

### D30 — durable identity
Success is not “how many items were bought.” It is whether the user has a durable profile/display/collection chapter that still feels meaningful after the rotation passed.

## 7. Session design

### 1–3 minute quick check
- one followed item/set deadline if relevant;
- one new expressive preview;
- one `save for later / ignore / view` choice;
- no forced purchase.

### 5–15 minute meaningful session
- preview and compare a small set;
- curate an owned collection;
- choose a display theme;
- read a short lore/provenance note;
- decide whether to buy after understanding the item.

### 30+ minute deep session
- build a display/gallery/archive;
- combine collection chapters across seasons;
- plan a community or space theme;
- browse broad catalog inventory without artificial action caps.

## 8. LiveOps and season anticipation

Use D-14 / D-7 / D-3 / D-1 previews to explain upcoming themes, not to escalate fear.

Good anticipation:
- reveal the theme and story;
- preview some cosmetics/collections;
- show exact start/end dates when authoritative;
- explain catch-up or post-event archive behavior;
- keep old season history visible after the event.

Avoid:
- surprise paywalls at the deadline;
- hidden expiry rules;
- repeated “last chance” notifications to users who did not follow the item;
- removing earned identity/history because a season ended;
- making late joiners permanently inferior when a catch-up path is feasible.

## 9. Viral and social loop

Preferred share artifacts:
- curated outfit/profile theme;
- completed collection chapter;
- season memory card;
- profession-themed space;
- club/city project display;
- before/after curation result.

Do not use private balance, exact holdings, debt, casino outcomes or private purchase history as default share material.

A recipient should understand the artifact without signing in, then enter through a public-safe preview or related story. Raw share clicks or invite acceptance should not receive meaningful WLD/WDX rewards.

## 10. Monetization model

Monetization should happen after identity/value comprehension:

`understand item → preview → know price/availability → choose voluntarily → purchase → use/display → later return`

Do not optimize for:
- countdown exposure;
- impulse conversion at the last minute;
- repeated purchase prompts after decline;
- individual price increases based on inferred willingness to pay;
- higher prices for users with stronger attachment unless a separately reviewed transparent pricing model exists.

The default monetization ladder remains:
1. game-earned WLD cosmetic/collection sinks;
2. clearly non-P2W presentation/convenience;
3. optional paid cosmetics/subscription only after value is proven and legal/payment policy allows it;
4. clearly disclosed sponsorship where appropriate.

Financial-game advantage is not sold.

## 11. SEO and public content

The best public search assets are not thousands of `item × timer × rarity` pages. Prefer:
- curated seasonal catalogs;
- meaningful collection/lore pages;
- season archives;
- “what changed this season” guides;
- profession/collection explainers;
- public-safe exhibit retrospectives.

If individual public item pages are ever indexable, availability and price/expiry information must match the authoritative public surface. Stale “available now” search snippets after removal create trust harm.

Private holdings, recent-acquisition history, purchase history, balance, debt, casino state, personalized recommendation state and security/account state remain non-indexable/private.

## 12. Funnel and KPI additions

Primary funnel:

`qualified discovery → expressive preview → identity/collection interest → optional follow/save → meaningful activation → D1 taste recognition → D7 curation/transparent rotation awareness → voluntary purchase/use → D30 durable identity → optional public-safe share`

### Core growth KPIs
- preview → authored-interest rate;
- interest → meaningful activation;
- first-value before first-purchase rate;
- time-to-first-expressive-use;
- D1 exact-theme recognition;
- D3 contextual-discovery continuation;
- D7 curation/identity progression;
- D14 voluntary second-theme adoption;
- D30 durable-display/collection coverage;
- repeat use of purchased/earned cosmetics;
- share artifact → visit → activation → D7;
- retention-adjusted revenue and contribution margin.

### Monetization diagnostics
- preview → purchase conversion;
- save/follow → later purchase;
- purchase → actual use/display;
- rotation-end conversion share;
- refund/support complaint rate;
- ad/subscription conversion only after value proof;
- ARPU/ARPDAU and LTV/CAC with D7/D30 retention.

### Trust/safety guardrails
- FOMO/pressure complaint rate;
- false-scarcity incident rate;
- deadline mismatch rate;
- youth-safety complaint rate;
- suspicious inventory-sniping/bot rate;
- multi-account purchase/reward abuse rate;
- account-takeover/phishing signal rate;
- privacy complaint rate;
- sensitive-state exposure incidents;
- finance/gambling misunderstanding rate;
- suspicious reward duplication.

## 13. Experiment backlog

### Experiment A — identity-first merchandising vs wealth-status merchandising
- **Hypothesis:** identity/collection/profession framing improves D7/D30 quality without lowering healthy shop use.
- **Target cohort:** activated users with at least one expressed theme/profession/collection interest.
- **Entry point:** first meaningful shop recommendation after activation.
- **Control:** mixed merchandising ranked mainly by broad popularity/status.
- **Treatment:** expression-first merchandising with wealth/profit/casino prestige de-emphasized.
- **Primary metric:** D7 retained users who use/curate at least one identity item.
- **Guardrails:** revenue collapse, confusion, finance/gambling misunderstanding, FOMO complaints, abuse.
- **Minimum observation:** one matured D7 cohort; D30 before permanent broad rollout.
- **Next action:** adopt only if retained identity use improves without trust/safety regression.

### Experiment B — exact authoritative deadline vs generic urgency copy
- **Hypothesis:** exact end date/time preserves conversion while reducing pressure and support confusion.
- **Target cohort:** users viewing an actually rotating item.
- **Entry point:** item preview/detail.
- **Control:** generic `limited / ending soon` copy where currently used.
- **Treatment:** exact authoritative end date/time plus plain-language expiry meaning.
- **Primary metric:** informed preview → voluntary purchase/use rate.
- **Guardrails:** deadline mismatch, complaints, support burden, accidental purchase, D7/D30 retention.
- **Minimum observation:** full rotation window plus at least 7 days after expiry.
- **Next action:** retain exact-date treatment if trust improves and conversion is not materially harmed.

### Experiment C — hard cutoff vs earning-end + redemption grace
- **Hypothesis:** a bounded grace period reduces panic behavior and comeback friction without undermining event anticipation.
- **Target cohort:** users with earned event tokens/progress near season end.
- **Entry point:** final 72 hours and post-event return.
- **Control:** simultaneous earning and redemption cutoff.
- **Treatment:** earning ends as scheduled; short clearly announced redemption/curation grace follows.
- **Primary metric:** D7 post-event healthy return and successful use of earned value.
- **Guardrails:** economy leakage, duplicate redemption, multi-account abuse, support tickets, false expectation of indefinite grace.
- **Minimum observation:** one complete event plus 14 post-event days.
- **Next action:** adopt only if healthy return improves without economy/abuse regression.

### Experiment D — rotation notification by follow intent vs broadcast urgency
- **Hypothesis:** opt-in item/theme follow notifications produce higher-quality comeback with less spam pressure.
- **Target cohort:** users who explicitly followed/saved a theme or rotating item.
- **Entry point:** D-3 / D-1 notification opportunity.
- **Control:** broad promotional message to eligible users.
- **Treatment:** only contextual followed-item/theme notification, no balance/debt/casino data.
- **Primary metric:** notification → meaningful session → D7 continuation.
- **Guardrails:** unsubscribe/opt-out, spam reports, phishing/ATO signals, privacy complaints, accidental purchase.
- **Minimum observation:** at least two rotation cycles.
- **Next action:** keep only categories with positive retained value and acceptable opt-out/trust rates.

### Experiment E — catalog SEO volume vs curated season/collection pages
- **Hypothesis:** fewer high-value curated pages produce better organic activation/D30 quality than thin item/timer pages.
- **Target cohort:** non-branded organic visitors.
- **Entry point:** search landing.
- **Control:** broad catalog/item discovery exposure where available.
- **Treatment:** curated season/collection/lore landing with useful context and transparent availability.
- **Primary metric:** organic visit → meaningful activation → D30 retained user.
- **Guardrails:** misleading availability, doorway/thin-content growth, bounce, privacy exposure, finance-like search mismatch.
- **Minimum observation:** enough search volume for directional comparison and matured D30 cohorts.
- **Next action:** expand only content families that create retained users, not impressions alone.

## 14. Security, abuse and privacy review

### HIGH — deadline phishing / account takeover
**User impact:** users can be tricked by fake `item expires`, `claim before deadline` or `save collection` messages.
**Abuse scenario:** attacker imitates Moneyverse rotation notifications and asks for password/OAuth/recovery codes.
**Minimum protection:** canonical domain/brand consistency; growth messages never request password, OAuth code or recovery code; no session/secret/recovery values in links.
**Separate development/QA:** yes before new email/push/external-deep-link rotation messaging.

### HIGH — false scarcity / deceptive urgency
**User impact:** rushed purchases, trust loss, youth pressure.
**Abuse scenario:** non-authoritative countdown, timer reset, fake stock level or “never returning” claim.
**Minimum protection:** authoritative deadlines only; truthful stock/return policy; no hidden reset; plain expiry semantics.
**Separate development/QA:** yes before new countdown/limited-inventory behavior.

### HIGH — wealth/casino/profit identity reinforcement
**User impact:** finance-like misunderstanding, loss chasing, unhealthy prestige incentives.
**Abuse scenario:** users are socially ranked or pushed to spend/trade/gamble to obtain status.
**Minimum protection:** do not use raw P/L, debt or casino outcomes as default prestige; preserve game-only disclosure and probability/market-integrity boundaries.
**Separate development/QA:** legal/product review before expanding finance/casino-adjacent prestige or paid promotion.

### HIGH — deadline sniping / bots / multi-account abuse
**User impact:** unfair access to limited inventory and degraded trust.
**Abuse scenario:** bots or coordinated accounts snipe inventory, farm deadline-linked rewards or exploit repeated claims.
**Minimum protection:** do not reward raw opens/follows/deadline clicks with meaningful WLD/WDX; preserve existing server limits, idempotency, anti-bot/fraud monitoring and review hooks.
**Separate development/QA:** yes before scarcity-linked rewards or materially constrained inventory campaigns.

### HIGH — sensitive recommendation/share leakage
**User impact:** exposure of WLD/WDX holdings, debt, casino outcomes, exact private purchase history or security state.
**Abuse scenario:** personalized shop/share URLs or analytics payloads encode private state.
**Minimum protection:** personalized state private by default; public-safe allowlist; no sensitive state in URL, share card, notification or third-party analytics payload.
**Separate development/QA:** yes before personalized public shop/share surfaces or new ad/analytics integrations.

### MEDIUM — personalized pricing/profile overreach
**User impact:** opaque price discrimination and privacy complaints.
**Abuse scenario:** browsing/purchase/attachment history silently changes a user-specific price.
**Minimum protection:** no undisclosed individualized pricing; data minimization; clear pricing policy; separate review before any personalization of paid price.
**Separate development/QA:** privacy/legal QA required for any future individualized pricing experiment.

## 15. Legal/policy notes

- Korea: the Fair Trade Commission’s February 13, 2025 Q&A on six regulated online dark-pattern types remains a standing official compliance reference. In 2026, the Korea Consumer Agency’s advertising monitoring program explicitly continued monitoring consumer-deceptive dark-pattern cases. Moneyverse should therefore treat false scarcity, misleading urgency and obstructive choice as product risks, not only copy issues.
- United States: on August 2026 the FTC sought comment on a proposed enforcement policy statement about personalized pricing, emphasizing deception risk when businesses imply static pricing while secretly varying prices based on personal data. This is not treated here as a final rule; it is a current enforcement-policy signal supporting a conservative no-hidden-personalized-pricing guardrail.
- Youth: rotation pressure, probability/casino-adjacent identity and paid cosmetics require age-sensitive review before expansion. This spec does not create a new age-gating architecture.
- WLD/WDX remain virtual/simulated/game-only. No rotation or prestige copy should imply real investment value, deposit safety, cash appreciation or guaranteed return.

## 16. Research note — current evidence

| Date / status | Source | Key takeaway | Use |
|---|---|---|---|
| Current support, checked 2026-09-15 | Epic Games, “How to check when an item will be removed and unavailable for purchase” — https://www.epicgames.com/help/cs/c-Category_Fortnite/c-Fortnite_Gameplay/how-to-check-when-an-item-will-be-removed-from-the-fortnite-item-shop-a000089695?lang=en-US | Individual cosmetics expose a concrete removal date/time instead of relying only on vague urgency. | **Directly adopt** exact authoritative end-time principle. |
| 2026-01-09 | Supercell, Clash of Clans event notice — https://supercell.com/en/games/clashofclans/blog/news/nakr%C4%99%C4%87-si%C4%99-na-wydarzenie-wybuchowe-wyposa%C5%BCenie/ | Event end was published explicitly and reward redemption remained available for two additional days. | **Directly adopt** clear schedule + bounded post-event grace as a testable pattern. |
| 2026-08 | U.S. FTC personalized-pricing policy statement proposal — https://www.ftc.gov/news-events/news/press-releases/2026/08/ftc-seeks-comment-enforcement-policy-statement-regarding-personalized-pricing | Hidden individualized pricing based on browsing/buying data can mislead consumers. Public comment proposal, not a final rule. | **Guardrail/reference**; no undisclosed personalized pricing. |
| 2025-02-13, standing official guidance | Korea Fair Trade Commission dark-pattern Q&A — https://www.ftc.go.kr/www/selectBbsNttView.do?bordCd=3&key=12&nttSn=43802 | Korea formally explains regulated online dark-pattern types and compliance questions. | **Compliance reference** for urgency/scarcity UX. |
| 2026 monitoring program | Korea Consumer Agency advertising-monitoring notice — https://www.kca.go.kr/home/sub.do?menukey=4003&mode=view&no=1004002526 | 2026 monitoring explicitly includes consumer-deceptive dark-pattern cases. | **Current enforcement-attention signal**. |
| Current docs, checked 2026-09-15 | Google Search product data docs — https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google | Search/product data should reflect current price and availability; stale availability is a known synchronization problem. | **SEO reference only** if public item pages are ever eligible/indexable; not a mandate to treat WLD shop as real-world ecommerce. |
| Runtime checked 2026-09-15 | Moneyverse home/shop — https://easy-scraping.com/ and https://easy-scraping.com/shop | Game-only boundary is explicit; Store 2.0 has broad expressive inventory but also wealth/profit/casino prestige labels and a large catalog competing for attention. | **Direct product observation** informing the selected gap. |

## 17. Decision summary

Adopt now at planning level:
- identity/collection/profession/community expression before wealth/profit/casino prestige;
- exact authoritative rotation end dates;
- clear expiry semantics;
- test bounded redemption grace where appropriate;
- user-followed, low-pressure rotation reminders;
- D30 durable use/identity as the primary success outcome;
- public-safe curation and season archives over timer-page SEO farms.

Do not expand yet:
- fake or resetting countdowns;
- raw WLD/P&L/casino prestige as the main aspiration ladder;
- meaningful WLD/WDX for raw shop opens/follows/deadline clicks;
- mandatory purchase for activation;
- hidden individualized pricing;
- finance-like “value appreciation” claims;
- aggressive broadcast “last chance” notifications;
- sensitive private-state sharing or search indexing.

## 18. Runtime verification

Runtime verification: **available for the public homepage, shop and public guide; authenticated calendar/holdings behavior was not independently exercised in this planning run.**

Observed:
- homepage clearly states WLD/rewards are game-only and non-cash;
- the public Store 2.0 advertises expression and permanent WLD sinks and exposes a large cosmetic/convenience catalog;
- current shop copy includes several wealth/profit/casino-centered prestige labels;
- latest `main` documents authoritative shop sale-ending deadlines in the member calendar and recent-acquisition filtering for holdings.

This spec records consumer-growth implications only. No runtime code change is part of v2026.09.15.96.
