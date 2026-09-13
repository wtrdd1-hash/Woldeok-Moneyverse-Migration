# Changelog — Community Proof-to-Participation Growth v2026.09.13.54

Date: 2026-09-13
Scope: consumer growth planning only
Korean counterpart: `docs/changelog/2026-09-13-community-proof-to-participation-v2026.09.13.54.ko.md`

## Added
- Added `COMMUNITY_PROOF_TO_PARTICIPATION_GROWTH_SPEC.md` as a Living consumer-growth specification.
- Defined the acquisition/activation gap as weak truthful social proof for first-time and logged-out visitors.
- Added a four-layer community proof ladder: editorial world proof, aggregated public-safe activity, opt-in member artifacts and live participation.
- Added first-30-second, first-3-minute and first-session consumer goals.
- Added the canonical spectator-to-participant funnel and D1/D3/D7/D14/D30 continuity model.
- Added explicit design rules for honest low-activity/empty-community states.
- Added acquisition rules for SEO, sharing, creator/community partnerships and paid acquisition.
- Added social-proof integrity rules prohibiting fake users/messages, inflated activity counts and financial-performance endorsements.
- Added security/privacy/trust review for harassment/doxxing, phishing/malicious links, public/private leakage, bot/spam/astroturfing and minors.
- Added retention-safe monetization order and five experiments.
- Added KPI families spanning acquisition, activation, retention, viral quality and trust guardrails.

## Research evidence
Directly adopted:
- Discord, 2026-08-20: judge discovery by downstream meaningful play/retention; social context should bridge into participation.
- Reddit Verified Profiles, 2026-07-09 update: official/verified identity cues matter where impersonation risk exists.
- Google Search Central UGC spam guidance: abuse policy, reporting and spam-account controls are prerequisites for scalable UGC discovery.
- Naver Search Advisor current guidance: user value first, clear index/non-index boundaries, no low-quality mass generation or misleading/phishing-like content.

Reference only:
- Reddit, 2026-06-29 “People Are The Best”: authentic human conversation as a brand/discovery asset.
- Roblox, 2026-01-07 age-gated chat rollout: layered, age-aware safety direction; facial age verification itself is not adopted.

## Runtime audit
Public service verification was available.
Observed:
- home and lobby are reachable;
- game-only disclosures are present;
- lobby warns against posting passwords, auth codes, real financial information, addresses or contact details;
- the visible lobby can appear quiet/empty and posting requires login;
- Monthly Notes and `/announcements` remain empty;
- sponsored placements already exist;
- terms prohibit phishing, impersonation, malicious code and automation abuse;
- privacy policy limits advertising to reviewed public surfaces and states that economy activity/balances/trades/preferences are not provided for ad targeting.

## Constraints preserved
- No runtime code, API, DB, auth, infrastructure or security architecture change.
- Existing auth/session/RBAC/ledger/security boundaries remain unchanged.
- WLD/WDX remain virtual/simulated/game-only.
- Public personalized financial/security/social data remains private by default.
- No expansion of economic referral rewards or public UGC is authorized by this document alone.

## Next priority
Validate `public proof → 30–90 second observation → one contextual action → signup if needed → first contribution/value → D1 → D7` before expanding UGC, notification volume, ad inventory, personalized public feeds or economic referral incentives.