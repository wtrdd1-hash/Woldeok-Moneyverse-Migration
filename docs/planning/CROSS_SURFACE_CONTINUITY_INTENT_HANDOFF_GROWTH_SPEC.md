# Woldeok Moneyverse — Cross-Surface Continuity & Intent-Handoff Growth Spec

> Version: v2026.09.14.77
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
> Korean counterpart: [CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.ko.md](CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, auth, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this pass
Moneyverse now has plans for first value, session closure, D1/D7 return promises, social belonging, notifications, world freshness, SEO, creator acquisition and retention-safe monetization. The remaining consumer gap is **surface fragmentation**: a user may discover Moneyverse on the public web, participate through Discord, and later use a native/mobile surface, yet each surface can feel like a separate beginning.

The repository has just strengthened the app-facing mobile contract while explicitly preserving one existing auth/session model. That makes the product question more urgent: **when the user changes surface, does their intent travel with them, or do they have to rediscover what they were doing?**

Narrow growth loop:

`qualified entry on one surface → clear value → authored intent → safe handoff → same intent recognized on destination surface → one meaningful action → D1 cross-surface recognition → D7 continuity → D30 durable history`

Consumer promise:

**“Wherever you come back to Moneyverse, your chosen path—not the device or channel—stays primary.”**

This is not an API, deep-link, session, OAuth, mobile-client or Discord-bot implementation specification.

## 2. Channel roles
Do not make every surface a duplicate of every other surface.

- **Public web:** discovery, explainability, SEO, reviewed guides/lore/season pages, safe preview and account entry.
- **Signed-in web / native app:** personal progress, quick check, meaningful actions, collections, profession/project continuity and longer sessions.
- **Discord/community surfaces:** social coordination, community context, safe invites, project/community conversation and discovery back into a relevant Moneyverse thread.

The user may start on any surface. The destination should preserve the *reason they moved*, not dump them into a generic home page.

## 3. First 30 seconds / 3 minutes / first session
### First 30 seconds
Every surface must communicate the same product truth:
- Moneyverse is a persistent community virtual-economy/game experience;
- WLD/WDX and related economy data are virtual/game-only;
- one clear action is available now;
- switching surface is optional, not required for basic understanding.

Do not require Discord linking, mobile installation or a second login before the user understands value.

### First 3 minutes
A user should be able to create one portable intent, such as:
- continue one profession/project path;
- follow one fictional company/world thread;
- save one collection theme;
- continue one learning/replay path;
- join one bounded community/project context.

### First-session closure
If another surface is genuinely better for the next step, explain why in user terms: “Continue this project in the app,” “Open this community thread in Discord,” or “Read the full guide on the web.” Do not use installation or account linking as an arbitrary activation gate.

## 4. Intent-preserving handoff
A handoff is successful only when the destination recognizes enough context for the user to continue without rebuilding orientation.

Good destination behavior:
1. recognize the user-selected thread;
2. explain where the user came from in plain language if needed;
3. show one relevant next action;
4. preserve a safe way back;
5. avoid replaying already-completed onboarding.

Bad destination behavior:
- generic home after a contextual invite;
- forcing the user to hunt for the same company/project/collection again;
- duplicating signup or consent unnecessarily;
- presenting a new unrelated ad/paywall before the intended action;
- treating account linking itself as the product value.

## 5. D1 / D3 / D7 / D14 / D30
### D1 — recognize the thread, not the device
If a user began on web and returns through app or Discord, recognize the same chosen thread before generic novelty.

### D3 — continuity proof
Show actual progress, new related context, a safe social response, or an honest unchanged state. Do not manufacture cross-channel activity.

### D7 — cross-surface completion
The first meaningful cross-surface thread should have either progressed, completed, or been deliberately replaced. Measure continuity quality, not number of surfaces used.

### D14 — optional multi-surface habit
Only after value is proven should Moneyverse suggest a second surface for convenience or social depth. A single-surface user is not lower quality.

### D30 — durable identity/history
The user should see one coherent history across relevant surfaces: collection chapter, profession/project history, followed world/company thread, learning replay, season memory or shared project chapter. Long-term value must not fragment into separate channel histories.

## 6. Acquisition implications
SEO, creators, Discord communities, shared cards and paid campaigns may each enter through different surfaces. Attribution must not optimize for handoff clicks alone.

Updated funnel:

`qualified impression → contextual public value → authored intent → optional surface handoff → intent preserved → signup/linking only when necessary → meaningful activation → D1/D7 continuity → D30 retained contribution`

Paid acquisition should compare CAC per *meaningfully retained user*, not cost per install or cost per account link.

## 7. Social and viral loop
A strong viral handoff carries an understandable artifact or project context.

Recipient flow:
`artifact/invite understood without login → safe preview → choose own intent → authenticate only when saving/joining → exact context resumes → meaningful action → D7`

Do not make recipients install an app or connect Discord solely to discover what was shared.

Referral/invite rewards remain cosmetic/honor/convenience-oriented where used. Raw install, link, click, invite acceptance or account-link events must not earn meaningful WLD/WDX.

## 8. UX rules
- Preserve one primary next action across surfaces.
- Show a visible “continue what I was doing” affordance before generic dashboards when context exists.
- If context is unavailable, say so and fall back to the user’s saved priority, not a random promotional surface.
- Do not duplicate consent prompts that are already valid merely to increase completion metrics.
- Do not make notification permission, Discord linking or app installation feel mandatory.
- Errors must never expose tokens, internal routes, private identifiers or security state.

## 9. SEO and public content
Cross-surface continuation state is private and must not become indexable content.

Index candidates remain substantial public guides, fictional-company/world pages, season archives, glossary/education, reviewed project retrospectives and reviewed public community content.

Do not create SEO pages for app-install handoffs, private deep-link state, referral codes, account-link status, personal progress or channel-specific duplicates. Use one canonical public content identity.

## 10. Monetization
Do not monetize the handoff boundary simply because the user is captive during a switch.

Protected sequence:
`context → destination recognition → intended action`.

No interruptive ad, subscription gate or sponsor interstitial should sit between those steps for a new or reactivated user. Monetization may appear later at a natural boundary after value delivery under the existing retention-first rules.

Cross-surface identity must not enable hidden willingness-to-pay pricing. Subscription price, renewal and cancellation remain clear and consistent.

## 11. Security / privacy / abuse review
### HIGH — malicious or hijacked deep-link / invite phishing
User impact: credential theft, session theft, account takeover or navigation to a fake Moneyverse surface.
Abuse: fake Discord invite, QR/link, “continue in app” or “claim progress” URL impersonates Moneyverse and requests credentials or recovery codes.
Minimum protection: canonical-domain consistency; verified platform links where supported; growth content never asks for passwords/OAuth codes/recovery codes; no auth/session secrets in share/handoff URLs; destination revalidates authorization before sensitive actions.
Separate dev/QA needed: yes before new external/native/Discord deep-link flows.

### HIGH — account-link hijacking / unintended identity merge
User impact: another person gains access to progress, social identity or virtual assets.
Abuse: handoff UX encourages linking by email similarity or ambiguous account state.
Minimum protection: preserve existing explicit authenticated linking rules; never auto-merge by email/display name; linking is optional unless genuinely required; clearly show which account is being linked.
Separate dev/QA needed: yes for any new linking surface.

### HIGH — private-state leakage across surfaces
User impact: WLD/WDX holdings, debt, casino activity, private social membership, moderation or security state appears in notifications, Discord presence, share links or public web.
Minimum protection: public-safe allowlist; private-by-default continuation; no sensitive economic/security values in public previews or third-party analytics.
Separate dev/QA needed: yes for public presence, notifications or rich social cards.

### HIGH — referral/install/link farming
Abuse: bots or multi-account networks repeatedly install/link/accept invites to farm rewards or manipulate acquisition metrics.
Minimum protection: no meaningful WLD/WDX for raw handoff/link/install events; fraud-adjust acquisition metrics; reward only verified downstream participation if ever used.
Separate dev/QA needed: yes before economic incentives attach.

### MEDIUM — analytics overcollection
Cross-surface identity can become a powerful tracking graph. Measure lifecycle outcomes with minimized pseudonymous identifiers where possible; do not export raw private economy/social histories to ad vendors.

Existing OAuth/session/RBAC/admin/ledger/privacy/community boundaries remain authoritative and must not be weakened for growth convenience.

## 12. Experiment backlog
| Experiment | Hypothesis | Cohort / entry | Control | Treatment | Primary metric | Guardrails | Minimum observation | Next action |
|---|---|---|---|---|---|---|---|---|
| E1 Contextual handoff | preserving exact intent improves activation | web/Discord qualified visitors | generic home destination | exact-thread destination | meaningful action after handoff | bounce, ATO/phishing reports | D7 matured cohort | scale only if D7 quality improves |
| E2 Optional linking | value-before-linking improves trust | users with Discord/native opportunity | link before preview | preview first, link to save/socialize | activation + link quality | abandonment, duplicate accounts | D14 | keep linking optional unless required |
| E3 Install vs browser continue | install pressure may reduce activation | mobile web visitors | app-install-first CTA | browser value + optional app continuation | D7 retained conversion | install rate, complaints | D30 | optimize retained value, not installs |
| E4 One history | coherent continuation reduces reorientation | multi-surface users | surface-local recent items | user-chosen thread first | time-to-next-meaningful-action | wrong-context reversals | D14 | retain only if faster and clearer |
| E5 Protected handoff | no ad during switch preserves intent | eligible handoffs | ad/interstitial before action | monetization after intended action | D7 retained quality | revenue/user, ad churn | D30 | use retention-adjusted contribution |

## 13. KPI framework
Activation:
- qualified entry → authored intent;
- handoff initiation rate (diagnostic only);
- handoff → intent-recognition rate;
- handoff → meaningful-action rate;
- time-to-next-meaningful-action after switch;
- signup/link completion when genuinely required.

Retention:
- D1 same-thread recognition across surfaces;
- D3 same-thread progress;
- D7 cross-surface completion/renewal;
- D14 voluntary multi-surface use;
- D30 unified durable-history coverage;
- WAU/MAU, returning-user share, sessions/user, meaningful actions/session.

Growth/revenue:
- SEO/creator/referral/Discord → intent-preserved activation → D7/D30;
- fraud-adjusted CAC per meaningful activation and D30 retained user;
- LTV, ARPU/ARPDAU, subscription conversion, cohort revenue, retention-adjusted contribution;
- ad-induced churn.

Trust/safety:
- duplicate-account/linking-confusion rate;
- fake-signup/referral-fraud rate;
- ATO/phishing signal rate;
- privacy complaints;
- suspicious reward duplication;
- deep-link destination mismatch rate.

## 14. Research notes
- **Xbox, 2026-03-11 / 2026-04-30 — direct principle:** Xbox Play Anywhere emphasizes that progress follows the player across devices and that the user can pick up where they left off. Adopt cross-device continuity and progress portability, not Xbox commercial terms.
- **Discord, GDC 2026 — direct principle:** contextual account linking, persistent social presence and mobile-native linking reduce coordination friction. Adopt value/context-first linking and continuity; Discord’s published partner lift is directional evidence only, not a Moneyverse forecast.
- **Discord Social Layer / SDK documentation — direct safety/product reference:** invites should lead users into the relevant session/context across supported platforms. Moneyverse must pair this with its own privacy and authorization gates.
- **Android Developers current App Links guidance — direct security guardrail:** verified HTTPS app links reduce deep-link hijacking risk. This is a future implementation QA trigger, not an implementation change in this pass.
- **KISA, 2026-05-19 — direct threat reference:** official-looking links can be used to steal passwords. Moneyverse handoff messages must never request credentials/recovery information and must keep canonical branding/domain cues.
- **PIPC, 2026-07-27 — direct privacy guardrail:** enforcement involving third-party behavioral data reinforces minimization around cross-app/cross-surface tracking and ad analytics.
- **FTC, 2026-05 and 2026-06 — monetization guardrail:** subscriptions require clear material terms, informed consent and simple cancellation regardless of surface.

## 15. Runtime Product Reality Audit — 2026-09-14
Verification: **partially available**.

Observed public Production web:
- Home clearly states WLD/rewards are game-only virtual data and describes Moneyverse as connected to Discord.
- Public home offers Discord/Google start, a getting-started guide, wallet/game/exchange/shop/quest shortcuts, a quiet lobby and multiple sponsored placements.
- The getting-started guide currently focuses on web flows and says users sign in with Discord or Google; its first-day path remains wallet/quest/job/reward/bank oriented.
- Announcements currently have no published notice while a sponsored placement is present.

Repository reality:
- the mobile/external app contract now exposes a versioned app-facing gateway while explicitly preserving the existing session, consent and OAuth security model rather than creating a second auth system.
- native app runtime UX and end-to-end Discord→web/app intent handoff were not independently verifiable in this pass.

Therefore `web/Discord/native entry → same authored intent → exact destination context → D1/D7 continuity` is recorded as an **unverified growth hypothesis**, not as implemented behavior.

## 16. Decision and next priority
Validate one narrow path before expanding integrations:

`public/Discord context → one authored thread → optional safe handoff → destination recognizes exact thread → one meaningful action → D1 same-thread recognition → D7 continuity → D30 unified history`

Do not solve this with mandatory app installation, mandatory Discord linking, raw link/install rewards, generic-home deep links, duplicate onboarding, cross-surface behavioral overcollection, or monetization interstitials before the intended action.