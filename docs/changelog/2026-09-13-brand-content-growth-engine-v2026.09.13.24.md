# Changelog — Brand & Content Growth Engine v2026.09.13.24

Date: 2026-09-13
Type: documentation-only consumer-growth planning

## Why

The prior growth stack now covers pre-signup value, D1–D30 retention/comeback and retention-to-viral sharing, but it still lacked a durable public reason to revisit Moneyverse on non-play days.

## Added

- Added `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md` as the English canonical consumer-growth spec and a Korean counterpart.
- Defined the recurring loop `useful public content → curiosity → contextual sample → signup/comeback → meaningful action → progress → future content revisit`.
- Added six content pillars: Weekly World Brief, virtual-company/market stories, Money Skills Lab, season anticipation/archive, collection/lore spotlight, and opt-in community/club/city spotlight.
- Added lifecycle mapping for first visit, D1, D3, D7, D14, D30+ and lapsed users.
- Added content-first SEO clusters and anti-thin-content rules.
- Added content-assisted acquisition/activation/retention/viral/revenue KPIs.
- Added five experiments covering contextual CTA, pre-signup sample, season preview cadence, community spotlight and value-first sponsor placement.
- Added trust gates for public/private leakage, UGC phishing/doxxing, sponsor deception, engagement fraud, analytics/ad overcollection and comeback phishing pressure.

## Research adopted

Reviewed on 2026-09-13:
- Spotify official 2026-07-10 weekly discovery update — directly adopted as evidence for a sustainable recurring discovery anchor.
- Spotify official 2026-06-12 editor-led New Music Friday update — directly adopted as evidence for adding explanatory editorial context.
- Naver Search Advisor current content-quality/spam guidance — directly adopted for standalone reader value and anti-thin-content rules.
- Google Search Central 2026-08-28 site reputation policy update — directly adopted for sponsor/creator/community editorial separation and anti-SEO-inventory behavior.
- FTC Native Advertising guidance — retained as a disclosure guardrail.
- Duolingo social/Friend Streak evidence — reference only; social motivation is useful, but punitive shared daily streak loss is not adopted.

## Product impact

- Acquisition: public content becomes a durable organic/direct/share entry surface rather than a thin signup funnel.
- Activation: contextual sample/action follows reader value instead of immediate auth pressure.
- Retention/comeback: Weekly World Brief and archives create low-friction reasons to revisit without FOMO.
- Viral: editorial and owner-first artifacts become shareable without making wealth/profit the default status signal.
- Monetization: ads/sponsorship come after first editorial value and are judged with D7/D30, ad-induced churn and contribution margin.
- SEO: index quality and downstream activation/retention matter more than URL count.

## Security / privacy / abuse

High-severity planning risks recorded:
- accidental public/private data leakage;
- UGC/community spotlight impersonation, phishing or doxxing;
- sponsor/creator deception in financial-like fictional-market contexts.

Minimum protections include explicit public scope/consent, public-safe fields only, no private balances/portfolio/security/recovery data, report/takedown readiness, clear sponsor disclosures and separate runtime QA before new personalized public surfaces or UGC spotlight expansion.

Medium risks include bot/SEO/referral engagement fraud, analytics/ad overcollection and phishing-style comeback pressure.

No existing auth/session/RBAC/ledger/admin/privacy boundary is relaxed.

## Legal / compliance

- WLD/WDX remain virtual/simulated/game-only.
- No cash redemption, real investment recommendation or guaranteed return wording is added.
- Sponsored/native/creator material relationships require clear disclosure.
- Personalized advertising, new tracking vendors, minors targeting, meaningful economic referral value and large-scale UGC expansion require separate privacy/legal/trust review.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530. `runtime verification unavailable`.

## Delivery

- Version: `v2026.09.13.24`
- Documentation-only: yes
- Documentation PR: none; current instruction is to update latest `main` directly for documentation-only planning.
- Runtime/DB/API/auth/infra changes: none
- Test server deployment for this documentation change: not required

## Next growth priority

Validate the content engine around one narrow consumer promise first: Weekly World Brief → contextual exploration → meaningful action/comeback → D7. After that, deepen the highest-performing pillar by source/cohort instead of expanding content volume blindly.