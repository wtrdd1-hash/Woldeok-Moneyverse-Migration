# Woldeok Moneyverse — User-Controlled Priority Home & Retention Growth Spec

> Version: v2026.09.14.68
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`, `CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md`
> Korean counterpart: [USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.ko.md](USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, infrastructure, scheduler or security-code change.

## 1. Gap selected for this iteration

Moneyverse already has plans for identity-oriented home, comeback catch-up, D7 continuity, collection ownership, seasons, notifications and qualified acquisition. The remaining retention gap is **priority control**.

A member can have many valid interests — collection, profession, fictional company, season, project, learning replay, space or community — but a large feature grid or opaque recommendation model can still force the member to rediscover what matters every time they return.

This version defines a consumer-facing priority contract:

`first meaningful choice → pin 1–3 active threads → home reflects those choices → one clear next action → D1 recognition → D3 progress → D7 outcome → revise priorities → D30 durable history`

Consumer promise:

**“Moneyverse remembers what I chose to care about, puts it within reach, and lets me change my mind.”**

This is not a recommendation-engine, schema or state-machine specification.

## 2. Why explicit user control matters

Personalization should reduce complexity without silently converting the user into an inferred persona.

Priority rules:
- let a member explicitly pin, unpin, reorder or pause interests;
- keep the active set small enough to remain understandable;
- use behavioral suggestions only as optional proposals, never irreversible identity assignments;
- explain why a suggested thread appears when practical;
- allow “show less” / “not now” without punishment;
- do not infer sensitive real-world traits, financial sophistication, creditworthiness, health, politics, religion, sexuality, security risk or moderation suspicion for growth personalization.

The goal is continuity, not surveillance-style prediction.

## 3. The priority set

A member should eventually be able to keep **1–3 active priorities** such as:
- finish a collection chapter;
- continue one profession path;
- follow a fictional company/world thread;
- prepare for one season goal;
- continue a learning replay or journal;
- improve a room/museum/space;
- participate in one club/city/community project.

A priority is not a daily chore and does not expire because the member misses a day.

Each priority should answer, in consumer language:
1. **Why this is here** — user chose it or explicitly accepted a suggestion.
2. **What changed** — one concise state/progress update.
3. **What can I do now** — one meaningful next action.
4. **Can I stop seeing it** — clear pause/unpin/change control.

## 4. Home behavior by lifecycle

### Visitor / pre-signup
Do not personalize from hidden tracking. Preserve the explicit search/share/creator context and offer one relevant sample.

### D0 / first meaningful action
After the user makes a real choice, offer to keep that thread as the first priority. Do not require choosing three categories before value is proven.

### D1
Lead with exact recognition: **“Continue what you chose.”** Show the saved thread before generic novelty, balance, ads or broad feature discovery.

### D3
Show progress or one adjacent depth action inside the same priority. One secondary discovery slot may exist, but it must not displace the chosen thread.

### D7
Resolve or meaningfully advance the first priority: `where I started → what changed → what I did → what I can choose next`.

If the thread is complete, let the member archive it, extend it, or replace it with a new priority.

### D14–D30
Allow the member to evolve the set: one enduring priority, one current/seasonal priority and optionally one exploratory priority. The system should not force all three slots to be filled.

### Lapsed/comeback
Show what was pinned before absence, what genuinely changed, and one safe restart action. Never imply that unpinned time caused loss or punishment.

## 5. Session design

### 1–3 minute quick check
- see the top priority;
- understand one change;
- perform or defer one action;
- leave without penalty.

### 5–15 minute meaningful session
- advance one priority;
- optionally inspect the second priority;
- produce a visible progress/history update.

### 30+ minute deep session
- curate, compare, build, explore or participate deeply;
- do not increase ad load simply because session length is high;
- allow user-driven branching without losing pinned priorities.

## 6. Acquisition and activation connection

Channel context may propose the **first priority**, but the user owns it after entry.

Examples:
- SEO guide → “keep following this fictional-company thread”;
- creator campaign → “save this collection/world path”;
- shared showcase → “start a related collection chapter”;
- season page → “follow this season goal.”

Funnel:

`qualified visit → useful sample → authored choice → contextual signup → meaningful activation → first pinned priority → D1 recognition → D7 outcome → D30 durable record`

Raw signup, login success, wallet open, ad click or referral-code entry is not activation.

## 7. Social and viral role

Priorities are private workflow/identity context by default, not public status.

A member may later share a **result produced by a priority** — collection chapter, season reflection, learning replay, space transformation or community project contribution — but should not share the private priority list itself by default.

Do not expose:
- private balances or WDX positions;
- debt/loan state;
- casino history;
- hidden social graph;
- account/security/recovery state;
- moderation/fraud-risk labels;
- precise personal information.

Sharing remains opt-in and reversible.

## 8. LiveOps and season fit

Season content should not automatically replace a member’s priorities.

Use D-14 / D-7 / D-3 / D-1 previews to offer a temporary seasonal priority with clear context. A user can accept, ignore, pause or replace it.

Late joiners and comeback users should receive a catch-up path rather than a “you missed everything” message. Season completion should create a durable chapter that can be archived or reinterpreted later.

## 9. SEO boundary

The priority home itself is a private retention surface and should not become SEO inventory.

Default noindex/private:
- personal priority pages;
- personal progress summaries;
- private saved threads;
- wallet/portfolio/debt/security/recovery/moderation state.

Index only substantial public-safe content with independent value, such as season archives, original guides, fictional-company/world pages, collection lore and explicitly public curated showcases.

## 10. Monetization boundary

A user’s priorities are not permission to charge more or target more aggressively.

Rules:
- never vary real-money subscription/cosmetic price because a user appears highly attached, wealthy or willing to pay;
- do not use private WLD/WDX/debt/casino/security data for ad targeting;
- do not insert an ad between priority recognition and the first meaningful action;
- prioritize contextual/non-personalized advertising where possible;
- sell expression/convenience after repeated value, not economic superiority;
- no meaningful WLD/WDX reward for pinning, opening, clicking or sharing a priority.

Evaluate monetization by retained contribution, not impressions per user.

## 11. Experiment backlog

### A — user-pinned priority vs algorithm-only recommendation
Hypothesis: explicit priority control improves D1/D7 meaningful continuation and trust.
Target: users after first meaningful action.
Control: generic/algorithmic recommended home.
Treatment: one explicit pinned thread + one next action.
Primary: D1 exact-thread continuation, D7 priority outcome.
Guardrails: hide/unpin rate, confusion, privacy complaint, abandonment.
Minimum observation: D7-mature cohort; D30 before broad rollout.

### B — one priority vs three equal recommendations
Hypothesis: one dominant thread reduces choice overload in D0–D3.
Primary: time-to-next-meaningful-action, D1/D3 continuation.
Guardrails: discovery of other systems, repeated-action fatigue.

### C — editable priority controls vs silent personalization
Hypothesis: visible pin/unpin/reorder controls increase trust without reducing engagement quality.
Primary: priority retention + D7 meaningful action.
Guardrails: control-use confusion, support complaints, unwanted personalization reports.

### D — chosen priority before novelty vs novelty-first return home
Primary: D1/D7 continuation and sessions with at least one meaningful action.
Guardrails: content discovery, session satisfaction, ad-induced churn.

### E — priority-context monetization after action vs before action
Primary: retained contribution and D30.
Guardrails: post-ad abandonment, accidental click, privacy complaint.

## 12. KPI framework

Activation/continuity:
- authored-choice → first-priority adoption;
- priority adoption → meaningful activation;
- time-to-next-meaningful-action;
- D1 exact-priority recognition/continuation;
- D3 same-thread progress;
- D7 priority outcome/meaningful advancement;
- D14 priority revision without churn;
- D30 durable-record creation.

Engagement quality:
- sessions with meaningful priority action;
- quick-check completion without forced extra actions;
- voluntary second-priority exploration;
- pause/unpin/reorder rate;
- “show less/not now” use;
- returning-user share.

Growth/economics:
- acquisition-source → first-priority fit;
- retained CAC by priority cohort;
- D30 LTV and contribution;
- ad-induced churn;
- subscription conversion after repeated value.

Trust/security:
- unwanted-personalization complaint rate;
- privacy complaint rate;
- ATO/phishing signal rate;
- fake-signup/referral-fraud rate;
- suspicious reward duplication;
- spam/report rate.

## 13. Security, abuse and privacy review

### HIGH — sensitive inference/private-state leakage
Impact: private financial/game state or sensitive inferred identity becomes visible on home/share/analytics.
Scenario: recommendation text reveals debt, WDX losses, hidden social relationship, security/recovery status or sensitive inferred trait.
Minimum protection: public-safe allowlist; sensitive categories excluded from growth personalization; personalized home private by default; no secret/session/recovery data in URL or analytics.
Separate dev/QA: **yes** before any new personalized public surface or third-party personalization SDK.

### HIGH — recommendation/deep-link phishing and ATO
Impact: credential theft/account takeover.
Scenario: lookalike message says “your pinned priority changed” or “continue your investment goal” and asks for credentials or OAuth codes.
Minimum protection: canonical domain/brand consistency; no credentials/auth codes requested inside growth content; safe reauthentication boundary; no urgent asset-loss language.
Separate dev/QA: **yes** for external notifications/deep links.

### HIGH — finance-like manipulation
Impact: users mistake game recommendations for real investment/credit guidance or are pushed toward risky in-game behavior.
Scenario: priority engine repeatedly surfaces WDX profit, loans or casino recovery because those actions increase engagement.
Minimum protection: game-only framing; exclude loss-chasing, debt urgency, casino comeback and profit-maximization as default priority goals; no financial-game advantage sold for cash.
Separate dev/QA: **yes** if finance-adjacent personalized recommendations are implemented.

### MEDIUM — bot/multi-account priority farming
Impact: reward/economy distortion.
Scenario: accounts repeatedly pin/unpin or complete trivial priority actions to farm rewards.
Minimum protection: no meaningful economic reward for pin/click/open; evaluate meaningful downstream action rather than UI events.
Separate dev/QA: only if reward mechanics are later attached.

### MEDIUM — personalization data overcollection
Impact: unnecessary behavioral profiles are exposed to analytics/ad vendors.
Minimum protection: collect only metrics necessary for product evaluation; do not export private economy/security fields; separate product-continuity analytics from ad targeting.
Separate dev/privacy review: **yes** for new analytics/ad SDK usage.

## 14. Legal/policy notes

- Korea: current PIPC enforcement reinforces that personal information and third-party behavioral information require an appropriate lawful basis and transparent handling. Do not treat private priority data as free advertising input.
- United States: the FTC’s August 2026 personalized-pricing policy statement is still a proposal/public-comment matter, not a final universal ban. Treat it as a strong product guardrail against undisclosed individualized pricing based on personal data.
- Subscription/advertising disclosures, cancellation, youth/minor protections and endorsement rules remain governed by their separate current requirements and must be rechecked at implementation time.
- WLD/WDX remain virtual/simulated/game-only and cannot be presented as deposits, securities, legal tender, cash redemption or guaranteed-return products.

## 15. Runtime Product Reality Audit — 2026-09-14

Verification: **available**.

Observed production public surfaces:
- home clearly states WLD/rewards are game-only virtual data;
- quick links foreground wallet, minigames, exchange, shop and quests;
- multiple `SPONSORED ADVERTISEMENT` placements are already present;
- newcomer copy says to start one activity at a time, but the current home does not expose a user-controlled persistent priority model;
- monthly/public notices are still empty/preparing content;
- the getting-started guide remains strongly finance/wealth-forward, emphasizing deposits, bonds, loans, capital gains, dividends, passive income, casino and a “representative capitalist” roadmap.

Conclusion: the priority-control loop is **not runtime-verified as a product behavior**. It remains a planning hypothesis and should be tested before broad personalization or new ad inventory.

## 16. Research note — 2026-09-14

Direct adoption:
1. Meta/Threads, `New Features to Celebrate 500 Million Monthly Users on Threads`, 2026-06-16/17 — `Your Algo` lets users privately control topics and duration. Adopt: explicit, private, reversible interest control. Source: https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
2. Xbox Wire, `April Xbox Update`, 2026-04-30 — users can pin up to three favorites to the front of Home. Adopt: a small user-selected set stays immediately reachable. Source: https://news.xbox.com/en-us/2026/04/30/april-xbox-update-2026/
3. Discord, `Profile Widgets FAQ`, updated 2026-09-08 — users add, reorder and remove interest widgets. Adopt: user-controlled arrangement/removal, not silent permanent profiling. Source: https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ

Policy guardrails:
4. PIPC, enforcement summary on TikTok/Apple, 2026-07-27 — unlawful collection/use and use of third-party behavioral data for personalized ads were enforcement issues. Use as privacy-by-design guardrail, not as a claim that all personalization is prohibited. Source: https://m.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS212&mCode=C040030000&nttId=12337
5. FTC, proposed enforcement policy statement on personalized pricing, 2026-08-19 (public comment ongoing) — undisclosed use of personal data to individualize prices can create deception concerns. Adopt product rule: no hidden willingness-to-pay pricing. Source: https://www.ftc.gov/legal-library/browse/federal-trade-commissions-proposed-enforcement-policy-statement-regarding-personalized-pricing

Reference only:
- Threads `Dear Algo`, 2026-02-11 — temporary “more/less” topic preference supports the concept of reversible, time-bounded preferences. Source: https://about.fb.com/news/2026/02/threads-dear-algo/

## 17. Next growth priority

Validate one end-to-end retained-quality loop before expanding personalization:

`first meaningful choice → pin one priority → D1 exact recognition → D3 progress → D7 outcome → user chooses keep/archive/replace → D30 durable record`

Do **not** expand opaque recommendation models, sensitive behavioral targeting, personalized pricing, finance-loss comeback nudges, priority-linked WLD/WDX rewards or additional interruptive ad inventory until this loop improves retention and trust guardrails.