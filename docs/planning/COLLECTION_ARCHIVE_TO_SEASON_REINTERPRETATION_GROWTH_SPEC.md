# Woldeok Moneyverse — Collection Archive-to-Season Reinterpretation Growth Spec

> Version: v2026.09.14.62
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.ko.md](COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

The previous collection work now covers discovery, pre-auth preview, first meaningful ownership, D1 recognition, D7 curation and a D30 durable chapter. The largest remaining retention gap is what happens after that chapter feels finished.

**Why should a D30–D90 user return to an old collection instead of treating completion as the end of the product?**

The selected loop is:

`D30 durable chapter → archive without loss → quiet period → new season/context signal → reinterpret one old piece/chapter → authored before/after meaning → D60/D90 return → optional public exhibit/share → next season memory`

The objective is to create long-term return through memory and reinterpretation, not through forced decay, expiring ownership, wealth escalation or endless new item supply.

This specification intentionally does not define archive tables, season migrations, scheduler jobs, notification APIs, ranking services or moderation backend implementation.

## 2. Consumer promise

**“Finishing a chapter should make it part of your history, not make it obsolete.”**

A mature collection user should understand four things:
- **preservation:** what I completed remains mine and legible;
- **context:** a new season can make an old chapter interesting again without rewriting its original history;
- **authorship:** I choose whether and how to reinterpret, display or share it;
- **renewal:** the next chapter adds perspective rather than invalidating previous effort.

Do not create long-term retention by:
- deleting or degrading old collections;
- making old items economically unusable unless the user pays;
- requiring daily attendance to preserve archive status;
- using “last chance or lose your history” messaging;
- ranking long-term players primarily by WLD wealth, WDX returns, debt use, casino activity or real-money spend;
- flooding the catalog with new items merely to manufacture novelty.

## 3. D30 — seal a durable chapter

At D30, the product should allow the user to regard one collection thread as a coherent chapter.

A chapter can be complete enough to preserve even if the underlying set is not 100% acquired. The consumer-facing completion signal may come from:
- a user-selected favorite piece;
- a chosen arrangement or grouping;
- a short bounded annotation or theme label;
- one “what this chapter means to me” choice from safe prompts;
- a season/lore context;
- a private archive cover or presentation style.

The archive moment should answer:
1. What did I start with?
2. What did I learn, complete or curate?
3. What did I choose to preserve?
4. Is this private, unlisted or intentionally public?
5. What might make it relevant again later?

No payment is required to preserve a completed chapter.

## 4. The quiet period is allowed

A mature retention system should permit a collection to become quiet without implying failure.

During the period after D30:
- no streak penalty should accumulate;
- no asset-loss threat should be sent;
- no repeated “claim now” reminder should be required;
- the user may spend time in professions, spaces, businesses, community or other systems;
- the collection remains a stable memory until meaningful new context exists.

This is important because long-term attachment is stronger when returning feels optional and meaningful rather than compulsory.

## 5. D60+ reinterpretation trigger

An old chapter should re-enter attention only when there is a real reason.

Valid reinterpretation triggers include:
- a new season that connects to the same theme;
- a new fictional-company, profession or city story that changes the chapter’s context;
- an editorial museum/exhibit theme;
- restoration or reframing that adds presentation meaning without changing original provenance;
- a personal retrospective that connects two periods of the user’s history;
- a club/city cultural project where the user explicitly opts in;
- a new lore layer that explains why an older piece mattered.

A reinterpretation prompt should state:
- **what is old:** the preserved chapter or piece;
- **what is new:** the season/story/context now attached to it;
- **what the user can do:** one voluntary curation action;
- **what will remain unchanged:** original history/provenance and private state.

Avoid pseudo-events that exist only to generate a notification.

## 6. Season bridge: anticipation without FOMO

The existing season lifecycle already preserves identity and archives. This growth layer adds a consumer-facing return contract.

### D-14 — relevance preview
Show which existing collection themes, professions or histories may become interesting again. Do not disclose a fake guaranteed economic advantage.

### D-7 — choose one thread
Let a user choose one old chapter to follow into the new season. Following is an interest signal, not an economic commitment.

### D-3 — explain the connection
Give one clear reason the old chapter matters to the upcoming theme. Avoid countdown pressure and “you will fall behind” language.

### D-1 — prepare a starting point
Offer a short recap and one reversible next action. Do not require spending, trading, borrowing or gambling to be ready.

### Season start
The first screen for this cohort should show `old meaning → new context → one authored choice`, not a wall of new rewards.

## 7. First-session-after-reinterpretation design

### First 30 seconds
The user should understand:
- which old chapter is being referenced;
- why it is relevant now;
- that the original chapter remains preserved;
- one thing they can explore or change.

### First 3 minutes
The user should be able to perform one low-friction action:
- feature a different favorite;
- add a new season label/context;
- compare “then” and “now”;
- connect the chapter to a new exhibit/theme;
- choose to keep it unchanged and simply archive the new context.

### Meaningful session
A 5–15 minute session can support:
- combining two chapters into an anthology;
- redesigning a museum/archive presentation;
- connecting collection history to a profession, space or season story;
- creating a private retrospective.

### Deep session
A 30+ minute session can support a richer exhibit or community project only after privacy, moderation and public-safety controls are ready.

## 8. Long-term memory ladder

The long-term collection ladder becomes:

`Acquire → Understand → Complete → Curate → Preserve → Revisit → Reinterpret → Anthologize`

- **Preserve:** create a stable chapter.
- **Revisit:** return without needing a new reward.
- **Reinterpret:** add new context while keeping old history intact.
- **Anthologize:** connect multiple seasons or chapters into a user-authored body of work.

The product should measure movement through these stages rather than only inventory size.

## 9. Funnel and cohorts

Primary long-term funnel:

`D30 durable chapter → archive revisit → D60+ valid reinterpretation trigger → reinterpretation preview → meaningful curation action → D7-after-return → next-season continuation → D90/multi-season retention → optional share`

Segment by:
- original acquisition source;
- first collection intention (`complete`, `learn`, `curate`, `display`);
- chapter age (30–59, 60–89, 90+ days);
- current season participation state;
- private vs explicitly public chapter;
- active vs returning user;
- minors/age-sensitive cohort only where lawful and safely measurable.

Do not average users who naturally revisit old material with users who only respond to economic incentives.

## 10. KPI additions

### Long-term retention
- D30 chapter-preservation rate;
- D60 archive revisit rate;
- valid-context reinterpretation rate;
- reinterpretation → meaningful action;
- D7-after-reinterpretation return;
- D90 / multi-season retention;
- old-chapter-to-new-season continuation;
- anthology creation rate;
- percentage of reinterpretation sessions with no economic reward attached.

### Brand / viral
- archive or anthology share intent;
- opt-in public exhibit rate;
- recipient engaged-read → contextual exploration → activation → D7;
- hide/unpublish/remove rate;
- branded/direct return share.

### Profitability
- D60/D90 LTV by collection-intent cohort;
- cosmetic/presentation revenue after repeated attachment;
- ad-induced churn around archive/season return;
- subscription conversion after demonstrated multi-session value;
- retention-adjusted contribution.

### Trust guardrails
- privacy complaint rate;
- public/private leakage;
- phishing/ATO signals around “archive updated” or “season memory” messages;
- fake prestige / bot / multi-account manipulation;
- UGC report rate;
- suspicious reward duplication;
- accidental ad click;
- FOMO/pressure complaints;
- finance-like claim complaints.

## 11. Experiment backlog

### A. Reinterpretation vs new-item novelty
Hypothesis: a real connection to an old chapter creates stronger D90 attachment than showing only new collectibles.
Target: users with a D30 durable chapter.
Entry: first relevant season/context update after D30.
Control: new-season/new-item feed.
Treatment: `old chapter → new context → one curation action`.
Primary: reinterpretation meaningful-action rate and D7-after-return.
Guardrails: confusion, pressure complaints, privacy exposure, season abandonment.
Minimum observation: at least one matured D90 cohort where sample permits; use D7/D30-after-trigger directionally earlier.
Next: adopt only if long-term continuation improves without trust regression.

### B. User-chosen old chapter vs system-selected memory
Hypothesis: user choice produces stronger ownership than a system-generated “memory.”
Target: users with two or more eligible chapters.
Control: algorithm/system chooses the highlighted chapter.
Treatment: user selects one chapter to carry forward.
Primary: reinterpretation action and next-season continuation.
Guardrails: choice paralysis, regret, exposure of private data.
Observation: two season-transition cohorts where feasible.

### C. Permanent archive vs expiring comeback incentive
Hypothesis: “your history is preserved” creates healthier return than “come back before this expires.”
Control: time-limited comeback/reward framing.
Treatment: preservation-first recap plus one current-context action.
Primary: D7-after-return and D30-after-return.
Guardrails: FOMO complaints, reward inflation, churn farming, multi-account abuse.
Observation: at least two matured return cohorts.

### D. Anthology recap vs raw activity statistics
Hypothesis: a multi-season story built from user-authored chapters increases share intent and branded return more than totals such as sessions, trades or wealth.
Control: numerical activity recap.
Treatment: chapter/season anthology with favorite moments and curation choices.
Primary: meaningful revisit/share intent and D30 subsequent return.
Guardrails: privacy regret, risky-behavior amplification, misleading finance framing.
Observation: one full retrospective cycle.

### E. Monetization after reinterpretation vs before value
Hypothesis: protecting `archive → reinterpretation → first authored action` from interruptive ads/upsells improves retention-adjusted contribution.
Control: reviewed ad or cosmetic upsell before the reinterpretation action.
Treatment: monetize only after the promised context and action are complete.
Primary: D30-after-trigger plus contribution margin.
Guardrails: ad-induced churn, accidental click, subscription complaints, CWV regression.
Observation: sufficient monetization volume plus matured D30 cohort.

## 12. SEO and acquisition

The durable SEO asset is not each user’s private archive. It is useful public context that can stand on its own.

Index candidates:
- substantial season archives;
- editorial museum/exhibit pages;
- fictional-company/profession histories;
- collection/lore explainers with original context;
- public club/city project retrospectives with explicit publication permission;
- carefully reviewed opt-in public anthologies that provide substantial original value.

Default private/noindex/unlisted:
- personal archive dashboard;
- private anthology;
- balances, holdings, debt, casino history;
- account/security/recovery/moderation state;
- thin automatically generated “memory” pages;
- referral/claim pages.

Google’s current people-first guidance says content should provide original, substantial value and should not be mass-produced merely to attract search visits. Naver’s current content guidance similarly emphasizes real user value, accurate titles/descriptions and avoidance of search-only spam. Archive growth must therefore be editorial/value-led rather than page-count-led.

Organic funnel:
`useful season/lore archive → related collection exploration → qualified signup/comeback → owned chapter → D30 preservation → later reinterpretation → D90/multi-season return → retention-adjusted contribution`

## 13. Viral and brand effect

Preferred long-term share artifacts:
- “then vs now” collection chapter;
- user-authored anthology cover;
- favorite piece across two seasons;
- museum/exhibit transformation;
- season history with one user-selected reflection;
- club/city cultural project result where publication is explicitly allowed.

Do not make raw WLD wealth, WDX return, debt size, casino outcomes or session time the default prestige story.

Brand direction:
**Moneyverse should feel like a place that remembers the user’s choices and gives them new meaning over time.**

## 14. Monetization

Natural later monetization surfaces are presentation layers after attachment:
- archive/museum themes;
- anthology cover/layout cosmetics;
- room/gallery presentation cosmetics;
- non-P2W restoration/reframing styles;
- ad-free subscription after repeated value;
- clearly disclosed sponsored editorial/cultural exhibits.

Never sell:
- the right to preserve history;
- better WDX, loan or casino outcomes;
- hidden sponsored prestige/search ranking;
- paid access to basic privacy controls;
- fake scarcity or asset-loss threats;
- “restore your lost value” finance-like messaging.

Subscription terms must remain clear before billing, consent must be informed and affirmative, and cancellation must be straightforward.

## 15. Safety, privacy and abuse review

### High — private history leakage
User impact: stalking, scams, embarrassment and targeted account attacks.
Abuse scenario: archive/anthology reveals balances, holdings, debt, hidden relationships, account age, security/recovery state or real-world identity.
Minimum protection: public-safe allowlist; private by default; explicit reversible publication; preview before sharing; no secrets/session/recovery values in URLs or analytics.
Separate development/QA: yes before personalized public archives/anthologies.

### High — archive/season phishing and ATO
User impact: credential theft and account takeover.
Abuse scenario: lookalike message says “your archive changed,” “season memory expires,” or “claim restored collectible” and requests credentials/OAuth codes.
Minimum protection: consistent official domain/brand; no urgent asset-loss language; no sensitive account data in notification copy; never request credentials/auth codes inside content.
Separate development/QA: yes before email/push/external deep-link campaigns.

### High — prestige and social-proof manipulation
User impact: distorted trust and polluted growth experiments.
Abuse scenario: bots/multiple accounts fabricate exhibit views, archive prestige or referral attribution.
Minimum protection: no meaningful WLD/WDX reward for raw archive opens/views/shares; fraud-adjusted metrics; abuse-resistant eligibility before public prestige.
Separate development/QA: yes before economic/social ranking rewards.

### High — public exhibit UGC abuse
User impact: harassment, impersonation, doxxing, malicious links and unsafe content.
Minimum protection: bounded/preset text for early pilots, reporting/removal, safe outbound-link policy, no forced real names, publication opt-in.
Separate development/QA: yes before open-ended public annotations.

### Medium — minors and inferred-interest advertising
Long-term collections can reveal interests and behavioral patterns. Do not use archive history to infer sensitive traits or intensify behavioral advertising to minors. New youth-facing public discovery, stranger interaction, tracking vendors or personalized ads require current legal/privacy/safety review.

## 16. Legal and policy cautions

- WLD/WDX remain virtual/simulated/game-only and must not be framed as investments, deposits, securities, cash value or guaranteed returns.
- Sponsored exhibits/creator relationships require clear disclosure where a material relationship exists.
- U.S. subscription/negative-option rules remain an active policy/enforcement area. The FTC’s March 2026 ANPRM and May 2026 Shutterstock settlement reinforce clear material terms, express informed consent and simple cancellation.
- Public user artifacts require consent and removal controls; minors require conservative privacy/safety handling.
- Expanded public UGC, material referral rewards, personalized advertising or new tracking vendors require separate launch-time legal/trust review in Korea and the U.S.

## 17. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable at `https://easy-scraping.com/`.

Observed:
- WLD/rewards are clearly labeled as game-only virtual data;
- the home still foregrounds wallet, games, exchange, shop and quest shortcuts;
- multiple sponsored-advertisement placements already exist;
- monthly public news is still in preparation;
- the lobby can appear quiet/empty;
- `/announcements` currently has no published notices while an ad placement is present;
- `/guide` remains strongly finance/economy-led, introducing deposits, bonds, loans, virtual-stock profit/dividends, businesses and casino early in the journey.

No runtime path was verified for `D30 archive → D60 reinterpretation → next-season authored return`. This remains a planning hypothesis rather than an implemented capability.

## 18. Research note — 2026-09-14

| Source | Date | Key implication | Use |
|---|---|---|---|
| FIFA Collect — Dynamic Collectibles for World Cup 2026 | 2026-06-26 | A collectible can evolve with an event and become a lasting historical record rather than a static acquisition. | **Directly adopt the “living memory/history” principle only.** Do not adopt tradable value, scarcity or real-world utility. |
| FIFA Collect — Dynamic Match Collectible pages | verified 2026-09-14 | Event outcome can be preserved as a lasting chapter of history. | **Reference** for durable memory framing. |
| Discord — Profile Widgets FAQ | updated 2026-09-08 | Users can choose, rearrange and remove what represents them publicly. | **Directly adopt user-controlled presentation and reversibility.** |
| Google Search Central — people-first content guidance | verified 2026-09-14 | Search content should be original, substantial and useful independent of ranking manipulation. | **Directly adopt** for archive/SEO eligibility. |
| Naver Search Advisor — content/basic/markup guidance | verified 2026-09-14 | Search optimization should improve real user value and use accurate, unique page descriptions rather than search-only content. | **Directly adopt** for Korean archive discovery. |
| Google Search — Preferred Sources global rollout | 2026-04-30 | People value recurring sources they explicitly choose to follow. | **Reference** for user-chosen return paths; not a product-performance forecast. |
| FTC — Negative Option ANPRM | 2026-03 | Subscription practices remain under active rulemaking review. | **Guardrail/reference**; re-check at launch. |
| FTC — Shutterstock settlement | 2026-05 | Material terms, express informed consent and simple cancellation remain enforcement priorities. | **Directly adopt as subscription trust guardrail.** |

## 19. What did not change

- No runtime code, database schema, API contract, authentication flow, security architecture, migration, scheduler, infrastructure or deployment behavior changed.
- Existing auth/session/RBAC/admin/ledger/privacy/ad/community security boundaries remain intact.
- Existing season implementation details remain governed by `SEASON_SYSTEM_SPEC.md`; this document adds consumer growth framing only.
- No economic advantage is introduced for old-collection ownership, reinterpretation, sharing or public display.

## 20. Next growth priority

The next narrow proof should be:

`one D30 preserved chapter → one genuine new-season context → one voluntary reinterpretation action → D7-after-return → D90/multi-season retention`

Do not expand public prestige leaderboards, economic referral payouts, mass personal-page SEO, open-ended public annotations, archive-targeted behavioral advertising or additional interruptive ad inventory until this loop demonstrates retention value without worsening privacy, fraud, phishing or pressure signals.