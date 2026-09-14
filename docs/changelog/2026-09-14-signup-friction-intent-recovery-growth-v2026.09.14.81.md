# v2026.09.14.81 — Signup Friction & Intent-Recovery Growth

Date: 2026-09-14  
Change type: documentation only  
Runtime/code change: none

## Added
- Added `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md` and its Korean counterpart.
- Selected the consumer-growth gap where a user understands value and chooses a thread before signup, but loses that original reason across OAuth, local-email verification, consent, delivery problems or interruption.
- Defined the funnel `qualified visit → useful sample → authored intent → contextual signup → verification/consent interruption → safe intent recovery → exact continuation → meaningful activation → D1 → D7 → D30`.
- Explicitly separated signup, verification, OAuth completion, account linking and consent acceptance from meaningful activation.
- Added D0/D1/D3/D7/D14/D30 promises centered on exact-intent recognition, same-thread progress and durable history.
- Added experiments for contextual signup copy, exact post-auth continuation, calm interrupted-verification recovery, no raw signup reward and monetization only after intent recovery.
- Added cohort KPIs for intent recovery, post-auth time-to-value, D1 exact-intent continuation, D7 outcome/renewal and D30 durable-history coverage.
- Added phishing, private-state leakage, fake-signup/referral farming, account-enumeration/merge and analytics-overcollection guardrails without changing the existing authentication implementation contract.
- Added SEO rules excluding verification, recovery, account-link and private continuation states from search acquisition assets.
- Added a protected monetization boundary from authentication completion through intent recovery and the first meaningful action.

## Research reviewed
- Discord, 2026 GDC Social Layer update — contextual account-link prompts and lower coordination friction were adopted as directional evidence; partner performance claims remain reference-only.
- Google, World Password Day 2026 — lower-friction phishing-resistant authentication was used as trust/friction direction, not as an implementation requirement in this pass.
- KISA, 2026-05-19 government-impersonation phishing warning — directly adopted as a verification/continuation-link safety guardrail.
- KISA, 2026-03-04 anti-spam guide revision — directly adopted to keep verification/service messages separate from commercial consent.
- Google Search Central noindex guidance — directly adopted for auth, verification, recovery and private continuation pages.

## Runtime reality
- Production home and the public start guide were reachable in this pass.
- The home continues to disclose that WLD/rewards are game-only virtual data.
- The guide remains substantially finance/wealth-heavy relative to newer identity/continuity growth planning.
- The exact login/registration/email-verification UI could not be independently retrieved, so post-auth intent preservation remains unverified.
- Recent repository history already includes email-verification delivery hardening for high-confidence provider-domain typos and safe delivery diagnostics; that reliability work does not by itself prove consumer intent recovery.

## Git/application note
- `main` was `bb06419d742d0fc39c6a52429493998fe771fd23` at the start and mid-run synchronization checks.
- This documentation set is intended for direct fast-forward application to the latest `main` only after a final synchronization check.
