# Product Growth Worklog — Brand & Content Growth Engine v2026.09.13.29

Date: 2026-09-13
Focus: non-play-day return reasons, brand/content cadence, content-assisted acquisition/retention, SEO quality, value-first monetization, trust guardrails

## Repository state reviewed

- Initial `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- Re-read: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, and current retention/activation/monetization/security planning.
- During the run, `main` concurrently advanced to integrated baseline `ef8509ac8db073a748d95eee8e564ec10f0e8f36` immediately before the first documentation write.
- The concurrent integration was reviewed. It added Account Security Center runtime work and newer AI-economy/casino planning. It did not invalidate this consumer-growth direction and its security/economy boundaries are preserved.
- The concurrent integration had already consumed sequential planning version `v2026.09.13.24`; therefore the transient brand/content v24 draft was corrected to **v2026.09.13.29**.

## Largest gap found

The product now has a clearer pre-signup value path, D1–D30 return ladder and retention-to-viral loop. The largest remaining gap was a repeatable reason to revisit Moneyverse even when the user does not intend to play a full session.

Without a recurring public content layer, acquisition can become dependent on one-off SEO pages and retention can become too dependent on tasks/notifications. A living virtual world should also generate stories, learning, archives and previews worth revisiting independently.

## Decision

Added the English/Korean `BRAND_CONTENT_GROWTH_ENGINE_SPEC` v2026.09.13.29.

Core loop:
`useful public content → curiosity → contextual sample/exploration → signup/comeback → meaningful action → personal progress/artifact → future content revisit`

No DB schema, API contract, auth architecture, migration, scheduler or backend implementation detail was expanded.

## Consumer planning changes

- Weekly Moneyverse World Brief as the sustainable recurring anchor.
- Virtual-company/market stories focused on context/learning rather than transaction frequency or profit hype.
- Money Skills Lab for 3–5 minute educational discovery.
- D-14/D-7/D-3/D-1 season previews connected to permanent archives without countdown pressure.
- Collection/lore content to strengthen voluntary aspiration/sinks through identity and story.
- Opt-in community/club/city spotlights with privacy/moderation conditions.
- Content roles mapped to first visit, D1, D3, D7, D14, D30+ and lapsed cohorts.
- Contextual pre-signup/comeback actions instead of generic auth pressure.
- Ads/sponsorship placed after first editorial value.

## Fresh research

Research date: 2026-09-13.

Direct adoption:
1. Spotify official 2026-07-10 weekly discovery update: Release Radar reaches nearly 9 million listeners weekly; supports one dependable recurring discovery anchor.
2. Spotify official 2026-06-12 editor-led New Music Friday update: preceding editor-led discovery produced more than double engagement via saves/likes; supports explanatory editorial context.
3. Naver Search Advisor current content-writing/spam guidance: supports standalone user value, clear brand/topic relevance and rejection of thin content.
4. Google Search Central 2026-08-28 Site Reputation Policy update: supports sponsor/creator/community editorial separation and rejection of SEO inventory farms.

Reference/guardrail:
5. FTC Native Advertising guidance: clear, prominent, understandable sponsorship disclosure close to content.
6. Duolingo Friend Streak/social evidence: social context can reinforce repetition, but punitive shared daily streak loss is not adopted.

## Funnel and KPI changes

Primary funnel:
`search/social/direct/share → useful content → engaged value → contextual sample → signup/comeback → meaningful action → D1 → D7 → D30`

Added/strengthened metrics:
- content-assisted signup/activation/D1/D3/D7/D14/D30;
- time-to-first-meaningful-action from content entry;
- 7/30-day content revisit;
- Weekly World Brief → meaningful action;
- content reader → comeback;
- branded organic/direct returning share;
- D7/D30/LTV by content pillar/source;
- share → engaged visit → pre-signup value → activation → D7;
- sponsor/ad revenue per engaged content user, subscription conversion, ad-induced churn, LTV/CAC, contribution margin;
- fake signup, engagement/referral fraud, ATO signals, spam/report, privacy complaints, duplicate rewards, disclosure complaints and takedowns as trust guardrails.

## Experiment backlog

A. Weekly World Brief contextual CTA vs generic Play/Sign up.
B. 30-second simulated sample before signup vs direct signup.
C. Progressive D-14/D-7/D-3/D-1 season context vs one launch announcement.
D. Opt-in curated community spotlight vs generic project promotion.
E. Sponsor after first useful content section vs top-of-page.

All experiments require downstream retention plus trust/fraud/privacy guardrails; short-term CTR or ad revenue alone cannot define success.

## Security / abuse / privacy review

### High — public/private leakage
Impact: stalking, phishing, targeted attacks and unintended exposure of balances/positions/account/social/security context.
Minimum protection: explicit public scope/opt-in, public-safe fields only, no private balance/portfolio/security/recovery/moderation/risk data, hide/remove/redact path.
Separate development/QA: required before any new personalized public surface.

### High — community spotlight/UGC impersonation, phishing, doxxing
Minimum protection: participant consent, moderation/report/takedown, no forced real identity, safe outbound links, no private contact details.
Separate development/QA: required before scaling user-submitted spotlights.

### High — sponsor/creator deception
Minimum protection: clear local-language sponsor/material-connection disclosure near content, editorial independence, no paid financial-like signal or guaranteed-return language.
Separate review: product/legal/trust gate before launch.

### Medium
- bot/SEO/referral engagement fraud;
- analytics/ad overcollection;
- comeback/deep-link phishing/ATO pressure.

Existing auth/session/RBAC/ledger/admin/privacy boundaries remain intact. No security code was changed.

## SEO / viral / revenue impact

SEO: prioritize useful learning, virtual-company explainers, season archives, glossary, collection/lore and substantial opt-in community stories. Reject mass-generated thin pages. Judge organic traffic through activation→D7/D30→margin.

Viral: make editorial shareable and keep personal artifacts opt-in. Do not default to balance/profit/debt/casino cards. Recipient value precedes signup pressure.

Revenue: value-first sponsor/ad placement, ad-free subscription and non-P2W expression remain preferred. Evaluate with D7/D30, ad-induced churn, content/support/moderation cost and contribution margin.

## Legal / policy cautions

- WLD/WDX remain virtual/simulated/game-only.
- No real investment recommendation, guaranteed return or cash-redemption implication.
- Sponsored/native/creator relationships require clear disclosure.
- Personalized ads, new tracking vendors, minors targeting, meaningful economic referral rewards and large-scale UGC expansion require separate privacy/legal/trust review.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530. `runtime verification unavailable`.

## Delivery

- Version: `v2026.09.13.29`
- Documentation-only: yes
- Documentation PR: none; latest `main` was updated directly per current instruction.
- Runtime/DB/API/auth/infra changes by this growth run: none
- Test deployment for this documentation-only update: not required

## Next growth priority

Prove the narrow loop `Weekly World Brief → contextual exploration → meaningful action/comeback → D7` before expanding publication volume. Then deepen the content pillar with the best fraud-adjusted activation, D7/D30 and contribution margin while preserving trust.