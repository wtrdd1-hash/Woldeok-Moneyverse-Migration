# Woldeok Moneyverse — Collection Showcase Viral Wedge Spec

> Version: v2026.09.14.59
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, `ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`
> Korean counterpart: [COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.ko.md](COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.ko.md)

## 1. Gap selected

The largest remaining viral-growth gap is no longer whether Moneyverse should have shareable artifacts. The previous artifact-to-recipient spec already establishes that principle. The gap is that the product still has too many candidate artifact types and no first wedge with a narrow, measurable recipient loop.

The first candidate should be a **curated collection showcase** rather than a wealth, return, casino, debt or portfolio-performance card.

Why this wedge:
- collections already fit the long-term identity and aspiration direction;
- completion and curation create a durable reason to return without punitive streaks;
- a collection can communicate taste and history without revealing economic power;
- the recipient can understand a set visually before knowing the full Moneyverse economy;
- a recipient can be offered a starter collection path rather than a generic feature grid;
- the artifact can later connect to museums, archives, seasons, spaces and prestige without becoming P2W.

This is a consumer-growth specification only. It does not add public-profile schemas, sharing APIs, deep-link contracts, reward services, moderation backends or new authentication flows.

## 2. Product promise

**“Show what you chose to collect and why it matters — not how rich you are.”**

A good collection showcase should make the recipient understand three things before login:
1. what set or theme the member completed or curated;
2. why the set is interesting inside the fictional world or the member’s identity;
3. what small related thing the recipient can inspect or try next.

## 3. First artifact contract

The first viral wedge should center on one bounded showcase object:

`collection milestone → member curates a public-safe showcase → recipient understands the set → recipient explores one related item/theme → optional starter preview → signup only to preserve progress → first meaningful collection action → D1/D7 continuation → recipient eventually curates a showcase`

A showcase should contain only public-safe information:
- member-chosen display identity;
- collection/set title;
- completion or curation milestone;
- selected items or visual slots;
- one short member caption or preset explanation where safe;
- season/world lore that is independently understandable;
- one contextual CTA such as `Explore the set` or `Try a starter collection path`;
- virtual/game-only cue when the collection relates to money, markets or economic systems.

Default-excluded fields:
- WLD balance or lifetime wealth;
- WDX positions, cost basis, realized/unrealized return;
- debt/loan state;
- casino bets/winnings/losses;
- private friend/club graph;
- account, security or recovery state;
- real name, precise location or other unnecessary personal data.

## 4. Why users create and share it

### Completion pride
Finishing a coherent set is easier to explain socially than a raw account level.

### Taste and identity
Users choose what to display and in what order. The artifact should feel authored, not generated as an opaque scorecard.

### Memory
A season or world collection can become a durable chapter in the user’s history after the event ends.

### Curation after completion
Completion should not immediately become “buy the next item.” It can become arrange, annotate, restore, display, compare themes or add to a museum/archive.

### Low-pressure social proof
A friend can understand “this is the set I completed” without being asked to admire wealth, gambling outcomes or risky returns.

## 5. Recipient first 30 seconds / 3 minutes / first session

### First 30 seconds
The recipient should understand:
- what the collection is;
- what the sender chose to highlight;
- whether it is complete, curated or tied to a season/world chapter;
- that the surrounding economy is virtual/game-only where relevant;
- that basic context is visible before authentication.

### First 3 minutes
Offer one path only:
- inspect the set and item lore;
- view one safe comparison/example;
- try a starter set preview;
- view the related season/world story.

Do not route recipients first to wallet, bank, loan, casino, trading dashboard or a generic feature directory.

### First session
A share-assisted activation requires meaningful state, for example:
- choosing a starter collection theme;
- saving a collection thread;
- completing a sample/lore interaction;
- acquiring or selecting the first non-competitive starter piece through the normal product flow;
- setting one next collection goal.

Opening the page, logging in, checking WLD or clicking an ad is not activation.

## 6. D1/D3/D7/D14/D30

### D1 — recognition
Return the user to the collection/theme they entered through and show that their selection still exists.

### D3 — adjacent meaning
Show one related set, lore chapter, space-display idea or profession/season connection.

### D7 — visible progress
Show what changed in the user’s own collection path or in the related world/season context. Avoid “you lost your chance” framing.

### D14 — curation
Introduce arranging, annotating, restoring, displaying or combining collection history where applicable.

### D30 — identity artifact
The user should have a durable collection chapter, museum/archive element or showcase worth keeping and optionally sharing.

## 7. Acquisition and viral loop

Primary loop:

`member collection progress → completion/curation moment → share intent → safe showcase → recipient engaged view → contextual exploration → signup if continuity requires → collection activation → D1 → D7 → own showcase`

Prioritize one-to-one relevance and identity broadcasting over referral payout.

Do not create meaningful WLD/WDX rewards for:
- opening a share;
- posting a showcase;
- receiving views;
- raw registrations;
- positive captions or endorsements.

If future referral incentives are tested, use verified downstream milestones, caps and fraud-adjusted CAC.

## 8. SEO and public discovery

A personal one-off share card should usually be private/unlisted or `noindex` unless it has enough independent value and the user explicitly opts into broader public discovery.

Indexable candidates can include:
- curated collection guides with substantial lore/context;
- season collection archives;
- museum-style public showcases with meaningful explanatory content;
- editorial collection spotlights that remain useful without knowing the owner.

Do not mass-generate thin pages for every user, item combination or completion event. Do not use third-party/member pages mainly to borrow Moneyverse domain authority.

Search funnel:

`qualified search/social discovery → useful collection context → starter exploration → signup/return → activation → D7 → D30 → retention-adjusted contribution`

## 9. Monetization

Monetization comes after collection value is understood.

Safe candidate monetization:
- non-P2W showcase frames/themes;
- museum/space presentation cosmetics;
- optional profile/archive presentation upgrades;
- ad-free subscription after repeated product value;
- clearly labeled sponsor/editorial collection content where appropriate.

Do not sell:
- collection completion itself;
- leaderboard/economy advantages disguised as prestige;
- better WDX, banking, loan or casino outcomes;
- exposure ranking that appears organic without clear sponsorship labeling.

Do not place ads between the shared artifact and its primary `Explore the set`/starter CTA if they could be mistaken for product navigation.

## 10. Safety, privacy and abuse review

### High — public/private leakage
User impact: stalking, embarrassment, targeted fraud and account targeting.
Abuse scenario: showcase generation accidentally includes balance, holdings, debt, private graph, precise personal data or security state.
Minimum protection: public-safe allowlist; private by default; owner preview before publish; no secrets/session/recovery values in URLs or analytics; delete/hide control.
Separate development/QA required: yes before personalized public showcase rollout.

### High — phishing / fake reward showcases
User impact: credential theft and account takeover.
Abuse scenario: attackers clone a collection page and claim the recipient must log in or “claim” an item/reward.
Minimum protection: consistent official domain/branding; public context before auth; no asset-loss urgency; no credential/auth-code request inside share content; external-link policy.
Separate development/QA required: yes before external deep links or messaging campaigns.

### High — bot/multi-account social-proof farming
User impact: polluted discovery, fake popularity and bad CAC decisions.
Abuse scenario: scripted accounts create collections/views/shares to manufacture prestige.
Minimum protection: no spendable reward for raw views/shares; suspicious activity excluded from growth decisions; bounded eligibility for public spotlights.
Separate development/QA required: yes before reward-bearing or ranked public showcase discovery.

### High — UGC abuse, impersonation and doxxing
User impact: harassment, scams and privacy harm.
Abuse scenario: captions or linked content contain personal data, malicious links or impersonation.
Minimum protection: bounded text surfaces or presets for first pilot; reporting/removal; public identity controls; no forced real name; moderation policy.
Separate development/QA required: yes before open-ended public captions or broad UGC discovery.

### Medium — minors and age-sensitive discovery
Do not infer sensitive age traits for growth targeting. Do not expand stranger interaction, behavioral ad targeting or financial-like recommendations for minors without separate privacy/legal/safety review.

## 11. Experiment backlog

### Experiment A — collection showcase vs generic invite
Hypothesis: a meaningful collection artifact produces higher recipient activation and D7 than a generic “join Moneyverse” share.
Target: users who reach a real collection milestone.
Entry point: post-milestone share prompt.
Control: generic Moneyverse invitation.
Treatment: curated collection showcase.
Primary: share recipient → activation → D7.
Guardrails: spam/report, privacy complaint, fake-signup, phishing reports.
Minimum observation: at least one matured D7 cohort and enough recipient volume to avoid interpreting noise as uplift.
Next action: expand only if downstream retention improves, not merely opens/CTR.

### Experiment B — user-curated layout vs auto-generated scorecard
Hypothesis: choice of displayed items/order increases share intent without increasing privacy complaints.
Primary: share-send rate and recipient engaged view.
Guardrails: hide/delete rate, privacy complaints, sensitive-field leakage.

### Experiment C — preview-before-auth vs auth-first
Hypothesis: a 30–90 second collection preview improves qualified signup and activation.
Primary: recipient signup → activation.
Guardrails: fake signup, abuse, public/private boundary incidents.

### Experiment D — collection/identity artifact vs wealth/status artifact
Hypothesis: collection identity yields better D7 and trust than raw WLD/return status.
Primary: recipient D7 and artifact creation by D30.
Guardrails: finance-like complaint, harassment/status pressure, privacy complaint.

### Experiment E — value first vs early advertising
Hypothesis: preserving artifact comprehension and starter exploration before ads improves retention-adjusted contribution.
Primary: recipient activation and D7; secondary: contribution margin.
Guardrails: accidental-ad-click, bounce, ad-induced churn, CWV regression.

## 12. KPI and cohort model

Creation:
- collection milestone reach rate;
- showcase creation rate;
- public/unlisted opt-in rate;
- share intent and share-send rate;
- repeat showcase rate.

Recipient quality:
- engaged showcase view;
- set/lore exploration rate;
- preview completion;
- share → signup → activation;
- share-assisted time-to-first-value.

Retention:
- share-recipient D1/D3/D7/D14/D30;
- collection-thread continuation;
- D7 collection progress;
- D30 own-showcase creation;
- second-generation share rate.

Business:
- fraud-adjusted CAC by share source;
- share-assisted LTV;
- cohort revenue;
- retention-adjusted contribution;
- ad-induced churn and subscription conversion only after sufficient value exposure.

Trust guardrails:
- privacy complaint rate;
- spam/report rate;
- phishing/ATO signal rate;
- fake-signup/referral-fraud rate;
- suspicious view/share inflation;
- accidental-ad-click rate;
- finance-like claim complaint rate.

## 13. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable during this planning pass.

Observed:
- the home clearly repeats that WLD and rewards are game-only virtual data;
- the home exposes wallet, games, exchange, shop, quests, lobby and login/start links;
- multiple sponsored-advertisement slots already exist;
- `Monthly notes` still says public operations news is being prepared;
- the lobby can visibly be quiet/empty;
- the current getting-started guide remains heavily economy-led, foregrounding compound deposits, bonds, loans, stock gains/dividends, passive income and a “representative capitalist” progression story.

Implication: there is not yet a visible public collection-showcase wedge on the main public surface. The first collection artifact experiment should therefore prove recipient understanding and D7 quality before expanding referral payouts, personalized public feeds or additional ad inventory.

## 14. Research note — 2026-09-14

| Source | Date | Observation | Use |
|---|---|---|---|
| Discord Profile Widgets FAQ, https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ | 2026-09-08 | Users can choose, rearrange and remove profile widgets that express interests and game progress. | **Direct adoption:** user-controlled curation and removable identity presentation. |
| Xbox Wire, “New Improvements to Achievements”, https://news.xbox.com/en-us/2026/04/08/xbox-insiders-may-2026-console-features/ | 2026-04-08 | Xbox added profile control to hide games and makes 100% completion visually easy to celebrate. | **Direct adoption:** completion milestone + user control over presentation. |
| Xbox Wire, X25 Community Designs, https://news.xbox.com/en-us/2026/08/24/xbox-anniversary-x25-fanfest-gear-community-designs/ | 2026-08-24 | Community-created designs are turned into identity surfaces and curated collections. | **Reference:** community identity can become brand/content fuel without raw wealth ranking. |
| Google Search, Search profiles, https://blog.google/products-and-platforms/products/search/a-new-profile-to-help-publishers-and-creators-highlight-their-work-on-search/ | 2026-06-04 | Search profiles let sources curate a shareable presence and help audiences follow content. | **Reference:** curated source identity can connect discovery to repeat following. |
| Google Search Central, Site Reputation Policy update, https://developers.google.com/search/blog/2026/08/update-site-reputation-policy | 2026-08-28 | Google continues to target third-party content used mainly to exploit host reputation. | **Direct guardrail:** no mass thin user showcase SEO inventory. |
| Spotify artist identity transparency update | 2026-08-11 | Spotify introduced stronger identity transparency signals for AI personas and reporting/appeal direction. | **Reference:** public identity surfaces need clear provenance and user trust cues. |
| FTC Publishing.com final order, https://www.ftc.gov/news-events/news/press-releases/2026/07/ftc-approves-final-order-against-publishingcom-settling-allegations-it-misled-consumers | 2026-07 | FTC emphasized substantiated earnings claims and disclosure of incentives/material connections. | **Direct guardrail:** do not turn collection sharing into hidden paid endorsement or finance-like earnings claim. |
| FTC Consumer Reviews and Testimonials Rule Q&A, https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers | current | Fake reviews/social influence and sentiment-conditioned incentives are restricted. | **Direct guardrail:** no fake social proof or positive-sentiment-conditioned sharing incentive. |
| Korea PIPC international privacy trend note on COPPA 2.0, https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060010000&nttId=11938 | 2026-04-01 | Notes proposed U.S. expansion of teen privacy and restrictions on targeted advertising; not current Korean law. | **Reference/legal-review trigger:** keep youth personalization/ads conservative and re-check applicable law before launch. |

## 15. Legal and policy notes

- WLD/WDX remain virtual/simulated/game-only. A collection artifact must not imply real investment performance, deposit safety, cash value or guaranteed earnings.
- Compensated creator/member showcases may create endorsement/advertising obligations; material relationships should be clearly disclosed where applicable.
- Do not buy fake views, followers, testimonials or positive sentiment as social proof.
- Personalized/public collection surfaces should minimize data and use opt-in/public-safe presentation; youth-oriented discovery or targeted advertising requires separate age/privacy/legal review.
- Before launch, re-check current Korean and U.S. requirements because consumer, privacy, minors and advertising rules can change.

## 16. Decision

Use **curated collection showcase** as the first artifact-to-recipient viral wedge to validate.

Do not yet broaden to wealth cards, portfolio cards, casino outcomes, referral payouts, broad public activity feeds or mass-indexed personal pages.

Next growth question:

**Can one collection milestone produce a trustworthy loop from member pride → recipient understanding → first collection action → D7 progress → recipient’s own showcase?**
