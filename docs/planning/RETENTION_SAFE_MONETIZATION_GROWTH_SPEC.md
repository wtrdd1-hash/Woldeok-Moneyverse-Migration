# Woldeok Moneyverse — Retention-Safe Monetization Growth Spec

> Version: v2026.09.13.44
> Status: Living consumer-growth specification
> Date: 2026-09-13
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> Korean counterpart: [RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.ko.md](RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

Reviewed public-content advertising is now default-enabled in Production, while the growth plans correctly say monetization must follow demonstrated value. The missing consumer contract is: **when an eligible page may technically carry an ad, when is that impression healthy for long-term growth?**

Canonical rule:

**Earn attention first → deliver the page's primary value → monetize without interrupting the next meaningful action → judge revenue together with D7/D30 and trust.**

Default-on infrastructure means reviewed inventory is available; it is not permission to maximize impressions.

## 2. Runtime Product Reality Audit

Verified 2026-09-13 against the public service.

The home is reachable and provides repeated game-only disclosure, a core product explanation, sign-in/getting-started routes and newcomer guidance. The announcements page is reachable but still contains no published notice content.

Text retrieval cannot reliably prove whether a visual ad rendered for a specific geography, consent state or fill state. This audit therefore does not claim that a live ad was or was not displayed. It evaluates whether first-party value is strong enough to justify monetization if an eligible slot fills.

Finding: the home has substantive first-visit value; the announcements page remains an empty content state. Empty/near-empty pages must not become ad-first destinations merely because they are allowlisted.

## 3. Consumer monetization states

### A — value not yet delivered
First viewport before the promise is understood, loading/empty states, consent interruption, or before promised content is reached.

Policy: do not optimize for ad exposure. Explanation, recovery or content comes first.

### B — first useful value delivered
The visitor has received the page's primary explanation, answer, story or update.

Policy: one clearly separated reviewed ad/sponsor placement may be appropriate if it does not displace the contextual next action.

### C — meaningful continuation intent
The user is about to start a preview, choose a thread, follow a contextual signup/comeback CTA or complete a learning reflection.

Policy: continuation wins over another impression. Do not interrupt intent and the next meaningful action.

### D — sensitive/economic action
Login, wallet, transfer, bank/loan, WDX order/portfolio decision, casino/game action, account/security/admin and similar surfaces remain ad-free.

## 4. Placement hierarchy

Preferred order on eligible public content:

1. page purpose and game-only context;
2. primary useful answer/story/update;
3. contextual next action;
4. reviewed, clearly separated advertising/sponsorship;
5. secondary exploration.

Avoid first-entry splash/interstitial ads, sticky units covering mobile CTAs, countdown-to-close behavior, attention-stealing animation, placements likely to cause accidental taps, ads styled like Moneyverse navigation/rewards/notices/community posts, and ad-dominant empty pages.

## 5. First-value contract

### First 30 seconds
The visitor must first understand that Moneyverse is virtual/game-only, what they can do or become, and one clear route to useful content or a preview. Revenue is secondary to comprehension.

### First three minutes
The user should reach one meaningful preview/thread without an ad interrupting the sequence:

`public promise → useful content/preview → contextual continuation → optional monetization around, not inside, the path`

### Signed-in first session
Keep current blocked-surface policy. Do not monetize first economy, learning, market, banking, casino or account actions with ads.

## 6. Retention-sensitive ad load

There is no universal impression target. Evaluate ad load by cohort where sample size permits: new vs returning anonymous visitor, acquisition source, first-seven-day vs established users, mobile vs desktop, content cluster, consent/personalization state, and eligible free vs ad-free subscriber.

Higher eCPM does not justify worse qualified activation, D7/D30, content completion, trust or Core Web Vitals.

Decision framework:

`retention-adjusted contribution = ad/subscription contribution - measurable churn/trust/support/CWV cost`

This is an experiment framework, not a claim that every term can be perfectly monetized.

## 7. Empty/loading/error policy

If promised first-party content is absent, explain what will appear, provide one useful adjacent route and prefer suppressing ads until substantive content exists. Loading ads must not look like loaded results or shift primary CTAs. Error/offline/maintenance remain ad-free.

## 8. Sponsored/editorial trust

Native/sponsored modules must disclose commercial nature clearly and near the module, using understandable local-language labels. Paid market/lore analysis must not masquerade as neutral Moneyverse editorial judgment. Sponsorship cannot buy WDX price movement, ranking, supposedly neutral recommendation priority, loan terms or moderation privilege. Shared/republished sponsored content should preserve material-connection disclosure.

## 9. Privacy and consent

Ad revenue does not justify unnecessary personal-data expansion.

- Prefer contextual/non-personalized inventory where personalization is not clearly justified.
- Personalized advertising remains behind region/age/privacy review.
- Do not infer sensitive traits from Moneyverse economic behavior for targeting.
- Do not send credentials, session secrets, recovery/security state or unnecessary private economy data to ad/analytics payloads.
- Consent UX must not optimize acceptance alone; refusal/limited-ad paths must remain understandable and functional.

Google's 2026-09-11 AdSense Privacy & messaging update is treated as an operational reference, not permission to weaken Moneyverse privacy standards.

## 10. Subscription relationship

Ad-free subscription should follow repeated value, not act as relief from deliberately painful advertising. It may remove eligible ads and add non-P2W presentation/archive/profile convenience, but must not improve WLD/WDX yield, execution, loan terms, random odds, ranking or moderation treatment.

Recurring price, interval, renewal/trial conversion terms must be clear before purchase; charging requires express informed consent; cancellation must remain simple.

## 11. KPI framework

Revenue: ARPU/ARPDAU, eCPM, fill, viewability, CTR, subscription conversion/cancellation, contribution margin per engaged visitor/cohort.

Growth: visitor→signup, visitor→first meaningful action, time-to-first-value, content completion, contextual CTA completion, D1/D3/D7/D14/D30, returning-user share, organic→activation→D7/D30, share/referral→activation→D7.

Trust guardrails: ad-induced abandonment, accidental-click signals, ad hide/report/complaints, privacy complaints, CLS/LCP/INP/mobile usability by ad-load cohort, ad-related support, consent refusal/limited-ad completion, cancellation difficulty complaints, and fraud-adjusted acquisition.

## 12. Experiment backlog

### E1 — after-value placement vs early placement
Hypothesis: moving a reviewed ad after the first useful section preserves activation/D7 with acceptable revenue.
Primary: retention-adjusted contribution per engaged visitor.
Guardrails: bounce, activation, D7/D30, accidental clicks, complaints, CWV.
Minimum observation: one full weekly cycle plus enough activated users for cohort comparison.
Decision: reject a higher-revenue arm if retention/trust deterioration offsets revenue.

### E2 — empty-page no-ad rule
Hypothesis: suppressing ads on empty/near-empty first-party pages improves trust and downstream exploration.
Primary: meaningful next-action rate.
Guardrails: return rate, bounce, complaints, revenue loss.

### E3 — one reviewed slot vs denser load
Primary: contribution margin per retained visitor.
Guardrails: content completion, CTA completion, CWV, complaints/accidental-click rate.

### E4 — repeated-value vs early ad-free subscription prompt
Primary: 30/60-day retained subscriber contribution.
Guardrails: D7/D30, cancellation/refund complaints, support cost.

### E5 — contextual baseline vs reviewed personalization
Run only after privacy/legal readiness.
Primary: incremental contribution margin.
Guardrails: consent complaints, opt-out behavior, retention, age/region risk, privacy incidents.
Personalization does not ship merely because CTR/eCPM rises.

## 13. Security, abuse and privacy review

### High — accidental/deceptive navigation
Scenario: an ad resembles a Moneyverse CTA or shifts into the intended tap area.
Minimum protection: strong separation, reserved layout, no ad inside/adjacent to sensitive CTA clusters, mobile visual QA, accidental-click monitoring.
Separate development/QA required: yes for placement changes.

### High — sensitive-context ad leakage
Scenario: ad/analytics code executes on wallet, market, loan, casino, account/security or admin surfaces or receives private context.
Minimum protection: preserve blocked surfaces; no private economy/security fields in ad analytics; separate runtime QA for routing/consent changes.
Separate development/security QA required: yes.

### High — consent/profile overreach
Scenario: economic behavior is used to infer sensitive traits or targeting expands beyond disclosed/necessary processing.
Minimum protection: data minimization, contextual default, age/region review, understandable choice, no sensitive-inference targeting.
Legal/privacy review required before personalized-ad expansion.

### Medium — ad/referral fraud
Do not treat impressions, clicks or raw signups as growth success. Use fraud-adjusted acquisition and retained activation.

## 14. SEO and brand

Advertising must not become the reason thin pages exist. Index pages with independent value: useful guides, fictional-company explainers, season/world archives, substantial collection/lore and public-safe project recaps. Do not mass-create pages to expand ad inventory.

Organic evaluation:

`impression → qualified click → useful understanding → contextual continuation → activation → D7/D30 → retention-adjusted contribution`

Brand rule: the first recognizable Moneyverse element should be Moneyverse value/trust, not advertising inventory.

## 15. Research note — 2026-09-13

### Directly adopted
1. **Deloitte + Google AdMob, 2025-06-10, industry study/official partner release.** Disruptive ad features can damage trust and retention; adopted directionally for retention-first ad quality. Reported survey percentages are not Moneyverse forecasts.
   - https://www.deloitte.com/us/en/about/press-room/deloitte-improve-mobile-game-advertising.html
2. **Google AdSense Program Policies, current 2026 official publisher policy.** Ads must not imitate navigation or create misleading interactions.
   - https://support.google.com/adsense/answer/48182
3. **Google AdSense Privacy & messaging, 2026-09-11 official update.** CMP message coverage/optimization is a consent-review trigger, not permission to weaken privacy review.
   - https://support.google.com/adsense/answer/18189118

### Reference / compliance guardrail
4. **FTC Native Advertising guide.** Commercial nature should be clear, prominent and close to native advertising.
   - https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
5. **FTC Shutterstock settlement, 2026-05.** Recurring terms require clear disclosure, express informed consent and simple cancellation.
   - https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 16. Legal/product notes

WLD/WDX remain virtual/simulated/game-only. Personalized advertising, child-directed/known-under-13 operation, new sensitive profiling or materially new tracking requires separate legal/privacy review. Real-money subscriptions/products require jurisdiction-specific Korea/US review at launch.

## 17. Version/concurrency note

This spec was initially drafted as v2026.09.13.43. A mandatory mid-work `main` recheck found that a concurrent repository workstream had already consumed v2026.09.13.43 for the user-app API coverage audit. This consumer-growth change was therefore renumbered to **v2026.09.13.44** before completion; no conclusion from the concurrent audit is treated as a fixed truth without re-reading current `main`.

## 18. Next priority

Turn the currently empty public-news surface into a **small, repeatable weekly return product** and test `world update → contextual continuation → D7` before increasing ad inventory.