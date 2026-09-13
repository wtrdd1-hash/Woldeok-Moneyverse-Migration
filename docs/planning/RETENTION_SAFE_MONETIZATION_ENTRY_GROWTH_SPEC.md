# Woldeok Moneyverse — Retention-Safe Monetization Entry Growth Spec

> Version: v2026.09.14.64
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, recent acquisition/activation/retention specs
> Korean counterpart: [RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.ko.md](RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

Recent growth work now defines why people discover Moneyverse, how public content should lead into one meaningful action, why collection/identity loops can retain people, and how comeback/season continuity should work. The largest remaining gap is question 7 of the consumer-growth framework:

**When has a user received enough value that advertising, sponsorship or an optional subscription can appear without damaging activation, trust or retention?**

The existing monetization spec correctly defines allowed/blocked surfaces and legal constraints, but it does not yet define a lifecycle-level `monetization readiness gate` for new, activated, returning and established users.

Selected loop:

`promised value → first meaningful action → continuity proof → monetization eligibility → low-interruption monetization → retention/trust check → only then scale`

This is not an ad-tech implementation specification. It is a consumer sequencing and profitability framework.

## 2. Consumer promise

**“Moneyverse earns the right to monetize after it has delivered the reason you came, not before.”**

Monetization must never be the first meaningful interaction for a qualified new visitor.

The product should optimize for `retention-adjusted contribution`, not raw impressions, raw CTR or short-term ARPDAU.

Do not:
- interrupt the answer, preview, first authored choice or first meaningful action with an interstitial;
- place ads between a user and a promised D7/comeback answer;
- make an advertisement resemble buy/sell/borrow/repay, login, security, wallet or primary game controls;
- use account balance, debt, WDX holdings, casino losses, security state or private social behavior to personalize ads;
- sell WLD/WDX yield, market execution, loan terms, ranking power, random odds or moderation advantage;
- make archive/history/progress retention dependent on payment;
- use fake scarcity, countdowns or loss language to push subscriptions;
- treat accidental clicks or short-term ad revenue as success when D7/D30 worsens.

## 3. Lifecycle monetization readiness gates

### Gate 0 — anonymous first value
State: first-time anonymous visitor from search/share/direct.
Monetization posture: minimal.

Required before monetization becomes visually meaningful:
- the visitor understands what Moneyverse is;
- game-only / no-cash-redemption meaning is clear where relevant;
- the promised answer or public artifact is substantially delivered;
- one optional contextual next action is visible.

Allowed candidate:
- one clearly separated reviewed display/native placement after the promised value.

Avoid:
- above-answer interruption;
- sticky formats covering CTA/content;
- sponsored modules that imitate editorial/game controls;
- personalization based on private Moneyverse state.

### Gate 1 — first-session activation
State: user has authenticated and completed one meaningful product action.
Monetization posture: still conservative.

Protection zone:
`auth continuity → first meaningful action → result/feedback → next goal`.

No interruptive ad inside this zone.

Eligible after the zone:
- low-risk contextual ad on allowed public/content surfaces;
- clearly labeled sponsor module relevant to content, not financial-like actions;
- passive preview of non-P2W identity/cosmetic value only if it does not displace the next goal.

### Gate 2 — D1/D3 continuity
State: user has returned and recognized the same thread/goal.
Monetization posture: test, not scale.

Eligibility signal:
- at least one continuity event (same thread, collection, profession, learning or season path);
- no unresolved onboarding confusion;
- user is not currently performing a sensitive economy/security action.

Use cohorts to test whether ad exposure changes:
- D7 retention;
- meaningful actions/session;
- session abandonment;
- complaint/hide rate;
- next-best-action completion.

### Gate 3 — D7 repeat value
State: user has experienced at least one meaningful return cycle.
Monetization posture: first point where broader monetization tests may be justified.

Candidates:
- reviewed contextual/native ads on low-risk content surfaces;
- ad-free subscription offer after natural ad exposure, not before users understand what is removed;
- non-P2W profile, collection, room, archive or gallery expression products;
- clearly disclosed sponsor-backed content/events with independent product value.

Never require payment to preserve D7 progress or avoid invented loss.

### Gate 4 — D30+ established value
State: durable record/identity/history exists.
Monetization posture: expression and convenience can become more relevant than interruption.

Candidates:
- archive/gallery presentation themes;
- profile/space cosmetics;
- optional ad-free plan;
- sponsor-supported editorial/community projects with clear separation;
- premium presentation/export convenience where core history remains accessible.

The strongest long-term revenue proposition should be `support/express/enhance`, not `pay to remain competitive`.

### Comeback users
Returning after inactivity is not automatically monetization-ready.

Order:
`what stayed → what changed → one re-entry action → result → only then monetization`.

Do not put an ad between catch-up summary and primary comeback action. Do not use “your assets/rewards are expiring” pressure to sell a subscription.

## 4. Session-length monetization policy

### 1–3 minute quick check
User intent: understand one change or continue one small goal.

Rule: protect the primary answer/action. Prefer no interruptive ad. A peripheral placement after value may be tested.

### 5–15 minute meaningful session
User intent: complete a coherent activity.

Rule: monetize at natural boundaries after completion/feedback, never in the middle of a sensitive or cognitively demanding action.

### 30+ minute deep session
User intent: exploration, curation, community or long-form engagement.

Rule: more inventory may be technically possible, but frequency should not rise merely because the user stayed longer. Use diminishing monetization pressure and measure fatigue/hide/exit behavior.

## 5. Monetization portfolio by user value

### Contextual display/native ads
Best for:
- substantial public guides;
- season/world/lore pages;
- approved public archives;
- low-risk content surfaces after core value.

Success condition:
`incremental revenue > incremental retention/trust harm + operational/privacy cost`.

### Ad-free subscription
Value proposition:
- reduced eligible advertising;
- optional convenience/presentation benefits;
- never economy power.

Offer only after the user has experienced enough eligible ads to understand the benefit.

### Cosmetics / identity / space / archive products
Preferred long-term monetization because they align with self-expression and aspiration without selling economic advantage.

Examples:
- profile frames/themes;
- collection/gallery layouts;
- room/office visual themes;
- archive/anthology presentation styles;
- seasonal cosmetic packs.

Core progress/history remains accessible without purchase.

### Sponsored content / B2B2C
Use only when:
- sponsorship is clear and adjacent;
- content is still useful if the user ignores the sponsor;
- sponsor cannot influence WDX prices, loan terms, casino outcomes, rankings or supposedly neutral analysis;
- creator/material relationships are disclosed.

## 6. Revenue sequencing model

Primary sequence:

`qualified acquisition → first value → meaningful activation → D1/D3 continuity → D7 repeat value → monetization test → D30 retention → LTV/CAC and contribution margin`

Do not reverse it into:

`traffic → impressions → clicks → revenue → hope users stay`.

Paid acquisition should be scaled only when downstream economics include:
- activation rate;
- D7/D30 retention;
- refund/chargeback/support cost;
- fraud-adjusted CAC;
- ad/subscription/cosmetic revenue;
- infrastructure and moderation cost;
- contribution margin and payback.

## 7. KPI additions

### Monetization readiness
- % of sessions reaching first-value gate before first monetization impression;
- % of activated users monetized before next-goal setting (should be constrained);
- D7-qualified monetization-eligible share;
- comeback sessions monetized only after reorientation/action.

### Advertising
- impressions/eligible user, not impressions/all visitors;
- ad exposure before/after first value;
- post-ad session abandonment;
- accidental-click signal rate;
- ad hide/report rate;
- D1/D7/D30 by ad-load cohort;
- meaningful actions/session by ad-load cohort;
- contextual vs personalized incremental value where legally allowed;
- ad revenue per retained user.

### Subscription
- offer-view → terms-view → purchase conversion;
- cancellation initiation/completion rate;
- refund/chargeback/complaint rate;
- D30/D90 retention by subscriber/non-subscriber comparable cohort;
- ad-free satisfaction signal;
- paid benefit comprehension.

### Expression products
- cosmetic/product attach rate after D7/D30;
- repeat purchase without retention decline;
- share/showcase creation after purchase;
- perceived fairness/P2W complaint rate.

### Profitability
- ARPU/ARPDAU;
- cohort revenue;
- LTV/CAC;
- gross and contribution margin;
- 30/60/90-day payback where meaningful;
- `retention-adjusted contribution = contribution × retained-quality factor` as an internal decision framing, not a financial accounting metric.

### Trust/security guardrails
- privacy complaint rate;
- youth/ad complaint rate;
- phishing/ATO signal rate;
- sponsor-disclosure complaint rate;
- fake signup/referral/ad-fraud rate;
- suspicious reward duplication;
- finance-like claim complaint rate.

## 8. Experiment backlog

### A. Value-before-ad vs early-ad
Hypothesis: delaying the first meaningful ad impression until after promised value improves D7/D30 enough to offset lower immediate impressions.
Target: first-time anonymous/new-user sessions.
Control: current reviewed early placement.
Treatment: protect answer/preview/first action; show eligible ad only afterward.
Primary: retention-adjusted contribution, D7, first-session completion.
Guardrails: revenue/session, page latency, accidental clicks, complaints.
Minimum observation: matured D7 cohort; confirm D30 before broad rollout.
Next: scale only when downstream contribution improves.

### B. D7-gated subscription offer vs first-session offer
Hypothesis: users understand ad-free value better after repeated use.
Target: eligible users who have experienced reviewed ads.
Control: subscription message during first session/early lifecycle where existing.
Treatment: first meaningful offer after a repeat-value milestone.
Primary: subscription conversion quality, cancellation/refund, D30.
Guardrails: price/renewal comprehension, complaints, churn.
Observation: at least one full billing decision window plus D30.

### C. Expression product vs economy-adjacent paid benefit
Hypothesis: identity/archive cosmetics monetize established users with lower fairness harm.
Target: D30 established users.
Control: any economy-adjacent convenience candidate that does not violate existing prohibitions.
Treatment: profile/collection/archive expression offer.
Primary: attach rate + D90 retention + fairness signal.
Guardrails: P2W complaints, spend concentration, youth concerns.
Observation: D90 where sample permits.

### D. Contextual sponsor module vs generic display ad
Hypothesis: a clearly labeled sponsor module with independent editorial value produces stronger user acceptance than generic interruption.
Target: substantial public content/season pages.
Control: standard display placement.
Treatment: adjacent clearly labeled sponsor module after core value.
Primary: revenue per retained visitor and D7/direct return.
Guardrails: disclosure comprehension, accidental click, trust complaint, SEO quality.
Observation: multiple content cycles plus D30.

### E. Ad-load cap by lifecycle vs uniform load
Hypothesis: lifecycle-sensitive load improves long-run revenue by protecting fragile cohorts.
Target: new, D1-D6, D7-D29, D30+, comeback cohorts.
Control: uniform eligible ad load.
Treatment: lower load for fragile lifecycle states and only modestly broader inventory for established users.
Primary: cohort LTV/contribution, D7/D30/D90.
Guardrails: revenue concentration, session length distortion, complaints.
Observation: D30 minimum; D90 for established cohorts.

## 9. Latest market references — 2026-09-14

### Discord Quests / Play Quest+
Discord announced Play Quest+ on 2026-08-20 and its Quests FAQ was updated 2026-08-31. Quests are opt-in and distinguishable from the surrounding product, and users can disable Quest personalization. Discord frames advertising around actions users voluntarily choose rather than unavoidable interruption.

Direct adoption:
- opt-in/clearly separated sponsor experiences are preferable to deceptive native blending;
- monetization should connect to meaningful user activity, not merely exposure;
- personalization must remain controllable and should not use Moneyverse private economy data.

Not adopted:
- Discord reward economics or reported completion rates as Moneyverse forecasts;
- rewards that create WLD/WDX competitive/economic advantage;
- friend-visible ad participation by default.

### Discord Ads Policy — updated 2026-09-09
Discord's current ads policy applies safety/editorial requirements across ads, landing pages, usernames, rewards and associated surfaces. Direction adopted: assess the whole sponsor journey, not just the ad rectangle.

### FTC subscription enforcement — 2026
The FTC sued JustAnswer in January 2026 over allegedly obscured recurring monthly subscription terms and lack of affirmative consent, and sued a broad subscription enterprise in June 2026 over hidden costs/recurring charges and cancellation barriers. These are enforcement allegations/cases, not Moneyverse-specific law determinations.

Direct adoption:
- price, billing interval and recurring nature must be clear before consent;
- affirmative informed consent;
- simple cancellation;
- no misleading low entry price that obscures recurring cost.

### Korea / youth privacy signal
The Korean Personal Information Protection Commission's 2026-04-01 international-policy note describes U.S. COPPA 2.0 developments including proposed protection expansion to teens and restrictions on personalized advertising. This is not treated as current Korean law. It is a launch-review trigger for youth-facing personalization/ads.

## 10. SEO / brand impact

Monetization must not degrade the reason public pages deserve to rank or be shared.

Rules:
- substantial useful content remains primary;
- sponsor labels are explicit;
- sponsored/third-party content is not created mainly to borrow Moneyverse domain authority;
- do not mass-generate ad inventory pages;
- measure organic landing → activation → D7/D30 after monetization changes;
- avoid layouts where ads dominate above original content.

Brand implication:

**Moneyverse should feel funded by optional, understandable value exchanges—not built to maximize extraction from every visit.**

## 11. Security, privacy and abuse review

### High — ad/sponsor impersonation and phishing
User impact: credential theft, malicious links, account takeover.
Scenario: a sponsored module or external landing page imitates Moneyverse login, reward claim or wallet action.
Minimum protection: clear ad label; official-domain distinction; external-link clarity; no credentials/OAuth-code collection by sponsors; reviewed destinations; no sensitive state in outbound URL.
Separate development/security QA: yes before expanded sponsor/external-link inventory.

### High — private-economy behavioral targeting
User impact: profiling, discrimination, scam targeting, privacy harm.
Scenario: balance, WDX holdings, debt, casino behavior, account security or private social graph are sent to ad/measurement vendors to improve yield.
Minimum protection: prohibit these fields from ad targeting; data minimization; contextual/non-personalized launch posture; legal/privacy review before personalized expansion.
Separate privacy/security QA: yes before any personalized-ad rollout.

### High — rewarded-ad economy abuse
User impact: inflation, unfair advantage, bot/multi-account farming.
Scenario: watch/click/Quest-like sponsor action gives meaningful WLD/WDX or competitive advantage and is farmed.
Minimum protection: no meaningful WLD/WDX/economy power for raw ad views/clicks; cosmetic/noncompetitive sponsor rewards only if later approved; fraud review for any reward.
Separate fraud/economy QA: yes before rewarded advertising.

### High — subscription/payment phishing and dark patterns
User impact: unauthorized charges, distrust, account attacks.
Scenario: fake renewal/cancellation warning or confusing recurring pricing pushes payment/credentials.
Minimum protection: clear recurring terms and confirmation; simple cancellation; no urgent asset-loss language; official billing surfaces only.
Separate billing/legal/security QA: yes before launch.

### Medium — ad measurement overcollection
User impact: unnecessary cross-context tracking.
Minimum protection: measure only data needed for cohort/placement performance; avoid exporting private economy/account fields; review SDK/processors, retention and opt-out/consent requirements.

## 12. Legal / wording cautions

- WLD/WDX remain virtual/simulated/game-only; no cash redemption or promised real return.
- Ads/sponsors cannot be confused with Moneyverse market, bank, loan or casino decisions.
- Material sponsor/creator relationships require clear disclosure.
- Subscription terms, consent, cancellation, refund and minor purchase handling require launch-time jurisdiction review.
- Personalized ads, youth-facing ads, rewarded advertising and new ad SDKs require current Korea/U.S. privacy/legal/trust review.
- Do not treat pending/proposed U.S. youth legislation as current Korean law.

## 13. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable.

Observed:
- home clearly discloses WLD/rewards as game-only virtual data;
- home already contains multiple `SPONSORED ADVERTISEMENT` placements;
- quick links foreground wallet, minigames, exchange, shop and quests;
- monthly public news remains in preparation;
- community lobby can appear empty/quiet;
- `/announcements` has no published notices but already has a sponsored-ad slot;
- `/guide` is substantial but starts with login/balance and heavily foregrounds deposits, bonds, loans, stock gains/dividends, business and casino.

Implication:
Moneyverse already has ad inventory before the planned content/continuity loops are proven. The next optimization should therefore be **sequencing and ad-load discipline**, not simply adding more slots.

Runtime verification status: available, non-destructive public-surface review only.

## 14. Decision hierarchy

For every monetization proposal, decide in this order:
1. Has the user received the promised value?
2. Is this a safe/non-sensitive surface?
3. Does monetization preserve the next-best action?
4. Is disclosure/consent understandable?
5. Does it avoid economic/P2W advantage?
6. Does D7/D30 remain healthy?
7. Does contribution margin improve after fraud/support/privacy cost?
8. Only then scale frequency/reach.

## 15. Next growth priority

Validate one narrow loop:

`new visitor → promised value → meaningful activation → D7 repeat value → first eligible monetization exposure → D30 retained quality + contribution`

Do not prioritize new ad inventory, personalized targeting, rewarded WLD/WDX ads, first-session subscription pressure or economy-power purchases until this loop shows that revenue can increase without reducing retention/trust.