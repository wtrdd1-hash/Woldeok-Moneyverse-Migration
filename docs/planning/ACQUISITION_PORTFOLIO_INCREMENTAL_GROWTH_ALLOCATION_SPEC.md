# Woldeok Moneyverse — Acquisition Portfolio & Incremental Growth Allocation Spec

> Version: v2026.09.15.90
> Status: Living consumer-growth specification
> Date: 2026-09-15
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md`, `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`, `CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`
> Korean counterpart: [ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.ko.md](ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this run

Moneyverse already has channel-specific planning for SEO/content, creator/community acquisition, referrals/viral loops and paid media. The largest remaining acquisition gap is now **portfolio allocation**:

**When several channels all claim credit for the same user, where should the next unit of money, creator effort or editorial capacity go to create genuinely incremental D30 retained users and contribution margin?**

A channel can look efficient because it harvests demand created elsewhere. Branded search, retargeting, creator mentions, referral links and paid search may all touch the same user. Raw attributed signups can therefore over-credit lower-funnel channels and under-credit brand/content/community work.

Selected loop:

`market/brand signal → channel-specific qualified discovery → public value/proof → authored interest → meaningful activation → D1/D7/D30 cohort quality → incremental retained contribution → marginal allocation decision → repeat`

This specification does not define ad-platform integrations, tracking schemas or backend attribution code. It defines consumer-growth economics, decision rules, experiments and privacy/abuse guardrails.

## 2. One acquisition portfolio, not isolated channel scoreboards

Evaluate at least these acquisition families together:
- non-branded organic search and useful public content;
- branded/direct return demand;
- social/video/creator content;
- community/Discord discovery;
- referrals and public-safe shared artifacts;
- paid search/social/display only where qualified intent exists;
- PR/sponsorship only where the relationship is clearly disclosed.

Do not let each channel optimize its own local metric while overall D30 retained growth stays flat.

### Primary portfolio outcome

**Incremental fraud-adjusted D30 retained users and retained contribution margin, with trust/privacy/safety guardrails intact.**

Local metrics such as impressions, CTR, creator views, referral sends, branded search clicks, registrations and installs are diagnostics, not the portfolio objective.

## 3. Demand creation vs demand capture

Classify channel work by the job it performs.

### Demand creation
Examples:
- useful educational/world/season content;
- creator/community storytelling;
- PR and public project outcomes;
- shareable collection/project artifacts;
- brand content that gives people a reason to search for Moneyverse later.

### Demand capture
Examples:
- branded search;
- high-intent SEO pages;
- source-matched paid search;
- retargeting after genuine prior value;
- direct navigation and saved return links.

Do not automatically credit a demand-capture channel for creating the underlying interest. A strong branded-search conversion rate may be evidence that brand/content/community activity worked upstream.

Google Search Console's branded-query filter, available broadly in 2026, is useful for separating branded demand from non-branded discovery. Treat the distinction as a planning signal, not a causal proof by itself.

## 4. Channel-quality contract

Every acquisition family should preserve the same consumer contract:

`truthful promise → useful public-safe proof/sample → one authored interest → contextual signup only if needed → same-intent activation → voluntary return`

A channel should not receive extra credit for sending a user through more steps, generating more ad impressions or exposing more financial-game surfaces.

### Excluded acquisition framing
- real-profit/high-yield/guaranteed-return claims;
- loss-recovery or debt urgency;
- casino-win acquisition;
- fake scarcity or fabricated social proof;
- raw WLD/WDX signup/referral bounty as the primary reason to join;
- undisclosed paid creator endorsements;
- deceptive redirects, cloaking or impersonation.

## 5. Cohort windows and allocation gates

### First 30 seconds
Measure product-purpose comprehension, game-only comprehension where relevant, and whether the visitor can identify one useful next action.

### First 3 minutes
Measure sample/proof completion and authored-interest creation, not account creation alone.

### First session
Measure meaningful activation and whether the user exits with a clear continuation thread.

### D1
Did the service recognize the exact acquisition promise/thread rather than defaulting to generic wallet/finance/casino surfaces?

### D3
Did the user see actual change, useful context or an honest unchanged state with one next action?

### D7
Did the user advance the same coherent identity/collection/learning/project/world loop?

### D14
Did breadth expand voluntarily rather than through feature-tour pressure?

### D30
Did the user leave durable history and return for product value independent of the acquisition incentive?

Permanent portfolio reallocation should prefer mature D30 evidence where sample size permits. D7 may be used for faster learning but not to hide poor D30 economics.

## 6. Portfolio measurement framework

Maintain three separate views rather than collapsing everything into one attribution number.

### View A — operational attribution
Use channel/platform attribution for campaign and content operations. It is useful for diagnosing creative, landing and audience issues, but it can over-credit demand capture.

### View B — first-party retained cohorts
Compare acquisition source/cohort on:
- meaningful activation;
- D1/D3/D7/D14/D30 retention;
- durable-history coverage;
- referral/share quality;
- support/moderation/fraud burden;
- ad/subscription/cosmetic contribution only after monetization eligibility;
- privacy complaint and phishing/scam misunderstanding signals.

### View C — incrementality evidence
When traffic/spend is sufficient, use holdout, geo, time-based or other credible controlled comparisons to estimate what would not have happened without the channel.

Do not pretend incrementality is measurable precisely when sample size is too small. In early stages, record uncertainty and prefer reversible budget/editorial moves.

## 7. Marginal allocation, not average-ROI worship

The question is not only "which channel had the best historical average?" but:

**What does the next unit of spend or effort produce?**

Useful portfolio measures:
- marginal CAC per incremental D30 retained user;
- marginal retained contribution;
- saturation/response curve where evidence exists;
- branded vs non-branded organic demand trend;
- creator/social content that later produces branded/direct/search demand;
- referral/share visitor activation and D30 quality;
- content production cost and shelf life;
- paid-media spend, support, moderation and fraud cost.

A low-cost organic article with durable qualified traffic may outrank a paid campaign even when its immediate signup volume is smaller. Conversely, paid media may deserve scale when it incrementally reaches qualified users that organic/community channels are not reaching.

## 8. SEO/content/creator as compounding assets

Google's 2026 Search Console updates add clearer branded/non-branded analysis, generative-AI visibility reporting and platform properties for social/video content. Use these to understand how owned-site and creator/social work participate in discovery across surfaces.

Do not optimize these reports for impressions alone. Connect them to:

`non-branded discovery → useful public content → authored interest → activation → D7 → D30`

and separately:

`creator/social exposure → later branded/direct/search return → activation → D30`

Avoid mass-produced doorway pages or generic AI content created only to occupy queries. Preserve people-first usefulness and a clear primary product purpose.

## 9. Experiment backlog

### A. Branded-search credit test
Hypothesis: some branded-search conversions are harvested demand created by creator/content/community work.
Target cohort: new visitors from branded search during stable campaign periods.
Control/treatment: compare regions/time windows with and without a bounded upstream creator/content push where feasible.
Primary metric: incremental meaningful activations and D30 retained users, not branded clicks.
Guardrails: finance-like misunderstanding, fake-signup rate, privacy complaint rate.
Minimum observation: enough D30 maturation to avoid reallocating on short-lived branded spikes.
Next action: reduce lower-funnel over-credit if upstream work materially lifts branded demand and retained outcomes.

### B. Organic evergreen vs paid matched-intent acquisition
Hypothesis: a substantial evergreen guide can create lower-volume but stronger D30 economics than repeated paid acquisition for the same intent.
Primary metric: retained contribution per unit of acquisition cost/effort.
Guardrails: content quality, search spam risk, ad-induced churn.
Observation: D30 plus content shelf-life review.

### C. Creator/community vs referral-code push
Hypothesis: contextual public artifacts produce fewer raw invitations but higher visitor→activation→D30 quality than code-first incentives.
Guardrails: spam/report rate, referral fraud, impersonation.

### D. Marginal paid-spend step test
Hypothesis: modest spend increases continue to create incremental D30 users rather than only higher platform-attributed conversions.
Control/treatment: bounded budget step-up with stable landing/creative.
Primary metric: marginal incremental D30 retained users / spend.
Guardrails: invalid traffic, CAC_D30, privacy complaints, finance misunderstanding.

### E. Social/video search-discovery feedback loop
Hypothesis: selected creator/social posts can produce durable non-platform discovery through Search/Discover and later branded demand.
Primary metric: qualified search-driven visits to platform/owned content that progress to activation/D30.
Guardrails: no clickbait, fake follower/view or undisclosed sponsorship.

## 10. SEO and public-content rules

- Separate branded and non-branded discovery in analysis where available.
- Do not treat branded-query growth as proof of SEO alone.
- Do not create near-duplicate channel landing pages solely for attribution.
- Keep public content independently useful if no signup occurs.
- Keep account, portfolio, balance, debt, casino, recovery, moderation and security state out of search indexing.
- Do not publish private acquisition or cohort data as public proof.

## 11. Viral/referral interaction

Referral and sharing should be evaluated as acquisition channels with downstream quality, not as free traffic.

Prefer:
- public-safe collection/project/season/learning artifacts;
- invite context that tells the recipient why the link matters;
- cosmetic/honor/convenience rewards only after retained participation if rewards are needed.

Avoid meaningful WLD/WDX for raw sends, clicks, signups, installs, account linking or one-day activity. Track suspicious duplication and referral arbitrage as portfolio costs rather than hiding them inside growth volume.

## 12. Monetization and profitability

Acquisition source must not change the retention-safe monetization contract.

Do not increase first-session ad load because a user was expensive to acquire. Do not sell financial-game advantage. Do not use debt, losses or casino outcomes to increase monetization pressure.

Portfolio profitability should include:
- acquisition/media/creator/content cost;
- variable ad/payment costs;
- support/moderation/fraud cost;
- content production/maintenance cost;
- retained subscription/ad/cosmetic/sponsor contribution after eligibility;
- churn or trust harm attributable to monetization.

Optimize `incremental retained contribution`, not gross attributed revenue.

## 13. Security, abuse and privacy review

### HIGH — cross-channel identity/tracking leakage
User impact: private economy, social or security state could be exposed to advertising/analytics/creator systems.
Abuse scenario: exact holdings, debt, casino results or private membership become audience attributes or conversion payloads.
Minimum protection: data minimization; public-safe event allowlist; no credentials/session/recovery material; no private economy/security state in acquisition payloads.
Separate development/QA: required before any new pixel, server-side conversion feed, enhanced matching or cross-platform audience sync.

### HIGH — referral/creator/paid arbitrage
User impact: fake users distort the economy/community and consume acquisition budget.
Abuse scenario: bots/multi-accounts cycle referral, creator or paid incentives.
Minimum protection: no meaningful reward for raw acquisition events; delayed/capped retained milestones; fraud-adjusted cohort economics.
Separate development/QA: required if new economic rewards are introduced.

### HIGH — finance/gambling claim drift
User impact: users may mistake Moneyverse for a real investment/deposit/gambling product.
Abuse scenario: automated ads, affiliates or creators optimize toward high-yield, loss-recovery or casino-win messaging.
Minimum protection: human-reviewed claims, game-only boundaries, prohibited-claim list, material-connection disclosure.
Separate legal/QA: required for new finance-adjacent campaigns.

### HIGH — phishing/impersonation across acquisition surfaces
User impact: account takeover or credential theft.
Abuse scenario: fake Moneyverse ad, creator page, referral link or comeback message requests login secrets.
Minimum protection: canonical domain/brand consistency; growth messages never ask for passwords, OAuth codes or recovery codes; no secrets in URLs.
Separate security QA: required for new external deep-link or campaign surfaces.

### MEDIUM — measurement overcollection
User impact: excessive profiling and privacy complaints.
Abuse scenario: combining search, creator, referral, social and private economy history merely to improve attribution.
Minimum protection: purpose limitation, data minimization, retention limits and consent/legal-basis review where applicable.

Existing OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community security boundaries remain unchanged.

## 14. Legal/policy guardrails

- Korea: do not expand acquisition measurement into third-party behavioral advertising without an appropriate legal/privacy basis. The 2026 PIPC TikTok/Apple enforcement remains a strong warning against collecting/using third-party behavioral information without proper basis.
- United States: endorsements/reviews must be truthful; material connections must be clearly disclosed; fake reviews/followers or sentiment-conditioned review incentives are excluded.
- Youth/sensitive users: do not infer or target sensitive traits merely for channel efficiency; personalized advertising involving minors requires separate legal/safety review.
- WLD/WDX remain virtual/simulated/game-only and must not be presented as real investments, deposits, legal tender, cash redemption or guaranteed returns.

## 15. Current runtime reality audit — 2026-09-15

Public production is reachable.

Observed today:
- the homepage immediately exposes wallet, five mini-games and a broad shortcut grid for wallet/game/exchange/shop/quest/lobby;
- sponsored placements appear before and around the main product explanation;
- the product later explains that Moneyverse is a Discord-connected community virtual economy and that activities leave records;
- WLD/rewards are repeatedly and clearly disclosed as game-only and non-redeemable;
- Monthly Notes currently has no published public update;
- the public lobby is in a low-activity state;
- the getting-started guide still emphasizes compound deposits, bonds, loans, stock gains/dividends, business dividends, casino and a wealth-based `beginner → capitalist` roadmap;
- announcements currently contain no published notices but do contain sponsored advertising;
- the privacy policy states that login/ledger/security information is handled for stated purposes and presents a data-minimization posture.

Implication: acquisition channels currently converge on a broad finance/economy-heavy public experience. Portfolio allocation should therefore avoid rewarding channels merely for sending traffic into the generic homepage. Evaluate whether channel-specific public value and the newer identity/history brand promise produce better activation and D30 quality.

## 16. Research notes

### Direct adoption
1. Google Search Central, branded queries filter — published 2025-11-20, broadly available by 2026-03-11. Key implication: separate branded demand from non-branded discovery instead of treating all organic clicks as equivalent.
2. Google Search Central, Search Generative AI performance reports — published 2026-06-03, worldwide rollout completed 2026-08-31. Key implication: AI-search visibility is a discovery diagnostic, not a retained-growth KPI.
3. Google Search Central, platform properties — launched 2026-07-07 and globally available 2026-07-29. Key implication: social/video content can participate in search discovery and should be measured as part of a cross-surface content portfolio.
4. Google Meridian v2.0 / GeoX — current September 2026 documentation. Key implication: causal experiments and MMM can be combined for cross-channel budget decisions, while acknowledging sample/data requirements.
5. Google Meridian full-funnel MMM — current 2026 documentation. Key implication: lower-funnel channels can over-receive credit when they harvest brand demand; model brand equity separately when evidence and scale justify it.
6. PIPC, 2026-07-27 TikTok/Apple enforcement. Key implication: do not broaden behavioral tracking merely for acquisition attribution.

### Reference only
- Platform/vendor uplift claims are not used as Moneyverse forecasts.
- Meridian/MMM implementation is not required now; the immediate product decision is to triangulate attribution, retained cohorts and controlled evidence proportionate to scale.
- FTC review/endorsement guidance is used as a marketing-integrity guardrail, not as a prediction of enforcement specific to Moneyverse.

## 17. Next growth priority

Validate a **unified acquisition portfolio review** using the smallest reliable set of channels:

`non-branded organic/content + branded/direct + creator/community + referral/share + paid`

For each, compare promise comprehension → authored interest → meaningful activation → D7 → D30 → fraud-adjusted retained contribution, then run at least one bounded incrementality test before materially reallocating budget or editorial/creator capacity.

Do not expand tracking, finance-keyword acquisition, referral rewards or spend simply because platform-attributed conversions rise.
