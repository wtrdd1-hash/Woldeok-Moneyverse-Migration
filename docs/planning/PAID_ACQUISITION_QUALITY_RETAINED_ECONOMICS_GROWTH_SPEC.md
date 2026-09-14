# Woldeok Moneyverse — Paid Acquisition Quality & Retained-Economics Growth Spec

> Version: v2026.09.14.89
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`, `TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.ko.md](PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this run

Moneyverse now has detailed plans for organic discovery, brand promise, pre-signup value, signup intent recovery, first-week complexity, D1–D30 continuity, social/viral loops, trust proof and retention-safe monetization. The largest remaining acquisition gap is **paid acquisition quality**:

**If Moneyverse buys attention, how does it prevent optimization toward clicks, cheap signups or finance-curious traffic that does not become a healthy D7/D30 user?**

The current public homepage is a poor default destination for cold paid traffic because it simultaneously exposes wallet, five mini-games, exchange, shop, quests, lobby and sponsored placements before a visitor has chosen one intent. The page does clearly disclose that WLD/rewards are game-only, but a paid ad that promises one narrow value can still lose message continuity when it lands on the broad home surface.

Selected loop:

`truthful paid creative → source-matched public-safe landing → one proof/sample → authored interest → contextual signup → meaningful activation → D1 promise kept → D7 retained intent → D30 durable history → contribution margin → only then scale spend`

This is not an ad-platform integration or tracking implementation specification. It defines consumer sequencing, channel economics, experiment rules and privacy/abuse gates.

## 2. Paid acquisition is a quality amplifier, not a traffic objective

Paid traffic is eligible for scale only after the destination experience already demonstrates value.

Do not define success as:
- CPM, CPC, CTR or impressions alone;
- raw account registrations;
- app installs or OAuth completions;
- raw referral acceptance;
- sessions/user without meaningful action;
- short-term ad revenue from acquired traffic.

Primary success unit:

**fraud-adjusted D30 retained user with positive expected contribution margin and no unacceptable trust/privacy/safety degradation.**

Useful intermediate measures are meaningful activation, D1, D3 and D7, but they are not permission to ignore D30 economics.

## 3. Acquisition promise families

Paid creative should advertise one truthful consumer promise, not the whole product at once.

### A. Persistent-world / identity
Promise: build a profession, collection, project, room/archive or other durable identity/history in a persistent virtual world.

Preferred because it aligns with long-term retention and avoids real-finance confusion.

### B. Collection / lore / season discovery
Promise: explore one fictional company, collection, season chapter or world story and optionally preserve a personal thread.

Good fit for search/social discovery when the landing page itself is useful before signup.

### C. Learning / simulation
Promise: understand one economy/market concept through a clearly fictional, game-only sample or replay.

High scrutiny: never imply real investment performance, guaranteed returns, deposits, real securities or cash redemption.

### D. Community / cooperative project
Promise: understand one public-safe club/project/community outcome, then optionally participate.

High scrutiny for spam, impersonation, harassment, doxxing and fake activity.

### Not preferred for cold paid acquisition
- `make money`, `earn returns`, `safe investment`, `high yield`, `recover losses`, `best stock`, `guaranteed profit` framing;
- debt/loan urgency;
- casino win framing;
- wealth leaderboard/status bait;
- raw WLD giveaway or signup-bonus framing;
- creator claims that conceal sponsorship or material connection.

## 4. Creative → landing → product continuity contract

Every campaign must map to one primary landing intent.

A cold visitor should be able to answer within the first 30 seconds:
1. What did the ad promise?
2. Is the landing page delivering that same thing?
3. Is this clearly a virtual/game-only experience where relevant?
4. Can I receive useful value before giving credentials?
5. What one optional next action preserves this interest?

### Landing contract

`ad promise → same headline/context → proof/sample → one authored choice → contextual signup only if needed`

Do not send a narrow creative into a generic feature grid when a source-matched public page exists or can be planned safely.

Do not use cloaking, materially different reviewer/user pages, fake scarcity, hidden redirect chains or misleading button labels.

AI-generated/ad-platform-generated text assets require human review against Moneyverse brand, game-only and consumer-safety rules before broad use. Automated expansion must not silently turn a virtual learning/world message into real-finance or gambling-style claims.

## 5. First 30 seconds, first 3 minutes, first session

### First 30 seconds
- one promise;
- one reason to believe;
- one game-only clarification where finance-like language appears;
- one sample/proof;
- one CTA.

### First 3 minutes
The visitor should consume or try one useful thing and form one authored interest:
- save/follow a fictional company or world thread;
- choose a profession/collection direction;
- try one bounded learning replay/sample;
- inspect one season/project chapter;
- choose `continue`, `explore another`, or `not now`.

### First session
If the visitor signs up, recover the same source intent after authentication and lead to one meaningful action. Account creation is not activation.

The session should close with a clear result and optional continuation, not an endless feature tour or immediate monetization pressure.

## 6. D1 / D3 / D7 / D14 / D30 for paid cohorts

### D1 — promise kept
Return surface recognizes the exact thread acquired from the campaign rather than defaulting to wallet wealth, casino, debt or a generic homepage.

### D3 — useful continuity
Show actual change, relevant context or an honest unchanged state plus one next action. Do not manufacture novelty to justify ad spend.

### D7 — retained intent
The user should complete or meaningfully advance the same identity/collection/learning/project/world loop. D7 is the first serious quality gate for campaign continuation.

### D14 — voluntary breadth
Only after core value is coherent should the user be invited to adjacent systems. Breadth itself is not the objective.

### D30 — durable history
A retained paid user should have a durable artifact/history such as a collection chapter, profession path, project record, learning replay history, season memory or public-safe shareable outcome.

Paid-source users should not require larger WLD grants, stronger FOMO or more notifications than organic users in order to retain.

## 7. Channel economics and scale gates

### Core economics

Track at minimum:
- spend;
- qualified landing visits;
- meaningful activations;
- D1/D3/D7/D14/D30 retained users;
- fraud-adjusted versions of those cohorts;
- subscription/ad/cosmetic/sponsor contribution where applicable;
- moderation/support/refund/chargeback/fraud costs;
- infrastructure/content costs attributable to the cohort;
- contribution margin and payback period.

Useful derived measures:
- `CAC_activation = spend / meaningful activations`;
- `CAC_D7 = spend / fraud-adjusted D7 retained users`;
- `CAC_D30 = spend / fraud-adjusted D30 retained users`;
- `retained contribution = cohort revenue - variable ad/payment/support/moderation/fraud/content costs`;
- `LTV/CAC` only after LTV assumptions are grounded in mature cohorts, not optimistic extrapolation.

### Scale gate

Do not materially increase budget until:
1. landing promise comprehension is acceptable;
2. meaningful activation beats the defined baseline or meets an explicit strategic target;
3. D7 is mature and healthy;
4. D30 is available for permanent channel/creative standardization where feasible;
5. fake-signup/referral/invalid-traffic signals are controlled;
6. finance-like misunderstanding, privacy complaints and phishing reports do not worsen materially;
7. retained contribution shows a plausible payback path.

A campaign with cheap signups and weak D7/D30 is a failed campaign.

## 8. Attribution and incrementality

Last-click conversion is not sufficient evidence that paid media created durable value.

Use three views together:
- platform attribution for operational optimization;
- first-party cohort measurement for activation/D7/D30 quality;
- incrementality/holdout or geo/time-based controlled comparison when scale justifies it.

Never upload or expose private economy/security data merely to improve attribution.

Forbidden as advertising optimization payloads unless a future explicit legal/privacy review changes the rule:
- WLD/WDX exact balances or holdings;
- debt/loan state;
- casino losses/wins;
- exact private portfolio positions;
- private club/social graph membership;
- moderation, recovery or account-security state;
- credentials, tokens, session identifiers or recovery material;
- inferred sensitive traits.

Use the minimum event set required for acquisition-quality measurement. Any new pixel, Conversion API/server event, audience sync or enhanced matching design requires separate privacy/security/legal QA before implementation.

## 9. Paid retargeting / comeback

Retargeting is not permission to pressure users.

Eligible themes:
- a world/collection/project thread the user explicitly engaged with;
- a new season chapter that is actually available;
- a useful educational continuation;
- a public archive/update relevant to prior interest.

Avoid:
- `your balance is waiting`;
- debt/loss/casino urgency;
- fabricated reward expiry;
- revealing private state in ad creative;
- frequency that resembles stalking or harassment;
- targeting minors/sensitive cohorts without an explicit legal/privacy/safety basis.

Retargeting success is comeback → meaningful action → D7/D30 quality, not ad clicks.

## 10. Paid acquisition and SEO/content interaction

Paid media should not replace people-first organic content.

High-quality public guides, fictional-company pages, season archives, glossary/learning content and public-safe project retrospectives can serve as both organic and paid destinations when they independently satisfy visitor intent.

Do not create one thin paid landing page per keyword/ad group if the pages are substantively identical. Do not index campaign parameters, referral tokens, account-specific state or private personalization.

When a paid landing proves strong D7/D30 value, use the learning to improve the canonical public page rather than building a permanent doorway-page farm.

## 11. Viral/referral interaction

Paid acquisition and referral must remain distinguishable in economics and abuse analysis.

Do not stack large WLD/WDX rewards on top of paid traffic for:
- raw signup;
- invite acceptance;
- page view;
- share;
- ad click;
- notification opt-in.

If referral benefits exist, keep them delayed, capped and tied to verified multi-day healthy participation, favoring cosmetic/honor/collection/convenience benefits over economic advantage.

Watch for:
- paid traffic buying referral payouts;
- affiliate self-referral;
- multi-account farms;
- bot signups;
- device/network recycling;
- coupon/reward duplication;
- coordinated creator/referral manipulation.

## 12. Monetization after paid acquisition

Acquired users do not become monetization-ready simply because Moneyverse paid to acquire them.

Keep the existing lifecycle order:

`promised value → meaningful activation → continuity proof → monetization eligibility → low-interruption monetization → D30/trust validation`

Do not attempt to recover CAC by increasing ad load in the first session. Do not put sponsor/subscription pressure between the paid promise and the first result.

Evaluate profitability with:
- ad-induced churn;
- session abandonment;
- D1/D7/D30;
- subscription conversion and cancellation;
- cohort revenue;
- contribution margin;
- support/moderation/privacy cost.

## 13. KPI framework additions

### Acquisition quality
- qualified visit rate;
- ad-promise comprehension;
- landing-message match comprehension;
- first-sample completion;
- authored-interest rate;
- visitor → signup;
- visitor/signup → meaningful activation;
- time-to-first-value;
- first-session completion;
- D1/D3/D7/D14/D30 by campaign/creative/landing/source;
- paid returning-user share;
- meaningful actions/session;
- paid CAC per activation, D7 and D30 retained user;
- retained LTV/CAC and contribution margin.

### Trust / fraud / privacy guardrails
- invalid/suspicious traffic rate;
- fake-signup rate;
- referral/affiliate fraud rate;
- suspicious reward duplication;
- account-takeover/phishing report signals;
- finance-like misunderstanding rate;
- spam/report rate;
- privacy complaint rate;
- ad/platform tracking opt-out or complaint signal where measurable;
- landing/ad mismatch complaints;
- minor/sensitive-targeting incidents;
- downstream ad-induced churn.

## 14. Experiment backlog

### Experiment A — source-matched landing vs generic homepage
Hypothesis: matching the ad promise to one public-safe landing improves meaningful activation and D7 without increasing misunderstanding.
Target: first-time paid visitors.
Control: generic homepage.
Treatment: promise-matched landing with one proof/sample and one CTA.
Primary: meaningful activation and D7.
Guardrails: bounce, finance-like misunderstanding, fake signup, privacy/phishing complaints.
Observation: minimum mature D7 cohort; D30 before permanent default where feasible.
If successful: expand to the highest-quality promise families. If failed: simplify creative/landing promise before adding more targeting.

### Experiment B — optimize for signup vs meaningful activation
Hypothesis: campaign optimization using a higher-quality first-party conversion proxy yields fewer but more retained users.
Target: channels where conversion-volume requirements are sufficient.
Control: signup optimization.
Treatment: meaningful-activation optimization using a privacy-safe event.
Primary: CAC_D7 and D7 retention.
Guardrails: total qualified volume, D30, fake signup, privacy leakage.
Observation: enough conversions for stable platform learning plus mature D7.
If successful: retain higher-quality objective. If failed: investigate event quality/volume before reverting permanently.

### Experiment C — broad discovery vs qualified intent constraints
Hypothesis: narrower promise/intent controls may reduce click volume while improving activation and D30 economics.
Control: broad discovery expansion under reviewed safe creative.
Treatment: stronger intent/placement/keyword exclusions and source-matched destination.
Primary: fraud-adjusted CAC_D30 or best available mature retained CAC.
Guardrails: reach, activation, finance/casino misunderstanding, invalid traffic.
Observation: D7 minimum; D30 preferred.
Do not use misleading finance/profit creative as an experimental arm.

### Experiment D — platform attribution only vs incrementality-informed budget review
Hypothesis: holdout/incrementality evidence prevents over-crediting channels that would have converted anyway.
Target: campaigns with sufficient scale.
Control: budget decision using platform-attributed conversions.
Treatment: budget decision also informed by first-party retained cohorts and controlled incrementality evidence.
Primary: incremental D30 retained users per spend.
Guardrails: measurement noise, privacy, operational cost.
Observation: multiple campaign cycles; do not make high-confidence claims from underpowered tests.

### Experiment E — immediate retargeting vs value-triggered retargeting
Hypothesis: waiting until a user has demonstrated a clear public-safe interest produces higher-quality comeback with less complaint/fatigue.
Control: standard eligible retargeting timing.
Treatment: retarget only after a meaningful content/sample engagement and sufficient quiet period.
Primary: comeback → meaningful action → D7.
Guardrails: frequency, hide/report, privacy complaint, phishing confusion.
Observation: multiple weeks plus mature D7.

## 15. Security, abuse and privacy review

### HIGH — paid-ad impersonation and phishing / ATO
User impact: attackers can imitate Moneyverse ads, `WLD rewards`, account-security notices or fake login pages.
Abuse scenario: sponsored-looking creative leads to credential/OAuth/recovery theft.
Minimum protection: canonical-domain consistency, official-brand clarity, never request passwords/OAuth/recovery codes in growth messaging, no secrets in URLs, monitor/report obvious impersonation when operationally possible.
Separate development/QA: required for new deep-link/auth campaign flows or anti-impersonation tooling.

### HIGH — AI/broad-target creative drifts into real-finance or gambling claims
User impact: Moneyverse may be mistaken for real investment/deposit/gambling or loss-recovery service.
Abuse scenario: automated text expansion creates `high return`, `safe stock`, `recover losses` or similar language.
Minimum protection: human-reviewed approved creative library, game-only language where relevant, excluded unsafe claim families, no guaranteed return/cash redemption/real-security framing.
Separate review: product/legal/trust review before finance-adjacent paid campaigns.

### HIGH — invalid traffic, bots, fake signup and referral arbitrage
User/business impact: wasted spend, distorted experiments, duplicated rewards and economy abuse.
Abuse scenario: bot or multi-account farm consumes paid traffic and monetizes signup/referral/reward incentives.
Minimum protection: fraud-adjusted metrics, no meaningful WLD/WDX for raw ad click/signup/share, delayed/capped referral eligibility, anomaly review before scaling.
Separate development/QA: required before paid acquisition is combined with economic rewards.

### HIGH — advertising/analytics data leakage
User impact: private economy, social, security or sensitive behavioral data can leave Moneyverse through pixels/APIs/audience uploads.
Abuse scenario: exact WLD/WDX/debt/casino/private-social state becomes third-party targeting or profiling data.
Minimum protection: purpose limitation, data minimization, public-safe event taxonomy, no secrets/private economy/security state, age/region review, documented vendor/legal basis.
Separate privacy/security/legal QA: required before any new tracking vendor, server-side conversion API, enhanced matching or audience sync implementation.

### MEDIUM — landing mismatch / cloaking / affiliate deception
Impact: trust damage, platform enforcement, scam-like experience.
Minimum protection: creative and destination remain materially consistent for reviewers and users; no cloaking or hidden redirect behavior; affiliates/creators follow the same approved claim/disclosure rules.
Separate QA: required before affiliate network expansion.

Existing OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community boundaries remain unchanged. This run does not change security code.

## 16. Korea / US legal-policy cautions

- WLD/WDX remain virtual/simulated/game-only; paid creative must not imply real securities, deposits, fiat money, cash redemption or guaranteed investment returns.
- Ads, testimonials and compensated creator claims must be truthful and material relationships must be disclosed where required.
- Paid acquisition does not justify broader collection or use of third-party behavioral information. New tracking/targeting must have a valid privacy/legal basis and user-facing disclosure/control where applicable.
- Minor/sensitive-user targeting requires conservative treatment and separate review before launch.
- Marketing messages/retargeting channels must not silently convert service-consent into advertising consent or use deceptive opt-out friction.
- Subscription or paid-plan acquisition must preserve clear material terms, informed consent, cancellation/refund rules and no hidden recurring charge.

This is product planning, not a legal opinion. Material launch changes require current counsel/compliance review for the actual implementation, audience, region and vendor stack.

## 17. Research notes — 2026-09-14

### Directly adopted

1. **Google Ads — AI Max / DSA migration, 2026-04-15, updated 2026-06-11**
   - Source: https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/
   - Insight: Search targeting/creative/final-URL expansion is becoming more automated and broad.
   - Adoption: Moneyverse must define stronger creative/landing intent controls, human review and downstream D7/D30 quality gates rather than trusting click/conversion expansion by default.
   - Note: Google-reported performance claims are not Moneyverse forecasts.

2. **Google Ads — AI Max steering features, 2026-04-30**
   - Source: https://blog.google/products/ads-commerce/ai-max-new-features/
   - Insight: advertisers are given more ways to steer AI expansion and brand/messaging requirements.
   - Adoption: maintain an approved claim/promise set and treat campaign controls as safety/quality tools, especially for finance-like vocabulary.

3. **TikTok for Business — Attribution Portfolio, 2026-05-13**
   - Source: https://ads.tiktok.com/business/en-US/blog/attribution-analytics-performance-comparison
   - Insight: discovery-to-conversion journeys are multi-touch and last-click can understate/overstate channel contribution.
   - Adoption: combine platform attribution with first-party retained cohorts and incrementality evidence; do not optimize Moneyverse only on last-click signup.

4. **Meta — 2026 AI Drives Performance, 2026-01**
   - Source: https://about.fb.com/news/2026/01/2026-ai-drives-performance/
   - Insight: Meta is emphasizing incremental attribution and increasingly automated ranking/creative systems.
   - Adoption: directionally supports incrementality-aware measurement and human-reviewed brand/safety boundaries around automated creative. Meta internal uplift figures are not used as Moneyverse forecasts.

5. **Google Ad Traffic Quality — invalid activity guidance, current**
   - Source: https://www.google.com/ads/adtrafficquality/invalid-activity/
   - Insight: invalid traffic includes bots, fraudulent and accidental interactions that do not represent genuine user interest.
   - Adoption: use fraud-adjusted activation/D7/D30 and accidental-click guardrails; never treat paid clicks as product success.

### Trust / privacy / abuse guardrails

6. **Meta — legal action against scam advertisers, 2026-02-26**
   - Source: https://about.fb.com/news/2026/02/meta-takes-legal-action-against-scam-advertisers/
   - Insight: celeb-bait, cloaking, brand impersonation and subscription fraud remain active paid-ad attack patterns.
   - Adoption: no cloaking, strong creative/destination consistency, canonical domain, anti-impersonation awareness and careful creator/affiliate claims.

7. **Meta — advertiser verification / anti-scam expansion, 2026-03**
   - Source: https://about.fb.com/news/2026/03/meta-launches-new-anti-scam-tools-deploys-ai-technology-to-fight-scammers-and-protect-people/
   - Insight: advertiser identity and high-risk-category verification are part of scam-defense strategy.
   - Adoption: treat brand identity/canonical destination consistency as a growth trust requirement, not just a security detail.

8. **Korea PIPC — TikTok/Apple enforcement, 2026-07-27**
   - Source: https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS215&mCode=C040060000&nttId=12343
   - Insight: collection/use of third-party behavioral information without a proper legal basis is an active enforcement concern.
   - Adoption: no unrestricted ad-platform profiling from private Moneyverse economy/social/security data; new tracking requires separate privacy/legal QA.

9. **KISA Spam Center — 7th revised anti-spam guide, 2026-03-04**
   - Source: https://spam.kisa.or.kr/spam/main.do
   - Insight: ambiguous advertising-consent wording and obstructive push opt-out are explicitly discouraged/limited in current Korean guidance.
   - Adoption: paid acquisition/retargeting must not turn service consent into hidden marketing consent or use manipulative opt-out friction.

## 18. Runtime Product Reality Audit — 2026-09-14

Runtime verification: **available for the public web homepage**.

Observed at `https://easy-scraping.com/`:
- repeated disclosure that WLD and rewards are game-only virtual data;
- the first viewport exposes wallet and mini-games, then a quick-link grid for wallet, five games, exchange, shop, quests and lobby;
- sponsored placements appear before and between product explanation sections;
- the core brand explanation (`Discord-connected community virtual economy`, activity becomes history) appears below the initial utility/shortcut area;
- the page offers pre-signup guidance, shop preview, announcements and community lobby context;
- current announcements remain a quiet state.

Growth implication:
**the generic homepage is not automatically the best cold paid landing.** A campaign that promises one world/collection/learning/community value can lose message continuity in the multi-feature first viewport. This spec therefore treats source-matched landing/message continuity as the first paid-acquisition experiment rather than increasing media spend.

Security implication:
The page currently maintains a strong game-only boundary, which paid creative must preserve. No paid campaign should weaken that boundary merely to improve CTR or signup rate.

## 19. Version record

### v2026.09.14.89 — Paid Acquisition Quality & Retained-Economics Growth
- Defined paid acquisition as a retained-user economics problem rather than a click/signup problem.
- Added four safe promise families and excluded finance/profit/casino-style cold acquisition framing.
- Added creative→landing→sample→authored-interest→signup→activation continuity contract.
- Added D1/D3/D7/D14/D30 paid cohort expectations.
- Added CAC_activation/CAC_D7/CAC_D30 and retained-contribution scale gates.
- Added platform attribution + first-party cohort + incrementality measurement model.
- Added privacy-minimized advertising event boundaries and prohibited sensitive optimization payloads.
- Added paid retargeting/comeback, SEO/content, referral and monetization interaction rules.
- Added five experiments with mature-retention and trust/fraud/privacy guardrails.
- Added four HIGH and one MEDIUM security/abuse/privacy risk classifications.
- Added current 2026 Google/Meta/TikTok/PIPC/KISA research notes with direct-adoption vs guardrail distinction.
- Runtime public-home audit available; source-matched landing quality remains an unverified growth hypothesis.

Documentation-only consumer planning update. Existing implementation/security/economy boundaries are preserved.