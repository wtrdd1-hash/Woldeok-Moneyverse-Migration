# Woldeok Moneyverse — Collection Ownership-to-Curation Retention Spec

> Version: v2026.09.14.61
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md`, `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.ko.md](COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

The previous collection activation spec answers how a showcase recipient can understand a collection, make one authored choice, sign up for continuity and reach a first meaningful collection state. The largest remaining retention gap is now the next week:

**Does that first collection action create enough ownership that the user voluntarily returns to deepen, arrange and interpret the collection, or does the experience collapse into another reward/checklist loop?**

This spec narrows the question to:

`first meaningful collection state → D1 recognition → visible unfinished meaning → D3 self-directed depth → D7 progress proof → curation choice → durable chapter → optional showcase`

The purpose is to test intrinsic ownership before expanding referral payouts, public activity feeds, collection monetization or more reward-heavy mechanics.

This document does not add a collection database schema, inventory API, scheduler, notification service, reward contract, moderation backend or public-profile implementation.

## 2. Consumer promise

**“Your collection should become more yours each time you return, not merely larger.”**

A retained collection user should feel four things:
- **recognition:** the product remembers what I chose;
- **progress:** I can see what changed since the last visit;
- **authorship:** I can decide what matters, how it is grouped and what it means;
- **unfinished aspiration:** there is a next chapter I want, not a punishment I must avoid.

The product should not depend on:
- daily claim pressure;
- streak-reset fear;
- expiring collection ownership;
- forced scarcity;
- large WLD rewards for merely opening the collection;
- leaderboards that rank users mainly by wealth or spending;
- repeated prompts to buy or acquire the next item before the current collection has meaning.

## 3. D1 — recognition before novelty

The first return should prove continuity before showing new inventory.

Primary D1 surface:
1. the exact starter theme/intention previously selected;
2. the first piece or private draft state already created;
3. one sentence explaining what is now preserved;
4. one small next step related to that choice.

Preferred emotional signal:
**“This is where I left it.”**

Good D1 next actions:
- inspect the story/provenance of the first piece;
- choose where it belongs in a small display;
- mark one related piece/theme as interesting;
- write/select a bounded private note or label;
- choose a next milestone such as `understand`, `complete`, `curate` or `display`.

Do not make D1 primarily:
- `claim your daily reward`;
- `your streak will reset`;
- `you missed income`;
- `deposit WLD now`;
- `trade before the price changes`;
- `play casino to recover losses`.

## 4. D3 — deepen one thread, not broaden the whole product

D3 should ask whether the user wants to know or shape more about the same collection thread.

Offer at most one adjacent depth path:
- **meaning:** lore, provenance, season context or fictional history;
- **completion:** a clear set relationship and what remains;
- **curation:** ordering, grouping, labeling or visual arrangement;
- **connection:** one related profession, space, season or public-safe project.

Do not introduce banking, loans, virtual stocks, business, casino and multiple unrelated systems simply because three days passed.

A user who ignores the collection path should remain free to use other Moneyverse features; the collection is an aspiration, not a mandatory tutorial lock.

## 5. D7 — progress proof and the first curation decision

D7 is the critical retention proof point.

The user should see a concise `then → now → next` story:
- **then:** what I chose or started;
- **now:** what I completed, learned, arranged or preserved;
- **next:** one meaningful direction I can choose.

A D7 collection return succeeds when the user performs a self-directed action such as:
- rearranging or grouping pieces;
- choosing a featured/favorite piece;
- adding a bounded annotation;
- selecting an unfinished set goal;
- restoring/reframing an older piece where the product supports it;
- placing the collection into a room/archive/museum-style context;
- choosing to keep the chapter private or preparing a public-safe showcase.

D7 should not require another acquisition. Existing pieces must be capable of creating value through interpretation and presentation.

## 6. Ownership ladder

### Stage 1 — Have
“I have a piece.”

### Stage 2 — Understand
“I know why this piece matters.”

### Stage 3 — Connect
“I know how it relates to a theme, season, profession or story.”

### Stage 4 — Curate
“I chose how to arrange, label, feature or preserve it.”

### Stage 5 — Express
“This collection looks like mine.”

### Stage 6 — Remember
“This records part of my Moneyverse history.”

### Stage 7 — Reinterpret
“An older collection became relevant again in a new season, exhibit or story.”

Acquisition is only the first stage. A healthy collection system should allow retained users to create meaning without continuously increasing item supply.

## 7. Session design

### 1–3 minute quick check
- see `then → now → next`;
- feature one piece;
- choose one next collection intention;
- leave without losing progress.

### 5–15 minute meaningful session
- explore one lore/provenance chapter;
- arrange a small display;
- compare two related pieces/themes;
- complete one curation milestone.

### 30+ minute deep session
- build an exhibit/archive chapter;
- redesign a personal display space;
- connect multiple seasons/themes;
- write/select richer safe annotations where moderation/privacy supports it;
- participate in a public-safe museum/community project only if the user opts in.

No artificial hard daily action cap is introduced by this spec. Existing anti-abuse and economy limits remain valid where they protect value movement, but collection interpretation itself should not be disabled to manufacture scarcity.

## 8. D14 / D30 / long-term bridge

### D14 — authored display
The user should be able to make at least one visible presentation choice: arrangement, favorite, annotation, theme, archive grouping or display context.

### D30 — durable chapter
The user should possess a collection chapter that has value even if nobody else sees it. Public sharing is optional.

### D60+ — reinterpretation
Old collections can become interesting again through:
- new season context;
- rotating editorial exhibits;
- restoration/reframing goals;
- personal retrospectives;
- museum/archive themes;
- club/city cultural projects;
- new presentation layers that do not invalidate original history.

This is the bridge from retention to the existing long-term aspiration ladder: `Acquire → Understand → Complete → Curate → Reinterpret`.

## 9. Funnel and cohort model

Primary collection-retention funnel:

`first meaningful collection action → D1 recognition → D3 adjacent depth → D7 progress proof → first curation action → D14 authored display → D30 durable chapter → optional showcase/share → recipient preview`

Track separately by acquisition source:
- direct showcase recipient;
- generic new-user onboarding;
- organic guide/lore visitor;
- community/Discord entry;
- creator/partner entry;
- paid acquisition if later tested.

Also segment by first collection intention:
- complete;
- learn lore;
- curate;
- build a display.

Do not treat users with different intentions as one homogeneous retention cohort.

## 10. KPI additions

### Ownership / activation quality
- first-collection-state completion;
- first-goal set rate;
- first-value proof completion;
- user-selected intention mix;
- time-to-first-owned-state.

### D1–D7 retention quality
- D1 exact-thread recognition rate;
- D1 recognition → meaningful action;
- D3 same-thread continuation;
- D7 collection return;
- D7 `then → now → next` completion;
- D7 first-curation-action rate;
- percentage of D7 users who deepen without receiving a comeback/daily economic reward.

### Long-term
- D14 authored-display rate;
- D30 durable-chapter rate;
- collection revisit rate;
- collection curation rate vs acquisition-only rate;
- archive/museum revisit;
- older-collection reinterpretation rate;
- own-showcase creation;
- second-generation share → activation → D7.

### Business
- D30/D60 LTV by collection-intent cohort;
- cosmetic/presentation revenue only after repeat value;
- subscription conversion after demonstrated collection attachment;
- ad-induced churn;
- retention-adjusted contribution;
- fraud-adjusted CAC for share-assisted acquisition.

### Trust guardrails
- privacy complaint rate;
- public/private leakage incidents;
- phishing/ATO signal rate;
- fake-signup/referral-fraud rate;
- suspicious reward duplication;
- spam/report rate;
- collection prestige manipulation rate;
- accidental-ad-click rate;
- FOMO/pressure complaint rate;
- finance-like claim complaint rate.

## 11. Experiment backlog

### Experiment A — D1 recognition-first vs novelty-first
Hypothesis: showing the exact saved collection state before new items increases D1 meaningful continuation.
Target cohort: users who completed a first meaningful collection action.
Entry point: first return after activation.
Control: generic home/new-content recommendations.
Treatment: exact saved theme/piece/intention plus one next action.
Primary metric: D1 recognition → meaningful collection action.
Guardrails: confusion, broken-state complaints, auth/session failures, privacy exposure.
Minimum observation: at least one matured D7 cohort.
Next action: adopt only if D1 and downstream D7 improve without support/trust regression.

### Experiment B — `then → now → next` vs reward recap
Hypothesis: progress narrative creates stronger D7 continuation than claimable-reward emphasis.
Target: D7-matured collection users.
Control: reward/claim-centric recap.
Treatment: concise progress proof with one chosen next direction.
Primary metric: D7 return → first curation action.
Guardrails: pressure complaints, reward inflation, abandonment.
Observation: at least two matured weekly cohorts.

### Experiment C — curation prompt vs next-acquisition prompt
Hypothesis: asking users to arrange/feature/annotate existing pieces improves D30 attachment more than immediately recommending another purchase/acquisition.
Control: next item acquisition CTA.
Treatment: curation of existing pieces first.
Primary metric: D14 authored display and D30 durable chapter.
Guardrails: sink pressure, confusion, monetization complaints.
Observation: D30-matured cohort.

### Experiment D — user-selected aspiration vs system-assigned collection goal
Hypothesis: reversible user-selected goals increase voluntary continuation.
Control: system-defined next collection milestone.
Treatment: choose `complete`, `learn`, `curate` or `display`.
Primary metric: D7/D30 continuation by intention.
Guardrails: choice regret, excessive switching, decision paralysis.
Observation: D30-matured cohort where feasible.

### Experiment E — value-first monetization vs early presentation upsell
Hypothesis: waiting until after D7 curation or repeated value improves retention-adjusted contribution.
Control: early cosmetic/theme upsell or reviewed ad exposure.
Treatment: keep first-piece → D1 → D7 curation path free from interruptive monetization; monetize after attachment.
Primary metric: D30 plus contribution margin.
Guardrails: ad-induced churn, accidental clicks, subscription complaints, CWV regression.
Observation: matured D30 cohort plus sufficient monetization volume.

## 12. Viral and brand implications

A curation-based collection is more defensible as a share artifact because it expresses taste rather than wealth.

Preferred future share signals:
- user-selected favorite piece;
- arrangement or exhibit theme;
- completed chapter;
- before/after curation;
- season/lore interpretation;
- archive/museum milestone.

Avoid default sharing of:
- WLD balance or wealth percentile;
- WDX holdings, cost basis or returns;
- loans/debt;
- casino wins/losses;
- private social graph;
- account/security/recovery state;
- moderation state;
- exact real-world location or legal identity.

The brand promise becomes: **Moneyverse remembers what you choose and helps you turn it into a history**, not “Moneyverse makes the richest player most visible.”

## 13. SEO and content discovery

Do not index every personal collection state, arrangement, note or D7 recap.

Index candidates must have independent public value:
- substantial collection/lore guides;
- editorial museum-style exhibits;
- season/world archives;
- fictional-company or profession history tied to collections;
- explicitly public, context-rich community projects;
- high-quality opt-in public showcases with sufficient original context after trust review.

Default non-index/private/unlisted candidates:
- private collection dashboards;
- first-piece states;
- personal progress recaps;
- drafts;
- balances/holdings/debt/casino history;
- security/recovery/moderation state;
- referral/claim pages;
- thin automatically generated user pages.

Google's current UGC guidance recommends clear abuse policy, reporting, spam-account detection and considering `noindex` for low-trust/new-user content. Search visibility must not become the reward for creating mass low-value collection pages.

Organic funnel:
`useful lore/exhibit → collection exploration → qualified signup → first owned state → D1 → D7 curation → D30 durable chapter → optional public exhibit → retention-adjusted contribution`

## 14. Monetization

Monetization should attach to expression after attachment, not to the right to keep progress.

Candidate later surfaces:
- non-P2W display themes;
- archive/museum presentation skins;
- room/office/gallery cosmetics;
- additional visual layouts that do not change economic outcomes;
- ad-free subscription after repeated value;
- clearly labeled sponsor/editorial exhibits.

Do not sell:
- better WDX/loan/casino outcomes;
- collection-completion odds disguised as cosmetics;
- hidden sponsored ranking;
- moderation/search visibility priority presented as organic prestige;
- required payment to preserve a collection chapter;
- fake scarcity or irreversible pressure solely to drive conversion.

Material subscription terms must be clear before charging, express informed consent must precede billing, and cancellation must be straightforward. Retention through cancellation friction is prohibited as a product strategy.

## 15. Safety, privacy and abuse review

### High — private-state leakage through collection continuity
User impact: stalking, targeted scams, embarrassment and account targeting.
Abuse scenario: D1/D7 recap or public exhibit exposes private inventory, balances, holdings, debt, social graph, account identifiers, security state or recovery state.
Minimum protection: public-safe allowlist; personalized collection state private by default; explicit publication choice; no secret/session/recovery values in URLs, analytics or share payloads.
Separate development/QA required: yes before personalized public collection continuity/showcase.

### High — phishing through collection-progress messages
User impact: credential theft and account takeover.
Abuse scenario: lookalike message says `your collection changed`, `claim your rare piece`, or `your exhibit will expire` and requests credentials/OAuth codes.
Minimum protection: official-domain consistency; no asset-loss urgency; no credential/auth-code collection inside content; sensitive account information absent from notification copy.
Separate development/QA required: yes before email/push/external deep-link campaigns.

### High — prestige/farming manipulation
User impact: distorted social proof, polluted experiments and economy abuse.
Abuse scenario: bots/multiple accounts repeatedly acquire cheap pieces, generate views/shares or exploit rewards to manufacture collection prestige.
Minimum protection: no meaningful WLD/WDX reward for raw view/share/collection open; fraud-adjusted metrics; suspicious cohorts excluded from decisions; public prestige must use abuse-resistant eligibility if introduced.
Separate development/QA required: yes before economic/social ranking incentives.

### High — UGC abuse in annotations/public exhibits
User impact: harassment, impersonation, doxxing, malicious links and unsafe content.
Abuse scenario: annotations or exhibit descriptions contain personal data, scams or abusive links.
Minimum protection: first pilot uses bounded/preset text; reporting/removal; external-link policy; no forced real name; public visibility opt-in.
Separate development/QA required: yes before open-ended public UGC.

### Medium — behavioral profiling/minors
Collection taste can reveal interests. Do not use it to infer sensitive traits or intensify targeted advertising to minors. Youth-facing public discovery, stranger interaction, behavioral advertising or new tracking requires separate current privacy/safety/legal review.

## 16. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable at `https://easy-scraping.com/`.

Observed:
- home clearly says WLD/rewards are game-only virtual data;
- quick shortcuts still foreground wallet, games, exchange, shop and quests;
- multiple `SPONSORED ADVERTISEMENT` areas are already present;
- `Monthly notes` still says public operations news is being prepared;
- the lobby can visibly be quiet/empty;
- the getting-started guide still leads with login → wallet balance → quests/jobs → compound deposits/shop and broadly foregrounds deposits, bonds, loans, stock gains/dividends, passive income, business and casino;
- no public collection `first state → D1 recognition → D7 curation` path was verified on current home/guide/announcements surfaces.

Implication: collection retention must be evaluated as a distinct identity/ownership path rather than assumed from the existing economy-led onboarding. Do not expand collection ads, referral payouts or public prestige until ownership-to-curation retention is demonstrated.

## 17. Research note — 2026-09-14

| Source | Date | Observation | Use |
|---|---|---|---|
| Supercell — New Collection Levels & Mastery Changes | 2026-05-13 | Supercell explicitly says progression had become complex/disconnected and redesigned it so every collection upgrade matters and the next goal is clear. | **Direct adoption:** make collection progress legible and tied to the user's chosen collection, not opaque XP/reward layers. |
| Supercell — June Update 2026 | 2026-05/06 | Collection Level replaces XP with a simpler overall progress model and preserves existing progress on return. | **Reference:** continuity and visible progress should survive system/session changes. |
| FIFA Collect — Dynamic Collectibles | 2026-06-26 | Collectibles evolve during the tournament and become a living record of the team's journey. | **Direct adoption:** collections can create return value through evolving context/history, not only new acquisition. |
| Discord — Profile Widgets FAQ | updated 2026-09-08 | Users select/rearrange/remove what they present on their profile. | **Direct adoption:** curation/presentation should be authored and reversible. |
| Xbox Wire — Achievement improvements | 2026-04-08 | 100% completion is highlighted while users can hide games from public achievement history. | **Direct adoption:** celebrate completion while preserving visibility control. |
| Google Search Central — Prevent User-Generated Spam | current | Recommends abuse policy, reporting, spam-account detection and `noindex` for low-trust/new content. | **Direct guardrail:** do not mass-index thin collection/UGC pages. |
| FTC — Shutterstock settlement | 2026-05-13 | FTC alleges unclear terms, lack of express informed consent and difficult cancellation. | **Direct guardrail:** collection attachment cannot justify subscription dark patterns. |
| FTC — Genesis Tech subscription case | 2026-06 | FTC alleges hidden recurring terms, unauthorized charges and cancellation obstruction. | **Reference:** keep recurring monetization terms clear and cancellation simple. |
| Korea PIPC — COPPA 2.0 international trend note | 2026-04-01 | PIPC reports U.S. legislative movement toward expanded youth privacy and targeted-ad restrictions; it is not current Korean law. | **Legal-review trigger:** keep minors-related collection personalization/ads conservative and re-check law at launch. |

Primary URLs:
- https://supercell.com/en/games/clashroyale/blog/news/new-collection-levels-and-mastery-changes/
- https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2026/
- https://collect.fifa.com/blog/dynamic-collectibes-fifa/
- https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ
- https://news.xbox.com/en-us/2026/04/08/xbox-insiders-may-2026-console-features/
- https://developers.google.com/search/docs/monitor-debug/prevent-abuse
- https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices
- https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-sues-stop-sprawling-enterprise-operating-unlawful-subscription-schemes
- https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060030000&nttId=11938

## 18. Legal/policy notes

- WLD/WDX remain virtual/simulated/game-only. Collection progress, rarity, curation or prestige must not imply cash value, deposit safety, guaranteed appreciation or real investment return.
- Sponsored/compensated collection exhibits or creator promotion require appropriate material-relationship disclosure where applicable.
- Subscription/autorenewal changes require current launch-time legal review; clear material terms, informed consent and simple cancellation remain product guardrails.
- Personalized/public collection experiences should minimize personal data and default to safe visibility. Collection interests should not be used as a shortcut to infer sensitive traits.
- Youth-facing discovery, public sharing, stranger interaction or behavioral advertising requires a separate current Korean/U.S. privacy and safety review.
- This Living Spec is product planning, not legal advice.

## 19. Decision

Use **collection ownership-to-curation retention** as the next narrow growth question.

The product should first prove that users voluntarily return to the same collection thread, recognize their prior choice and perform a D7 curation action without needing a large economic reward.

Do not broaden yet to:
- wealth/portfolio share cards;
- raw-signup/referral WLD payouts;
- public collection leaderboards;
- mass-indexed personal collection pages;
- open-ended public annotations;
- aggressive comeback rewards;
- more interruptive ad inventory inside the first-piece → D7 path.

Next growth question after validation:

**Can a D14–D30 curated collection chapter become a durable personal archive and optional social artifact that increases D30/D60 retention without turning prestige into wealth competition or privacy pressure?**