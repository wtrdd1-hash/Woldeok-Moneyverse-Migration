# Woldeok Moneyverse — Clubs & Cooperative Economy Specification

> Version: v2026.09.12.20
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`, `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
> Korean counterpart: [CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md](CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md)

## 0. Purpose

Moneyverse clubs are persistent social organizations for cooperation, identity, collective projects, learning, and long-term voluntary WLD/resource sinks. They are not an alternate bank, investment fund, pyramid reward program, or shared balance that officers can freely withdraw.

The system must answer:

1. Why should a player join or create a club?
2. What can members build together without creating pay-to-win power?
3. How do contributions become visible social value rather than compulsory taxation?
4. How do seasons create new cooperative goals without deleting permanent club identity?
5. How can the club scale without arbitrary membership/play caps?

This specification supersedes the earlier `5–30 members` wording in `PRODUCT_DESIGN_SPEC.md` as a **recommended small-group UX cohort**, not a hard membership cap. The default membership capacity is `null = unlimited`; infrastructure safeguards may use documented safety controls, pagination, queueing, moderation thresholds, or sharding rather than a hidden gameplay cap.

## 1. Product principles

### 1.1 Unlimited by default

- Club membership capacity: `null/unlimited` by default.
- Number of ordinary club contributions: unlimited.
- Number of club projects completed over club lifetime: unlimited.
- Club history retention: unlimited by product policy; archival/storage safety may use tiered storage without deleting user-visible history arbitrarily.
- Number of ordinary club decorations and non-scarce cosmetic purchases: unlimited where duplicate semantics make sense.
- Weekly cooperation has no global participation cap; rewards use diminishing marginal value and one-time milestone semantics where needed.

Allowed limits remain security/integrity constraints: API burst control, anti-spam, moderation flood control, transaction idempotency, project settlement locks, true finite event inventory, and abuse-review holds.

### 1.2 No pay-to-win collective power

Club spending must not directly increase:

- member job payout;
- stock return or execution quality;
- loan terms;
- business settlement multiplier;
- season league score;
- ranking score purchased with WLD;
- probability of winning random outcomes.

Club spending can unlock identity, spaces, archives, presentation, cooperative content, social tools, optional planning tools, and non-economic convenience.

### 1.3 Contribution should feel voluntary

No member is required to pay dues to access core gameplay. Clubs may define suggested contribution goals, but the platform must label them as optional. Officers cannot automatically debit member WLD.

## 2. Club lifecycle

### 2.1 States

`DRAFT -> ACTIVE -> DORMANT -> ACTIVE`

Administrative states:

- `FROZEN` — protected mutations disabled during integrity/moderation review.
- `ARCHIVED` — club intentionally retired; history remains visible to eligible former members.
- `DISSOLVED` — terminal state after explicit governance flow; permanent public identity record may remain as an archive stub.

Transitions are server-authoritative and audited.

### 2.2 Creation

Planning seed:

- Club charter registration: **10,000 WLD HARD_SINK**.
- Founder chooses name, short tag, description, primary language, discovery status, and initial visual theme.
- Name uniqueness is normalized and checked server-side.
- Club creation is unlimited over a player's lifetime, but a player may have only one active `OWNER` responsibility at a time initially as an integrity/operational rule; this should be revisited before implementation and must not silently become a general membership cap.

Ledger type: `SINK_CLUB_CHARTER`.

### 2.3 Joining

Join modes:

- open;
- request-to-join;
- invite-only;
- seasonal recruitment window.

A user may join multiple clubs if product implementation supports multi-membership. P0 may expose one `primary_club_id` for profile/navigation while storing memberships generically for future multi-club use. Do not model the database as permanently one-club-per-user unless explicitly accepted as a product constraint.

## 3. Roles and permissions

Default roles:

- `OWNER`
- `STEWARD`
- `PROJECT_MANAGER`
- `MODERATOR`
- `CURATOR`
- `MEMBER`

Permissions are capabilities, not hardcoded role-name checks. Suggested capabilities:

- manage club profile;
- manage membership requests;
- invite/remove members;
- moderate club feed;
- create/edit projects;
- publish project stages;
- configure clubhouse layout;
- purchase club cosmetics from club-funded project budget;
- manage archive exhibits;
- view analytics;
- manage roles;
- dissolve/archive club.

High-risk actions require fresh reauthentication where the existing admin/account security model supports it. No officer role receives a generic `withdraw club money` capability in P0.

## 4. Club points and currencies

### 4.1 Club Points (`CP`)

`CP` is non-transferable club progress metadata, not WLD and not redeemable for money.

Earned from:

- completing cooperative objectives;
- finishing club projects;
- verified participation breadth;
- season cooperation milestones;
- educational/community contributions accepted by policy.

CP must not be farmed through raw post count, raw trade count, or circular transfers.

### 4.2 Club project budget

P0 avoids a freely withdrawable shared WLD balance. Instead, member WLD contributions go directly to a specific project escrow/sink contract.

Flow:

`member WLD -> project contribution transaction -> project escrow/system account -> completion settlement -> HARD_SINK or named system destination`

Members can see exactly which project receives the contribution. Officers cannot redirect already committed funds to unrelated use without a published cancellation/refund rule.

### 4.3 Contribution classification

- Contribution to a club construction/cosmetic project that permanently removes WLD: `HARD_SINK`.
- Contribution temporarily held until threshold then either spent or refunded: `HOLD` until settlement.
- Transfer between members is `TRANSFER`, never sink.
- Material-to-decoration conversion is `CONVERTER` plus any WLD fee classified separately.

## 5. Cooperative project system

### 5.1 Project state machine

`DRAFT -> PUBLISHED -> FUNDING -> FUNDED -> BUILDING -> COMPLETED -> ARCHIVED`

Alternate transitions:

- `FUNDING -> CANCELLED`
- `FUNDED -> CANCELLED` only under published refund policy;
- `BUILDING -> PAUSED` for integrity or operational failure;
- `PAUSED -> BUILDING` or `PAUSED -> CANCELLED`.

Each transition stores actor, reason, timestamp, policy version, and idempotency scope.

### 5.2 Project types

1. **Clubhouse** — permanent rooms, wings, galleries, themes.
2. **Archive** — season museum, trophy displays, member-history exhibits.
3. **Event** — temporary festival stage, meetup board, showcase week.
4. **Community** — sponsor a city project together and display club contribution history.
5. **Crafting** — collaborative decorative fabrication using materials + WLD fee.
6. **Research/Learning** — unlock shared educational dashboards or historical simulation presets; no live market advantage.

### 5.3 Funding model

Projects may use:

- WLD only;
- materials only;
- WLD + materials;
- CP prerequisite + WLD/materials.

A project target is a content requirement, not a player contribution cap. Individual contribution amount is unlimited by default.

For very large donations, prestige recognition uses diminishing visibility value rather than linear gameplay rewards.

Suggested prestige score:

`contribution_prestige = floor(100 * ln(1 + lifetime_valid_contribution / 1000))`

This score never converts to WLD or competitive power.

## 6. Clubhouse and long-term sinks

### 6.1 Launch sink seeds

| Code | Sink | Planning price | Repeatable | Classification | Value |
|---|---|---:|---|---|---|
| CLUB-CHARTER | Club charter | 10,000 WLD | new club | HARD_SINK | create identity |
| CLUB-BANNER-BASIC | Banner visual | 5,000 WLD | variants | HARD_SINK | club identity |
| CLUB-HALL-LOBBY | Clubhouse lobby | 50,000 WLD | one per clubhouse | HARD_SINK | shared space |
| CLUB-HALL-ROOM | Additional room | `25,000 * 1.35^n` | unlimited by default | HARD_SINK | expansion |
| CLUB-GALLERY-WING | Gallery wing | `75,000 * 1.45^n` | unlimited by default | HARD_SINK | archive/display |
| CLUB-TROPHY-ATR | Trophy atrium | 250,000 WLD | themed variants | HARD_SINK | prestige |
| CLUB-SKYLINE-HQ | Skyline headquarters | 1,500,000 WLD | expansion path | HARD_SINK | high-wealth prestige |
| CLUB-LEGACY-HALL | Legacy hall | 2,500,000 WLD | expansion path | HARD_SINK | multi-season archive |
| CLUB-CITY-SPONSOR | City sponsorship project | 250,000+ WLD | recurring | HARD_SINK | public contribution history |
| CLUB-LANDMARK | Landmark co-sponsorship | 5,000,000+ WLD | recurring | HARD_SINK | server-wide prestige |

Prices are configuration seeds, not promises. Geometric prices continue without an arbitrary final tier unless content or infrastructure creates a real boundary.

### 6.2 Clubhouse modules

Modules include:

- reception;
- member wall;
- season archive;
- trophy gallery;
- market-learning room;
- business showcase;
- crafting studio;
- club project control room;
- community event stage;
- city sponsorship gallery;
- historical hall;
- founder/legacy wing.

Modules must not increase economic output directly.

### 6.3 Decorative sinks

Recurring club sinks:

- furniture fabrication fee: 1,500–10,000 WLD;
- theme recolor: 2,500 WLD;
- banner redesign: 5,000 WLD;
- commemorative engraving: 3,000 WLD;
- season plaque restoration: 7,500 WLD;
- historical exhibit mounting: 10,000–50,000 WLD;
- event stage skin: 15,000–100,000 WLD;
- club anniversary monument: dynamic prestige pricing.

All are tunable and cosmetic/archive focused.

## 7. Cooperative objectives

### 7.1 Objective design

Objectives measure breadth and learning, not raw grind volume.

Examples:

- members complete distinct profession activities;
- club collectively finishes a diversification-learning chain;
- members complete business review tasks;
- members donate materials to a city archive project;
- members publish approved learning notes or post-season reviews;
- members complete a season story chapter across multiple systems.

### 7.2 Unlimited participation without runaway issuance

Valid extra participation remains allowed, but rewards separate:

- one-time milestone reward;
- CP/progress value with diminishing marginal contribution weight;
- cosmetic/archive recognition;
- no endlessly linear WLD payout.

Example contribution weight for repeated identical objective actions:

`weight_n = 1 / sqrt(n)`

This is a tuning model, not a mandatory formula. The user can keep contributing; the economy does not mint full-value rewards forever.

## 8. Club seasons

### 8.1 Permanent vs seasonal

Permanent:

- club identity;
- membership history;
- clubhouse ownership;
- purchased cosmetics;
- completed archive exhibits;
- lifetime CP/history;
- city sponsorship history.

Season-scoped:

- current season club objectives;
- seasonal club ranking score;
- season contribution board;
- seasonal event tokens where explicitly defined;
- season-only project availability.

### 8.2 Season transition

Required cadence:

- D-14: incomplete club objectives + next theme teaser;
- D-7: next season headline cooperative project revealed;
- D-3: reward/clubhouse cosmetics preview;
- D-1: exact close time, seasonal reset matrix, unclaimed club rewards summary;
- lock/verification: seasonal ranking mutations paused while permanent clubhouse remains accessible;
- next season: seasonal score resets, permanent identity/history remains.

### 8.3 Season rewards

Club season rewards prioritize:

- numbered plaques;
- banner variants;
- archive trophies;
- profile badges showing club affiliation in that season;
- clubhouse decorations;
- historical exhibit unlocks.

Do not grant a persistent earnings multiplier to top clubs.

## 9. Discovery, recruitment and social UX

### 9.1 Discovery filters

- language;
- open/request/invite status;
- primary interests: market learning, collecting, business, casual, crafting, events;
- typical activity window;
- season participation preference;
- newcomer friendly;
- public clubhouse available.

No ranking by member wealth or aggregate WLD by default.

### 9.2 Club page

Tabs:

1. Overview
2. Members
3. Projects
4. Clubhouse
5. Season
6. Archive
7. Feed
8. About / Rules

Sensitive data such as balances, holdings, debt, and private transaction history never appear by default.

### 9.3 Feed

Feed supports announcements, project updates, achievement shares, learning notes and event posts. It must include report/mute/block controls and server-side spam defenses.

Raw posting frequency does not generate CP or WLD.

## 10. Governance and safety

### 10.1 Governance

P0 uses owner/steward administration rather than token-weighted voting. Optional project polls are non-financial preference signals.

No vote weight may be purchased with WLD.

### 10.2 Ownership transfer

Ownership transfer requires:

- explicit recipient acceptance;
- fresh authentication for current owner;
- audit event;
- cooling confirmation UX if security policy requires;
- no transfer while club is frozen or dissolution pending.

### 10.3 Dissolution

Dissolution must show:

- permanent archive consequences;
- active project consequences;
- refund rules for unsettled holds;
- ownership of club-bound cosmetics;
- exportable member history where supported.

Completed hard sinks are not automatically refunded merely because the club dissolves.

## 11. Economy accounting

Required transaction types:

- `SINK_CLUB_CHARTER`
- `SINK_CLUB_HALL_PURCHASE`
- `SINK_CLUB_HALL_EXPANSION`
- `SINK_CLUB_DECORATION`
- `SINK_CLUB_ENGRAVING`
- `HOLD_CLUB_PROJECT_CONTRIBUTION`
- `SETTLE_CLUB_PROJECT_SINK`
- `REFUND_CLUB_PROJECT_CONTRIBUTION`
- `CONVERT_CLUB_CRAFTING_MATERIAL`
- `SINK_CLUB_CRAFTING_FEE`
- `SINK_CLUB_CITY_SPONSORSHIP`
- `SINK_CLUB_PRESTIGE`

Economy dashboard must distinguish:

- gross club contribution volume;
- settled hard-sink amount;
- pending project holds;
- refunded contributions;
- material conversion volume;
- club sink share of total sink volume;
- median/P90/P99 club spend per active member;
- concentration of club spending among top 1%/10% of clubs;
- number of clubs responsible for top 50% of club sinks;
- new/mid/high-wealth member participation in club sinks.

## 12. Database model

Recommended entities:

### `clubs`

- `id`
- `name`
- `tag`
- `description`
- `primary_language`
- `discovery_mode`
- `state`
- `primary_theme_code`
- `owner_user_id`
- `created_at`
- `updated_at`
- `version`

### `club_memberships`

- `club_id`
- `user_id`
- `role_code`
- `status`
- `joined_at`
- `left_at`
- `is_primary`
- unique active-membership invariant as appropriate to selected multi-club policy.

### `club_role_capabilities`

- `club_id`
- `role_code`
- `capability_code`
- `enabled`

### `club_projects`

- `id`
- `club_id`
- `project_type`
- `project_code`
- `state`
- `policy_version`
- `target_wld`
- `target_material_json`
- `funded_wld`
- `published_at`
- `funded_at`
- `completed_at`
- `version`

`target_wld` is a completion target, not an individual contribution cap.

### `club_project_contributions`

- `id`
- `club_project_id`
- `user_id`
- `wld_amount`
- `material_payload`
- `ledger_transaction_id`
- `idempotency_key`
- `status`
- `created_at`

### `club_spaces`

- `club_id`
- `space_type`
- `expansion_index`
- `theme_code`
- `layout_revision`
- `created_at`

### `club_season_snapshots`

- `season_id`
- `club_id`
- `score_components_json`
- `tier`
- `rank`
- `reward_policy_version`
- `snapshot_version`
- `verification_status`
- `created_at`

### `club_audit_events`

Append-only operational audit for membership/role/project/governance state changes.

## 13. API contract

Suggested routes:

- `GET /api/clubs`
- `POST /api/clubs`
- `GET /api/clubs/:clubId`
- `PATCH /api/clubs/:clubId`
- `POST /api/clubs/:clubId/join`
- `POST /api/clubs/:clubId/leave`
- `POST /api/clubs/:clubId/invites`
- `PATCH /api/clubs/:clubId/members/:userId`
- `GET /api/clubs/:clubId/projects`
- `POST /api/clubs/:clubId/projects`
- `POST /api/clubs/:clubId/projects/:projectId/contributions`
- `POST /api/clubs/:clubId/projects/:projectId/cancel`
- `POST /api/clubs/:clubId/projects/:projectId/settle`
- `GET /api/clubs/:clubId/clubhouse`
- `PATCH /api/clubs/:clubId/clubhouse/layout`
- `GET /api/clubs/:clubId/season`
- `GET /api/clubs/:clubId/archive`
- `GET /api/clubs/:clubId/feed`

All state-changing requests use authentication, authorization, validation, server-calculated prices/policy, and idempotency where financial/project settlement is involved.

## 14. Concurrency and integrity

Project contribution flow must be atomic:

1. lock/read project state/version;
2. validate project accepts funding;
3. validate authoritative balance and amount;
4. create idempotent ledger mutation;
5. record contribution;
6. update funded total;
7. transition to `FUNDED` once target is satisfied;
8. commit transaction;
9. return canonical project state.

Overfunding policy must be explicit. Recommended P0: accept only the remaining target amount into the project and return the unused requested amount without debit. High-wealth unlimited spending remains available through repeatable prestige/sponsorship projects, not accidental overfunding of a finite construction target.

## 15. Abuse and moderation

Detect and review:

- invite spam;
- join/leave churn used to farm rewards;
- circular contribution/refund exploitation;
- officers publishing misleading fake scarcity;
- role escalation bypass;
- duplicate project settlement;
- idempotency-key reuse with mismatched payload;
- harassment in club feed;
- coordinated manipulation discussions tied to virtual stock abuse;
- sybil clubs created solely to farm one-time rewards.

Reward eligibility must not depend on unbounded raw messages, invites, or trivial joins.

## 16. Analytics and KPIs

Events:

- `club_created`
- `club_join_requested`
- `club_joined`
- `club_left`
- `club_role_changed`
- `club_project_published`
- `club_project_contribution_completed`
- `club_project_funded`
- `club_project_completed`
- `clubhouse_module_purchased`
- `clubhouse_layout_saved`
- `club_season_snapshot_created`
- `club_reward_delivered`
- `club_abuse_case_opened`

Metrics:

- % WAU in at least one club;
- new-user D7 retention by club participation cohort;
- median time from signup to first healthy club interaction;
- active clubs per week;
- contributor breadth per project;
- median project completion time;
- club hard-sink WLD / total hard-sink WLD;
- contribution concentration Gini/top-share;
- % projects funded by >=3 distinct members versus one whale;
- report/block/moderation rate;
- season-to-season club continuity;
- member churn after governance/moderation events.

Do not optimize solely for contribution amount.

## 17. Admin console

Admin tools must support:

- search/view club;
- membership/role audit history;
- project state and contribution reconciliation;
- freeze/unfreeze with reason;
- content moderation actions;
- project policy/config inspection;
- season snapshot/reward status;
- duplicate settlement investigation;
- club sink/economy metrics;
- archive/dissolution support.

Admin actions are audited and must not directly edit protected WLD ledger history.

## 18. Configurable policy

Code-deploy-free configuration may include:

- charter price;
- clubhouse module catalog and prices;
- geometric price factors;
- project templates;
- project visibility;
- CP milestone tables;
- season objective definitions;
- cosmetic reward mappings;
- discovery categories;
- moderation thresholds;
- project cancellation windows;
- true finite inventory only when intentionally used.

Membership capacity defaults to `null`. Any positive capacity requires a documented reason and user-visible explanation if it affects normal membership.

## 19. P0 / P1 / P2 rollout

### P0

- club creation/discovery/join/leave;
- roles/capabilities;
- club profile and announcement feed;
- one cooperative project template;
- project-specific WLD contributions;
- basic clubhouse lobby + decorations;
- CP/progress;
- moderation/reporting;
- ledger accounting and admin reconciliation.

### P1

- multiple project templates;
- clubhouse expansion;
- archive/trophy gallery;
- season club objectives and snapshots;
- city-project integration;
- material contribution/crafting projects;
- recruitment preferences.

### P2

- advanced multi-club support if not enabled in P0;
- club-to-club collaborative city projects;
- public clubhouse tours;
- historical museum and legacy hall;
- richer cooperative learning/replay tools;
- large-club UX sharding without membership hard caps.

## 20. Definition of Done

Runtime implementation is not complete until:

- English/Korean behavior docs match;
- no arbitrary player-facing membership/contribution/play cap is introduced;
- financial contributions are server-authoritative and idempotent;
- transfer/hold/hard-sink/converter accounting reconciles exactly;
- officers cannot withdraw project funds freely;
- role/capability authorization is tested server-side;
- project state transitions are transactional and replay-safe;
- season reset preserves permanent club identity/history;
- moderation/report/block flows work;
- high-wealth sinks remain prestige/cosmetic rather than pay-to-win;
- analytics distinguish contribution volume from actual WLD destruction;
- forward-only migrations pass against real PostgreSQL;
- exact candidate SHA is deployed to isolated Test;
- concurrent contribution, duplicate request, cancellation/refund, role abuse, and season settlement tests pass;
- only the exact verified SHA may be promoted to Production.

## 21. Research rationale

Current reference patterns support four decisions used here:

1. Guild Wars 2 guild upgrades demonstrate that shared organizations can turn collective resource contributions into visible shared spaces, facilities and identity. Moneyverse adopts the cooperative-building concept but removes inherited weekly resource caps and power buffs that conflict with Moneyverse's unlimited-by-default and non-pay-to-win policy.
2. EVE Online's 2026 Military Campaigns explicitly allow different playstyles to contribute toward shared long-horizon objectives. Moneyverse similarly lets jobs, collecting, crafting, business and learning contribute to club objectives instead of forcing one grind path.
3. EVE's corporation/freelance-job direction shows that organizations can provide a bridge for newer players into community activity. Moneyverse therefore makes newcomer-friendly recruitment and small useful contributions first-class.
4. TradingView's 2026 paper-trading competitions isolate competition accounts with equal starting conditions. Moneyverse keeps seasonal competitive scoring separate from main WLD/club wealth so rich clubs cannot buy leaderboard dominance.

These are design references, not copied implementations.