# Woldeok Moneyverse — Collection Preview-to-First-Piece Activation Spec

> Version: v2026.09.14.60
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`
> Korean counterpart: [COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.ko.md](COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

The collection showcase wedge now answers what a member should share. The largest remaining gap is the next 90 seconds for the recipient: **why should someone who enjoyed a collection showcase create an account and take a first meaningful collection action instead of merely viewing the artifact and leaving?**

The product therefore needs a narrow value bridge:

`showcase understanding → safe collection preview → personal choice → signup only to preserve continuity → first piece/goal → visible next step → D1 recognition → D7 progress`

This is not a new collection backend, reward service, public-profile schema, deep-link protocol or authentication contract. It defines consumer meaning, sequence, metrics, safety constraints and experiment rules only.

## 2. Consumer promise

**“Try the collection idea before joining. Join only when you want to keep your choice and continue it.”**

The recipient should never need to understand the full Moneyverse economy before deciding whether the collection path is interesting.

The preview must answer:
1. What is this collection/theme?
2. Why did the sender care enough to display it?
3. What can I choose or explore right now without an account?
4. What specifically will be preserved if I sign in?
5. What is my first meaningful next step after sign-in?

## 3. First 30 seconds

The first screen should prioritize, in order:
- collection/set identity;
- sender-selected highlight and short context;
- completion/curation/season status;
- one sentence describing the recipient’s possible path;
- one primary CTA such as `Try this collection path`;
- clear virtual/game-only cue wherever economic concepts appear.

Do not lead with:
- WLD starting balance;
- wallet setup;
- bank/deposit/loan products;
- WDX return or price performance;
- casino outcomes;
- a generic feature grid;
- multiple equal CTAs;
- an ad that can be confused with the product CTA.

## 4. First 3 minutes: preview before commitment

The preview should create a small authored choice rather than a fake reward.

Candidate preview actions:
- choose one of 2–3 starter themes;
- inspect 2–3 representative items and their lore;
- arrange a tiny sample set locally for the session;
- pick one item/theme to follow;
- choose a first collection intention such as `complete`, `curate`, `learn the lore`, or `build a display`.

The preview must not:
- mint spendable WLD/WDX;
- create an economic advantage for anonymous users;
- expose another member’s private inventory or balances;
- claim that a rare item is guaranteed after signup;
- create artificial urgency such as “sign up now or lose this forever”;
- require the user to connect Discord/Google before understanding the value.

## 5. Why signup happens

Signup should be contextual rather than generic.

Good reason:
**“Save this theme and continue your first collection chapter.”**

Weak reasons:
- `Create account to continue` with no explanation;
- `Claim free WLD`;
- `Unlock investment features`;
- `Do not lose your reward`.

The pre-signup choice should be useful even if the user never signs up. Authentication exists to preserve continuity, identity and future progress—not to hide the value proposition.

## 6. First meaningful action after signup

Authentication is not activation.

A collection-share recipient becomes activated only after meaningful state is created, for example:
- selecting a starter collection theme;
- acquiring/selecting a non-competitive starter piece through the normal product flow;
- saving the collection thread;
- completing one lore/sample interaction;
- setting a next collection milestone;
- creating a first private draft arrangement.

Do not count as activation:
- successful OAuth;
- terms acceptance alone;
- wallet open;
- WLD balance view;
- ad click;
- generic home visit.

### First-value proof
Immediately after the meaningful action, show:
- what the user chose;
- what is now preserved;
- one next goal;
- when/why returning will be useful.

## 7. Session-length design

### 1–3 minute quick session
- view a showcase;
- choose a theme;
- save/follow one collection thread;
- leave with one visible next goal.

### 5–15 minute meaningful session
- explore set lore;
- complete first collection action;
- arrange or annotate a small display;
- see adjacent season/world context.

### 30+ minute deep session
- compare themes;
- curate a larger display;
- explore archive/museum/history layers;
- participate in an optional public-safe community project.

No hard daily action cap is introduced by this spec. Diminishing rewards may protect the economy where already valid, but the collection activity itself should not become unavailable solely to manufacture scarcity.

## 8. D1 / D3 / D7 / D14 / D30

### D1 — recognition
Show the exact collection/theme/intention the user selected. The primary emotional signal is: **“My choice is still here.”**

### D3 — adjacent meaning
Offer one adjacent item, lore chapter, display idea or related season/profession link. Avoid flooding the user with unrelated systems.

### D7 — progress proof
Show a real change in the user’s collection path: progress, new context, a completed small goal, or an honest next step. Do not use lost-reward or streak-reset framing.

### D14 — authorship
Introduce curation: order, annotate, restore, theme, archive or display choices.

### D30 — identity artifact
The user should possess a durable collection chapter or display that is valuable even without sharing and can optionally become a public-safe showcase.

## 9. Acquisition and funnel model

Primary share-assisted funnel:

`member showcase → recipient understands artifact → preview starts → authored choice → contextual signup → meaningful collection action → first-value proof → D1 → D7 → D30 → optional own showcase`

Measure separately by:
- direct friend share;
- Discord/community share;
- organic search/editorial discovery;
- creator/partner content;
- paid acquisition if later tested.

Paid acquisition is acceptable only when CAC is linked through activation, D7/D30, LTV and contribution margin. Showcase opens or cheap signups alone are not success.

## 10. Experiment backlog

### Experiment A — preview-before-auth vs auth-first
Hypothesis: allowing a 30–90 second meaningful preview increases qualified signup and downstream activation.
Target cohort: non-member collection-showcase recipients.
Entry point: primary showcase CTA.
Control: authentication required before collection interaction.
Treatment: public-safe preview followed by contextual signup to save continuity.
Primary metric: recipient → signup → meaningful activation.
Guardrails: fake signup, privacy complaints, public/private leakage, abuse rate.
Minimum observation: at least one matured D7 cohort and sufficient volume for directional confidence.
Next action: adopt only if activation and D7 improve without trust regressions.

### Experiment B — authored choice vs passive lore
Hypothesis: making one low-risk choice creates stronger first-session ownership than passive reading alone.
Control: lore-only preview.
Treatment: choose starter theme/intention plus lore.
Primary metric: preview → meaningful action and D1 recognition return.
Guardrails: confusion, abandonment, accessibility complaints.

### Experiment C — contextual signup promise vs generic signup
Hypothesis: `Save this theme and continue` produces better activation than `Join Moneyverse`.
Primary metric: signup → meaningful collection action.
Guardrails: misleading-copy complaints, OAuth abandonment, fake signup.

### Experiment D — first-piece proof vs balance-first onboarding
Hypothesis: showing the selected collection state before wallet/balance produces better D7 and trust for share-entry cohorts.
Control: existing generic/economy-led post-login route.
Treatment: return to chosen collection path and show first-value proof.
Primary metric: time-to-first-value, activation, D7.
Guardrails: auth/session failure, broken-intent return, support burden.

### Experiment E — value-first monetization
Hypothesis: delaying ad/subscription prompts until after first-value proof improves retention-adjusted contribution.
Control: early reviewed-public-surface ad exposure.
Treatment: protect the artifact → preview → first-value path from interruptive monetization.
Primary metric: D7 plus contribution margin.
Guardrails: accidental-ad-click, ad-induced churn, CWV regression.

## 11. KPI and cohort model

Acquisition/preview:
- showcase engaged-view rate;
- primary CTA rate;
- preview start/completion;
- theme/intention choice rate;
- qualified signup conversion.

Activation:
- signup → meaningful collection action;
- time-to-first-value;
- first-session completion;
- first-goal set rate;
- intent-preservation success signal.

Retention:
- share-recipient D1/D3/D7/D14/D30;
- D1 recognition return;
- D7 collection-progress rate;
- D30 durable collection chapter;
- own-showcase creation and second-generation share.

Business:
- CAC by acquisition source;
- fraud-adjusted CAC;
- share-assisted LTV;
- cohort revenue;
- ARPU/ARPDAU only after sufficient value exposure;
- subscription conversion;
- retention-adjusted contribution.

Trust guardrails:
- abuse rate;
- fake-signup/referral-fraud rate;
- phishing/ATO signal rate;
- privacy complaint rate;
- spam/report rate;
- suspicious reward duplication;
- public/private leakage incidents;
- finance-like claim complaints;
- accidental-ad-click rate.

## 12. SEO and content discovery

Do not create an indexable URL for every preview state, item choice or user draft.

Indexable content should have independent value:
- substantial collection guides;
- collection lore and history;
- season/archive pages;
- editorial museum-style showcases;
- public-safe community projects with meaningful context.

Personal preview state, private drafts, account progression, balances, holdings, loans, casino history, security/recovery state and referral claims must not become search inventory.

Use people-first content. Thin automated pages, doorway variants, keyword stuffing and mass-generated personal pages are excluded. New/low-trust UGC should not automatically receive search visibility merely because it lives on the Moneyverse domain.

## 13. Monetization

Monetization follows value proof.

Candidate later monetization:
- non-P2W showcase/display themes;
- museum/space presentation cosmetics;
- archive/profile presentation upgrades;
- ad-free subscription after repeat value;
- clearly labeled sponsor/editorial collection content.

Do not monetize:
- completion odds or economic advantage;
- WDX/banking/loan/casino superiority;
- fake scarcity;
- hidden sponsored ranking;
- a signup reward that appears to have cash/investment value.

Subscription terms must be clear, express consent must precede charging, and cancellation must remain straightforward. Do not use cancellation friction as a retention mechanism.

## 14. Safety, privacy and abuse review

### High — preview leaks private collection/account context
User impact: stalking, targeted scams, embarrassment and account targeting.
Abuse scenario: preview or analytics includes non-public inventory, balances, holdings, debt, social graph, account identifiers or security state.
Minimum protection: public-safe allowlist, data minimization, private-by-default state, no secret/session/recovery values in URLs/analytics.
Separate development/QA required: yes before personalized public preview implementation.

### High — phishing through “save/claim your first piece”
User impact: credential theft and account takeover.
Abuse scenario: lookalike pages promise a starter item and demand credentials, OAuth codes or wallet-like information.
Minimum protection: consistent official domain/branding; useful context visible before auth; no credential/auth-code request inside shared content; no asset-loss urgency.
Separate development/QA required: yes before external deep-link/message campaigns.

### High — multi-account/referral farming
User impact: polluted growth data and economy abuse.
Abuse scenario: scripted accounts repeatedly use previews/signups to farm starter value or referrals.
Minimum protection: no meaningful spendable reward for preview/raw signup; fraud-adjusted CAC; suspicious cohorts excluded from growth decisions.
Separate development/QA required: yes before economic referral/starter incentives.

### High — UGC abuse in captions/lore links
User impact: harassment, impersonation, doxxing and malicious-link exposure.
Abuse scenario: showcase caption or linked content contains personal data, scam links or impersonation.
Minimum protection: bounded/preset text for the first pilot, reporting/removal, external-link policy, no forced real name.
Separate development/QA required: yes before open-ended public UGC.

### Medium — minors and behavioral personalization
Do not infer sensitive age traits or use collection behavior to intensify targeted advertising to minors. Youth-facing public discovery, behavioral ads or stranger interaction require separate privacy/safety/legal review.

## 15. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable.

Observed:
- home clearly says WLD/rewards are game-only virtual data;
- first public shortcuts emphasize wallet, games, exchange, shop and quests;
- multiple sponsored-advertisement areas are already present;
- `Monthly notes` still says public operations news is being prepared;
- the lobby can visibly be quiet/empty;
- the getting-started guide remains strongly economy-led: login → starting balance → quests/jobs → compound deposits/shop, and extensively foregrounds deposits, bonds, loans, stock gains/dividends, passive income and a `representative capitalist` progression story;
- no visible public collection showcase → preview → first-piece activation path was verified on the current public home/guide surfaces.

Implication: the collection viral wedge should not be judged by share opens alone. Its first validation must prove that a recipient understands the collection, makes an authored choice, reaches first value quickly and returns at D1/D7 before referral payouts, broader public UGC, mass SEO pages or more ad inventory are expanded.

## 16. Research note — 2026-09-14

| Source | Date | Observation | Use |
|---|---|---|---|
| Discord Profile Widgets FAQ | 2026-09-08 | Users manually select, rearrange and remove interests/game progress shown on profile. | **Direct adoption:** authored choice and user-controlled presentation. |
| Discord game discovery/social play update | 2026-08-20 | Discovery products are framed around downstream gameplay/retention actions, not exposure alone. | **Direct adoption:** judge showcase traffic by activation and retention, not opens. |
| Xbox achievement improvements | 2026-04-08 | Completion is made visible while users can hide games from public achievement history. | **Direct adoption:** celebrate completion while preserving presentation control. |
| Pokémon TCG Pocket community/support guidance | updated 2026-05-12 | Community collection-transfer features include eligibility timing/history controls rather than unrestricted immediate transfer. | **Reference:** collection social actions can mature after initial use instead of being a raw signup incentive. |
| Google Search Central — Prevent user-generated spam | current | Recommends abuse policies, reporting, spam-account detection, and considering `noindex` for low-trust/new-user content. | **Direct guardrail:** do not mass-index thin/low-trust showcase or preview UGC. |
| Google Site Reputation Policy update | 2026-08-28 | Third-party content should not exist mainly to exploit host search reputation. | **Direct guardrail:** collection pages are not SEO inventory. |
| FTC Shutterstock settlement | 2026-05-13 | FTC alleged inadequate material-term disclosure, lack of express informed consent and difficult cancellation. | **Direct guardrail:** subscription monetization only with clear terms, consent and simple cancellation. |
| FTC Publishing.com final order | 2026-07 | Earnings claims and compensated endorsements require truthful substantiation/disclosure. | **Direct guardrail:** collection sharing must not become hidden paid endorsement or earnings marketing. |
| Korea PIPC international trend note on COPPA 2.0 | 2026-04-01 | Reports U.S. proposals expanding youth privacy and targeted-ad restrictions; not current Korean law. | **Legal-review trigger:** keep minors personalization/ads conservative and re-check applicable law before launch. |

## 17. Legal/policy notes

- WLD/WDX remain virtual/simulated/game-only. Collection preview must not imply cash value, deposit safety, guaranteed return or real investment opportunity.
- Sponsored/compensated collection promotion should clearly disclose material relationships where applicable.
- Subscription/autorenewal must use clear material-term disclosure, express informed consent and simple cancellation under applicable law/policy.
- Public/personalized collection experiences should minimize personal data and default to safe visibility. Youth-oriented discovery/ads require separate current Korean/U.S. legal and privacy review before launch.
- Re-check current Korean and U.S. consumer/privacy/advertising/minors rules at implementation/release time; this Living Spec is not legal advice.

## 18. Decision

Use **collection preview-to-first-piece activation** as the next narrow growth question.

Do not broaden yet to wealth/portfolio share cards, economic referral payouts, mass-indexed personal pages, broad public activity feeds, aggressive comeback rewards or additional interruptive ad inventory.

Next growth question after validation:

**Does the first collection action create enough ownership that D7 users voluntarily deepen the collection through curation/archive/display rather than needing a reward-driven habit?**
