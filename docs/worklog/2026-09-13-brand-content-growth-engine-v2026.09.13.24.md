# Product Growth Worklog — Brand & Content Growth Engine v2026.09.13.24

Date: 2026-09-13
Focus: non-play-day return reasons, brand/content cadence, content-assisted acquisition/retention, SEO quality, monetization after value, trust guardrails

## Inputs reviewed

- Latest `main` at start and immediately before documentation writes: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- `docs/planning/PROJECT_PLAN.md` Living Project Plan.
- `docs/planning/PRODUCT_GROWTH_PLAN.md`.
- `docs/planning/RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md` v2026.09.13.23.
- Recent retention/activation/monetization/security planning discovered from current main, including `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, authentication-security priorities, notification/reactivation governance, and analytics/experimentation governance.
- Current product invariants: WLD/WDX remain virtual/simulated/game-only; private/account/admin/economy/security surfaces stay outside public SEO; growth planning must not weaken auth/session/RBAC/ledger/security boundaries.

No concurrent main change was observed between the initial read and the pre-write recheck. Documentation was then written directly to `main` according to the current documentation-only policy.

## Largest gap found

The growth stack now explains why a visitor may sign up, why a user can return through D1–D30, and why meaningful progress can become shareable. The largest remaining gap was a **repeatable reason to visit Moneyverse even on days the user does not plan to play**.

Without a strong recurring content layer, Moneyverse risks making acquisition depend on one-time SEO pages and retention depend only on in-product tasks/notifications. A living virtual world should also produce stories, learning, archives and previews that are worth checking independently.

## Decision

Added English/Korean `BRAND_CONTENT_GROWTH_ENGINE_SPEC` v2026.09.13.24.

Core consumer loop:

`useful public content → curiosity about a living virtual world → contextual sample/exploration → signup/comeback → meaningful action → personal progress/artifact → future content revisit`

The plan deliberately avoids adding DB schemas, API contracts, auth architecture, schedulers or backend implementation detail.

## Consumer planning changes

- Added one sustainable recurring anchor: Weekly Moneyverse World Brief.
- Added virtual-company/market stories focused on context and learning rather than trade-frequency/profit hype.
- Added Money Skills Lab for 3–5 minute educational content.
- Connected D-14/D-7/D-3/D-1 season previews to durable post-season archives without FOMO countdown pressure.
- Added collection/lore content to strengthen voluntary aspiration/sinks through identity and story.
- Added opt-in community/club/city spotlights with privacy/moderation conditions.
- Mapped content roles to first visit, D1, D3, D7, D14, D30+ and lapsed cohorts.
- Connected content to contextual pre-signup samples or comeback actions instead of generic authentication pressure.
- Kept monetization after initial editorial value.

## Fresh external research

Research date: 2026-09-13.

### Directly adopted

1. Spotify official, 2026-07-10, weekly discovery playlists.
   - Release Radar reaches nearly 9 million listeners weekly and is positioned as a recurring discovery destination.
   - Adopted as evidence for one dependable weekly anchor with user relevance rather than filler every day.

2. Spotify official, 2026-06-12, editor-led New Music Friday.
   - Spotify reports the preceding editor-led discovery format produced more than double engagement through saves/likes.
   - Adopted as evidence that explanatory editorial context can outperform a raw list of new items.

3. Naver Search Advisor current content-writing and spam guidance.
   - Emphasizes substantive value to users, clear brand/topic relevance, and avoidance of spam patterns.
   - Adopted for standalone page value, clear topic intent, and rejection of thin auto-generated content.

4. Google Search Central, 2026-08-28, Site Reputation Policy update.
   - Continues to address third-party content that exploits a host site's reputation for ranking.
   - Adopted for sponsor/creator/community editorial separation and rejection of SEO inventory farms.

### Reference / continuing guardrail

5. FTC Native Advertising guidance.
   - Re-checked for clear/prominent/understandable sponsor disclosure near native content.

6. Duolingo social/Friend Streak evidence.
   - Social context can reinforce repeated participation.
   - Moneyverse does not adopt shared daily-loss pressure or punitive streak mechanics as a default retention pattern.

## Funnel and KPI changes

Primary funnel:

`search/social/direct/share → useful content → engaged value → contextual sample → signup/comeback → meaningful action → D1 → D7 → D30`

Added/strengthened KPIs:
- content-assisted signup/activation/D7/D30;
- content revisit in 7/30 days;
- Weekly World Brief reader → meaningful action;
- content reader → comeback rate;
- branded organic/direct returning share;
- D7/D30/LTV by content pillar/source;
- content/artifact share → engaged visit → activation;
- sponsor/ad revenue per engaged content user;
- ad-induced churn and contribution margin;
- privacy/spam/takedown/disclosure complaint guardrails.

## Experiment backlog added

A. Weekly World Brief contextual CTA vs generic Play/Sign up.
B. 30-second simulated sample before signup vs direct signup CTA.
C. Progressive D-14/D-7/D-3/D-1 season context vs single launch announcement.
D. Opt-in curated community spotlight vs generic project promotion.
E. Sponsor placement after first useful content block vs top-of-page insertion.

Every experiment includes downstream retention and trust/fraud/privacy guardrails. Short-term CTR or ad revenue alone cannot define success.

## Security / abuse / privacy review

### High — public/private boundary leakage
Impact: private balances, positions, account existence, social relationships or security context could enable stalking, phishing or targeted attacks.
Minimum condition: explicit public scope/opt-in, public-safe data only, no private balance/portfolio/security/recovery/moderation/risk data, remove/redact route.
Separate development/QA: required before new personalized public surfaces.

### High — community spotlight / UGC impersonation, phishing, doxxing
Impact: harassment, malicious links, false identity, real-world contact leakage.
Minimum condition: participant consent, moderation/report/takedown, no forced real identity, safe outbound-link policy, no private contact details.
Separate development/QA: required before scaling user-submitted spotlights.

### High — sponsor/creator deception
Impact: paid promotion could be mistaken for neutral Moneyverse analysis in financial-like simulated contexts.
Minimum condition: clear local-language sponsor/material-connection disclosure near content, editorial independence, no paid investment-signal or guaranteed-return language.
Separate review: product/legal/trust gate before launch.

### Medium
- bot/SEO/referral engagement fraud;
- analytics/ad data overcollection;
- phishing/ATO pressure in comeback/deep-link messaging.

No security code was changed in this run.

## SEO / viral / revenue impact

SEO:
- prioritize useful beginner learning, virtual-company explanations, season archives, glossary/explainers, collection/lore and substantial opt-in community stories;
- do not mass-index thin autogenerated issuer/profile/recap pages;
- measure organic visit → signup/comeback → activation → D7/D30 → margin rather than index volume.

Viral:
- make editorial shareable and keep personal artifacts opt-in;
- avoid default wealth/profit/debt/casino social cards;
- recipients must understand the content before signup pressure.

Revenue:
- sponsorship/ads appear after editorial value;
- ad-free subscription and non-P2W expression remain preferred paid value;
- judge revenue with D7/D30, ad-induced churn, support/moderation cost and contribution margin.

## Legal / policy cautions

- WLD/WDX remain virtual/simulated/game-only.
- No real investment recommendation, guaranteed return or cash-redemption implication is added.
- Sponsored/native/creator relationships need clear disclosure.
- Personalized ads, new tracking vendors, minors targeting, meaningful economic referral value and scaled UGC require separate privacy/legal/trust review before launch.

## Runtime reality check

`https://easy-scraping.com` returned HTTP 530. `runtime verification unavailable`.

Therefore no claim is made that production already has the proposed content surfaces or consumer journeys.

## Delivery state

- Version: `v2026.09.13.24`
- Documentation-only: yes
- Direct `main` documentation policy: followed
- Documentation PR: none
- Runtime/DB/API/auth/infra changes: none
- Test deployment required for this documentation-only change: no

## Next growth priority

Start narrow rather than publishing more for its own sake. The next priority is to prove the loop:

`Weekly World Brief → contextual exploration → meaningful action/comeback → D7`

After that, compare content pillars by source/cohort and deepen the one that produces the best fraud-adjusted activation, D7/D30 and contribution margin while preserving trust.