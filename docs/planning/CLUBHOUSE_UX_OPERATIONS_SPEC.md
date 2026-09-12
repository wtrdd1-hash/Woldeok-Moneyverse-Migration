# Woldeok Moneyverse — Clubhouse UX & Operations Specification

> Version: v2026.09.13.18
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `CLUBS_COOPERATIVE_ECONOMY_SPEC.md`, `COMMUNITY_MARKET_INTEGRITY_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`, `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
> Korean counterpart: [CLUBHOUSE_UX_OPERATIONS_SPEC.ko.md](CLUBHOUSE_UX_OPERATIONS_SPEC.ko.md)

## 0. Purpose

This specification turns the existing club/cooperative-economy model into a screen-level, large-community-safe product contract. It does not replace the existing club ledger, project, season, moderation or role-capability rules. It defines how players discover a club, understand what to do after joining, navigate a potentially large club without arbitrary membership caps, use the clubhouse, contribute to projects, manage roles, and recover from loading/error/permission/moderation states.

Primary objectives:

1. make the first healthy club interaction understandable within minutes;
2. preserve `null/unlimited` default membership capacity while keeping large clubs usable;
3. make permissions and high-risk actions explicit and server-authoritative;
4. make clubhouse spending voluntary, cosmetic/archive/social, and non-P2W;
5. prevent contribution amount or message volume from becoming the only social status signal;
6. make every major club surface responsive, accessible, observable and operable.

## 1. Product boundaries

### 1.1 Unlimited by default

The following remain unlimited by default:

- active club membership capacity;
- ordinary member-history retention;
- lifetime completed club projects;
- ordinary project participation;
- non-scarce clubhouse expansion paths where content supports repetition;
- ordinary archive history;
- browsing/searching club content.

Large-scale safety is solved with cursor pagination, indexed search, virtualized rendering, lazy loading, caching, background aggregation, moderation rate controls, queueing and documented infrastructure safeguards. A positive membership cap requires a concrete protection reason and must not be introduced merely because one UI list becomes slow.

### 1.2 No club P2W

Clubhouse purchases, project contributions and paid cosmetic entitlements must not directly improve:

- WLD faucet rates;
- WDX execution, returns or ranking;
- job/business payout multipliers;
- credit terms;
- season competitive score;
- random-result probability;
- moderation priority.

### 1.3 Sensitive data boundary

Club surfaces must not expose member balances, debt, private holdings, billing state, private transaction history, age-assurance evidence, authentication state or moderation evidence to ordinary members.

## 2. Information architecture

Authenticated club routes:

- `/clubs` — discovery and joined clubs;
- `/clubs/new` — create club;
- `/clubs/:clubId` — overview;
- `/clubs/:clubId/members` — members and roles;
- `/clubs/:clubId/projects` — cooperative projects;
- `/clubs/:clubId/clubhouse` — clubhouse view;
- `/clubs/:clubId/clubhouse/edit` — capability-gated layout editor;
- `/clubs/:clubId/season` — season objectives/snapshot;
- `/clubs/:clubId/archive` — permanent history and exhibits;
- `/clubs/:clubId/feed` — announcements/learning/project updates;
- `/clubs/:clubId/settings` — capability-gated settings;
- `/clubs/:clubId/moderation` — capability-gated moderation queue.

Public routes may exist only for explicitly public club profiles/clubhouse tours. Public pages must never imply that club wealth is a financial product or investment pool.

## 3. Discovery and recruitment UX

### 3.1 `/clubs`

Desktop layout:

- page header with `Find a club` and, when eligible, `Create club`;
- joined-club summary strip;
- search field;
- filter drawer/rail;
- result cards or dense list toggle;
- pagination/cursor controls;
- empty and error states.

Mobile:

- search remains top-level;
- filters move to bottom sheet/drawer;
- joined clubs appear before discovery results;
- cards remain one-column;
- no horizontal table dependency.

Filters:

- language;
- join mode;
- interests;
- activity window;
- newcomer-friendly;
- season participation preference;
- public clubhouse availability.

Do not rank clubs by aggregate WLD or member wealth by default.

### 3.2 Club result card

Show:

- name/tag;
- short description;
- primary language;
- interests;
- join mode;
- approximate activity signal such as `active this week`, not invasive presence tracking;
- newcomer-friendly marker;
- public-house indicator;
- one primary CTA: `View club`, `Join`, or `Request to join` depending on state.

Do not show a giant member-count leaderboard that makes size the only quality signal.

### 3.3 Join onboarding

After successful join, do not drop a user into a dense dashboard with no direction. The first-session club guide presents at most three recommended actions:

1. read club rules/summary;
2. choose interests/notification preferences;
3. contribute a non-financial action or inspect an active project.

Contribution of WLD is never the mandatory first step.

The guide may be dismissed and reopened. Preference questions can be changed later. This follows the current Discord onboarding pattern of giving new community members a small, personalized starting surface instead of exposing every channel/action at once.

## 4. Club overview

### 4.1 Information hierarchy

Order:

1. identity/header;
2. important announcement or moderation/service state;
3. `What can I do now?` recommended actions;
4. active project summary;
5. clubhouse preview;
6. season progress;
7. recent archive/feed activity;
8. member/community summary.

### 4.2 Recommended actions

Recommendations must be explainable and non-coercive. Examples:

- finish reading rules;
- welcome a new member;
- vote in a non-financial preference poll;
- contribute a needed crafting material;
- review a project plan;
- complete a season learning objective;
- visit a new archive exhibit.

Avoid prompts such as `Donate now or your club falls behind` or high-pressure countdowns around WLD contribution.

## 5. Members and large-club behavior

### 5.1 Member list

Columns on desktop:

- member identity;
- role;
- joined date;
- non-sensitive activity status category;
- season/cooperation badges where policy allows;
- capability-gated actions.

On mobile, transform each row into a card. Do not squeeze a desktop table beyond readability.

### 5.2 Pagination and virtualization

- server cursor pagination is required for large clubs;
- default page size is a performance configuration, not a membership cap;
- search executes server-side after a reasonable local threshold;
- long lists use virtualization only when accessibility behavior remains valid;
- deep links and filters preserve state when returning from a member detail/action;
- aggregate counts must not require loading all members into the browser.

### 5.3 Search and sort

Search by normalized display name/tag where policy allows. Sort options may include role, join date and recent healthy participation. Do not sort ordinary members by WLD contribution as the default view.

### 5.4 Role changes

Role-change UI must:

- show current role/capabilities;
- show resulting capability delta;
- require explicit confirmation for privilege escalation;
- use fresh reauthentication for owner transfer or other high-risk actions where security policy requires it;
- record actor/reason/version in audit history;
- fail closed if capability data is stale.

## 6. Clubhouse view

### 6.1 Purpose

The clubhouse is a shared identity, archive and social space. It is not a passive-income building.

Primary modules:

- reception;
- member wall;
- active-project board;
- season archive;
- trophy/gallery wing;
- learning room;
- business/crafting showcase;
- city sponsorship gallery;
- legacy hall.

### 6.2 Desktop/tablet/mobile

Desktop:

- visual room/canvas area plus module/navigation rail;
- details panel opens without replacing the entire page;
- clear `View` vs `Edit` modes.

Tablet:

- collapsible module rail;
- details as drawer;
- touch targets meet accessibility specification.

Mobile:

- room/map becomes section cards or simplified scene navigation;
- editing controls move to bottom sheet;
- primary action may use a sticky bottom bar when it does not obscure content;
- no drag-only placement requirement.

### 6.3 States

Every module supports:

- default;
- locked by project prerequisite;
- available for purchase;
- funding;
- building;
- completed;
- archived;
- permission denied;
- stale data;
- loading/skeleton;
- empty;
- error;
- offline;
- maintenance.

## 7. Clubhouse editor

### 7.1 Safe editing model

Editing uses a draft revision. The live layout does not change on every drag.

Flow:

`LIVE revision -> CREATE DRAFT -> EDIT -> PREVIEW -> VALIDATE -> PUBLISH -> new LIVE revision`

Required behaviors:

- autosave the local/server draft without publishing;
- preserve unsaved input during non-destructive refresh;
- show conflict if another authorized editor published a newer revision;
- allow discard/reset to last live revision;
- publish is an explicit action;
- all publishes create an audit event.

### 7.2 Placement accessibility

Every drag operation has keyboard/button alternatives:

- move up/down/left/right;
- change room/slot;
- rotate when supported;
- remove from layout;
- restore.

Focus must remain predictable after actions. Status changes are announced with appropriate `aria-live` behavior.

### 7.3 Layout integrity

Server validates:

- ownership/club binding of decoration;
- module compatibility;
- collision/slot rules where applicable;
- current draft base revision;
- permissions;
- item lock state;
- no duplicate placement of a unique instance.

Client coordinates are never authoritative for ownership or entitlement.

## 8. Projects and contributions UX

### 8.1 Project card

Show:

- purpose and visual outcome;
- state;
- target and current funded amount/materials;
- deadline only when real;
- refund/cancellation rule;
- whether contribution settles as HOLD or immediate HARD_SINK;
- contributor breadth without glorifying whales;
- next non-financial actions.

### 8.2 Contribution confirmation

Before WLD/material contribution:

- authoritative available balance/material count;
- requested amount;
- remaining project requirement;
- actual accepted amount if over-target protection applies;
- sink/hold/refund meaning in plain language;
- final confirmation.

The backend calculates accepted amount and final classification. Client totals are display-only.

### 8.3 Overfunding

For finite construction targets, accept only the remaining requirement and leave excess with the user. This is a project-completion boundary, not a general spending cap. Repeatable prestige/city/archive sinks remain available for high-wealth users.

## 9. Season UX

Club season page contains:

- current phase and exact close timestamp/timezone;
- objectives grouped by playstyle;
- club progress;
- personal eligible contribution history;
- reward preview emphasizing cosmetics/archive/status;
- D-14/D-7/D-3/D-1 transition notices;
- settlement/verification state;
- archive link after close.

During settlement lock, permanent clubhouse and archive remain viewable; only affected competitive mutations are disabled.

## 10. Feed, moderation and community integrity

### 10.1 Feed content types

- announcement;
- project update;
- event notice;
- learning note;
- archive/trophy share;
- approved poll;
- season update.

Raw posting volume generates neither CP nor WLD.

### 10.2 User controls

Every eligible content item exposes:

- report;
- mute author where appropriate;
- block where platform model supports it;
- copy link;
- moderation status feedback when policy allows.

### 10.3 Market-integrity safety

Posts coordinating virtual-stock manipulation, deceptive pump narratives, impersonation or fraudulent scarcity claims follow `COMMUNITY_MARKET_INTEGRITY_SPEC.md`. Moderation must not silently turn a club feed into a privileged trading-signal channel.

### 10.4 Moderation queue

Moderator view supports:

- reason/category;
- reported content snapshot;
- actor/history context limited to what is necessary;
- action options;
- notes;
- appeal/review state where policy supports it;
- audit trail.

Sensitive reports are not exposed to ordinary club officers without corresponding capability and policy need.

## 11. Permissions model

All UI gates derive from server-returned capabilities. The browser may hide unavailable controls, but backend authorization remains mandatory.

Minimum capabilities:

- `club.profile.manage`;
- `club.members.invite`;
- `club.members.remove`;
- `club.roles.manage`;
- `club.projects.manage`;
- `club.projects.contribute`;
- `club.clubhouse.edit`;
- `club.clubhouse.publish`;
- `club.feed.moderate`;
- `club.analytics.view`;
- `club.archive.curate`;
- `club.lifecycle.manage`.

Never authorize by display role name alone.

## 12. Data/read models

In addition to parent entities, implementation may introduce read models:

### `club_member_directory_read`

- `club_id`
- `user_id`
- `display_name`
- `role_code`
- `joined_at`
- `activity_bucket`
- `badges_json`
- `cursor_key`

### `clubhouse_layout_revisions`

- `id`
- `club_id`
- `revision_number`
- `state` (`DRAFT|LIVE|SUPERSEDED`)
- `base_revision_number`
- `layout_json`
- `created_by`
- `published_by`
- `created_at`
- `published_at`

### `clubhouse_module_instances`

- `id`
- `club_id`
- `module_code`
- `state`
- `source_project_id`
- `entitlement_or_inventory_ref`
- `created_at`

### `club_onboarding_preferences`

- `club_id`
- `user_id`
- `interest_codes`
- `notification_preferences_version`
- `completed_at`

Read models must be derivable/reconcilable from authoritative membership, role, inventory/entitlement, project and audit records.

## 13. API contract

Suggested additions/refinements:

- `GET /api/clubs?cursor=&query=&filters=`;
- `GET /api/clubs/:clubId/overview`;
- `GET /api/clubs/:clubId/members?cursor=&query=&role=`;
- `GET /api/clubs/:clubId/capabilities`;
- `PATCH /api/clubs/:clubId/members/:userId/role`;
- `GET /api/clubs/:clubId/clubhouse`;
- `POST /api/clubs/:clubId/clubhouse/drafts`;
- `PATCH /api/clubs/:clubId/clubhouse/drafts/:draftId`;
- `POST /api/clubs/:clubId/clubhouse/drafts/:draftId/validate`;
- `POST /api/clubs/:clubId/clubhouse/drafts/:draftId/publish`;
- `GET /api/clubs/:clubId/projects?cursor=&state=`;
- `POST /api/clubs/:clubId/projects/:projectId/contributions`;
- `GET /api/clubs/:clubId/feed?cursor=`;
- `POST /api/clubs/:clubId/reports`.

Financial/project mutations require idempotency keys. Layout publish uses optimistic concurrency via base revision/version.

## 14. Responsive and accessibility acceptance criteria

- all actions keyboard operable;
- visible focus never obscured;
- no color-only role, project or season state;
- member tables have mobile-card equivalent;
- drag actions have button/keyboard equivalent;
- dialogs trap/restore focus correctly;
- destructive governance actions require explicit confirmation;
- loading/error state announced without excessive live-region noise;
- 200% zoom does not remove core actions;
- touch targets meet the shared accessibility spec;
- contribution amount and status use text/symbols in addition to color.

## 15. Analytics

Events:

- `club_discovery_viewed`;
- `club_discovery_filter_changed`;
- `club_join_started`;
- `club_join_completed`;
- `club_onboarding_completed`;
- `club_first_healthy_action_completed`;
- `club_member_search_used`;
- `club_role_change_completed`;
- `clubhouse_viewed`;
- `clubhouse_edit_started`;
- `clubhouse_draft_saved`;
- `clubhouse_publish_completed`;
- `club_project_viewed`;
- `club_project_contribution_completed`;
- `club_report_submitted`.

KPIs:

- signup-to-first-club-view;
- join-to-first-healthy-action time;
- D7/D30 retention by club participation cohort;
- project contributor breadth;
- clubhouse unique viewers/editors;
- large-club member-directory p95 latency;
- role/permission error rate;
- contribution confirmation abandonment;
- report rate and moderation resolution time;
- mobile completion parity vs desktop;
- accessibility defect escape rate.

Do not optimize for gross WLD contribution alone.

## 16. Economy and sinks

This spec adds no new mandatory tax. Existing voluntary sink portfolio remains authoritative.

Candidate UX merchandising should keep something valuable available across wealth cohorts:

- low: banner variants, small furniture, engraving;
- mid: room themes, archive mounts, event-stage cosmetics;
- high: gallery wings, trophy atrium, city sponsorship;
- prestige: legacy hall, landmark co-sponsorship.

Each catalog item continues to require transaction type, analytics event, config, abuse review and completion semantics in the parent sink catalog. User-to-user transfers remain `TRANSFER`; only actual system removal counts as `HARD_SINK`.

## 17. Monetization boundaries

Allowed:

- non-P2W cosmetic themes;
- profile/club visual packs;
- optional ad-free subscription benefits unrelated to club power;
- clearly disclosed sponsorship of public non-competitive community content.

Disallowed:

- buying officer power;
- buying season score;
- buying WDX/loan/business advantage;
- paid moderation priority;
- advertising disguised as a club recommendation;
- sponsor money changing WDX price/ranking/recommendation logic.

## 18. Privacy and legal review

- public/private club visibility must be explicit;
- member profiles expose only policy-approved public data;
- personalized advertising within club surfaces follows consent/age/region policy;
- minor-restricted users default to conservative discovery/ad settings;
- economic endorsements/sponsored club content require clear disclosure;
- externally redeemable value, paid random club rewards, real-money member trading or real financial products remain `legal review required`.

## 19. SEO

Potentially indexable:

- explicitly public club profile;
- public clubhouse tour;
- public archive exhibit;
- public community guide/event page.

Authenticated or `noindex`:

- member directory;
- join requests/invites;
- private feed;
- project contribution details;
- role/permission pages;
- moderation queue;
- clubhouse editor/drafts;
- admin/audit pages.

Public EN/KO pages use self-canonical URLs and reciprocal hreflang when equivalent localized content exists. Thin autogenerated club pages must not be indexed merely to create SEO volume.

## 20. Admin and operator UX

Operator tools provide:

- read-only club overview;
- role/membership audit;
- project reconciliation;
- layout revision history and diff;
- report/moderation queue;
- freeze/unfreeze with reason;
- search and pagination health;
- sink/contribution metrics;
- season snapshot status.

Forms do not auto-refresh destructively while an operator is typing. Refresh is user-controlled or applied as a non-destructive patch. WLD ledger history is never directly editable.

## 21. Failure and recovery states

Required handling:

- membership data unavailable -> fail closed for privileged actions;
- capability endpoint stale -> disable high-risk mutation and offer refresh;
- contribution timeout -> query idempotency result before allowing retry;
- layout publish conflict -> preserve draft and show diff/refresh choice;
- project state changed -> refresh authoritative target before confirm;
- moderation service unavailable -> preserve report draft where safe and clearly indicate submission status;
- feed unavailable -> clubhouse/projects remain independently usable;
- offline -> allow read cache only where privacy policy permits; financial/governance writes disabled.

## 22. QA matrix

Must test:

- 0, 1, 50, 1,000 and synthetic very-large member datasets;
- cursor pagination without duplicate/skip;
- member search normalization;
- role escalation/authorization denial;
- concurrent role edit;
- concurrent clubhouse publish;
- keyboard-only layout editing;
- mobile cards for large member/project lists;
- contribution replay/idempotency;
- over-target contribution acceptance;
- report/mute/block path;
- season lock state;
- permission-denied, empty, loading, error, offline and maintenance states;
- screen-reader labels/live status;
- noindex/auth boundary for private routes.

## 23. Research reviewed 2026-09-13

### Directly adopted

- Microsoft PlayFab `Groups, Guilds and Clans`, updated 2026-06-17 — official platform reference. Adopted the separation of persistent group identity, membership, roles/permissions and group-scoped data without creating a PlayFab dependency.
- Discord Community Onboarding FAQ, updated 2026-06-25 — official product/help reference. Adopted the idea of reducing first-contact overload through a small set of default/relevant destinations and user-editable interests/roles rather than exposing every community surface immediately.

### Reference only

- Discord Community Onboarding examples, updated 2026-05-15 — reference for keeping onboarding choices concise and avoiding overwhelming option lists; Moneyverse does not copy Discord's channel model.
- EVE Online `Cradle of War In Focus`, 2026-05-26 — reference for allowing different playstyles to contribute to shared long-horizon goals; Moneyverse keeps rewards non-P2W and uses its own economy/state models.

## 24. Runtime verification

`https://easy-scraping.com` returned HTTP 530 during this planning pass. Status: `runtime verification unavailable`.

No claim is made that Production or Test currently implements these club/clubhouse behaviors. When runtime access returns, the first verification pass must create/update a `Runtime Product Reality Audit` and compare actual `/clubs`, membership, project, clubhouse, feed, moderation and responsive states against this specification.

## 25. Delivery boundary

This document is documentation-only. No runtime deployment is required for this change.

Runtime implementation must use a separate development branch, isolated Test deployment, backend/DB/API/authorization/accessibility validation, then exact-SHA Production promotion only after verification.

## 26. Definition of Done

A clubhouse runtime slice is not complete until:

- English/Korean behavior docs remain synchronized;
- no arbitrary membership/activity hard cap is introduced;
- large member lists remain usable via server pagination/search;
- capabilities are enforced server-side;
- contribution accounting preserves HOLD/TRANSFER/HARD_SINK distinctions;
- layout editing uses drafts, version checks and audited publish;
- drag has an accessible alternative;
- mobile layouts do not depend on desktop tables;
- private/member/admin surfaces are authenticated and noindex;
- moderation/report controls exist for feed/community content;
- analytics measure healthy participation rather than raw spending/messages;
- exact candidate SHA passes isolated Test QA before Production.