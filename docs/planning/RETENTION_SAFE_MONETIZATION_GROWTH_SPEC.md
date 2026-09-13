# Woldeok Moneyverse — Retention-Safe Monetization Growth Spec

> Version: v2026.09.13.43
> Status: Living consumer-growth specification
> Date: 2026-09-13
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> Korean counterpart: [RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.ko.md](RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

The largest current growth gap is no longer whether advertising exists. Reviewed public-content advertising is now default-enabled in Production, while the consumer-growth plans still correctly say monetization must follow demonstrated value.

The missing contract is therefore: **when an eligible public page may technically carry an ad, what consumer conditions make that impression good for long-term growth rather than a short-term revenue win?**

Canonical rule:

**Earn attention first → deliver the page's primary value → monetize without interrupting the next meaningful action → judge revenue together with D7/D30 and trust.**

Default-on infrastructure is not permission to maximize impressions. It only means reviewed inventory is operationally available.

## 2. Current product reality

The current Living Project Plan limits default-enabled advertising to allowlisted public-information/content surfaces. Login/account, wallet/transfer, virtual market/stocks, loans, casino/gameplay, admin, error/status and other sensitive/transaction surfaces remain ad-free.

The public home is reachable and currently provides game-only disclosure, the core product explanation, sign-in/getting-started routes, and newcomer guidance. The announcements page is also reachable but still contains no published notice content.

Text retrieval cannot reliably prove whether a visual ad slot rendered for a particular visitor, geography, consent state or fill state, so this audit does not claim that a live ad was or was not displayed. It instead asks whether a public surface has enough first-party value to justify monetization if an eligible slot fills.

Finding: the home has substantive first-visit value; the announcements surface remains an empty content state. An empty/near-empty page should not become an ad-first destination merely because it is allowlisted.

## 3. Consumer monetization states

Every eligible public-content session should be viewed through four consumer states.

### A — value not yet delivered
First viewport before the promise is understood, loading/empty states, consent interruptions, or before the promised guide/content is reached.

Policy: **do not optimize for ad exposure here.** Primary explanation, recovery or content comes first.

### B — first useful value delivered
The visitor has received the page's primary explanation, answer, story or update.

Policy: one clearly separated reviewed ad/sponsor placement may be appropriate if it does not displace the contextual next action.

### C — meaningful continuation intent
The user is about to start a preview, choose a thread, follow a contextual signup/comeback CTA or complete a learning reflection.

Policy: continuation wins over another impression. Do not insert an interruption between intent and the next meaningful action.

### D — sensitive/economic action
Login, wallet, transfer, bank/loan, WDX order/portfolio decision, casino/game action, account/security/admin and similar surfaces remain ad-free under the existing boundary.

## 4. Monetization placement hierarchy

Preferred order on eligible public content:

1. page purpose and game-only context;
2. primary useful answer/story/update;
3. contextual next action;
4. reviewed, clearly separated advertising or sponsorship;
5. secondary exploration.

A non-intrusive placement between substantial content sections may be tested, but not if it creates false navigation or competes visually with the primary CTA.

Avoid splash/interstitial ads on first entry, sticky units covering mobile CTAs, countdown-to-close behavior, attention-stealing animation, placements likely to cause accidental taps, ads styled like Moneyverse navigation/rewards/notices/community posts, and ad-dominant empty pages.

## 5. First-visit and activation contract

### First 30 seconds
Revenue is secondary to comprehension. The visitor must first understand that Moneyverse is virtual/game-only, what they can do or become, and one clear route to useful content or a preview.

An ad impression that increases bounce before this understanding is a growth failure even if it earns revenue.

### First three minutes
The user should reach one meaningful preview/thread without an ad interrupting the sequence:

`public promise → useful content/preview → contextual continuation → optional monetization around, not inside, the path`

### Signed-in first session
Existing blocked-surface policy remains. Do not use ads to monetize the first economy, learning, market, banking, casino or account actions.

## 6. Retention-sensitive ad load

There is no universal impression target. Evaluate ad load by cohort where sample size permits: new vs returning anonymous visitors, acquisition source, first-seven-day vs established users, mobile vs desktop, content cluster, consent/ad-personalization state, and eligible free vs ad-free subscriber.

A higher eCPM does not justify worse qualified activation, D7/D30, content completion, trust or Core Web Vitals.

Decision framework:

`retention-adjusted contribution = ad/subscription contribution - measurable churn/trust/support/CWV cost`

This is a decision framework for controlled experiments, not a claim that every term can be perfectly monetized.

## 7. Empty, loading and error-state monetization

If promised first-party content is absent, such as a news feed with no published items, do not make advertising the dominant page value. Explain what will appear, offer one useful adjacent route, and prefer suppressing the ad until substantive first-party content exists.

Loading ads must not look like loaded results or create layout shifts that move primary CTAs. Error/offline/maintenance remain ad-free.

## 8. Advertising, sponsorship and editorial trust

For native/sponsored modules:
- disclose commercial nature clearly and near the module;
- use plain local-language labels such as `광고`, `스폰서`, `Ad`, `Advertisement`, or `Sponsored` as context requires;
- never present paid market/lore analysis as neutral Moneyverse editorial judgment;
- sponsorship must not buy WDX price movement, ranking, supposedly neutral recommendation priority, loan terms or moderation privilege;
- republished/shareable sponsored content must preserve material-connection disclosure.

## 9. Privacy and consent growth rule

Ad revenue does not justify unnecessary personal-data expansion.

- Prefer contextual/non-personalized inventory where personalized processing is not clearly justified.
- Personalized advertising remains subject to region/age/privacy review.
- Do not infer sensitive traits from Moneyverse economic behavior for ad targeting.
- Analytics/ad payloads must not contain credentials, session secrets, recovery/security state or unnecessary private economy data.
- Consent UX must not be optimized only for acceptance rate; refusal/limited-ad paths must remain understandable and functional.

Google's 2026-09-11 AdSense Privacy & messaging update is an operational reference, not permission to weaken Moneyverse consent standards.

## 10. Subscription relationship

Ad-free subscription should be presented after repeated value, not as relief from deliberately painful advertising.

It may remove eligible ads and add non-P2W presentation/archive/profile convenience. It must not improve WLD/WDX yield, execution, loan terms, random odds, ranking or moderation treatment.

Recurring price, billing interval, renewal/trial conversion terms must be clear before purchase; charging requires express informed consent; cancellation must be simple and must not become an obstructive retention funnel.

## 11. KPI model

Revenue: ARPU/ARPDAU, eCPM, fill, viewability, CTR, subscription conversion/cancellation, and contribution margin per engaged visitor/cohort.

Growth: visitor→signup, visitor→first meaningful action, time-to-first-value, content completion, contextual CTA completion, D1/D3/D7/D14/D30, returning-user share, organic→activation→D7/D30 and share/referral→activation→D7.

Trust/quality guardrails: ad-induced abandonment, accidental-click signals, ad hide/report/complaint, privacy complaints, CLS/LCP/INP/mobile usability by ad-load cohort, ad-related support, consent refusal/limited-ad completion, subscription cancellation difficulty complaints, and fraud-adjusted acquisition where monetization campaigns create incentives.

## 12. Experiment backlog

### E1 — after-value placement vs early placement
Hypothesis: moving a reviewed ad after the first useful section preserves or improves activation/D7 with acceptable revenue.
Primary: retention-adjusted contribution per engaged visitor.
Guardrails: bounce, activation, D7/D30, accidental clicks, complaints, CWV.
Minimum observation: one full weekly cycle plus enough activated users for cohort comparison.
Action: reject a higher-revenue arm if retention/trust deterioration offsets revenue.

### E2 — empty-page no-ad rule
Hypothesis: suppressing ads on empty/near-empty first-party content improves trust and downstream exploration.
Cohort: visitors to empty announcement/community-public states.
Primary: meaningful next-action rate.
Guardrails: return rate, bounce, complaints, revenue loss.

### E3 — one reviewed slot vs denser public-content load
Primary: contribution margin per retained visitor.
Guardrails: content completion, CTA completion, CWV, complaint/accidental-click rate.

### E4 — value-first ad-free subscription timing
Compare repeated-value timing with early prompting.
Primary: 30/60-day retained subscriber contribution.
Guardrails: D7/D30, cancellation/refund complaints, support cost.

### E5 — contextual/non-personalized baseline vs reviewed personalization
Run only after privacy/legal readiness.
Primary: incremental contribution margin.
Guardrails: consent complaints, opt-out behavior, retention, age/region risk and privacy incidents.
Personalization does not ship merely because CTR/eCPM rises.

## 13. Security, abuse and privacy review

### High — accidental/deceptive navigation
Scenario: an ad resembles a Moneyverse CTA/navigation card or shifts into the intended tap area.
Minimum protection: strong separation, reserved layout, no ad inside/adjacent to sensitive CTA clusters, mobile visual QA and accidental-click monitoring.
Separate development/QA required: yes for placement changes.

### High — sensitive-context ad leakage
Scenario: ad/analytics scripts execute on wallet, market, loan, casino, account/security or admin routes, or receive private economy/security context.
Minimum protection: preserve blocked surfaces; do not send private economy/security fields to ad analytics; separate runtime QA for routing/consent changes.
Separate development/security QA required: yes.

### High — consent/profile overreach
Scenario: economic behavior is used to infer sensitive traits or personalized targeting expands beyond disclosed/necessary processing.
Minimum protection: data minimization, contextual default, age/region review, understandable choice and no sensitive-inference targeting.
Legal/privacy review required before personalized-ad expansion.

### Medium — ad/referral fraud
Scenario: bots/fake accounts manufacture monetized pageviews or campaign/referral attribution.
Minimum protection: impressions/clicks/raw signups are not growth success; use fraud-adjusted acquisition and retained activation.

## 14. SEO and brand impact

Advertising must not become the reason thin pages exist. Index only pages with independent user value: useful guides, fictional-company explainers, season/world archives, substantial collection/lore and public-safe community/project recaps. Do not generate thin pages to expand ad inventory.

Organic evaluation:

`impression → qualified click → useful understanding → contextual continuation → activation → D7/D30 → retention-adjusted contribution`

Brand rule: the first recognizable Moneyverse element should be Moneyverse value/trust, not advertising inventory.

## 15. Research note — 2026-09-13

### Directly adopted

1. **Deloitte + Google AdMob, 2025-06-10, industry study/official partner release.** Disruptive ad features can damage trust and retention; positive ad quality is associated with continued play. Adopted directionally for retention-first ad quality and experiments; reported percentages are not Moneyverse forecasts.
   - https://www.deloitte.com/us/en/about/press-room/deloitte-improve-mobile-game-advertising.html
2. **Google AdSense Program Policies, current 2026 policy page, official publisher policy.** Ads must not imitate navigation or create misleading interactions. Adopted as placement guardrail.
   - https://support.google.com/adsense/answer/48182
3. **Google AdSense Privacy & messaging, 2026-09-11, official update.** Google CMP message coverage/optimization behavior is relevant to EEA/UK/Switzerland. Adopted only as a consent-review trigger.
   - https://support.google.com/adsense/answer/18189118

### Reference / compliance guardrail

4. **FTC Native Advertising guide, official guidance.** Commercial nature should be clear, prominent and close to native advertising, including redistribution where applicable.
   - https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
5. **FTC Shutterstock settlement, 2026-05, official enforcement.** Recurring subscription terms require clear disclosure, express informed consent and simple cancellation.
   - https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 16. Legal/product notes

WLD/WDX remain virtual/simulated/game-only. Personalized advertising, child-directed/known-under-13 operation, new sensitive profiling or materially new tracking requires separate legal/privacy review. Real-money subscriptions/products require jurisdiction-specific Korea/US review of price, recurring terms, cancellation/refund, minors and disclosure duties.

## 17. Definition of success

This version succeeds when reviewed public traffic can be monetized without breaking first-value and retention:
- visitors understand the product before monetization competes for attention;
- empty/loading/error states do not become ad-first experiences;
- continuation paths remain uninterrupted;
- sensitive/economic surfaces remain ad-free;
- ads/sponsors are recognizable;
- revenue experiments are judged with D7/D30/trust and contribution margin, not CTR/impressions alone;
- subscription remains an optional value exchange, not relief from degraded UX.

Next growth priority: turn the currently empty public-news surface into a **small, repeatable weekly return product** and test `world update → contextual continuation → D7` before increasing ad inventory.