# Product Growth Worklog — v2026.09.13.23

Date: 2026-09-13
Focus: retention-to-viral loop, brand/content discovery, referral quality, trust guardrails

## Inputs reviewed

- `main` at start and again before documentation writes: `32c150ff5a4137b04ce53f28382ef8e24d21eb79`.
- `PROJECT_PLAN.md` Living Project Plan and current planning stack.
- `PRODUCT_GROWTH_PLAN.md`.
- `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`.
- `RETENTION_RETURN_LADDER_GROWTH_SPEC.md` v2026.09.13.22.
- current authentication/security planning, including the explicit rule that referral/share loops must not weaken abuse attribution or existing security boundaries.
- current analytics/privacy/monetization planning surfaced in the repository search.

## Largest gap found

The retained-user experience had several shareable moments, but it did not yet define a complete consumer loop from a meaningful retained-user artifact to a useful recipient landing and then to activation/retention quality.

A raw referral program would be the wrong default because it can optimize invite volume, fake signup and economic reward rather than genuine product understanding.

## Decision

Created English/Korean `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC` v2026.09.13.23.

The canonical loop is:

`meaningful progress → owner-first artifact → optional share → value-first recipient landing → pre-signup value → signup → first value → D1/D7`

Sharing is explicitly secondary to owner value. An artifact must remain useful as a personal archive even when it is never shared.

## Consumer-planning changes

- Added lifecycle-specific share artifacts for D1–D3, D7, D14 and D30+.
- Prioritized progress, collection, profession, learning, space, season and community stories over raw wealth, profit or leaderboard status.
- Defined the non-member recipient journey and delayed signup pressure until after the artifact has been understood.
- Made referral rewards milestone-based and non-P2W in principle; raw signup is not a sufficient reward event.
- Added creator/community growth formats with disclosure and financial-game framing safeguards.
- Connected public archives/share surfaces to SEO quality thresholds instead of blanket indexing.
- Connected monetization only after repeated value, with emphasis on expression/ad-removal rather than economic advantage.

## Fresh external research

Research date: 2026-09-13.

### Directly adopted

1. Spotify Investor Day 2026 and 2025 Wrapped official product material.
   - Key signal: Spotify reported more than 620 million Wrapped shares in 2025 and frames meaningful personalized experiences as “time well spent.”
   - Adoption: owner-first recap/artifact can be both retention value and an acquisition/brand surface.

2. Google Search Central current Search Appearance/ProfilePage material and August 28, 2026 Site Reputation Policy update.
   - Key signal: public creator/community pages can be understood through structured data, but content/markup must accurately represent visible public content; domain reputation should not be exploited with third-party content inventory.
   - Adoption: index substantial intentional public archives/showcases; do not index thin automatically generated share inventory.

3. FTC Consumer Reviews/Testimonial Rule guidance and 2025–2026 enforcement.
   - Key signal: review incentives cannot be conditioned on required positive/negative sentiment; material connections/incentives need disclosure.
   - Adoption: referral/creator rewards may not require praise or positive reviews; sponsorship/incentives must be disclosed where applicable.

### Reference only

4. Discord GDC 2026 social-layer update and August 2026 discovery/social-play release.
   - Reported linked-player metrics show a median increase in active game days and session duration across participating integrations.
   - Used directionally for social context and discovery; Moneyverse is not adopting Discord account linking or reward-ad mechanics by default.

5. TradingView 2026 community paper-trading contests.
   - Shows simulated trading can create creator/community participation.
   - Real-money prizes and profit-only ranking are not adopted.

6. Naver Search Advisor sitemap/RSS and URL inspection guidance.
   - Used to reinforce intentional public discovery and observable index quality rather than URL-count growth.

## Funnel and KPI changes

New core viral-quality funnel:

`retained eligible user → artifact viewed/saved → optional share → recipient engaged visit → pre-signup value action → signup → activation → D1 → D7 → D30`

Added/strengthened metrics:
- artifact eligibility/view/save rate;
- artifact → meaningful next action;
- share → engaged visit;
- share → pre-signup value action;
- share → activation → D7;
- activated recipients per 100 retained sharers;
- viral cohort D30 vs baseline source cohorts;
- fraud-adjusted referral CAC;
- public artifact hide/takedown and privacy complaint rate.

## Experiment backlog added

A. owner-first weekly artifact vs immediate share CTA;
B. value-first story landing vs immediate signup wall;
C. self-progress/identity artifact vs wealth/rank-forward sharing;
D. retained-milestone referral recognition vs first-activation reward;
E. substantial public archive indexing vs broad thin recap indexing.

Each experiment includes downstream retention as primary or required quality measurement and trust/fraud/privacy guardrails.

## Security, abuse and privacy review

### High: public/private data leakage
Impact: stalking, phishing, embarrassment, targeted account attack.
Minimum protection: public-safe data only, private-by-default personalized data, clear preview/visibility intent, intentional indexing only.
Separate runtime development/QA: required before new public artifact/share surfaces.

### High: phishing/impersonation of share or referral destinations
Impact: account takeover and malicious-link trust.
Minimum protection: recognizable official destinations/branding, no secrets or sensitive asset detail in URLs/messages, no threats of asset loss.
Separate runtime development/QA: required for implementation.

### High: referral farming/multi-account abuse
Impact: CAC inflation, economy/prestige distortion.
Minimum protection: no meaningful raw-signup reward, retained milestone quality, non-P2W reward, fraud-adjusted economics.
Separate runtime development/QA: required before economic referral rewards.

### Medium
- UGC harassment/impersonation/doxxing;
- creator/sponsor disclosure failure;
- analytics/ad overcollection and minor/privacy risk.

No runtime security code was changed.

## Legal/revenue/SEO review

- WLD/WDX remain virtual/simulated/game-only.
- No cash-out or guaranteed investment return framing was introduced.
- Sponsored/compensated creator activity requires clear disclosure where applicable.
- Personalized advertising, minors, contact uploads, new tracking vendors and expanded public UGC remain separate privacy/legal/trust gates.
- Monetization is placed after repeated value and evaluated through D7/D30, LTV, ad-induced churn and contribution margin.
- SEO emphasizes substantial opt-in public content; private financial-game/account/security/billing/recovery pages and thin generated recap/referral pages are not indexing targets.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530. Runtime verification unavailable.

## Delivery

- Version: `v2026.09.13.23`
- Documentation-only: yes
- Current instruction: write documentation-only planning changes directly to `main`; no documentation PR.
- Files added: English/Korean planning spec, English/Korean changelog, English/Korean worklog.
- Test server deployment: not required.
- Runtime code/DB/API/infrastructure: unchanged.

## Next priority

Define a recurring **brand/content cadence** that produces reasons for non-players and lapsed users to return between play sessions: weekly world recap, season editorial cadence, fictional-company stories, learning content, collection/lore features and community spotlights. Measure the path through activation and D7/D30 rather than impressions alone.
