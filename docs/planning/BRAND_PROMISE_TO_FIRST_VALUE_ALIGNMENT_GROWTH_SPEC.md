# Woldeok Moneyverse — Brand Promise-to-First-Value Alignment Growth Spec

> Version: v2026.09.14.65
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md](BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

Recent planning now defines strong acquisition, collection, retention, comeback, season, viral and monetization loops. The largest remaining consumer-growth gap is no longer the absence of a funnel. It is **promise inconsistency across the funnel**.

The current public product surfaces can still describe Moneyverse primarily through wallets, compound deposits, bonds, loans, stock gains, dividends, business payouts, casino play and a wealth ladder toward becoming a “capitalist,” while the newer growth strategy increasingly depends on learning, authored choice, collection, identity, community, seasons, archives and durable personal history.

That mismatch can create low-quality acquisition even if clicks and signups rise:

- visitors may arrive expecting a finance/gambling/wealth-maximization product;
- the first-session experience may then feel unrelated to the reason they arrived;
- safety disclosures have to fight against the dominant promise instead of supporting it;
- D1/D7 continuity becomes weaker because the acquisition expectation was wrong;
- paid/organic traffic can look efficient while downstream retention and trust are poor.

Selected loop:

`clear brand promise → concrete proof → authored first choice → intent-preserving signup → first meaningful value → D1 recognition → D7 continuation → branded/direct return`

The purpose of this spec is consumer message architecture, not a UI component or implementation contract.

## 2. Canonical brand position

### Category
**Persistent community simulation / virtual-economy game.**

Moneyverse is not positioned as a real investing app, bank, casino, exchange, savings product, wealth product or income opportunity.

### Core promise
**“Choose a path, build a record, and return to a virtual world that remembers what you did.”**

Supporting sentence:

**Moneyverse is a game-only community economy where you can learn, build, collect, follow fictional companies, participate in seasons and leave a personal history without real-money investment or cash redemption.**

### Why this promise
It unifies the strongest long-term loops already present in current planning:

- authored choice rather than mandatory chores;
- collections and spaces as identity;
- professions/businesses as paths;
- fictional-company and world stories as recurring content;
- seasons as change over time;
- archive/history as durable retention;
- community as optional social proof and participation;
- WLD/WDX as game-only simulation rather than real financial value.

### Trust qualifier
Where economy, market, banking or casino concepts appear, the visible promise must remain consistent with:

- WLD/WDX are virtual/simulated/game-only;
- no cash redemption or real-security ownership;
- no guaranteed earnings, principal protection or investment return;
- no real-money gambling framing;
- no implication that progress must be protected by paying or logging in daily.

## 3. Message hierarchy

Consumer surfaces should use the same hierarchy even when the exact copy changes.

### Layer 1 — human outcome
Answer: **Why should I care?**

Preferred themes:
- make a choice;
- build something that persists;
- learn through simulation;
- collect and express a point of view;
- see the world change;
- return to a history that remembers you.

### Layer 2 — product proof
Answer: **What can I actually do?**

Use 2–4 concrete proofs, not the entire feature catalog:
- choose a profession/path;
- start or curate a collection;
- follow a fictional company/world thread;
- participate in a season/project;
- complete one simulated economy lesson or scenario.

### Layer 3 — trust boundary
Answer: **What is this not?**

Use concise, plain language near finance-adjacent content:
- game-only virtual data;
- not cash redeemable;
- not a real investment/deposit/security;
- no guaranteed return.

### Layer 4 — next action
Answer: **What should I do now?**

One contextual action only:
- Explore one path;
- Try one sample;
- Follow this story;
- Start this collection;
- See what changed.

Do not lead first-time users with `wallet`, `deposit`, `loan`, `trade`, `casino`, `claim reward`, `passive income`, or a grid of every system.

## 4. First 30 seconds

A first-time visitor should be able to answer four questions after the first screen and one short scroll:

1. **What is Moneyverse?** — a persistent community simulation / game-only virtual economy.
2. **What can I do first?** — choose one path, sample, story or collection.
3. **Why might I return?** — my choice/progress/history persists and the world changes.
4. **Is this real finance or cash gambling?** — no.

The first screen should contain:

- one clear brand promise;
- one concrete proof or current world example;
- one primary exploratory CTA;
- optional sign-in as a secondary continuation action;
- concise game-only disclosure when economy language appears.

A visitor should not have to interpret WLD balances, ledger terminology, “compound” products or casino terminology to understand the brand.

## 5. First 3 minutes and first session

### Minute 0–1: choose a reason to care
Present at most three intent paths:

- **Build:** profession/business/space progression as a path of authored growth.
- **Collect:** themed collection, archive and identity expression.
- **Explore:** fictional company/world/season story and one simulated decision.

`Learn` can be embedded within all three rather than becoming a fourth competing top-level path.

### Minute 1–3: produce one authored state
The visitor does something that reflects preference:

- chooses a starter theme;
- chooses one profession/world goal;
- answers one fictional scenario and sees the explanation;
- follows one public-safe story thread;
- arranges a sample collection.

No authoritative balance, stock, loan, referral or casino state is created before authentication.

### Signup reason
Authentication should preserve the authored state:

- “Save this path and continue”; 
- “Keep this collection chapter”; 
- “Follow this fictional company thread”; 
- “Continue this season story.”

Generic `Sign up now` can remain available but should not be the dominant conversion story when a contextual continuation exists.

## 6. Brand continuity through D1/D3/D7/D30

Brand is not only acquisition copy. It must remain true after signup.

### D1 — recognition
Show the same path, collection, story or choice first.

Promise delivered: **“Moneyverse remembered what I chose.”**

### D3 — relevance
Add one adjacent piece of value without re-expanding to the whole feature catalog.

Promise delivered: **“The world is starting to connect around my interests.”**

### D7 — change
Show what changed in the chosen thread and one next authored action.

Promise delivered: **“There was a reason to come back.”**

### D14 — identity
Let the user curate, display, interpret or connect progress across one or two systems.

Promise delivered: **“This is becoming mine, not just a checklist.”**

### D30 — history
Preserve one durable chapter: collection, profession path, season memory, project contribution, learning replay or world thread.

Promise delivered: **“My time here left a record.”**

Long-term monetization, sharing and prestige should amplify these outcomes rather than replace them with wealth-only status.

## 7. Surface-specific message architecture

### Homepage
Primary job: category clarity + emotional reason + one proof + one next action.

Recommended priority:
1. brand promise;
2. game-only qualifier where needed;
3. current proof (story/collection/season/path);
4. explore/sample CTA;
5. secondary sign-in;
6. deeper feature navigation;
7. monetization after value.

Current wallet/status shortcuts can remain useful for returning users but should not define the anonymous first impression.

### Getting Started guide
Primary job: reduce complexity and establish one successful first session.

Lead with authored progression and persistence, not “capital growth.” Economy systems should be introduced as optional simulation systems inside the broader world.

The guide should not imply that the canonical success path is:

`earn seed WLD → compound savings → trade for gains → collect passive income → become a capitalist`.

A healthier high-level path is:

`choose a goal → complete one meaningful activity → understand the result → set the next goal → later explore deeper economy systems if desired`.

### SEO landing pages
Primary job: fully answer the search intent, then show how Moneyverse uniquely lets the visitor try or continue it.

Search copy must not promise one product (for example, real investing returns) while the destination is a simulation game.

### Share landings
Primary job: explain the shared artifact without requiring prior Moneyverse knowledge.

Start with the artifact/story, then the product context, then one related preview. Do not default to wealth cards.

### Signup/auth continuation
Primary job: preserve intent and trust.

Do not transform a collection/story/learning entry into a generic wallet dashboard immediately after authentication.

### Comeback
Primary job: restore context.

`what stayed → what changed → one action` before advertising, economy pressure or unrelated feature grids.

## 8. Copy guardrails

### Preferred vocabulary
- virtual / simulated / game-only;
- path, chapter, progress, collection, archive, world, story, season;
- choose, learn, build, collect, curate, explore, continue;
- fictional company/market;
- optional, transparent, user-controlled.

### Restricted or context-sensitive vocabulary
The following terms can exist inside accurate feature documentation, but should not dominate acquisition/brand promises:

- guaranteed / safe return;
- passive income;
- seed money as a life-success metaphor;
- undervalued winning stock;
- compound wealth as the primary goal;
- get rich / capitalist as the canonical success identity;
- loss recovery;
- risk-free income;
- “you will miss/lose” comeback pressure;
- casino jackpot/win language as top-level acquisition copy.

### Accuracy rule
If a feature is simulated but uses finance vocabulary, `virtual`/`simulated` should not be hidden only in a footer. The consumer should understand the nature of the feature before acting on it.

## 9. Acquisition quality and cohort model

Brand alignment changes what counts as a good visitor.

Primary chain:

`qualified impression → promise-understood visit → proof engagement → authored choice → contextual signup → meaningful activation → D1 recognition → D7 continuation → D30 durable record → monetization/share`

Track separately by acquisition promise:

- learning intent;
- collection/identity intent;
- fictional-world/company intent;
- profession/build intent;
- community/social intent;
- broad “virtual economy game” intent.

Do not optimize campaigns on cheap clicks from finance/gambling language if those cohorts show low activation quality, poor D7/D30, high misunderstanding or trust complaints.

Paid acquisition success requires `fraud-adjusted CAC → activation → D7/D30 → LTV/contribution`, not CTR or signup alone.

## 10. KPI additions

### First-visit comprehension
- category comprehension rate;
- primary value-promise comprehension;
- game-only/no-cash comprehension;
- “what should I do next?” clarity;
- 30-second qualified engagement rate;
- promise → proof engagement.

### Expectation alignment
- landing promise → post-auth intent preservation;
- signup → meaningful activation by promise cohort;
- finance-like misunderstanding complaint rate;
- cash-redemption misconception rate;
- casino/real-money misconception rate;
- feature-expectation mismatch exit rate.

### Retention
- D1 exact-intent recognition;
- D3 same/adjacent-thread continuation;
- D7 original-promise continuation;
- D14 identity/curation action;
- D30 durable-record rate;
- branded/direct returning share;
- returning-user share and WAU/MAU.

### Growth / revenue
- organic promise → activation → D7/D30;
- share promise → activation → D7;
- CAC and fraud-adjusted CAC by message cohort;
- LTV and contribution by message cohort;
- ad/subscription/cosmetic revenue after retention eligibility;
- ad-induced churn.

### Trust guardrails
- phishing/ATO signal rate;
- impersonation/report rate;
- privacy complaint rate;
- youth/ad complaint rate;
- spam/fake-signup/referral-fraud rate;
- misleading finance claim reports;
- suspicious reward duplication.

## 11. Experiment backlog

### A. Persistence/identity promise vs finance-feature-first hero
Hypothesis: a clear persistence/identity promise attracts fewer but higher-quality visitors and improves activation/D7.
Target: first-time direct/organic homepage visitors.
Control: current feature/economy-heavy first impression.
Treatment: canonical brand promise + one current proof + Explore CTA.
Primary: visit → meaningful activation and D7.
Guardrails: signup completion, bounce, game-only comprehension, misleading-finance reports, page performance.
Minimum observation: matured D7 cohort; use D30 before broad paid-acquisition scaling.
Next: retain only if downstream quality improves, even if raw signup falls modestly.

### B. One proof vs feature grid
Hypothesis: one living proof (collection/story/season/path) improves first-30-second comprehension over many shortcuts.
Target: new anonymous visitors.
Control: multi-feature shortcut emphasis.
Treatment: one featured proof plus secondary navigation.
Primary: proof engagement → authored choice.
Guardrails: returning-user shortcut utility, accessibility, bounce.
Minimum observation: at least one full weekly content cycle plus D7.

### C. Intent-consistent guide vs wealth-ladder guide
Hypothesis: a goal-first getting-started narrative creates better first-session completion and lower finance misunderstanding.
Target: guide entrants/new signups.
Control: wealth/economy progression narrative.
Treatment: choose goal → activity → result → next goal, with economy as optional depth.
Primary: guide → first meaningful action; D1/D7.
Guardrails: guide completion, economy-feature discovery, confusion/support rate.
Minimum observation: D7 cohort, then confirm D30.

### D. Contextual trust qualifier placement
Hypothesis: concise game-only qualifiers near finance-adjacent claims improve trust without materially hurting activation.
Target: economy/market/bank/business learning entry pages.
Control: footer/global-only qualifier.
Treatment: concise contextual qualifier near the first relevant claim/action.
Primary: comprehension + activated-user conversion quality.
Guardrails: visual clutter, bounce, legal/support complaints.
Minimum observation: enough sessions for comprehension sample + D7.

### E. Message-cohort paid acquisition gate
Hypothesis: acquisition creative aligned to learning/build/collect/world identity produces stronger retained contribution than wealth/profit creative even at a higher CPC.
Target: any future paid acquisition pilot.
Control: broad economy/wealth creative where lawful and currently considered.
Treatment: canonical persistence/identity creative.
Primary: retention-adjusted contribution, D30, fraud-adjusted CAC.
Guardrails: misleading-ad reports, youth concerns, fake signup, privacy complaints.
Minimum observation: D30; do not scale from CTR/CPC alone.

## 12. Security, abuse and privacy review

### High — brand impersonation / phishing / ATO
Impact: attackers can imitate “official Moneyverse,” collection claims, season updates or wallet/reward messages and steal credentials/session information.
Abuse scenario: fake login or “claim/continue your chapter” page linked from social/Discord/search.
Minimum protection: consistent canonical domain/brand identity, official-link discipline, no secrets/session/recovery values in share URLs or notifications, clear separation of external destinations.
Separate development/QA: required for new deep-link, notification or external campaign flows.

### High — finance-like consumer deception
Impact: users can misunderstand WLD/WDX, deposits, stocks, business dividends or casino play as real financial value or guaranteed earning.
Abuse scenario: acquisition copy cherry-picks “compound,” “passive income,” “undervalued stock” or “capitalist” language while minimizing game-only qualification.
Minimum protection: canonical virtual/simulated/game-only message, no cash-return or guaranteed-profit claims, contextual qualifiers near relevant claims, marketing/legal review for finance-adjacent campaigns.
Separate development/QA: no code change required for this spec; consumer/legal review required before new campaigns.

### High — public/private boundary leakage
Impact: public proof/showcase surfaces could reveal balances, WDX positions, debt, hidden social graph, moderation/security/recovery state or precise personal details.
Minimum protection: public-safe allowlist, private by default, explicit reversible opt-in for personal artifacts, no sensitive query/URL/analytics payloads.
Separate development/privacy QA: required before new personalized public surfaces.

### Medium — bot/fake-signup/referral manipulation
Minimum protection: no meaningful WLD/WDX for raw click/view/signup/share, downstream verified milestones, fraud-adjusted attribution and cohort quality measurement.

### Medium — tracking/analytics overcollection
Brand-cohort analysis must not export credentials, session IDs, private balances, positions, debt, casino losses, recovery/security state, precise sensitive traits or unnecessary minor data to advertising/analytics vendors.

### Medium — community/UGC impersonation and doxxing
If user stories become brand proof, require opt-in/public-safe scope, report/block/takedown paths, no forced real identity and safe outbound-link policy.

Existing auth/session/RBAC/admin/ledger/privacy boundaries are unchanged by this planning update.

## 13. Youth and legal/policy cautions

- Do not make casino or speculative-profit language the primary brand hook for younger/general audiences.
- Age-sensitive discovery, behavioral advertising or creator/referral campaigns require current Korea/U.S. legal and privacy review before launch.
- The Korean PIPC’s 2026-04-01 note on U.S. COPPA 2.0 is treated only as a policy signal/review trigger, not as current Korean law.
- Korea’s current fair-advertising framework prohibits false/exaggerated or deceptive advertising; finance-like virtual-product claims must be accurate and substantiated.
- Sponsored/creator/material relationships require appropriate disclosure.
- WLD/WDX remain game-only; any future real-money redemption, real securities/deposit product or external-value prize changes the product/legal boundary and is outside this spec.

## 14. SEO and content impact

Brand architecture and SEO should reinforce each other.

Rules:
- titles/descriptions should tell the truth about the page and the product;
- the site should have a recognizable primary purpose, not unrelated keyword clusters;
- “Moneyverse” should be associated with one consistent category and promise;
- original Moneyverse world/collection/season/learning material should be the reason to rank;
- no thin finance-keyword pages that attract traffic by implying real returns;
- no third-party/sponsor inventory that borrows domain reputation without independent value;
- private account/portfolio/balance/security/recovery/moderation pages remain non-public/non-indexable.

Organic success remains `qualified visit → activation → D7/D30 → retained contribution`.

## 15. Latest references reviewed — 2026-09-14

### Discord — “Building on the Social Layer of Games: What’s New from GDC 2026” (2026-03)
URL: https://discord.com/blog/building-on-the-social-layer-of-games-whats-new-from-gdc-2026
Adoption: **direct principle**.
Key implication: Discord explicitly frames reducing the distance between discovery/social context and actually trying a game; Instant Play Quests lower the barrier to a first session. Moneyverse adopts the principle that the brand promise should lead immediately to one understandable experience, not a feature catalog.
Not adopted: Discord internal uplift figures as Moneyverse forecasts.

### Discord — “You’re Now Discord Official” (2026-03-12) and game discovery update (2026-08-20)
URLs:
- https://discord.com/blog/claim-your-game
- https://discord.com/press-releases/introducing-new-tools-to-power-game-discovery-and-social-play
Adoption: **direct trust/discovery principle**.
Key implication: one trusted canonical identity and consistent official profile reduce discovery ambiguity and support organic discovery. Moneyverse should keep official-domain/brand signals consistent across search, share, Discord and comeback surfaces.

### Meta — “Rewarding Original Creators on Facebook” (2026-03-13)
URL: https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/
Adoption: **directional reference**.
Key implication: prioritize original material and reduce copycat/impersonation pressure. Moneyverse’s durable acquisition should come from original world, collection, season and learning material, not generic finance summaries.

### Instagram — “Introducing Instants” (2026-05-13)
URL: https://about.fb.com/news/2026/05/instants-share-in-the-moment/
Adoption: **privacy/control reference**.
Key implication: low-friction sharing can still preserve user control, private archive behavior and block/mute/restrict protections. Moneyverse should keep personal history private by default and make sharing explicit/reversible.

### Google Search Central — people-first content; site reputation policy update (2026-08-28)
URLs:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
Adoption: **direct SEO principle**.
Key implication: clear site purpose, descriptive headings/titles, original value and trust matter more than search-engine-first content volume; third-party content must not exist mainly to borrow site reputation.

### Naver Search Advisor — current content/title guidance
URLs:
- https://searchadvisor.naver.com/guide/content-basic
- https://searchadvisor.naver.com/guide/markup-content
- https://searchadvisor.naver.com/guide/content-abusing
Adoption: **direct SEO/brand principle**.
Key implication: use a recognizable brand identity, concise accurate titles/descriptions and useful content; avoid user-confusing, phishing or low-value/spam content.

### Korea policy/legal references
- KFTC advertising-law resources: https://case.ftc.go.kr/ocp/co/relateLaword4.do
- PIPC COPPA 2.0 international-policy note, 2026-04-01: https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060030000&nttId=11938
Adoption: **guardrail/reference**. These sources reinforce accurate advertising and conservative youth/privacy review. The COPPA 2.0 item is not treated as Korean law.

## 16. Runtime Product Reality Audit — 2026-09-14

Runtime verification: **available**.

Observed public homepage:
- game-only WLD disclosure is visible;
- wallet/minigame/stock/shop/quest shortcuts appear before the main brand hero;
- multiple `SPONSORED ADVERTISEMENT` placements already exist;
- the hero says “a small, solid economy we build together” and identifies a Discord-connected community virtual economy;
- monthly public news is still empty/preparing;
- lobby can appear quiet/empty.

Observed getting-started guide:
- headline describes a next-generation virtual-economy portal;
- early product pillars emphasize compound deposits, bonds, loans, stock gains/dividends, business dividends and casino;
- roadmap progresses from seed WLD to savings/investing and eventually “representative capitalist”; 
- several passages use language such as stable interest, undervalued stocks, passive income or wealth growth even though the same page also states WLD is virtual/game-only.

Finding:
**The runtime trust disclosure is stronger than the runtime brand hierarchy.** The site says the economy is virtual, but the dominant getting-started success story can still make wealth accumulation and finance-like mechanics feel like the product’s central promise. That is not fully aligned with the newer retention strategy centered on authored choice, identity, collection, world continuity and durable history.

This spec does not change runtime copy. It records the growth hypothesis and required consumer guardrails for a later separately tested implementation.

## 17. Decision

Adopt **brand promise-to-first-value alignment** as the next growth priority.

Before scaling paid acquisition, referral payouts, additional ad inventory or mass SEO, verify one consistent promise across:

`search/share/home → first 30 seconds → sample → signup → first value → D1 → D7`.

The next growth pass should measure whether expectation-matched visitors produce stronger activation and retention than finance/feature-heavy acquisition, while preserving clear game-only and privacy/safety boundaries.

## 18. Version record

### v2026.09.14.65 — brand promise-to-first-value alignment
- Identified promise inconsistency as the largest current acquisition/activation quality gap.
- Defined canonical category, brand promise, proof hierarchy and trust qualifier.
- Added first-30-second, first-3-minute and D1/D3/D7/D14/D30 message continuity.
- Added homepage, guide, SEO, share, auth-continuation and comeback message architecture.
- Added copy guardrails for finance-like, passive-income, guaranteed-return and casino-first acquisition language.
- Added message-cohort KPI and five experiments tied to activation/D7/D30, not CTR alone.
- Added phishing/impersonation, finance-deception, public/private leakage, fraud, analytics and UGC guardrails.
- Added current Discord, Meta, Google, Naver, KFTC and PIPC reference notes.
- Recorded runtime mismatch between newer identity/history growth strategy and current finance-heavy getting-started narrative.

Documentation only. No runtime, database, API, authentication, infrastructure, security code or production configuration is changed by this version.
