# Woldeok Moneyverse — Community & Market Integrity Specification

> Version: v2026.09.12.21
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `CLUBS_COOPERATIVE_ECONOMY_SPEC.md`
> Korean counterpart: [COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md](COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md)

## 0. Purpose

Moneyverse connects community discussion, clubs and a fictional WDX market. That creates a product risk absent from isolated chat or isolated trading: users can coordinate social behavior that distorts a game market, harasses users, manufactures popularity, abuses reports, or creates misleading claims of guaranteed profit.

This specification defines the product, moderation, market-integrity and audit contracts needed to keep community participation open by default while protecting users and the virtual economy.

The core rule is: **discussion is allowed; coordinated manipulation is not**. Users may express opinions, publish theses, disagree, organize learning groups and discuss fictional issuers. They may not coordinate deceptive or artificial activity designed to create false market signals, fake engagement, sham liquidity or pressure other users into trades.

## 1. Design principles

1. Community participation has no arbitrary daily post/comment/report quota by default.
2. Safety controls are protection limits, not progression caps. Spam/burst throttles may exist and must be documented under `DEFAULT_LIMIT_POLICY.md`.
3. Moderation must be evidence-based, reviewable and auditable. High-impact enforcement should not depend on one opaque score.
4. A market-integrity hold must be narrower than an account-wide punishment where practical.
5. Community popularity must never directly determine WDX prices, job payouts, loan terms or season rewards.
6. Community reports are signals, not votes. Mass-reporting does not automatically remove an account or change a market outcome.
7. Users must be able to understand why content was limited and how to appeal where appropriate.
8. Historical moderation/audit evidence is retained according to security/privacy policy; ordinary public content retention remains unlimited by default unless the user deletes content or a valid policy requires removal.

## 2. Community surfaces

Initial community surfaces:

- public community feed;
- stock-tagged posts linked to fictional WDX issuers;
- comments/replies;
- club feed;
- user profiles and follow graph;
- reactions/bookmarks;
- event/season discussion;
- educational market journals;
- moderation/report inboxes.

P0 does not add private user-to-user financial solicitation tools. Direct messaging, if added later, requires a separate abuse/privacy review.

## 3. Content model

Recommended entities:

### `community_posts`

- `id`
- `author_user_id`
- `scope` (`PUBLIC`, `CLUB`, `PROFILE`, `STOCK_TAGGED`)
- `stock_id` nullable
- `club_id` nullable
- `title`
- `body`
- `visibility_status`
- `moderation_state`
- `created_at`, `edited_at`, `deleted_at`
- `content_version`

### `community_comments`

- parent post/comment identifiers;
- author;
- body;
- moderation state;
- timestamps/version.

### `community_reactions`

Reactions are engagement metadata only. They must not mint WLD or move stock prices.

## 4. Content rules

### 4.1 Allowed examples

- “I think WDX-LOG may benefit from the current in-game logistics event.”
- “My fictional portfolio is diversified across three sectors.”
- “Here is why I sold WDX-BIO after reviewing the fictional event log.”
- “Our club is discussing the new market-learning quest.”

### 4.2 Disallowed market-integrity conduct

- arranging coordinated buys/sells to create an artificial price move;
- self-trading or circular-trading coordination;
- recruiting users to place sham orders to manufacture volume/liquidity;
- false claims that a system/admin guarantees a price increase;
- impersonating staff or fictional-company insiders;
- fabricated screenshots, settlement records or admin messages presented as authentic;
- coordinated attempts to pump a stock-tagged post while executing linked manipulative trades;
- promising off-platform consideration for in-game trades or coordinated activity;
- evading an integrity hold through linked accounts/clubs.

### 4.3 General safety rules

Disallow harassment, threats, doxxing, hate/targeted abuse, spam, malware/phishing, ban evasion, bot-driven engagement manipulation and malicious mass reporting. Exact policy taxonomy should be versioned so enforcement remains explainable.

## 5. Stock-tagged post disclosure model

Every stock-tagged post should display:

- fictional-market disclosure;
- post timestamp;
- last edit timestamp;
- whether the author currently has a position in the tagged WDX issuer, using a privacy-preserving boolean or coarse category rather than exact holdings by default;
- whether the author is an operator/admin account;
- “not investment advice / internal simulation” language appropriate to the product.

Do not show exact private balance/position sizes without explicit user opt-in.

An author changing position after publishing is normal and not itself misconduct. Manipulation review requires behavioral evidence, not merely disagreement between a post and later trading.

## 6. Report system

### 6.1 Report categories

- harassment/targeted abuse;
- hate/threat/doxxing;
- spam/platform manipulation;
- impersonation/fabricated evidence;
- market-manipulation coordination;
- scam/phishing/off-platform solicitation;
- inappropriate content;
- other with required explanation.

### 6.2 Report contract

`POST /api/community/reports`

Required input:

- target type/id;
- reason code;
- optional evidence text;
- optional related content/trade references already visible to reporter;
- idempotency key.

A duplicate retry returns the original report result. Multiple reports from the same reporter on the same target/reason may be coalesced rather than creating artificial severity.

### 6.3 No report-vote enforcement

A report count must not automatically:

- ban a user;
- delete a post permanently;
- halt a WDX issuer;
- cancel trades;
- change ranking/rewards.

Reports can raise queue priority. Enforcement uses evidence, severity, confidence and reviewer policy.

## 7. Moderation state machine

Content state:

`VISIBLE -> FLAGGED -> LIMITED_PENDING_REVIEW -> VISIBLE | REMOVED`

Account/community capability state may be:

`NORMAL -> WARNED -> COMMUNITY_RESTRICTED -> SUSPENDED`

Market-integrity capability is separate:

`NORMAL -> WATCH -> TRADE_REVIEW_HOLD -> MARKET_RESTRICTED -> CLEARED`

Do not automatically escalate `COMMUNITY_RESTRICTED` to full economy lock unless there is a concrete economy/security reason.

## 8. Enforcement ladder

Possible actions, selected by policy/severity:

1. education/warning;
2. content label or reach reduction for spam-like behavior;
3. content removal;
4. temporary posting/reply restriction;
5. club moderation action;
6. temporary market review hold for linked integrity evidence;
7. market-feature restriction;
8. account suspension for severe/repeated platform abuse;
9. permanent removal for the most serious policy violations.

A temporary safety throttle can be automated for obvious bursts. Long-duration or account-wide enforcement should normally require durable evidence and review.

## 9. Anti-spam without arbitrary participation caps

Normal posting is unlimited by default. Protection uses adaptive server-side controls:

- token/burst rate limits for API safety;
- duplicate-text similarity detection;
- repeated-link/domain detection;
- account-age/risk signals;
- bot-like timing patterns;
- mass mention/reply detection;
- engagement-ring detection;
- linked-account clustering.

A normal active user should not see a “you used all posts for today” mechanic.

If automated throttling activates, UX should communicate that the system is temporarily slowing unusual activity rather than implying a progression quota.

## 10. Market-integrity graph

Create a risk graph joining only justified signals:

- user/account nodes;
- club membership;
- public post/comment/reaction relationships;
- WDX order/trade counterparties;
- referral/linked-account risk identifiers when legally/product permitted;
- device/session risk features when allowed by privacy policy;
- shared idempotency/replay anomalies;
- moderation and integrity cases.

The graph is an investigation aid, not proof by itself.

## 11. Manipulation patterns to detect

### 11.1 Self/circular trading

Indicators:

- same beneficial-risk cluster on both sides;
- repeated A↔B trades;
- A→B→C→A loops;
- high volume with negligible net position change;
- repeated trades around the same content/event timestamps.

### 11.2 Pump coordination

Indicators:

- near-simultaneous bullish posts from tightly connected accounts;
- synchronized buy bursts after those posts;
- rapid sell-off by promoters;
- repeated reuse across issuers/seasons;
- engagement inflation from linked accounts.

These signals trigger review. They are not an automatic finding of guilt.

### 11.3 Fake liquidity/order-book signaling

If limit orders exist, detect:

- repeated place/cancel bursts far above normal behavior;
- layered orders that disappear when executable;
- matched clusters designed to create depth appearance;
- cancel-to-fill ratios combined with price-impact patterns.

### 11.4 Mass-report retaliation

Detect clusters where a group reports opponents immediately after disagreements, club disputes or market losses. Malicious reporting can itself become a moderation violation.

## 12. Risk scoring

Risk should be decomposable. Example internal dimensions:

- `trade_cycle_score`
- `counterparty_concentration_score`
- `content_coordination_score`
- `engagement_authenticity_score`
- `account_linkage_score`
- `burst_automation_score`
- `report_abuse_score`

Never persist only a single unexplained “fraud score”. Store reason codes, feature values or summarized evidence permitted by privacy policy, model/rule version and timestamp.

Thresholds are operational safety configuration and are allowed under the default-limit policy because they protect platform/market integrity. They must not be presented as player progression limits.

## 13. Holds and settlement safety

A `TRADE_REVIEW_HOLD` should normally block only new WDX actions whose completion could worsen the suspected manipulation. It should not silently delete balances, holdings, posts or unrelated assets.

Already settled trades remain in the append-only ledger. If a confirmed integrity case requires correction, use a compensating operation under explicit operator policy; never rewrite historical ledger rows.

Season rewards linked to a pending integrity investigation may enter `PENDING_VERIFICATION` until the case resolves.

## 14. Community and market separation

Community metrics must not directly feed the WDX price engine in P0/P1.

Forbidden direct price factors:

- reaction count;
- follower count;
- post view count;
- comment sentiment score;
- club popularity;
- report count.

If a future fictional event uses community participation, it must be announced as an explicit game event with bounded, server-defined mechanics and abuse-resistant inputs.

## 15. Clubs

Club discussion and club projects remain unlimited-by-default according to the clubs specification. Integrity controls apply to clubs that coordinate market manipulation.

Club owners/moderators may manage their space, but must not have authority to:

- view members' private exact WLD/stock balances;
- override Moneyverse enforcement;
- cancel settled trades;
- inspect hidden integrity signals;
- confiscate member assets.

Club moderation actions and Moneyverse platform enforcement are separate audit domains.

## 16. Appeals

For material enforcement, support an appeal record:

- enforcement id;
- policy reason codes;
- user explanation;
- submitted timestamp;
- reviewer/result;
- decision timestamp;
- restoration/compensating action if applicable.

Appeal volume is not an economy feature and may use security burst protection, but there should be no arbitrary paid or progression-based access to appeals.

## 17. Moderator/admin console

Required views:

- prioritized report queue;
- content context/thread;
- author enforcement history;
- linked moderation cases;
- separate market-integrity evidence panel;
- public/trade timeline correlation;
- reason-coded action controls;
- reversible temporary actions;
- audit event preview;
- appeal queue;
- integrity dashboard.

High-risk actions require the project's existing admin session, reauthentication, TOTP and database actor validation contract.

## 18. Suggested database tables

- `community_posts`
- `community_comments`
- `community_reactions`
- `community_reports`
- `moderation_cases`
- `moderation_case_evidence`
- `moderation_actions`
- `moderation_appeals`
- `market_integrity_cases`
- `market_integrity_signals`
- `market_integrity_entities`
- `market_integrity_case_links`
- `user_capability_restrictions`

All high-impact case/action history should be append-oriented. Corrections create new actions/events rather than silently rewriting history.

## 19. API sketch

Community:

- `GET /api/community/feed`
- `POST /api/community/posts`
- `PATCH /api/community/posts/:id`
- `DELETE /api/community/posts/:id`
- `POST /api/community/posts/:id/comments`
- `POST /api/community/posts/:id/reactions`
- `POST /api/community/reports`

Self-service:

- `GET /api/me/moderation-actions`
- `POST /api/me/moderation-actions/:id/appeals`

Admin/operator:

- `GET /api/admin/moderation/reports`
- `GET /api/admin/moderation/cases/:id`
- `POST /api/admin/moderation/cases/:id/actions`
- `GET /api/admin/integrity/cases`
- `GET /api/admin/integrity/cases/:id`
- `POST /api/admin/integrity/cases/:id/hold`
- `POST /api/admin/integrity/cases/:id/resolve`

State-changing endpoints require server authorization and idempotency where replay could duplicate an action.

## 20. Privacy and evidence minimization

- collect only signals needed for safety/integrity;
- do not expose hidden linkage/device-risk data to ordinary moderators or users;
- separate public content evidence from sensitive security signals;
- use coarse disclosures instead of exact financial balances in community UI;
- define retention/access controls for sensitive integrity evidence;
- prohibit moderators from exporting unrestricted user datasets through the UI.

## 21. Analytics

Track at minimum:

Community health:

- DAU/WAU contributors and readers;
- posts/comments per active contributor without turning counts into rewards;
- report rate per 1,000 content items;
- confirmed violation rate;
- false-positive/reversal rate;
- median/P90 report-to-first-review time;
- repeat violation rate;
- unique reporters vs coordinated-report clusters.

Market integrity:

- self/circular-trade signal rate;
- repeated-counterparty concentration;
- reviewed vs confirmed integrity cases;
- temporary hold duration;
- appeal/reversal rate;
- suspicious volume as a share of total virtual-market volume;
- price impact associated with confirmed cases;
- season rewards held/released due to integrity review.

Do not optimize moderators solely for “cases closed per hour”. Quality and reversal rates matter.

## 22. Economy/sink integration

Moderation must not become a pay-to-escape sink. Users cannot pay WLD to remove warnings, accelerate appeals, clear market holds or buy favorable moderation treatment.

Optional community identity sinks are allowed if economically neutral, e.g. profile board themes, post-card visual skins, club notice-board decorations or archive display frames. They must not increase content ranking or market influence.

Example transaction types:

- `SINK_COMMUNITY_COSMETIC`
- `SINK_CLUB_NOTICE_DECOR`
- `SINK_ARCHIVE_DISPLAY`

These are hard sinks only when WLD is actually destroyed by the system. Transfers remain transfers.

## 23. Season integration

Each season may add:

- themed community prompts;
- educational market-journal chapters;
- season archive cards;
- club discussion events;
- moderation education reminder at season start;
- season-specific integrity monitoring for competitive WDX league activity.

Season rank rewards under integrity review remain pending until verification. Community popularity cannot be converted into leaderboard score.

D-14/D-7/D-3/D-1 messaging should remind users of season-close verification where competitive rewards exist, without threatening legitimate high activity.

## 24. Configuration

Code-deploy-independent configuration may include:

- spam burst thresholds;
- duplicate-content similarity thresholds;
- risk-review thresholds;
- automatic temporary throttle durations;
- moderator queue routing rules;
- content-policy reason codes;
- disclosure wording;
- feature flags for stock-tagged discussions.

Config changes must be versioned/audited. Dangerous changes require preview and the existing admin step-up controls.

## 25. Testing

Required runtime test matrix before implementation release:

- ordinary high-volume legitimate poster is not blocked by arbitrary daily cap;
- bot-like burst is throttled;
- duplicate report retry is idempotent;
- mass report does not automatically ban/remove;
- post edit retains moderation/version history;
- exact private holdings are not leaked;
- self/circular-trading fixture creates review signals;
- unrelated high-volume trading does not automatically convict user;
- temporary market hold blocks only intended actions;
- settled ledger records are never rewritten;
- appeal reversal restores capability without deleting audit history;
- moderator cannot access hidden sensitive signals outside permission scope;
- concurrent case actions do not duplicate enforcement;
- club moderator cannot override platform enforcement;
- community engagement cannot move WDX reference price directly.

## 26. Rollout

### P0

- community posts/comments/reactions;
- stock tags and fictional-market disclosure;
- report flow;
- moderator queue;
- spam/duplicate protection;
- market-integrity case table/signals;
- self/circular-trade detection using deterministic rules;
- separate capability restrictions;
- audit trail/appeal foundation.

### P1

- club moderation integration;
- engagement-ring and coordinated-report detection;
- richer trade/content timeline;
- season competition verification;
- moderator analytics.

### P2

- carefully evaluated graph/anomaly models;
- transparent internal reason decomposition;
- broader automated triage only after false-positive evidence supports it.

## 27. Definition of Done

The feature is not complete until:

- English/Korean specifications match;
- normal participation has no arbitrary hard cap;
- spam/security limits have documented protection reasons;
- reports cannot become an automated popularity vote;
- moderation and market restrictions are separate capabilities;
- community metrics do not directly set WDX prices;
- enforcement is reason-coded/auditable;
- high-impact actions support review/appeal policy;
- ledger history remains immutable;
- sensitive integrity data is access-controlled;
- DB/API/idempotency/concurrency tests pass on PostgreSQL;
- dedicated Test serves the exact release-candidate SHA before Production.

## 28. Research notes

External design inputs reviewed for this revision:

- Discord Community Guidelines (effective 2025-09-29) describe report-driven/proactive enforcement and graduated actions; Discord's platform-manipulation material also treats spam/automation as platform abuse.
- Discord moderation guidance recommends anti-spam/text filters and anti-raid controls for larger public communities rather than relying on ordinary user posting quotas.
- TradingView exposes direct reporting for ideas/scripts/comments/messages and separates Paper Trading competition accounts from ordinary accounts; current 2026 competition rules also include explicit high-frequency safety limits for Paper Trading.
- FINRA's pump-and-dump guidance warns about promotion through social media and messaging channels.
- SEC enforcement announcements in 2025 describe fraud schemes that used social-media/group-chat trust and purported investment clubs, reinforcing the need to distinguish community discussion from deceptive solicitation.

These references are patterns, not policy imports. Moneyverse remains a fictional internal virtual economy and must not imply that its WDX assets are real securities.