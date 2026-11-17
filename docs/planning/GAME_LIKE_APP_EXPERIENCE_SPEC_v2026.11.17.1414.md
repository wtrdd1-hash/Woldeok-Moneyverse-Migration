# Game-like App Experience — Product-Wide Specification

**Version:** v2026.11.17.1414
**Status:** DRAFT / DOCUMENTATION ONLY / RELEASE HOLD
**Canonical language:** English; Korean companion: [Korean specification](GAME_LIKE_APP_EXPERIENCE_SPEC_v2026.11.17.1414.ko.md).
**Applies to:** Woldeok Moneyverse web/PWA and Android apps, public/member/admin boundaries, Spring Boot-backed API, PostgreSQL canonical economy.
**Owner directive:** “It is an app, but implement it like a game.”
**Priority:** Integrated planning master > this cross-product experience supplement > feature-specific UX plans. Security/financial truth, accessibility, and real source behavior always override decorative presentation.

## 1. Product contract and non-goals

Woldeok Moneyverse is a functioning application and a persistent virtual economic world, not a disposable game mock-up. All primary member flows should feel like entering and playing a coherent game: clear world identity, avatar, personalized home, quests, progress, inventory, meaningful action outcomes and next steps. A member must still be able to complete tasks efficiently with familiar app navigation, fast loading, full keyboard/screen-reader support and unambiguous financial information.

- **Implement:** game-like navigation, hierarchy, feedback, progression visibility, missions, world atmosphere, item cards, optional animation/audio, cross-screen consistency and service-state truth.
- **Do not imply:** gambling is mandatory, WLD is real cash, an animation mints WLD, client-side progress grants rewards, undisclosed pay-to-win requirements, forced engagement, guaranteed stock returns, or fabricated activity.
- **Existing functionality is not certified by this plan.** Module names and journeys below are design targets and must be mapped against the actual Spring API, migrated SPA, Android client, contracts and feature switches before coding.
- Web and Android share interaction semantics, server-state truth and Korean/English copy. Platform-specific shell details can differ. The default primary copy is English with Korean as second language, preserving approved member-facing Korean strings unless separately authorized to change them.

## 2. Experience architecture: an app shell shaped like a playable world

### 2.1 Screen map, placement, visible elements

| Area / candidate entry | Player-facing presentation and UI position | Main actions | Server-state ownership |
|---|---|---|---|
| Home / World lobby (signed-in landing) | Top: compact account/avatar and accessible notification controls. First viewport: personalized world status, verified balance *with as-of time*, selected mission and one primary “Continue” CTA. Below: 3–5 location cards and activity feed. | Continue mission; open a location; review what changed. | Server-signed member summary; mission source; never infer money from client state. |
| Avatar / My profile | Top identity card; level/XP only where the underlying contract exists. Middle: equipped slots, cosmetic preview, titled achievements. Bottom: privacy and appearance settings. | Edit cosmetic display, inspect achievements, view levels. | Server entitlements and verified progression read; use UNKNOWN rather than zero for missing source. |
| Quests / Activities | Top: Today / Weekly / Story tabs; each card: objective, explicit progress numerator/denominator, deadline, reward type and source freshness. Bottom: claim history and receipts. | View conditions, complete eligible action, claim verified reward. | Authoritative rule evaluation and idempotent receipt from server/DB. |
| Wallet / Treasury-related pages | Render as a readable “vault” or world ledger, not a casino counter. Balance and transactions occupy clear numerical panels; visual themes surround but never obscure accounting. | Review balance, open receipt, initiate permitted transfer. | PostgreSQL canonical double-entry ledger and authorized server commands. |
| Bank / Stocks / Market | World “financial district” navigation. Upper area: valuation and explicit simulation notices. Mid: position cards/charts with timestamps. Lower: separate confirm/review actions. | View holdings and risks; initiate existing authorized actions. | Actual quoted source, eligibility, protections, receipts; no guaranteed-gain visuals. |
| Shop / Inventory | Shop as world store with filter/search/rarity. Inventory as equipment bag: slot icons, equip status, expiries, maintenance notices and empty explanations. | Inspect, buy, equip, unequip where permitted. | Server ownership/stock/maintenance read; exact WLD amounts; no fake owned state. |
| Profession / Work / Companies | Map-like districts with profession cards, task board, prerequisites, progress bar, career stages and completed evidence. | Accept a task, submit, review employer/company status. | Approved server task transitions, duration verification and settlement. |
| Community / Blog / Announcements | Tavern/newsroom board metaphor with legible posts, timestamps, moderation indicators and verified sources. | Read, publish, comment where allowed. | Moderation/publication state from server; no fake “published” state. |
| Season / Achievements / Collections | Seasonal world pass-like progression *without paid pressure*: historical archive, meaningful milestones and optional return paths. | View goals, inspect earned badge proof and collection completeness. | Exact earned entitlements; immutable evidence or explicit provisional status. |
| Notifications / Settings / Support | Plain app conventions with light world styling; clear account recovery, security alerts, permissions and support. | Manage notification opt-ins, accessibility and account. | Durable settings and audited account transitions. |
| Administrator console | Professional operational control room, not role-play gamification. Precise severity, time, data provenance, logs, rollback and permissions take priority over game visuals. | Inspect, approve/administer authorized actions, audit. | Authoritative sources and superadmin controls; no decorative “healthy” badge if verification fails. |

No module is created by merely listing it. Existing feature-specific specs remain authoritative for detailed capabilities, restrictions and rollout gates.

### 2.2 Navigation architecture

**Web / desktop:** persistent left world navigation (collapsed icons plus accessible text); active location name and breadcrumbs; responsive 2–3 column cards. **Mobile:** bottom navigation with **Home, Quests, World, Inventory, Profile** (five maximum); Wallet/Bank/Stocks and other areas reachable under World with a prominent search and deep links. Use in-app labels rather than fantasy jargon for core money/security actions. Android system Back returns to the previous in-app screen; a drawer/overlay closes before navigation.

**First session:** short skippable 3-stage entry: choose display identity → see a genuine sample/verified world state → perform one reversible, nonfinancial guided action. Never grant money or XP merely because an animation played. Signed-out users receive a coherent preview rather than fake signed-in progression. Deep links to a game location preserve the authentication and consent gates and return to the intended location after login.

## 3. Game-feel interaction requirements

1. **Action–response loop:** every eligible action shows immediate control feedback (<100ms perception target), honest pending state, definitive server-authoritative success/error and a discoverable next action. Do not change canonical amounts before a verified receipt. Buttons must be idempotency-safe, disable duplicate submissions, and distinguish PENDING, CONFIRMED, REJECTED and UNKNOWN.
2. **Progression:** XP, levels, streaks, achievements and quest completion are separate typed domains. Define exact rule ID, eligibility, cap, reset/timezone (KST when applicable), source version, verification timestamp, reward type and receipt before implementing any UI. Pure client “progress” is cosmetic only and never displayed as earned.
3. **Quest cards:** title, explicit requirement, objective/source evidence, real progress (e.g. 2/5), verified expiry, reward terms, state and accessible CTA. Unknown input is “Unable to verify progress”, not 0%, complete or unclaimed. Weekly quest claims require an actual replay-safe backend receipt.
4. **Reward presentation:** brief optional celebration (150–500ms target), light particles and positive microcopy **only after confirmed server success**. Reduced-motion mode removes animations but still announces the result. No synthetic WLD increments, fake jackpot visuals, artificial loss aversion or urgency.
5. **Status visibility:** server refresh age and pending/unknown states are first-class. Socket/realtime update is a hint to re-fetch, not proof of settlement. A disconnect must never appear as an empty account, inventory or zero balance.
6. **World continuity:** character/area/season branding carries across screens, but location metaphors never override plain labels for user-critical actions. Empty states include a genuine next step, not arbitrary “collect reward” bait.
7. **Sound/haptics:** OFF by default; explicit opt-in and persistent mute; no unexpected autoplay, especially for finance, auth, critical alerts or background page transitions.
8. **Ethical retention:** optional challenges and visible progress, not mandatory streak coercion, surprise purchase prompts, manipulative countdowns or randomized paid reward pressure. Gambling/monetization remains governed by its separate age/jurisdiction/feature-switch policy and is not included in the default home loop.

## 4. Visual design system and content rules

- **Direction:** modern high-quality strategy/simulation game UI over a dependable application foundation. Dark-friendly neutral canvas; restrained gold/teal/purple accent for world categories; consistent card elevation, item frames, map iconography, and soft transitions. Do not make color the only rarity or state signal.
- **Design tokens (proposal, not existing implementation):** spacing 4/8/12/16/24/32 px; corner radius 12/16/20 px; typography body >=16px on phone, labels >=14px where readable; touch/click target >=44×44 CSS px; focus ring >=2px; content width max ~1200px desktop; 8px grid.
- **Component inventory:** GameShell, WorldNav, PlayerIdentityCard, VerifiedBalanceCard, QuestCard, ObjectiveProgress, RewardReceiptToast, LocationTile, InventorySlotCard, RarityLabel, StatusBanner, PendingActionDialog, SourceFreshnessLabel. Implement as reusable accessible components only after confirming current Spring SPA/Android framework and design tokens.
- **Breakpoints:** 320–359px smallest supported view, 360–767 phone, 768–1023 tablet, >=1024 desktop. At 320px and 200% zoom there must be no horizontal scrolling for core tasks, clipped money amounts, inaccessible CTAs or hidden primary navigation.
- **Motion:** support prefers-reduced-motion, app-level disable, no flashing >3/s, short transitions, preserve navigation focus and scroll. Performance budgeting: avoid expensive continuous canvas/particle scenes; static fallback for low-memory or weak GPU.
- **Data typography:** monetary amount is integer WLD (exact decimal string; integer-safe formatting), not floating calculations. Display signs, currency units, timestamps and updated/unknown labels plainly. Never represent debt, suspension, losses or failures with celebratory feedback.
- **Copy:** primary English and second Korean with meaning parity. Keep approved translated Korean copy unless product-authorized revision; distinguish “reward preview”, “eligible”, “submitted”, “processing”, “verified”, “failed”, “not yet verified”. Do not translate accounting terminology into misleading fantasy terms.

## 5. Data, API and security boundaries

Presentation is NOT the source of truth. Use the effective Spring Boot + SPA/Android contracts verified against live source at implementation time; do not blindly copy old Nest/Next routing from historical documentation. The canonical PostgreSQL ledger controls WLD, balances and postings through approved authenticated/idempotent operations. Character XP, quests, entitlements and other game metrics require independently specified authoritative source tables/read functions or existing verified APIs; do not invent SQL contracts.

State machine common to money-relevant and game-reward actions: IDLE → SUBMITTING → ACKNOWLEDGED/PENDING → VERIFIED_SUCCESS or VERIFIED_FAILURE; when the source times out or is inconsistent, UNKNOWN_RETRYABLE instead of assumed success. On re-fetch require server receipts/ownership checks, stable idempotency keys, actor/session fencing, CSRF/auth/consent and approved feature switches. Never give a second reward because a client retries. No direct client-to-DB or unreviewed app-role table grants; no owner ID accepted from URL in place of verified identity.

Error handling: 401 sign in again; 403 insufficient authorization/consent with truthful explanation; 409 state conflict refresh; 429 bounded retry; 503 temporary source unavailable; malformed response separate from verified empty. For private member pages, enforce private/no-store and noindex at the actual edge on success and failure, no PII in analytics, screenshots, deep links or event streams.

## 6. Engineering handoff (separate owner branches)

- **GX-01 Foundation:** verify actual latest main, Spring runtime/auth contracts and Android code; inventory current routes and component owners; create wireflows for five primary destinations; reserve no features without source check.
- **GX-02 Design system:** platform-neutral tokens, component states, locale keys, accessibility and no-motion fallback. Build a small Storybook/preview-equivalent against existing UI framework without overwriting uncommitted work.
- **GX-03 Shell & Home:** responsive GameShell/world navigation + first-session; zero false financial claims, no lost deep links.
- **GX-04 Quests & character:** bind authorized progress/XP/level/achievement reads only; all unimplemented sources explicitly blocked behind default-OFF feature flags.
- **GX-05 Economy & inventory:** world visual skin over existing real wallet/bank/stocks/shop/inventory flow; verify exact canonical money format, confirmations, costs, status, receipts.
- **GX-06 Android parity:** identical state/copy/ownership, offline/re-login/account-switch fences; native back/edge-to-edge/status bar.
- **GX-07 Hardening:** security/privacy, a11y, responsive/screenshot regressions, interaction E2E, performance and automated fake-success checks.
- **GX-08 Release:** full CI, canonical DB nonmutating read contract, official Test exact SHA + signed-in E2E, independent restore/rollback, documented review and staged rollout; only then consider production promotion.

Use a proposed default-OFF flag **game_like_app_shell** (do not create it in this docs-only change). Every implementation unit has an explicit owner, spec acceptance tests, base/main synchronization, isolated worktree and separate PR. No cross-branch overwrite of the current Spring work or the other developer's files.

## 7. Verification matrix: mandatory before coding is called done

| Test group | Required pass criterion |
|---|---|
| Navigation | Every mobile bottom-tab, desktop nav item, back/deep link and auth return resolves to the correct owner view; no dead ends |
| Source truth | Unverified XP, quests, balance, holdings or payouts never render as earned/0/paid; reconcile confirmed rewards against server receipts |
| Monetary safety | Exact integer WLD, double-entry/receipt authority, idempotent double tap/retry, no client-generated settlement |
| Security/privacy | Guest/foreign-owner/admin negatives; CSRF, session revocation, consent and feature-OFF; actual-edge no-store/noindex |
| Offline/errors | 401/403/409/429/503, timeout, malformed, reconnect and two rapid account switches never leak stale or false-success data |
| UI responsive/a11y | 320px and 200% zoom, 44px targets, screen reader, keyboard, focus, contrast, reduced motion; no clipped actions |
| Performance | Proposed targets: home LCP <=2.5s at p75 mobile on representative network, interaction INP <=200ms, no animation-caused >5% memory regression; measure and refine before enforcement |
| Localization | EN and KO copy complete, no truncation in currency/quest states, critical strings convey identical legal and financial meaning |
| Cross-client | Web/PWA and Android feature parity, no notification/audio surprise, same reward receipt and account-fencing semantics |
| Rollback | Flag OFF restores existing safe navigation without migration/ledger rollback; exact known-good release artifact and independent backup restoration preflight |

Targets are **proposals** and **no tests were executed for this planning change**. Screenshots and external design references are to be curated per screen during implementation with original sources, attribution/licensing and accessibility review; do not duplicate competitor trademarks, copyrighted illustrations or unverified reference claims.

## 8. Approval boundary and definition of done

**This change creates documentation, not UI code or a deployed feature.** Product sign-off requires a coherent clickable prototype or controlled test implementation, source-backed backend contracts, SEO/privacy/security review, owner-approved first-time-user flow, Android/web parity and a complete screenshot QA set. Do not call the app “game implemented” merely because this specification exists.

### Relationship to authoritative plans

Read alongside [Integrated Planning Master](INTEGRATED_PLANNING_MASTER.md), [Living Project Plan](PROJECT_PLAN.md), [Product Design Specification](PRODUCT_DESIGN_SPEC.md), [Spring Migration Report](../../SPRING_BOOT_MIGRATION_REPORT.md), [Accessibility / Responsive Specification](ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md), [Economy / quests / inventory feature specs](README.ko.md). Conflicting dated architecture assertions are resolved only after live source and operator-approved security/release gate verification.
