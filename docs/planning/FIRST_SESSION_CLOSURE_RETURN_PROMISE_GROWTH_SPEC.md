# Woldeok Moneyverse — First-Session Closure & Return-Promise Growth Spec

> Version: v2026.09.14.76
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md`, `ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.ko.md](FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, auth, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this pass
Moneyverse has increasingly strong plans for acquisition, first value, user-controlled priorities, D1/D7 continuity, seasons, collection history, social belonging and quiet states. The remaining activation/retention gap is narrower: **the first session can end after a completed action without the user deliberately creating a reason to return.**

Current Production reinforces this gap. The getting-started guide explains login, wallet, quest, job, first reward, then bank/shop use, but its first-day checklist does not explicitly close with a user-authored next objective or a clear future-state preview. The user can finish the checklist yet still leave without knowing what they personally expect to see next time.

Narrow growth loop:

`first value → visible result → user chooses one unfinished/next thread → explicit return promise → session ends cleanly → D1 recognizes that exact thread → D3 shows progress/context → D7 resolves or renews it → D30 durable history`

Consumer promise:

**“Before you leave, Moneyverse helps you choose one thing worth coming back to—and remembers it.”**

This is not a scheduler, reminder engine, task state machine, DB schema or API-contract spec.

## 2. Session closure is a product moment
A session should not be treated as successful merely because the user completed a quest, received WLD, opened a wallet, joined a club, or viewed a season page. A high-quality first session ends with three facts understood by the user:

1. what I accomplished;
2. what I chose to continue;
3. what I can expect to be different or available next time.

The user may leave without choosing a continuation and must not be punished for doing so.

## 3. First 30 seconds / first 3 minutes / first session
### First 30 seconds
Keep the existing brand and game-only boundary clear. Show one understandable proof of value and one action. Do not force the user to understand bank, loans, stocks, business, casino, collections, seasons and clubs simultaneously.

### First 3 minutes
The target is one authored choice that creates a real state: select a profession direction, follow one fictional-company/world thread, choose a starter collection theme, save one learning path, or join a bounded project.

### First-session closure
After the first meaningful result, show one compact closure choice:
- **Continue this:** one exact thread derived from the user’s action;
- **Try something else:** one adjacent option;
- **Finish for now:** leave with no penalty.

If the user chooses a thread, preview only a truthful future state such as:
- “Next time, continue your chosen profession path.”
- “You’re following this fictional company; return when its next world update is published.”
- “Your starter collection theme is saved. Your next step is one related artifact.”
- “This project is saved. Its next meaningful milestone will appear here.”

Do not promise a change that is not actually scheduled or supported.

## 4. D1 / D3 / D7 / D14 / D30
### D1 — recognition before novelty
The first returning surface should recognize the exact selected thread before generic features, wallet balance, advertising, or novelty. If nothing changed, say so honestly and offer the next evergreen step.

### D3 — evidence of continuity
Show one of: progress made, a new relevant context, an available next action, or an honest unchanged state. Do not manufacture activity.

### D7 — resolution or renewal
A good D7 experience either:
- completes the original first-session promise and lets the user archive/extend/replace it; or
- shows meaningful progress and lets the user renew the thread deliberately.

### D14 — identity formation
If the user has repeated the same thread, allow it to become an optional visible identity signal: profession path, collection chapter, world interest, project role, learning history. Visibility remains reversible and private by default where appropriate.

### D30 — durable history
The original first-session choice should be visible in a durable record: a collection chapter, profession/project history, followed world thread, learning replay, season memory or shared project chapter. Long-term value is not merely a larger WLD balance.

## 5. Session lengths
- **1–3 min quick check:** recognize thread → see state → one action or leave.
- **5–15 min meaningful session:** advance one chosen thread and set/renew the next return promise.
- **30+ min deep session:** build, curate, explore or collaborate; closure still ends with at most one primary next thread rather than a queue of obligations.

Avoid daily homework framing, punitive streak reset, loss threats and artificial action caps.

## 6. Acquisition and activation implications
SEO, creator, referral and shared-card traffic may suggest a first thread, but the user must author the saved continuation after experiencing value.

Updated funnel:

`qualified visit → clear promise → useful sample → authored choice → contextual signup if needed → meaningful result → return-promise selection → D1 exact-thread recognition → D7 resolution/renewal → D30 durable history`

Authentication success, referral-code entry, ad click, wallet open or notification opt-in are not activation.

## 7. UX and copy rules
Preferred closure copy is concrete and low-pressure:
- “You finished your first job. Keep this profession as your next path?”
- “Save this collection theme for next time?”
- “Follow this world thread and continue when there’s a real update?”

Avoid:
- “Come back tomorrow or lose your reward.”
- “Your money is sitting idle.”
- “Don’t miss guaranteed profit.”
- “Recover today’s loss.”
- fake countdowns, fake unread badges, fake pending rewards.

Empty/quiet states continue to follow `State → Reason → Continuity → Next` from v75.

## 8. LiveOps and season connection
A season may provide a truthful next-return anchor, but it must not make the first session dependent on FOMO.

Use D-14/D-7/D-3/D-1 previews only when real content exists. A user can save a season interest, but missing a preview does not damage progress. Mid-season and returning users receive catch-up context and one next action.

## 9. Social and viral loop
The strongest share moment is after a meaningful first-session outcome, not before value. Candidate share objects:
- first collection theme/result;
- first profession choice/result;
- first educational replay;
- first safe community/project contribution;
- first fictional-world choice.

Recipient flow: `understand artifact without login → useful preview → own choice → signup only when saving/continuing → activation → D7`.

No session tokens, PII, private balances, WDX positions, debt, casino history, moderation status or recovery state in share URLs/cards.

## 10. SEO
Do not create indexable pages for personal next-session states, private saved goals, pending rewards, wallet state, debt, casino outcomes, recovery/security status or thin dynamically generated “come back” pages.

Index candidates remain people-first evergreen or substantial public content: guides, fictional-company/world pages, season archives, glossary/education, project retrospectives and reviewed community content.

Success is `organic visit → sample → authored choice → signup → activation → return promise → D7/D30`, not impressions alone.

## 11. Monetization
The first-session closure moment is protected. Do not place an interruptive ad, subscription gate or sponsored module between the first meaningful result and the user’s decision to continue/finish.

Monetization eligibility remains retention-first:
- ads after promised value, at natural boundaries;
- ad-removal subscription only after the user understands the recurring value and actual ads removed;
- non-P2W identity/space/collection products after attachment exists;
- no paid WLD/WDX advantage, better lending terms, trading advantage, casino advantage, moderation advantage or ranking advantage.

Subscription terms, renewal, price and cancellation must be clear, consented and simple. FTC 2026 subscription enforcement is a continuing guardrail, not a prediction of Moneyverse liability.

## 12. Security / privacy / abuse review
### HIGH — fake “unfinished task / reward waiting” phishing
User impact: credential theft and account takeover.
Abuse: fake Moneyverse message claims a saved goal, reward, season or wallet action needs completion and asks for login/OAuth/recovery information.
Minimum protection: canonical-domain consistency; no credential/auth/recovery-code requests in growth content; no secret/session/recovery data in URLs; no fake urgency.
Separate dev/QA needed: yes for external deep links, push/email comeback flows or new login handoff.

### HIGH — sensitive-state leakage through return promise
User impact: private WLD/WDX holdings, debt, casino activity, club/social graph or security state becomes visible on home, lock screen, share link or analytics.
Minimum protection: public-safe allowlist; personalized continuation private by default; sensitive finance/security fields excluded from growth copy and third-party analytics.
Separate dev/QA needed: yes for public/personalized surfaces or new analytics SDKs.

### HIGH — reward farming / multi-account continuation abuse
Abuse: scripts or alternate accounts repeatedly create/complete “next goals” to farm referral, comeback or reward incentives.
Minimum protection: do not pay meaningful WLD/WDX for save/pin/open/return-promise creation; reward downstream verified participation only if ever introduced; fraud-adjust metrics.
Separate dev/QA needed: yes before economic rewards attach to this loop.

### HIGH — finance-like manipulation
Abuse: continuation nudges exploit WDX losses, debt, casino outcomes or “idle money” to pressure return.
Minimum protection: no loss-chasing/debt urgency/guaranteed-return framing; WLD/WDX remain clearly virtual/game-only.
Separate dev/QA needed: yes before finance-adjacent personalized comeback campaigns.

### MEDIUM — analytics overcollection
Minimum protection: measure thread category and lifecycle outcome where possible rather than exporting raw private economic/social histories to ad vendors.

Existing OAuth/session/RBAC/admin/ledger/privacy/community boundaries remain unchanged.

## 13. Experiment backlog
| Experiment | Hypothesis | Cohort / entry | Control | Treatment | Primary metric | Guardrails | Minimum observation | Next action |
|---|---|---|---|---|---|---|---|---|
| E1 Closure | explicit closure creates return intent | new activated users | action ends normally | result → choose one next thread | D1 exact-thread return | completion, exit, complaints | D7 matured cohort | keep only if D1 and D7 improve |
| E2 One vs three | one next thread reduces overload | first-session completers | 3 equal recommendations | 1 primary + change option | return-promise selection + D7 | bounce, wrong-choice reversal | 2 weeks / D7 | expand only with quality gain |
| E3 User-authored vs automatic | user control improves durable retention | new users | auto-selected next action | explicit save/choose | D30 durable-thread rate | opt-out, hide, privacy complaints | D30 | reject opaque personalization if not superior |
| E4 Protected closure | monetization after closure preserves activation quality | eligible first sessions | ad before closure | no ad until after closure | D7 retained quality | revenue/user, ad churn | D30 | evaluate retention-adjusted contribution |
| E5 Honest unchanged | truthful quiet state builds trust | D1/D3 returners without updates | filler novelty | unchanged + evergreen next step | meaningful-action rate + D7 | trust complaints, exits | D14 | keep if no engagement penalty and trust improves |

## 14. KPI framework
Activation:
- visitor→signup conversion;
- meaningful activation rate;
- time-to-first-value;
- first-session completion;
- first-result→return-promise selection;
- first authored continuation rate.

Retention:
- D1 exact-thread recognition/continuation;
- D3 same-thread progress;
- D7 resolution-or-renewal rate;
- D14 identity attachment;
- D30 durable-history coverage;
- returning-user share, WAU/MAU, sessions/user, meaningful actions/session, comeback rate.

Growth/revenue:
- organic/referral/share→activation→return promise→D7/D30;
- CAC and fraud-adjusted CAC;
- LTV, ARPU/ARPDAU, subscription conversion, cohort revenue, retention-adjusted contribution;
- ad-induced churn.

Trust/safety:
- abuse/fake-signup/referral-fraud rates;
- ATO signal rate;
- spam/report rate;
- privacy complaints;
- suspicious reward duplication;
- finance-like misunderstanding rate.

## 15. Research notes
- **Supercell, 2026-05-13, Collection Levels & Mastery Changes — direct principle:** progression should be clear and users should know how close they are to the next goal. Adopt clarity/user-goal alignment, not its economy.
- **Xbox, 2026-04-30, April Update — direct principle:** user-pinned “Jump back in” items remain at the front until the user removes them. Adopt explicit user control and rapid return access.
- **Clash Royale, 2026-09-07, Minion Academy season — reference:** a current season packages a small set of concrete upcoming activities. Use as a live-service anticipation reference, not a FOMO/reward model.
- **Google Search current people-first guidance — direct:** public content must satisfy the reader independently; do not produce mass thin continuation pages for SEO.
- **FTC, 2026-05 and 2026-06 subscription enforcement — direct guardrail:** clear material terms, express informed consent and simple cancellation.
- **FTC, 2026-09 personalized-pricing proposal status — reference only:** still a proposed policy/comment process; Moneyverse should not use hidden willingness-to-pay pricing regardless.

## 16. Runtime Product Reality Audit — 2026-09-14
Verification: **available**.

Observed public Production:
- Home clearly states WLD/rewards are game-only virtual data and presents wallet/games/exchange/shop/quest shortcuts before the broader brand story.
- Monthly Notes still says reviewed public news is being prepared.
- Lobby can show no conversation yet and invites the user to greet others; it warns against sharing personal/account information.
- Getting-started guide currently defines a 4-step quick start and a 7-item first-day checklist ending with putting remaining WLD into a compound deposit. It says to start with one easy activity, but does not explicitly close the first session with a user-authored next-return promise.
- Announcements page currently has no published announcement while a sponsored advertisement is present.

Therefore this pass records `first meaningful result → one user-chosen continuation → D1 recognition` as an **unverified growth hypothesis**, not a statement about implemented behavior.

## 17. Decision and next priority
Do not add more onboarding steps. Validate one narrow loop:

`first meaningful result → choose one continuation → finish session → D1 exact-thread recognition → D3 progress/unchanged truthfully → D7 resolve/renew → D30 history`

Do not solve this with streak punishment, fake pending rewards, finance-loss urgency, raw WLD/WDX return bonuses, opaque automatic goal assignment or earlier advertising.