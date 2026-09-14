# Woldeok Moneyverse — Progressive Complexity & First-Week Growth Spec

> Version: v2026.09.14.82
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.ko.md](PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.

## 1. Gap selected this pass

Moneyverse now has plans for pre-signup value, signup intent recovery, first-session closure, user-controlled priorities, social continuity and retention-safe monetization. The largest remaining early-retention gap is **how complexity expands after the first meaningful action**.

The older `PRODUCT_GROWTH_PLAN.md` proposes introducing one major system per day across the first seven days. The live public guide, however, already exposes banking, bonds, loans, eight professions, businesses, stocks, shop items and casino/minigames in one first-visit narrative. Both approaches risk making the product roadmap, rather than the user's goal, determine what the user must understand next.

This pass replaces calendar-first exposure as the preferred growth model with a readiness-and-intent model:

`first value → chosen core thread → clear result → one adjacent concept preview → user chooses continue / explore / not now → coherent second value → D1/D3 continuity → D7 mental model → D14 voluntary breadth → D30 durable depth/history`

This does **not** add implementation unlock rules. It defines consumer sequencing and experimentation only.

## 2. Consumer promise

**“Moneyverse gets deeper when I am ready, without making me learn the whole economy before I can enjoy one thing.”**

A user should never need to understand jobs, WLD accounting, deposits, bonds, loans, WDX, businesses, casino, clubs, seasons and collections at once.

The product should distinguish:
- **available** — a system exists;
- **visible** — the system is discoverable;
- **recommended now** — it is relevant to the user's current goal;
- **understood enough to act** — the user has the minimum context required for a safe meaningful action.

Availability does not imply that every feature deserves equal first-week prominence.

## 3. First 30 seconds, first 3 minutes, first session

### First 30 seconds
Show one product promise, one game-only boundary where relevant, one proof/sample and one primary action. Do not lead with the full economy feature inventory.

### First 3 minutes
The user should choose one starter intent such as:
- build/profession;
- collect/curate;
- explore a fictional company/world thread;
- learn through a bounded simulation;
- follow a season/project.

The first experience should create a state the user can recognize later.

### First session
After the first meaningful result, offer one adjacent concept only if it explains or extends the result. Examples:
- profession result → a relevant collection/tool preview;
- collection result → a world/lore thread;
- fictional-company learning sample → watch/follow or replay, not an immediate leveraged-looking finance pitch;
- season thread → one related project or collection objective.

Do not default the next step to a deposit, loan, stock trade or casino session merely because those systems exist.

## 4. Complexity ladder

### Layer 0 — Orientation
Question answered: `What is Moneyverse and what can I do now?`

Allowed cognitive load:
- one product category;
- one primary CTA;
- game-only/no-cash meaning;
- one sample/result.

### Layer 1 — Core thread
Question answered: `What am I trying to progress?`

The user selects or accepts one bounded thread. The home/return experience should remember it.

### Layer 2 — Adjacent system
Question answered: `What else helps this goal?`

Show at most one strongly related system at a time. The relationship must be explainable in one sentence.

### Layer 3 — Connected loop
Question answered: `How do two or three systems reinforce my goal?`

By D7, a healthy new user may understand a coherent loop such as:
- profession → collection → personal space;
- world/company learning → replay/watchlist → weekly recap;
- season → project → archive;
- collect → curate → share.

A user does not need to touch every economy system to be considered successfully onboarded.

### Layer 4 — Voluntary breadth
Question answered: `What new direction do I want to explore?`

From D14 onward, breadth should increasingly be user-authored. `Not now`, hide and reorder choices should not reduce rewards or create pressure.

### Layer 5 — Long-term identity
Question answered: `What have I become or built here?`

D30+ value should center on durable history, mastery, collections, spaces, projects, season memories and social contribution rather than feature-count completion.

## 5. D0–D30 lifecycle

### D0
Success means one meaningful result plus one understood continuation. Do not score a user higher merely because they opened many feature pages.

### D1
Restore the core thread and explain one real change or next step. Do not front-load a new subsystem simply to satisfy a day-2 tutorial calendar.

### D3
If the user has made progress, preview one adjacent system that meaningfully extends the chosen goal. If they have not, make the original thread easier to continue rather than expanding complexity.

### D7
The user should be able to explain their current Moneyverse loop in simple terms and see an outcome, milestone or next goal. A coherent two- or three-system loop is preferable to shallow exposure to seven systems.

### D14
Invite voluntary breadth: a second priority, community project, season branch or new collection/business path. Preserve the ability to remain focused on one path.

### D30
Measure durable identity/history and chosen depth. Breadth is valuable only when it adds meaning without increasing confusion, abuse or churn.

## 6. Sensitive-system sequencing

Banking, loans, WDX trading, casino/probability play and other finance-like surfaces are high-risk comprehension areas.

Consumer-growth rules:
- never use them as mandatory proof that onboarding is complete;
- do not recommend them merely because the user's WLD balance crossed a threshold;
- show the fictional/game-only meaning near the decision, not only in a footer;
- avoid `safe return`, `guaranteed income`, `recover losses`, `low-risk profit`, `undervalued quality stock` or equivalent outcome-promising language;
- do not use loss, debt or casino outcomes to force comeback;
- preserve user-selected limits and existing safety/legal gates;
- youth/minor-sensitive expansion requires separate policy/legal review and must not be inferred from growth experimentation alone.

The existing ledger, authorization, anti-manipulation, probability and account-security contracts remain unchanged.

## 7. Session-length model

### 1–3 minute quick check
`recognize core thread → understand one change → act or defer`.

No new system is required.

### 5–15 minute meaningful session
Complete one coherent activity and optionally preview one adjacent concept after the result.

### 30+ minute deep session
Allow exploration across multiple systems, curation, business/world planning, community or season activity. More available depth must not automatically mean more interruption or more ads.

## 8. Funnel and cohort KPIs

Primary funnel:

`qualified visit → first value → authored core thread → meaningful result → understood continuation → D1 same-thread return → adjacent-system acceptance when relevant → D3 coherent progress → D7 coherent-loop outcome → D14 voluntary breadth → D30 durable history`

Add these metrics:
- first-value comprehension;
- primary-next-action clarity;
- first-result → understood-continuation rate;
- feature-grid backtracking / confusion exit rate;
- number of systems opened before first meaningful value;
- D1 exact-thread continuation;
- D3 same-thread progress;
- adjacent-preview accept / defer / hide rate;
- accepted-adjacent-system → meaningful-value rate;
- D7 coherent-loop completion;
- D7 self-reported or behaviorally validated next-goal clarity;
- D14 voluntary-breadth rate;
- D30 durable-history coverage;
- shallow-feature-sampling rate;
- support/help usage caused by system confusion.

Guardrails:
- D1/D7/D30 retention;
- ad-induced churn;
- abuse/fake-account rate;
- suspicious reward duplication;
- WDX manipulation/collusion signals;
- casino/loan-related complaints;
- phishing/ATO signals;
- privacy complaints;
- youth-safety reports where applicable.

Do not optimize `features visited per user` as a success metric.

## 9. Experiment backlog

### Experiment A — intent-led first week vs calendar-led system tour
- Hypothesis: keeping the user's chosen thread primary and introducing adjacent systems only when relevant improves D7 retained quality.
- Cohort: newly activated users with one authored thread.
- Control: scheduled broad feature introduction.
- Treatment: core-thread-first progressive complexity.
- Primary: D7 coherent-loop outcome and retention.
- Guardrails: confusion/help exits, abuse, finance-like misunderstanding.
- Observation: minimum D7 matured cohort; D30 before broad rollout.
- Next: retain only if downstream value improves without hiding important safety information.

### Experiment B — one adjacent preview vs equal feature grid
- Entry: after first meaningful result.
- Control: multiple equal feature cards.
- Treatment: one explainable adjacent preview plus `Explore all` secondary path.
- Primary: next meaningful-action rate and time-to-next-value.
- Guardrails: discoverability complaints and repeated backtracking.

### Experiment C — explain-before-entry for finance-like systems
- Control: direct finance/casino shortcut.
- Treatment: concise fictional/game-only purpose + what the user can learn/do + optional continue.
- Primary: qualified meaningful use, not click-through.
- Guardrails: misunderstanding, loss-chasing/debt-pressure signals, youth-safety complaints.

### Experiment D — reversible `not now` vs persistent recommendation
- Primary: D7/D30 retention and recommendation trust.
- Guardrails: feature discoverability and notification/spam complaints.

### Experiment E — monetization after coherent session closure
- Protect `result → continuation choice` and first adjacent-system explanation from interruptive monetization.
- Primary: retention-adjusted contribution, D7/D30 and ad-induced churn.

## 10. Acquisition, SEO and content impact

Acquisition creative should promise a concrete starter experience, not the entire economy stack.

Search/content clusters may explain professions, fictional companies, collections, seasons and beginner financial concepts, but each page should be independently useful. Do not mass-generate `day 1/day 2/day 3`, `level × feature`, or pseudo-unlock pages merely to capture queries.

SEO evaluation remains:
`organic visit → sample → authored thread → activation → D7 coherent loop → D30 durable history → contribution`.

Private progression, recommendations, balances, debt, portfolio, casino history, moderation/security/recovery state remain non-indexable/private under existing controls.

## 11. Viral and social impact

Share after an outcome worth explaining: collection chapter, project contribution, season milestone, learning replay or curated space.

Do not make early viral status depend on raw WLD wealth, loan size, casino winnings or WDX profit. A recipient should be able to understand the artifact without being pushed directly into a high-risk economy action.

Referral rewards remain downstream, capped and fraud-adjusted; raw invite, page-open, signup or feature-unlock events should not receive meaningful WLD/WDX.

## 12. Monetization impact

The first-week complexity ramp is a protected learning boundary.

Do not use an ad, sponsored module or subscription offer as the bridge that teaches the next system. Monetization can appear after value at eligible low-risk surfaces under the existing monetization-readiness gates.

Do not personalize prices from inferred attachment, wealth, debt, casino activity or progression urgency. Paid products should emphasize expression, convenience and ad removal rather than economic power or accelerated access to finance-like systems.

## 13. Security, abuse and privacy cross-check

### HIGH — fake unlock/next-step phishing and account takeover
- Scenario: `Your next Moneyverse system unlocked`, `claim your progression`, or `portfolio ready` messages lead to a credential-harvesting page.
- User impact: credential/session theft and ATO.
- Minimum conditions: canonical-domain consistency; growth messages never request passwords/OAuth/recovery codes; no session or verification secrets in share/deep links.
- Separate QA: required for new email/push/external deep-link progression messaging.

### HIGH — progression recommendations expose private state
- Scenario: public/shared cards or notifications reveal WLD/WDX holdings, debt, casino activity, private club membership, moderation or security state.
- Minimum conditions: private-by-default personalized progression; public-safe allowlist; no sensitive values in URL, metadata, analytics or lock-screen copy.
- Separate QA: required before personalized public surfaces.

### HIGH — economic unlock/reward farming
- Scenario: bots/multi-account networks repeatedly trigger tutorial, unlock, referral or adjacent-system rewards.
- Minimum conditions: no meaningful WLD/WDX for raw page opens, unlocks, recommendations, `not now` choices or simple feature visits; retained/fraud-adjusted milestones only if economic incentives are separately approved.
- Separate fraud QA: required before any progression-linked economic reward.

### HIGH — finance/casino complexity used for manipulation
- Scenario: recommendations steer users toward WDX, loans or casino after losses, debt or balance changes, or coordinated groups exploit discovery to manipulate markets.
- Minimum conditions: no loss-chasing/debt-urgency recommendations; fictional/game-only labeling; preserve anti-collusion/market-integrity rules; no community popularity signal directly controlling WDX value/reward.
- Separate product/legal/security QA: required for new finance-adjacent recommendation logic.

### HIGH — youth/minor exposure to high-risk progression
- User impact: inappropriate finance/probability pressure, tracking or commercial targeting.
- Minimum conditions: growth experiments cannot weaken existing age/legal gates; do not infer permission from engagement alone; avoid youth-targeted profit/jackpot/debt messaging.
- Separate legal/privacy/safety QA: required before expanding age-sensitive social, advertising or probability features.

### MEDIUM — analytics overcollection
Do not record an unrestricted cross-feature behavioral profile just to optimize sequencing. Use the minimum events needed to understand comprehension and retained value; exclude credentials, recovery/security state and unnecessary sensitive economy/social details.

## 14. Legal/policy notes

- U.S.: the FTC's 2025 Genshin Impact action remains a relevant gaming precedent around deceptive in-game purchase/odds practices involving children and teens. It is not a Moneyverse-specific rule, but supports conservative treatment of youth, probability and purchase UX.
- U.S.: the FTC's 2026-06 Genesis Tech action reinforces clear recurring-price terms, informed authorization and simple cancellation. Progressive onboarding must not be used to hide subscription terms.
- Korea: PIPC's 2026-03-23 youth-privacy policy work reinforces that child/teen privacy and safety remain active policy areas. Any age-sensitive expansion needs launch-time legal/privacy review.
- Korea/U.S.: PIPC's 2026-04-01 summary of COPPA 2.0 describes a U.S. legislative proposal/status, not current Korean law and not a settled U.S. rule. Treat it as a policy signal only.
- WLD/WDX remain virtual/simulated/game-only and must not be described as real deposits, securities, cash redemption or guaranteed returns.

This document is product-planning guidance, not legal advice.

## 15. Research note — 2026-09-14

Directly adopted:
- Supercell, `New Collection Levels & Mastery Changes`, 2026-05-13 — explicitly identifies progression complexity and disconnected rewards as problems, and moves toward simpler visible progress tied to personal goals. Adopted as evidence for `clear next goal > system count`. https://supercell.com/en/games/clashroyale/blog/news/new-collection-levels-and-mastery-changes
- Supercell, `June Update 2026` — reiterates a simpler connected progression loop and clearer milestones, used as a cross-check of the May direction. https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2026/
- Meta/Threads, `New Features to Celebrate 500 Million Monthly Users on Threads`, 2026-06 — community progress and discoverable community identity used as directional evidence for visible voluntary progress rather than forced breadth. https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
- Google Search Central people-first guidance and current AI-search guidance — used to reject mass-generated first-week/unlock SEO pages and keep content independently useful. https://developers.google.com/search/docs/fundamentals/creating-helpful-content and https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Naver Search Advisor SEO guide — used to keep Korean search optimization user-value-first. https://searchadvisor.naver.com/guide/seo-help

Reference only:
- Discord Community Onboarding current guidance — asks newcomers what they want to do, recommends limiting options to avoid overwhelm, and allows later re-selection. The feature predates 2026, so it is supporting UX evidence rather than the primary fresh reference. https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- Google Health Coach, 2026-05-07 — frames abundant information as useful only when surfaced around personal goals; used as a general personalization pattern, not a domain analogy or health requirement. https://blog.google/products-and-platforms/products/google-health/google-health-coach/

## 16. Runtime Product Reality Audit — 2026-09-14

Verification: **available for public web surfaces**.

Observed today:
- Production home clearly states that WLD/rewards are game-only virtual data.
- The home exposes wallet, five minigames, real-time virtual stocks, shop, quests and lobby as top-level quick links before a user has demonstrated a preferred path.
- The public guide says newcomers should start with one easy activity, which is directionally good.
- However, the same guide introduces deposits, bonds, credit-like loans, eight professions, businesses, stock trading, passive-income language, shop boosts and casino/minigames in the initial five-pillar narrative.
- Its first-day checklist ends by recommending that remaining WLD be placed into a compound deposit, and the player roadmap still frames progression as `beginner → representative capitalist` with asset thresholds.
- Public announcements remain quiet while a sponsored placement is present.

Conclusion: the live product has a strong game-only disclosure and some `start with one` language, but **public information architecture still exposes substantially more complexity than the newer intent/identity/continuity strategy requires**. The proposed progressive-complexity loop is therefore a growth hypothesis requiring cohort testing; this documentation pass does not change the runtime guide or navigation.

## 17. Decision and next priority

Adopt this narrow growth contract:

`first value → one chosen core thread → result → one explainable adjacent preview → user-controlled continue/defer → D1 same-thread → D3 coherent progress → D7 coherent loop → D14 voluntary breadth → D30 durable history`.

Do **not** expand calendar-driven system tours, mandatory feature checklists, finance/casino default recommendations, feature-open rewards, breadth-based status, first-week monetization interruptions, or mass-generated unlock SEO pages until the coherent-loop model improves D7/D30 retained value without worsening confusion, fraud, privacy, youth-safety or finance-like misunderstanding signals.
