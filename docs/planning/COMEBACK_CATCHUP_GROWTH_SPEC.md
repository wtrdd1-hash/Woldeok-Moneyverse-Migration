# Woldeok Moneyverse — Comeback Catch-up Growth Spec

> Version: v2026.09.13.53
> Status: Living consumer-growth specification
> Date: 2026-09-13
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `D7_CONTINUITY_CONTRACT_GROWTH_SPEC.md`, `WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
> Korean counterpart: [COMEBACK_CATCHUP_GROWTH_SPEC.ko.md](COMEBACK_CATCHUP_GROWTH_SPEC.ko.md)

## 1. Gap selected

The largest remaining retention gap is **comprehension debt after absence**.

Moneyverse now has a D1→D7 continuity contract and a weekly content concept, but that contract can become a liability when a player misses one or several editions. A returning user should not have to reconstruct every missed announcement, market event, profession change, season beat or community update before they can act again.

Current production reality checked on 2026-09-13:
- the public home is reachable and clearly labels WLD as game-only virtual data;
- several sponsored placements are already visible on the home;
- Monthly Notes still says public operations news is being prepared;
- `/announcements` is reachable but has no published notices yet and already contains a sponsored placement;
- `/guide` remains broad and wealth-forward, introducing deposits, bonds, loans, stocks, business dividends and casino systems before a lightweight return path exists.

Therefore the next growth priority is not more content. It is a **catch-up product that compresses absence into one understandable current state and one safe next action**.

Canonical loop:

`absence → low-pressure return → what changed / what stayed safe → one relevant catch-up choice → one meaningful action → restored continuity → next honest return reason`

## 2. Comeback promise

The comeback promise is:

**“You do not need to catch up on everything. Your history is still here, and you can understand what matters now in a few minutes.”**

Every comeback surface should answer four questions in this order:
1. **What is still intact?** — progress, collections, identity, saved interests and eligible history.
2. **What materially changed?** — only the few changes relevant to the user or the current world.
3. **What can I ignore?** — expired noise, nonessential announcements and old tasks should not become debt.
4. **What is one useful action now?** — a single 1–5 minute re-entry action.

Do not lead with missed rewards, lost streaks, rank decay, expired offers or guilt language.

## 3. Catch-up by absence horizon

### 3–6 days inactive — lightweight continuity
Goal: restore the interrupted thread, not create a churn campaign.

Show:
- last meaningful thread or action;
- one change since the last visit;
- one continuation under three minutes.

Do not issue a large economic comeback bonus.

### 7–13 days inactive — missed-D7 recovery
Goal: prevent the D7 continuity contract from turning into homework.

Show:
- the prior open question, if one existed;
- a two- or three-sentence resolution summary;
- one optional deeper link;
- one new next action.

The user does not need to read the missed full Weekly Brief before continuing.

### 14–29 days inactive — return briefing
Goal: compress the world into a current-state briefing.

Recommended hierarchy:
1. `Your progress is still here.`
2. `Three things that matter now.`
3. `One thing connected to what you cared about.`
4. `One action you can finish in five minutes.`

Avoid a chronological dump of every missed patch, season event or announcement.

### 30+ days inactive — fresh chapter
Goal: respect history without forcing an obsolete checklist.

Show:
- durable personal history and identity;
- major world/season changes only;
- a choice between resuming an old thread and starting a fresh one;
- a catch-up path that does not require rebuilding lost daily streaks.

A long absence should not permanently reduce the user's ability to participate.

## 4. First comeback session

### First 30 seconds
The user should understand:
- nothing important was silently confiscated because they were absent;
- what changed at a high level;
- there is one obvious re-entry action.

### First 3 minutes
The user should be able to:
- read a compact briefing;
- recognize one prior interest or select a new one;
- complete or start one meaningful action.

### First 5–15 minutes
Offer depth only after the user has re-established context:
- profession continuation;
- collection/lore catch-up;
- fictional-company/world explainer;
- season catch-up;
- club/city project update;
- learning replay.

Do not require the user to clear a backlog before using the normal product.

## 5. Catch-up is comprehension assistance, not an economy faucet

Catch-up should primarily reduce **information disadvantage**, not grant large WLD advantages.

Preferred assistance:
- concise summaries;
- recommended next action;
- late-entry season path;
- restored context for collections/professions;
- replay/explainer content;
- non-P2W cosmetic or archive recognition when justified.

Avoid:
- large WLD grants triggered simply by inactivity;
- better market, loan or casino terms for churned users;
- rewards that make intentional churn optimal;
- repeated multi-account comeback farming opportunities.

Any economic comeback reward requires separate fraud/economy review and should be bounded, idempotent and retention-justified.

## 6. Home and UX priority for returning users

A returning-user home should prioritize:
1. **Welcome back without guilt**;
2. **Still yours** — one durable progress signal;
3. **What changed** — at most three high-signal items;
4. **Continue now** — one primary CTA;
5. optional exploration.

Do not begin with:
- generic feature grid;
- balance leaderboard;
- expired reward list;
- casino promotion;
- loan prompt;
- ad-heavy interruption.

Empty/loading/error states should preserve the return path. If personalized catch-up cannot load, fall back to a safe generic `what changed this week + one public action` experience rather than exposing internal errors or sensitive state.

## 7. Notifications and comeback messaging

Comeback communication should be useful even when opened cautiously.

Preferred framing:
- `A topic you followed has a short update.`
- `Here is what changed while you were away.`
- `Your collection/progress is still here.`

Avoid:
- `Your balance is at risk.`
- `Claim now before you lose...`;
- account-security urgency in marketing messages;
- sensitive balances, holdings, debt, loan status or private social activity in notifications.

Messages must make the official domain/brand clear. Email, push and external deep-link rollout requires separate phishing/ATO, privacy and notification QA.

## 8. Acquisition, SEO and public catch-up content

Catch-up pages are not automatically SEO pages.

Indexable candidates:
- independently useful season/world catch-up guides;
- fictional-company history explainers;
- substantial `what changed` educational summaries;
- public-safe event archives.

Do not index:
- personalized return briefings;
- user progress summaries;
- balances, portfolios, loans or casino history;
- security/recovery state;
- referral/reward claim pages;
- thin per-user or per-date catch-up pages.

SEO funnel:

`qualified search/share visit → useful current-state explanation → contextual preview/signup/comeback → meaningful action → D7/D30 → retention-adjusted contribution`

Google's current people-first guidance and February 2026 Discover update support original, useful, non-clickbait content rather than manufactured freshness.

## 9. Social and viral implication

A comeback artifact may be shareable only when it is valuable without exposing private history.

Good examples:
- `What changed in Moneyverse this month`;
- season catch-up card;
- public fictional-company/world timeline;
- collection/lore recap.

Bad examples:
- `User X was absent for 21 days`;
- private balance or debt comparison;
- personalized comeback reward URL;
- hidden club/friend activity.

No meaningful WLD reward for sharing or raw comeback clicks.

## 10. Monetization

Comeback is a fragile trust moment.

Rules:
- show the catch-up answer before monetization becomes visually dominant;
- do not place an ad between `what changed` and the primary re-entry action;
- do not advertise loans, stock-like outcomes or casino play as the default comeback path;
- ad-removal subscription can be shown only after repeated value is re-established;
- sponsored catch-up content must be clearly labeled and cannot purchase editorial conclusions or economic recommendations.

Primary business metric: **retention-adjusted contribution**, not comeback-page ad impressions.

## 11. Funnel and KPI framework

Primary funnel:

`inactive cohort → comeback visit → briefing understood → one relevant next action → meaningful action → D1-after-return → D7-after-return → D30 re-retention`

Primary KPIs:
- comeback briefing completion;
- time-to-reorientation;
- comeback → meaningful-action rate;
- 1–5 minute catch-up completion;
- resumed-thread rate;
- fresh-thread selection rate for 30+ day returners;
- D1/D3/D7/D14/D30 after comeback;
- comeback cohort sessions/user and meaningful actions/session;
- comeback → share/referral quality;
- reactivated-user LTV;
- retention-adjusted contribution.

Guardrails:
- comeback bonus abuse rate;
- multi-account/fake-return signal rate;
- suspicious reward duplication;
- phishing/ATO report rate;
- notification opt-out;
- privacy complaint rate;
- finance-like claim complaint rate;
- accidental ad click;
- user-reported guilt/FOMO/pressure.

## 12. Experiment backlog

### Experiment A — compressed briefing vs chronological backlog
Hypothesis: `what matters now` improves comeback-to-meaningful-action and reduces time-to-reorientation.
Target: 14–29 day inactive returners.
Control: chronological missed-update list.
Treatment: three high-signal changes + one relevant action.
Primary: comeback → meaningful action; time-to-reorientation.
Guardrails: confusion, missed-critical-information reports.
Minimum observation: D7-matured comeback cohorts; avoid conclusions from very small samples.
Next action: keep compressed hierarchy if action and D7 improve without comprehension harm.

### Experiment B — reassurance-first vs missed-reward framing
Hypothesis: `your progress is still here` produces healthier return than `you missed rewards`.
Target: 7+ day inactive users.
Primary: meaningful-action and D7-after-return.
Guardrails: pressure complaints, notification opt-out.

### Experiment C — resume old thread vs forced old checklist
Hypothesis: offering `resume or start fresh` improves 30+ day reactivation.
Primary: first-session completion and D7-after-return.
Guardrails: abandonment, confusion.

### Experiment D — contextual catch-up vs large WLD comeback reward
Hypothesis: comprehension assistance retains users without creating churn farming.
Primary: D7/D30 re-retention.
Guardrails: reward abuse, suspicious multi-accounting, economy inflation.
Treatment should avoid material economic advantage unless separate economy/fraud review approves it.

### Experiment E — answer/action before ad vs early ad
Hypothesis: restoring context before monetization improves retention-adjusted contribution.
Primary: retention-adjusted contribution.
Guardrails: bounce, accidental clicks, D7/D30, ad complaints, CWV.

## 13. Security, abuse and privacy review

### High — comeback phishing / account takeover
User impact: credential theft and session compromise.
Abuse scenario: attackers impersonate `welcome back`, `your reward expires` or `your account changed while away` messages.
Minimum protection: consistent official-domain cues; no credential/balance-loss urgency; no secrets/session/recovery material in URLs; no sensitive account state in notification copy.
Separate development/QA: required before email, push, personalized external links or deep-link rollout.

### High — personalized return briefing leakage
User impact: exposes holdings, debt, social relationships, private activity or security state.
Abuse scenario: public/shared/cached comeback page reveals account-specific history.
Minimum protection: personalized catch-up is private by default; public-safe allowlist; no sensitive values in URLs/analytics; explicit sharing if any; hide/delete controls where applicable.
Separate development/QA: required before personalized public/shareable surfaces.

### High — comeback reward farming
User impact: economy inflation and unfair advantage.
Abuse scenario: users cycle inactivity or create multiple accounts to farm comeback rewards/referrals.
Minimum protection: avoid meaningful reward for inactivity itself; bounded eligibility; retention-based value; fraud review; duplicate/replay resistance in any eventual reward implementation.
Separate economy/security QA: required before material WLD or scarce-item comeback rewards.

### High — finance-like reactivation targeting
User impact: vulnerable or inexperienced users may be pushed toward high-risk simulated behavior.
Abuse scenario: comeback messaging highlights loans, `safe yield`, guaranteed passive income, stock recovery or casino wins.
Minimum protection: game-only context; neutral current-state explanation; no guaranteed-return/loss-recovery claims; no casino/loan default comeback CTA.
Legal/product review: required if real value or financial characteristics are ever proposed.

### Medium — teen and behavioral targeting overreach
Do not infer or exploit sensitive traits from inactivity. Age-sensitive experiences, personalized advertising and reactivation targeting require privacy/legal review and conservative defaults.

## 14. Current external evidence reviewed

Direct adoption:
- **Supercell / Clash Royale Welcome Back Log-in Calendar**: current support documentation says players inactive for 30+ days may receive a seven-reward welcome-back calendar, with twice as many days to claim as rewards and without requiring consecutive daily logins. Moneyverse adopts the *grace / non-consecutive recovery* idea, not the reward-heavy structure.
- **Google Search Central, February 5 2026 Discover core update**: Google explicitly says Discover is reducing sensational/clickbait content and surfacing more in-depth, original and timely content. Adopted for public catch-up editorial standards.
- **Discord scam/phishing guidance, updated July 23 2026**: unsolicited offers and click requests are a common scam pattern. Adopted for official-domain, no-urgency comeback messaging.

Reference only:
- **EA NHL 27 Loyalty Rewards, August 11 2026**: recognizes prior engagement when users return across game versions. Useful evidence that continuity/history can be acknowledged, but Moneyverse does not adopt engagement-proportional economic rewards because of churn-farming and P2W/economy risks.
- **Discord teen-by-default / age-assurance updates, February 2026**: reinforces that age-sensitive personalization should minimize unnecessary identity collection and retain conservative default protections.

## 15. Runtime verification

Runtime verification was available on 2026-09-13.

Observed publicly and non-destructively:
- home is reachable;
- WLD/game-only disclosures are visible;
- home contains multiple sponsored placements;
- Monthly Notes remains empty;
- `/announcements` remains empty and contains a sponsored placement;
- `/guide` foregrounds broad virtual-finance/economy systems and wealth progression.

No authenticated, value-changing, admin, casino settlement or destructive action was performed.

## 16. Next growth priority

After this spec, the next priority is to validate a single narrow loop:

`7–29 day absence → 30–90 second catch-up → one meaningful action → D1-after-return → D7-after-return`

Do not expand comeback bonuses, notification volume, ad inventory or personalized targeting until this loop improves re-retention without increasing fraud, privacy complaints, finance-like pressure or user-reported guilt.