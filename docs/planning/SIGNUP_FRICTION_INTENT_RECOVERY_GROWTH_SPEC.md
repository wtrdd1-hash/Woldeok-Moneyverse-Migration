# Woldeok Moneyverse — Signup Friction & Intent-Recovery Growth Spec

> Version: v2026.09.14.81
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
> Korean counterpart: [SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.ko.md](SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this pass

Moneyverse already has strong plans for pre-signup value, contextual signup, first-session closure and cross-surface intent continuity. The remaining gap is the **consumer transition through signup and verification itself**.

A user can understand the product, choose a job/collection/world thread, decide to save it, and then encounter OAuth, local-email verification, consent, a bounced/mistyped address, a closed tab, or a delayed verification message. If the product resumes at a generic home screen, the consumer has paid the signup cost but lost the reason they signed up.

This pass therefore defines one growth contract:

`qualified visit → useful sample → authored intent → contextual signup → verification/consent interruption → safe intent recovery → exact continuation → meaningful activation → D1 recognition → D7 continuation → D30 durable history`

Signup, email verification, OAuth completion, account linking, app installation and consent acceptance are **not activation by themselves**.

## 2. Consumer promise

The signup promise is:

**“Create an account only when you want Moneyverse to remember what you chose, then return you to that exact next step.”**

The product must not ask users to register merely to reveal basic public value. Registration should preserve demonstrated value: a chosen profession direction, collection theme, fictional-company/world thread, learning path, season follow, safe community project or another bounded continuation.

## 3. First 30 seconds and first 3 minutes

### First 30 seconds
The visitor should understand:
- Moneyverse is a game-only persistent community economy;
- one useful preview/action is available before signup where safe;
- WLD/WDX are virtual and not cash/investment products;
- the primary CTA explains what will be saved or continued.

Avoid a generic `Sign up now` as the only value proposition. Prefer intent-preserving language such as `Save this path and continue`, `Keep following this collection`, or `Continue this project` when the context genuinely exists.

### First 3 minutes
The visitor should be able to create one **authored intent** before authentication where privacy/security boundaries allow it. The intent should be narrow and low-risk; it must not contain private balances, credentials, security state, loan/casino history or hidden social relationships.

The intended path is:

`context → preview → authored choice → reason to save → signup`

## 4. Signup and verification interruption model

Treat interruption as normal, not as failure or abandonment deserving pressure.

Consumer-facing states:
1. **Signup choice** — explain what the account will preserve.
2. **Verification pending** — explain what remains to do without exposing whether another account exists.
3. **Delivery problem / typo correction** — provide a calm correction path; do not imply loss of progress.
4. **User leaves** — no punishment, no fabricated expiring reward.
5. **User returns through an authentic verification/login path** — recover only the minimum safe continuation context.
6. **Verified/authenticated** — return to the exact intended thread or a safe equivalent if the original context is no longer valid.
7. **Meaningful action** — only now count activation.

If the exact continuation cannot be restored safely, explain that and offer one closely related action; do not silently substitute a high-value financial, casino or advertising surface.

## 5. D0–D30 lifecycle

### D0
Success is not account creation. Success is:
- verified/authenticated user reaches the promised context;
- performs one meaningful action;
- can identify what remains for the next session.

### D1
Recognize the exact thread the user signed up to preserve. Do not lead with wallet balance, generic novelty, ads or unrelated high-complexity systems.

### D3
Show one of: real progress, a relevant world/content change, a social response, or an honest unchanged state plus an evergreen next step.

### D7
The original signup promise should have produced a visible outcome, milestone or explicit `continue / archive / replace` decision.

### D14/D30
The account should contain durable history that justifies the original signup: collection chapter, profession/project history, learning replay, world/season follow, curated space or shared-project record. Retention should increasingly depend on identity/history, not authentication friction or repeated login prompts.

## 6. Funnel and cohort KPIs

Primary funnel:

`qualified visit → sample value → authored intent → signup start → verified/authenticated → intent recovered → meaningful activation → D1 exact-intent continuation → D7 outcome/renewal → D30 durable history`

Add these metrics:
- sample → authored-intent rate;
- authored intent → contextual signup-start rate;
- signup-start → verified/authenticated rate;
- verified/authenticated → intent-recovered rate;
- intent-recovered → meaningful-action rate;
- time from verification/auth completion to first meaningful value;
- D1 exact-intent recognition and continuation;
- D3 same-thread progress;
- D7 original-promise outcome/renewal;
- D30 durable-history coverage;
- abandonment by signup method and acquisition source;
- recovery success after interrupted verification;
- support/contact rate caused by signup confusion.

Guardrails:
- fake-signup rate;
- credential-stuffing/account-takeover signals;
- verification abuse/bot rate;
- phishing/impersonation reports;
- spam complaints;
- privacy complaints;
- suspicious referral/reward duplication;
- false-positive signup blocking.

Do not optimize signup conversion while D7/D30 quality or trust degrades.

## 7. Experiment backlog

### Experiment A — contextual preservation vs generic signup
- Hypothesis: explaining exactly what will be saved increases post-auth meaningful activation more than a generic registration CTA.
- Cohort: new anonymous visitors who completed a public sample.
- Control: generic signup/login CTA.
- Treatment: intent-specific `save and continue` CTA.
- Primary: verified/authenticated → meaningful-action rate.
- Guardrails: phishing confusion, privacy complaints, bounce/support rate.
- Observation: minimum D7 matured cohort; D30 before broad acquisition expansion.
- Next action: keep only if downstream retention improves, not merely signup-start rate.

### Experiment B — exact intent recovery vs generic home
- Hypothesis: returning to the chosen thread reduces time-to-first-value after authentication.
- Primary: post-auth time-to-value and meaningful-action rate.
- Guardrails: authorization errors, private-state leakage, dead-link/error rate.

### Experiment C — calm interrupted-verification recovery vs urgency
- Control: generic resend/retry screen.
- Treatment: state explanation + safe correction/retry + assurance that no reward is expiring.
- Primary: successful verification-to-activation.
- Guardrails: resend abuse, spam complaints, phishing reports.

### Experiment D — no signup reward vs raw signup reward
- Default/control should remain no meaningful WLD/WDX for signup/verification.
- Any economic reward treatment requires separate fraud/security review and should not launch from this growth spec.

### Experiment E — monetization after intent recovery vs before it
- Protect `signup/auth completion → intent recognition → first meaningful action` from interruptive ads/paywalls.
- Primary: D1/D7 retained quality and retention-adjusted contribution.

## 8. Acquisition, SEO and viral impact

Paid/creator/SEO traffic should not be judged on cheap registrations. Compare acquisition sources by:

`CAC → verified/authenticated → intent recovered → meaningful activation → D7 → D30 → LTV/contribution`

Public search pages should provide independent value before signup. Verification-pending pages, login callbacks, account-link states, referral claim state, recovery/security pages and personal continuation state are not SEO assets and should remain private/non-indexable under the existing security/SEO model.

Share/referral links may suggest an initial public context, but must never encode session tokens, verification tokens, email addresses, private balances, account IDs that expose private state, or recovery data.

## 9. Monetization impact

The signup/verification journey is a protected value-delivery boundary.

Do not place interruptive ads, sponsor interstitials, subscription gates or casino/loan prompts between:

`auth/verification completion → intent recovery → first meaningful action`.

Monetization eligibility remains downstream of demonstrated repeated value. Do not sell economic advantage for faster verification, account recovery, moderation priority or better authentication treatment.

## 10. Security, abuse and privacy cross-check

### HIGH — verification/login impersonation and phishing
- User impact: credential theft, session theft, account takeover.
- Scenario: fake `verify your Moneyverse account`, `continue your saved progress` or `reward pending` message links to a credential-harvesting page.
- Minimum conditions: canonical domain/brand consistency; growth messages never request passwords, OAuth codes or recovery codes; no auth/session/verification secrets in public/share URLs; clearly separate service messages from commercial promotion.
- Separate development/QA: required for any new email/push/deep-link recovery flow.

### HIGH — intent payload leaks private state
- User impact: exposure of WLD/WDX positions, debt, casino activity, private membership/social graph, security/recovery state.
- Minimum conditions: public-safe allowlist; private-by-default continuation; preserve only the minimum context needed to resume; no sensitive values in URL, metadata, analytics or notifications.
- Separate development/QA: required for personalized public/deep-link surfaces.

### HIGH — fake signup / verification / referral farming
- Scenario: bots or multi-account operators create accounts to collect signup, invite or verification rewards.
- Minimum conditions: no meaningful WLD/WDX for raw signup, verification, resend, login or invite acceptance; downstream retained/fraud-adjusted milestones only if rewards are later considered.
- Separate fraud QA: required before any economic referral/recovery incentive.

### HIGH — account enumeration / mistaken account merging
- Preserve the existing authentication contract: generic public responses, no silent account merge by matching email, linking only under authenticated/reverified rules.
- This growth spec must not weaken those boundaries for conversion.

### MEDIUM — analytics overcollection
- Do not turn signup intent into an unrestricted advertising profile. Exclude credentials, verification state, private economy state, security events and hidden social data from growth analytics payloads.

## 11. Youth and trust/safety

Do not use youth-targeted financial-profit, casino-jackpot or debt-recovery messaging to increase signup. Age-sensitive surfaces remain subject to the existing product/legal gates. A consumer-growth experiment cannot override age, privacy, community-safety or advertising restrictions.

## 12. Legal/policy notes

- Korea: KISA's 2026-05-19 warning documents government-impersonation emails that led users to a page requesting email passwords. Moneyverse verification and continuation messages must avoid patterns that normalize credential entry from unsolicited links.
- Korea: the 2026-03-04 revised anti-spam guide warns against ambiguous commercial-consent wording and unnecessarily difficult opt-out. Verification/transactional messaging consent must not be silently expanded into marketing consent.
- U.S.: FTC consumer guidance continues to treat unexpected verification/security prompts and phishing links as account-compromise risks; growth copy should not imitate urgency patterns used by scams.
- Privacy: use the existing minimization principle. Collect only account data required by the selected identity flow; do not add demographic or financial identity data merely to improve conversion.

This is product-planning guidance, not a substitute for launch-time legal review.

## 13. Research note — 2026-09-14

Directly adopted:
- Discord, “Building on the Social Layer of Games: What’s New from GDC 2026” — contextual account-link prompts and lower coordination friction; used only as directional evidence, not as a Moneyverse performance forecast. https://discord.com/blog/building-on-the-social-layer-of-games-whats-new-from-gdc-2026
- Google, “World Password Day 2026” — passkeys framed as lower-friction and phishing-resistant authentication; used as a trust/friction direction, not a requirement to add passkeys in this documentation-only pass. https://blog.google/innovation-and-ai/technology/safety-security/world-password-day-2026/
- KISA, 2026-05-19 government-impersonation phishing warning — direct trust/safety guardrail for verification and continuation links. https://spam.kisa.or.kr/spam/main.do
- KISA, 2026-03-04 anti-spam guide revision — direct guardrail separating service/verification messaging from commercial consent. https://spam.kisa.or.kr/spam/main.do
- Google Search Central `noindex` / control-what-you-share guidance — direct SEO guardrail for auth, verification and private continuation pages. https://developers.google.com/search/docs/crawling-indexing/block-indexing

Reference only:
- Discord account-linking performance claims. They are Discord/partner-specific and must not be treated as expected Moneyverse uplift.

## 14. Runtime Product Reality Audit — 2026-09-14

Verification: **partially available**.

Verified public surfaces:
- Production home is reachable and clearly says WLD/rewards are game-only virtual data.
- Home offers Discord/Google start plus public guide/value previews.
- The start guide is reachable and currently presents login as step 1, then wallet, quests/jobs and finance/shop progression; its narrative remains substantially finance/wealth-heavy relative to the newer identity/continuity growth specs.
- The exact login/registration/verification UI could not be independently retrieved in this audit, so actual intent preservation through authentication is **not verified**.

Repository reality relevant to this pass:
- Current auth planning preserves one shared security/session model and treats email verification as a high-risk account boundary.
- Recent main history includes email-verification delivery hardening for high-confidence domain typos and safe diagnostics. This strengthens reliability but does not by itself prove that consumer intent survives verification.

Therefore the proposed `intent → signup → verification → exact continuation` loop remains a consumer-growth hypothesis requiring runtime/product experimentation.

## 15. Decision and next priority

Adopt this as the next narrow growth contract:

`public value → authored intent → contextual signup → safe verification/recovery → exact intent continuation → meaningful action → D1 → D7 → D30`.

Do **not** expand raw-signup rewards, urgency-based verification copy, generic-home post-auth routing, finance/casino comeback pressure, auth-page advertising, or cross-surface tracking until this loop improves retained quality without increasing phishing, abuse or privacy signals.
