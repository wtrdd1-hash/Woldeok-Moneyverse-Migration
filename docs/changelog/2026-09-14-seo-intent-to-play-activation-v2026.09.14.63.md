# 2026-09-14 — SEO intent-to-play activation v2026.09.14.63

## Summary
Added a documentation-only consumer-growth specification focused on the missing acquisition→activation bridge for Google/Naver/public-content visitors.

Largest gap: public content can answer a question, but the path from that answer to one meaningful Moneyverse action is not yet defined tightly enough.

Selected funnel:
`search/share intent → useful standalone answer → contextual preview → authored choice → contextual signup → meaningful activation → D1 → D7 → D30`.

## Product decisions
- Answer the visitor's intent before asking for authentication.
- Use one intent-matched preview instead of the full economy feature grid.
- Preserve the exact entry intent through signup/authentication.
- Do not count login, wallet open, ad click or generic page view as activation.
- Segment organic cohorts by intent cluster and evaluate organic traffic through activation, D7/D30 and LTV.
- Keep private account/economy/security pages outside public search acquisition.
- Prefer fewer substantial pages over thin/template keyword variants.
- Protect `answer → preview → authored choice` from interruptive monetization.

## Experiments
Added answer-first vs auth-first, contextual vs generic signup CTA, one preview vs feature grid, substantial original page vs scaled templates, and value-before-ad vs early-ad experiments with retention/trust guardrails.

## Research note
Directly adopted current Google people-first/UGC guidance, Google’s 2026-08-28 site-reputation update, Naver Search Advisor quality/spam guidance, Discord’s 2026-08-20 discovery-to-gameplay framing and Discord Official trust signals. FTC 2026 subscription enforcement remains a monetization guardrail. Spotify editorial discovery is directional only.

## Security / trust
Recorded High risks for public/private leakage, SEO/UGC spam and malicious links, official-content impersonation/phishing/ATO, and fake-signup/referral manipulation; Medium risk for tracking/privacy overcollection. No security code changed.

## Runtime audit
Runtime reachable. Home remains feature/economy-heavy with several ad placements; monthly news is still pending; announcements are empty; `/guide` is substantial but heavily finance/economy-oriented and starts with login/wallet rather than an intent-specific pre-auth preview.

## Files
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md`
- English/Korean changelog and worklog for v2026.09.14.63.

No runtime, DB, API, auth, migration, infrastructure or deployment change.