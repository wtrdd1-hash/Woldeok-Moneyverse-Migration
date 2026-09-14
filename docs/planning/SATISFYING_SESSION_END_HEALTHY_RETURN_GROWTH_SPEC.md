# Woldeok Moneyverse — Satisfying Session End & Healthy Return Growth Spec

> Version: v2026.09.14.85
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.ko.md](SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code changes.

## 1. Gap selected this run

Moneyverse now specifies acquisition, pre-signup value, authored intent, safe signup recovery, progressive first-week complexity, user-selected priorities, visible mastery, D1-D30 continuity, comeback, social bonds and long-term identity. The remaining retention gap is **whether a session has a satisfying, understandable stopping point.**

The current growth stack is very good at generating `what next?`; without an equally explicit `enough for now`, however, the product can drift toward endless task pressure, finance-like urgency, ad inventory expansion, or repetitive recommendation. That may increase actions per session while weakening satisfaction and voluntary return.

Selected loop:

`meaningful action → result understood → progress safely preserved → optional next step → explicit stop/continue choice → satisfying exit → D1 recognition → D7 voluntary return → D30 healthy habit`

This is not a scheduler, cooldown, state-machine or notification implementation specification.

## 2. Consumer promise

**“I can make meaningful progress, know that it is safely preserved, stop without penalty, and know what I may want to return for.”**

A good session does not require exhausting every available action.

Do not use:
- punitive streak resets;
- invented expiring rewards;
- `your assets are falling behind` pressure;
- debt/loss/casino recovery urgency;
- endless recommendation chains that hide a natural exit;
- ads or subscription prompts that become the de facto final step of every session;
- hidden penalties for choosing `finish for today`, `later`, mute, hide or notification opt-out.

## 3. Session-end contract

Every meaningful session should be able to resolve into four plain-language facts:
1. **What I did.**
2. **What changed.**
3. **What is safely preserved.**
4. **What I can do next — or that I can stop now.**

The final choice should normally be one primary continuation plus a visible `finish for today`/`later` path. The exit path must not be visually degraded into a trick choice.

If nothing meaningful changed, say so. Do not fabricate progress, popularity, urgency or pending rewards to prevent exit.

## 4. First session and activation

### First 30 seconds
Deliver one clear product promise and one value proof/sample. Do not make commitment frequency, streaks or notifications part of the first-value requirement.

### First 3 minutes
Let the user create one authored state: profession direction, collection theme, learning/world thread, season/project interest or another bounded non-sensitive goal.

### First meaningful result
Explain the result before presenting monetization or a chain of new systems. Then offer:
- continue this same thread;
- save/return later;
- finish for today.

Activation is still a meaningful product action, not time spent, notification permission, ad exposure, wallet opening, signup completion or `continue` clicks.

## 5. Return ladder built from voluntary closure

### D1 — remembered, not guilted
Show the thread the user chose or completed. The return surface should say what remained and what is available now, not imply that the user failed by leaving.

### D3 — one coherent continuation
Offer real progress, an adjacent context, or an honest unchanged state. Do not escalate to more systems solely because three days passed.

### D7 — satisfying weekly resolution
Provide a compact recap: `what I chose → what I completed/learned → what remains → keep/archive/replace`. A user who chooses to stop or replace a thread has still completed a healthy loop.

### D14 — voluntary depth
Offer optional deeper mastery, curation, community/project participation or season content. Deferring must not reduce status or base rewards.

### D30 — habit with durable history
Measure whether users have a durable profession, collection, project, learning, season or social-history record and return voluntarily. Do not define success as an unbroken attendance streak.

## 6. Session-length design

### 1–3 minute quick check
One answer or change, one optional action, one clear stop. The user should be able to leave satisfied without opening another system.

### 5–15 minute meaningful session
One coherent loop with result comprehension and a natural boundary. If another action is suggested, explain why it relates to the completed action.

### 30+ minute deep session
Support curation, building, strategy replay, world exploration and collaboration, but surface periodic natural boundaries. Do not increase ad pressure merely because the session is long.

## 7. Economy and live-ops guardrails

Healthy return cannot depend on fear of economic loss.

Do not make the session-end message primarily about:
- WLD balance erosion;
- missed compound interest;
- loan urgency;
- WDX loss recovery or `opportunities disappearing`;
- casino loss recovery;
- fabricated limited stock or countdowns.

Season anticipation may create curiosity when the event is real and dated. It should not tell users that ordinary absence destroys prior identity/history. Catch-up remains available for mid-season and returning users.

Unlimited-by-default play remains compatible with this spec: users may keep playing, but the product should offer a satisfying stop rather than force one or hide one.

## 8. Social, viral and notification implications

Sharing should happen because a completed artifact or story is worth showing, not because the product blocks exit with `share to continue`.

Good exit-adjacent share candidates:
- completed collection/exhibit;
- profession or learning milestone;
- project contribution;
- season/world recap;
- public-safe collaborative outcome.

Notification permission is not a session-completion step. Ask only when the user can understand a concrete category of future value. Category controls, quiet hours and opt-out must remain accessible.

Messages must not contain sensitive balances, debt, exact portfolio, casino state, recovery state or private social membership. Growth messages never request passwords, OAuth codes or recovery codes.

## 9. Acquisition, brand and SEO

A satisfying product is a brand promise: `useful even in a short visit; no punishment for stopping`.

Public content should support that promise with substantial guides, explainers, world/season archives and useful simulations. Do not create indexable pages for every daily completion, `you missed today`, personal unfinished state or comeback reminder.

SEO funnel:
`useful public content → one sample/action → authored thread → meaningful activation → satisfying closure → D1/D7 return → D30 retained value`.

Naver's current Search Advisor guidance emphasizes user-helpful content and warns against low-quality mass-generated pages, traffic manipulation and phishing-like user harm. Session/comeback SEO therefore must remain content-led rather than template-led.

## 10. Monetization

Protect the closure sequence:
`result → comprehension → preserve state → choose continue/stop`.

Do not insert an interruptive ad, sponsor interstitial or subscription gate inside this sequence. Monetization may appear after the user has reached a natural boundary on an otherwise eligible surface.

If an ad-free subscription is offered, it should describe what eligible advertising is removed and must not imply that paying protects progress, streaks, economic outcomes or access to basic safety controls.

Longer sessions are not a license for linearly increasing ad frequency. Optimize retained contribution, not impressions per minute.

## 11. Funnel and cohort KPI additions

Maintain the existing KPI framework and add:
- meaningful-action → understood-result rate;
- understood-result → natural-boundary reach rate;
- session-end choice distribution: continue / save-later / finish;
- `finish for today` satisfaction signal;
- next-step clarity without forced continuation;
- D1 return after voluntary finish;
- D3 same-thread continuation after voluntary finish;
- D7 healthy-resolution rate (`complete/archive/replace/continue`);
- D30 durable-history coverage without streak dependency;
- notification opt-in after demonstrated value, by category;
- session abandonment before result comprehension;
- post-monetization immediate exit rate;
- ad-induced churn and complaint rate.

Do not optimize `average session length`, `actions/session`, notification opt-in or streak length in isolation.

Trust/abuse guardrails remain:
- abuse/fake-signup/referral-fraud rates;
- suspicious reward duplication;
- ATO/phishing signals;
- spam/report rate;
- privacy complaint rate;
- finance-like misunderstanding;
- youth-safety complaints.

## 12. Experiment backlog

### A — explicit satisfying closure vs endless next-action chain
Hypothesis: after one meaningful loop, `result + preserved state + one next step + finish` improves D7 retention and satisfaction versus repeated recommendations.
Target: newly activated and early returning users.
Control: current recommendation chain.
Treatment: explicit natural-boundary closure.
Primary: D7 retained user rate.
Guardrails: first-session completion, meaningful actions/session, complaint/pressure signal.
Observation: at least one mature D7 cohort; D30 before broad standardization.

### B — neutral finish vs loss/FOMO return copy
Hypothesis: neutral continuity copy produces equal or better D30 trust-adjusted retention than urgency copy.
Primary: D7/D30 voluntary return.
Guardrails: complaint, notification opt-out, finance-like misunderstanding.
Unsafe loss/debt/casino urgency is excluded rather than experimentally optimized.

### C — result-first monetization vs closure-interrupting monetization
Hypothesis: monetization after closure preserves retained contribution better than monetization between result and next/stop choice.
Primary: D30 retained contribution.
Guardrails: ad-induced churn, accidental clicks, abandonment.

### D — contextual notification invitation vs first-session permission ask
Hypothesis: asking for a specific notification category only after demonstrated repeat value improves useful opt-in and lowers later opt-out.
Primary: category opt-in retained at D30.
Guardrails: spam complaint, permission denial, ATO/phishing concern.

### E — weekly resolution recap vs attendance streak framing
Hypothesis: `what changed / what remains / choose next` improves D30 satisfaction without punitive streak pressure.
Primary: D30 retained user + satisfaction.
Guardrails: return frequency distortion, reward farming, message fatigue.

## 13. Security, abuse and privacy review

### HIGH — phishing/ATO via fake unfinished-progress alerts
Scenario: `complete your session`, `claim saved reward`, `protect your progress` links impersonate Moneyverse.
User impact: credential/session theft.
Minimum conditions: canonical domain/brand; messages never request passwords/OAuth/recovery codes; no secret/session/recovery data in URLs; no fake pending reward language.
Separate QA: required for new push/email/deep-link implementation.

### HIGH — sensitive-state leakage in closure/comeback summaries
Scenario: exit or notification surfaces expose WLD/WDX, debt, casino history, portfolio, private membership, moderation/security state.
Minimum conditions: private-by-default; public-safe allowlist; sensitive data excluded from notification/share metadata and analytics payloads.
Separate QA: required for public personalized surfaces or new analytics partners.

### HIGH — reward farming around session completion
Scenario: bots/multi-accounts repeatedly trigger `session complete`, reminder opt-in or comeback actions for value.
Minimum conditions: no meaningful WLD/WDX for raw exit, return, open, notification opt-in, share or reminder click; retain existing ledger/eligibility/anomaly controls.
Separate QA: required for any economy-linked return reward.

### HIGH — finance/casino pressure disguised as retention
Scenario: loss, debt, missed interest or casino outcomes are used to generate urgency and repeated sessions.
Minimum conditions: game-only disclosure; no loss-chasing/debt urgency as generic return copy; preserve market-integrity/probability controls.
Separate legal/QA review: required before finance-adjacent campaigns.

### MEDIUM — notification/analytics overcollection
Scenario: session-exit reasons, mastery interests and return timing become unrestricted ad-targeting profiles.
Minimum conditions: purpose limitation, minimal collection, consent/legal boundaries and no unrestricted export of private economy/social history.

## 14. Research note — 2026-09-14

Directly adopted:
- Discord, 2026-05-18, `Player's Guide and Wellbeing Principles`: digital experiences should support wellbeing and meaningful connection, reinforcing that engagement quality matters more than maximized time online.
- Roblox, 2026-05-20, `Well-Being Partnerships and Resources`: recent platform-level emphasis on positive, healthy experiences and protections, especially for younger users.
- KISA, 2026-03-04, 7th revised illegal-spam guide: vague advertising-consent language is prohibited in the described guidance, and app-push ad refusal should not require a complex login path; adopt clear category consent and easy refusal.
- Naver Search Advisor, current 2026 guidance: optimize for user-helpful content; avoid low-quality mass generation, traffic manipulation and phishing/user-harm patterns.
- FTC, 2026-05-13 Shutterstock settlement: informed consent and easy cancellation remain active consumer-protection signals for optional paid plans.

Reference only:
- Discord/Roblox wellbeing work is directional product evidence, not proof that a specific Moneyverse closure UI will raise retention.
- FTC matters are U.S. consumer-protection references, not a substitute for launch-time legal review in Korea or the U.S.

## 15. Runtime Product Reality Audit — 2026-09-14

Verification: available for public home, guide and announcements.

Observed:
- Home clearly discloses that WLD/rewards are game-only virtual data.
- Home exposes many immediate next surfaces (wallet, five minigames, exchange, shop, quests, lobby) and several sponsored placements.
- Guide tells newcomers to start with one activity, but the overall journey still expands quickly into deposits, bonds, loans, businesses, stocks, shop and casino.
- The first-day checklist ends by recommending that remaining WLD be placed into a compound deposit.
- Public announcements remain a quiet state with sponsored inventory.

Conclusion: current public runtime gives users many reasons to continue but does not visibly establish a cross-product `enough for today / progress preserved / come back when you want` contract. This spec is therefore an unverified retention hypothesis.

## 16. Legal/policy notes

- WLD/WDX remain virtual/simulated/game-only and must never imply real investment, deposit, guaranteed return, cash redemption or recoverable gambling losses.
- Commercial push/email remains subject to current Korean advertising/spam consent rules; transactional/service messaging must not be stretched into general advertising permission.
- Youth-facing growth should favor healthy, age-appropriate engagement and requires current Korea/U.S. review before expanding personalized ads, open social contact or probability-product prompts.
- Subscription terms, renewal, price, refund and cancellation must remain clear and easy to understand.

## 17. Version record

### v2026.09.14.85 — satisfying session end & healthy return
- Added a voluntary session-end contract across first session, quick/meaningful/deep sessions and D1-D30.
- Added `finish for today` as a valid successful outcome without streak/status/economic penalty.
- Added healthy-return and satisfaction KPIs and five experiments.
- Added monetization protection around result comprehension and natural closure.
- Added notification, phishing, privacy, reward-farming, finance-pressure and youth-safety guardrails.
- Added current market/policy research and runtime audit.

No runtime implementation change is part of this version.