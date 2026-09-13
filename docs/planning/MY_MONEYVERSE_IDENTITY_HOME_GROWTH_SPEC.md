# Woldeok Moneyverse — My Moneyverse Identity Home Growth Spec

> Version: v2026.09.13.32
> Status: Living consumer-growth specification
> Date: 2026-09-13
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`
> Korean counterpart: [MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.ko.md](MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure, or security-code change

## 1. Gap selected

The largest remaining consumer-growth gap is **compression**: Moneyverse has many systems and many long-term aspirations, but a user still lacks a simple answer to three questions on return:

1. What kind of Moneyverse person am I becoming?
2. What have I meaningfully built or learned?
3. What is the single best thing to continue next?

The product should not answer these questions with a wall of balances, feature menus, daily chores, or rankings. It should summarize the relationship in **2–3 strong identity signals plus one next chapter**.

Working consumer concept: **My Moneyverse**.

`my identity → my current thread → my visible history → one next chapter`

This is a consumer-facing relationship model, not a new backend architecture.

## 2. Runtime Product Reality Audit — first recovered-service pass

Runtime verification became available again on 2026-09-13, so this version prioritizes real consumer surfaces over speculative implementation detail.

### 2.1 What currently works well

The public home page already provides several useful trust and activation foundations:
- WLD is clearly described as game-only virtual data;
- the first major value proposition is understandable without login;
- Discord/Google sign-in is prominent;
- a newcomer section explicitly says users can inspect activities before signing in;
- community and privacy links are visible.

The login screen also explains that third-party passwords are not sent to Moneyverse and describes the limited account information used for connection.

These are compatible with the current growth direction and should be preserved.

### 2.2 Largest consumer gaps observed

**Gap A — the public home is feature-forward, not relationship-forward.**
The home exposes wallet, games, stocks, shop, quests, lobby, guide and notices, but there is no visible consumer promise resembling “what will become mine over time.” A new user can see what Moneyverse contains without yet seeing what personal history they will build.

**Gap B — the getting-started guide over-weights accumulation and finance-like success language.**
The guide currently frames progression around seed money, compounding deposits, dividends, capital gains, “undervalued blue-chip” discovery, passive income and becoming a representative capitalist. This conflicts with the newer long-term plan that prioritizes learning, collections, profession identity, curation, spaces, community contribution and multi-season history over raw wealth.

**Gap C — the guide presents too much system complexity before a clear first identity.**
A newcomer encounters banking, bonds, loans, eight professions, businesses, stocks, shop, casino and economic-loop explanations before establishing one personally meaningful thread.

**Gap D — several public app surfaces expose loading-only states to anonymous web retrieval.**
Stocks, work, quests and businesses can present little more than “loading” in the public rendered surface. Even when this is technically expected for client-side data, the consumer effect is weak pre-signup proof of value.

**Gap E — the public content return surface is not yet alive.**
The announcements page says public notices are being prepared. The planned weekly-world/content loop therefore exists in planning but does not yet provide a real recurring public return reason.

**Gap F — Lucky Zone copy is inconsistent with the current responsible-financial-game direction.**
Current public copy includes expressions such as “jackpot payout,” “thrilling comeback,” and immediate signup-reward framing. The probability disclosure and game-only notice are positive, but the excitement framing can over-emphasize risky behavior relative to learning/identity/product goals.

### 2.3 Runtime status classification

- Home/public trust shell: **implemented, useful baseline**.
- Pre-signup value preview: **partially implemented**.
- My Moneyverse identity summary: **planned / not observed**.
- Weekly world/content return loop: **planned / currently empty public notice surface**.
- Long-term identity/curation promise: **planned / not clearly visible on current public home or guide**.
- Finance/gambling-neutral consumer language: **needs content correction; do not treat current wording as canonical product intent**.

This automation does not change runtime copy or code. Runtime fixes require separate product/content implementation and QA.

## 3. My Moneyverse consumer model

The signed-in relationship surface should eventually answer the user with at most four primary blocks:

### A. “You are becoming…” — 1–2 identity signals
Examples:
- Collector · urban-history sets
- Builder · personal-space curator
- Analyst · diversified-market learner
- Craftsperson · restoration specialist
- Founder · operations-focused business path
- Community contributor · city-project participant

Identity labels must describe **interest and demonstrated meaningful behavior**, not sensitive psychological inference or financial-risk profiling.

A user may edit, hide or reject a suggested identity. Do not lock them into a persona because an algorithm inferred it.

### B. “Continue this” — one active thread
Examples:
- complete the next collection chapter;
- revisit a saved fictional company idea;
- continue a profession milestone;
- finish a room/museum curation task;
- resume a learning replay;
- see what changed in a club/city project.

This should be the dominant return action.

### C. “Your history” — one concise proof of continuity
Examples:
- a season chapter;
- a favorite collection milestone;
- a before/after space transformation;
- a learning reflection;
- a community contribution;
- a user-selected favorite memory.

Do not default to total wealth, casino results, debt, trade frequency or session hours.

### D. “Next chapter” — one optional aspiration
A next chapter is not a daily task. It is a reversible medium/long-term direction such as:
- curate a complete collection room;
- become a profession specialist;
- build a public-safe museum showcase;
- complete a season anthology;
- support a city landmark;
- build a learning journal across several fictional market events.

## 4. Home adaptation by maturity

### Visitor
Primary message: **what Moneyverse lets me build and remember**, not every available feature.

Show:
- one clear service promise;
- one 30–90 second public-safe preview;
- one example personal outcome such as a collection chapter, profession path or season archive;
- one contextual sign-up CTA.

### New / D0–D3
Show:
- one chosen or inferred-safe interest;
- one “continue” action;
- one explanation of why it matters;
- a visible next milestone.

Do not show eight equal-priority systems.

### D7–D30
Show:
- 2–3 identity signals;
- weekly progress story;
- one unfinished thread;
- one discoverable adjacent system.

### Established / multi-season
Show:
- current chapter;
- curated history/collection/space;
- community or seasonal continuity;
- next aspiration.

Avoid converting the home into a portfolio terminal unless the user explicitly chooses that mode.

### Returning after inactivity
Lead with:
- “what changed while you were away”;
- “what you were doing is still here”;
- one easy restart action.

Do not lead with lost rewards, missed streaks, declining rank or urgent asset-loss language.

## 5. Identity signals: selection rules

A good identity signal is:
- understandable in one phrase;
- earned through meaningful activity over time;
- non-sensitive;
- reversible/editable;
- not tied to real-world wealth or protected characteristics;
- useful for choosing the next action;
- safe to keep private by default.

Do not infer or expose:
- real-world investment sophistication;
- creditworthiness or real financial status;
- political/religious/health identity;
- sexual orientation or other sensitive identity;
- hidden account-security status;
- moderation suspicion;
- device/network risk labels.

For minors or uncertain-age traffic, keep identity expression conservative and do not use it for unrestricted behavioral advertising.

## 6. Activation and retention funnel

Updated narrow funnel:

`public promise → one preview → choose/recognize one interest → signup → first meaningful action → identity seed → D1 continue → D3 identity confirmation → D7 progress story → D30 aspiration → multi-season history`

### First 30 seconds
User should understand:
- this is a community virtual-economy game;
- assets are game-only;
- they can build a personal history, not merely earn WLD;
- one simple preview is available.

### First 3 minutes
User should complete or simulate one action in one thread. Do not require understanding banking, business, stocks, shop and casino together.

### First session
The product should save a clear next chapter or interest thread so signup has a reason beyond account creation.

### D1
Continuity: “the thing you chose is still here.”

### D3
Recognition: “this is starting to look like your Moneyverse.”

### D7
Interpretation: show a short story of what the user built/learned/collected plus one next chapter.

### D14/D30
Aspiration: let the user deliberately choose or revise the identity/goal they want to deepen.

## 7. Viral and public sharing

My Moneyverse can generate opt-in artifacts only after they are valuable privately.

Preferred artifacts:
- “my current chapter” card;
- collection/space transformation;
- season identity chapter;
- profession milestone;
- learning reflection;
- community-project contribution.

Public sharing should not reveal balances, private holdings, loan state, security state, account-recovery information, hidden social graph or moderation history.

Use **private by default** for personalized history. Public profile/showcase scope must be understandable and reversible.

## 8. SEO and content role

My Moneyverse itself is primarily a retention surface, not an SEO inventory generator.

Indexable content should be substantial independent material:
- season/world archives;
- fictional-company histories;
- educational guides;
- collection/lore guides;
- opt-in, substantial showcase stories with editorial/public context.

Do not mass-index personalized identity cards or auto-generated thin “My Moneyverse” pages.

SEO funnel:

`useful public content → identity-relevant preview → meaningful action → signup → D7 identity signal → D30 aspiration → retained LTV`

Search success is not impressions alone. Evaluate activation and D7/D30 by query/content cluster.

## 9. Monetization fit

Monetization should support expression after value is established:
- ad-free subscription;
- non-P2W profile/archive/space themes;
- collection display styles;
- season anthology presentation;
- clearly disclosed sponsorship around editorial/lore/education surfaces.

Do not sell:
- a more prestigious identity label;
- algorithmic social visibility disguised as organic status;
- better WDX outcomes;
- loan advantages;
- moderation priority;
- casino advantage;
- referral/reputation legitimacy.

The monetization question is: **does this help the user express or preserve something they already care about?** If not, it should not interrupt the core relationship surface.

## 10. KPI additions

### Relationship/identity
- identity-signal recognition rate;
- identity-signal edit/hide rate;
- active-thread continuation rate;
- next-chapter selection rate;
- D7 recap completion;
- D30 aspiration continuation;
- multi-season identity continuity;
- percentage of sessions beginning with a meaningful continue action.

### Acquisition/activation
- public preview → signup;
- public preview → first meaningful action;
- signup → identity seed;
- time-to-first-value;
- first-session next-thread save rate.

### Retention
- D1/D3/D7/D14/D30 by first identity thread;
- comeback → active-thread continuation;
- D60/D90 where sample permits;
- returning-user share;
- meaningful actions/session rather than raw session duration.

### Viral/SEO
- opt-in artifact share → engaged visit → activation → D7;
- organic content → identity-relevant preview → activation;
- branded/direct return share;
- public-artifact hide/report rate.

### Profitability
- D30/D90 LTV by identity thread;
- subscription/cosmetic conversion after repeated value;
- ad-induced churn;
- cohort contribution margin.

### Trust guardrails
- identity misclassification/edit rejection rate;
- privacy complaint rate;
- public/private exposure incidents;
- fake-signup/referral-fraud rate;
- spam/report rate;
- ATO-signal rate;
- suspicious reward duplication.

## 11. Experiment backlog

### A. Identity-first home vs feature-grid home
Hypothesis: 2–3 identity signals + one continue action improve D7 without reducing discovery.
Target: activated D3–D30 users.
Control: broad feature/dashboard modules.
Treatment: My Moneyverse relationship summary.
Primary: meaningful continuation and D7/D30 retention.
Guardrails: feature-discovery loss, confusion, identity-edit rate, privacy complaints.
Observation: at least one D30-mature cohort.

### B. “Build your history” visitor promise vs finance/economy-feature promise
Target: new organic/direct visitors.
Primary: preview engagement → signup → activation.
Guardrails: bounce, misleading-expectation feedback, finance-product confusion.
Observation: enough traffic for source-level comparison and at least D7 maturation.

### C. One chosen identity thread vs three equal next actions
Primary: time-to-first-meaningful-action and D7.
Guardrails: regret/edit rate, abandonment of other systems.

### D. Story-style D7 recap vs balance/activity-stat recap
Primary: recap → meaningful action and D14/D30.
Guardrails: privacy complaints, risky-behavior amplification, pressure complaints.

### E. Expression monetization after identity attachment vs generic early offer
Primary: contribution margin and subscription/cosmetic conversion.
Guardrails: D30/D90, ad/subscription-induced churn, cancellation/support complaints.

## 12. Security, abuse and privacy review

### High — private history/profile leakage
User impact: a personalized relationship surface can aggregate enough information to reveal private behavior, holdings, relationships or security context.
Minimum protection: private-by-default personalized history; explicit public scope; public-safe fields only; easy hide/remove; never expose recovery/security/moderation data.
Separate development/QA: required before public personalized surfaces.

### High — identity inference overreach
User impact: users may feel profiled or may have sensitive traits inferred from behavior.
Minimum protection: only product-interest identities; editable/rejectable labels; no sensitive inference; do not use finance-adjacent behavior to infer real credit/risk/personality status.
Separate privacy review: required for material behavioral-ad targeting or new tracking vendors.

### High — phishing/impersonation around personalized return pages
Minimum protection: first-party domain/branding, no secret-bearing URLs, no urgent asset-loss messages, no credential request inside shared artifacts.
Separate development/QA: required for deep links and share/login continuation.

### Medium — prestige/referral manipulation
Identity and public recognition must not become a farmable source of WLD/WDX advantage. Raw views, shares, follows and signup counts should not carry meaningful economy rewards.

Existing auth/session/RBAC/ledger/security boundaries remain unchanged.

## 13. Legal and policy cautions

- WLD/WDX remain virtual/simulated/game-only.
- Consumer wording must not imply real deposits, securities, guaranteed returns, cash redemption or financial advice.
- Personalized identities must not become sensitive profiling or unrestricted targeted-ad segments.
- Public personalized artifacts need understandable consent, privacy controls, takedown/removal and conservative minor handling.
- Sponsored identity/content surfaces require clear material-relationship disclosure.
- New personalized advertising, cross-service tracking, material referral rewards or minor-targeted monetization require separate privacy/legal/trust review.

## 14. External research adopted

Research date: 2026-09-13.

1. Discord, **Profile Widgets FAQ**, updated 2026-09-08 — customizable profile-board widgets let users intentionally express selected interests. **Directly adopted:** user-chosen modular identity expression, not opaque inferred profiling.
2. Discord, **Profile Privacy Setting**, updated 2026-07-08 — users can restrict visibility of profile details such as badges, activity, connected accounts, bio, widgets and wishlists. **Directly adopted:** personalized identity/history should be private-controlled and visibility-scoped.
3. Discord, **Activity Sharing FAQ**, updated 2026-07-07 — activity visibility has user controls and interacts with profile privacy. **Directional:** expression and activity sharing should be separated from core account availability.
4. Spotify, **Investor Day 2026**, 2026-05-21 — Spotify describes Free as an engagement/habit foundation before monetization and states engagement, retention, revenue and efficiency are linked operating KPIs. **Directional:** establish repeated value before aggressive monetization.
5. Google Search Central, **February 2026 Discover Core Update**, 2026-02-05 — favors more useful, in-depth, original, timely and locally relevant content while reducing sensational/clickbait content. **Directly adopted for SEO/content:** substantial editorial context over mass-generated identity pages.
6. Google Search Central, **Creating helpful, reliable, people-first content** — original, complete, trustworthy content should exist for people rather than ranking manipulation. **Directly adopted for SEO quality gate.**

## 15. Next growth priority

After this specification, the next growth priority is not another feature catalog. It is to correct the **public consumer narrative** so the live home/guide/content surfaces consistently communicate:

`one clear reason to start → one meaningful personal thread → something that becomes mine → a reason to return → a safe optional way to share or pay for expression`

The highest-value future runtime/content work is therefore a consumer-copy and information-hierarchy reconciliation of Home, Getting Started, Lucky Zone, public stock/business previews and the first recurring World Brief — under separate implementation/QA work.