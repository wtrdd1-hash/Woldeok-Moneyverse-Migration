# Woldeok Moneyverse — 180-Route Responsive Design Blueprint

Version: v2026.11.18.12
Status: PLANNING — CONCEPT ONLY / NO PRODUCT SOURCE CHANGE
Canonical language: English; Korean companion: ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md
Owner instruction: preserve the existing frontend. Create all-page visual planning artifacts before any implementation.
Baseline reference: GitHub main 0590fac4e8a82bc986ba1b8c64f014d18daca9e9 (2026-11-18)
Reference repository: wtrdd1-hash/Woldeok-Moneyverse-Migration

## 1. Decision, scope and non-goals

The user approved the direction of a game-inspired Moneyverse interface (deep navy, restrained violet/blue highlights, economy-themed illustrations), requested the equivalent mobile design, and then requested image concepts for every existing site screen and their inclusion in authoritative planning BEFORE development. The user explicitly prohibits touching the current frontend at this stage.

This work provides **planning mockups** for all 180 routes observed in the union of two snapshots:
- 178 screen routes with page.tsx in the GitHub main source baseline.
- 2 additional routes found only in the current mini-PC working checkout: /admin/logs/errors and /calculators. These are separately marked BRANCH_ONLY_CONCEPT; they are NOT treated as released or authoritative main routes.
- 40 administrator concepts and 140 non-administrator concepts in the union.
- Dynamic routes (e.g., /stocks/[symbol]) receive a dedicated **route template** image, not imagery for every possible record ID or slug.

The inventory excludes API endpoints, app-api route handlers, non-screen metadata, and source files without page.tsx. Route presence does not establish UI completeness, backend API health, member entitlement, test success or production availability.

Non-goals: editing frontend/, spring-backend/, backend/, apps or Nginx; changing databases, ledger entries, financial policy, user data, credentials, feature switches or runtime; marking Spring migration/QA complete; merging to main; Test/Production release.

## 2. Traceable complete visual inventory

Source and generated assets (inside this isolated documentation branch):
- docs/design/all-pages-v2026.11.18.12/routes-manifest.json — route, screen name, family, status, image path.
- docs/design/all-pages-v2026.11.18.12/README.md — 180-item browsable route-image catalog.
- docs/design/all-pages-v2026.11.18.12/gallery.html — filterable offline image gallery for project review.
- docs/design/all-pages-v2026.11.18.12/previews/ — exactly 180 SVG files. Every SVG contains one desktop and one mobile planning composition.
- docs/design/all-pages-v2026.11.18.12/generate_previews.py — deterministic documentation-only generator. Two provisional routes are explicit rather than silently added to main.

The SVG screens are intentionally systematic wireframe/concept images. Previous high-fidelity art direction images shared in the chat are visual references, NOT implemented production assets. A specific production-ready UI must subsequently be reviewed against its feature specification, real content, permitted state transitions and frontend/runtime contracts.

| Product family | Route images | Desktop target | Mobile target |
|---|---:|---|---|
| Home | 1 | Hero + asymmetric action dashboard + global search | Personalized cards and accessible bottom navigation |
| Administration | 40 | Audit-friendly dense tables, RBAC, source status | Read-only digest, guarded actions, stacked data |
| Finance / sovereign economy | 27 | Ledger numerics, charts, drilldowns, explicit action boundaries | Vertical cards, tabular amounts, confirmations |
| Gameplay | 16 | Reward/progress panels, quests, inventory, achievements | Thumb-friendly mission cards, receipts, progress |
| Community / editorial | 22 | Article hierarchy, post lists, discussion, moderation | Readable feed and composer with report access |
| Tools / calculators | 37 | Assumptions form, result, comparison, methodology | Stepwise input/result with units visible |
| Authentication | 7 | Identity, consent, OAuth provider states | Compact and secure access/recovery flows |
| Legal / safety | 6 | Readable structured policy, data controls | Single-column accessible policy and warnings |
| Member / general | 24 | Profile, notifications, status, guides | Simplified navigation and personal state |
| TOTAL | 180 | 180 desktop design frames | 180 mobile design frames |

## 3. Product navigation and feature placement

Keep every existing route discoverable: do not delete features simply because the primary navigation is reduced. Core desktop masthead mirrors the published guideline: Home, Trading, Tools, Community, MY. Group deeper routes in a searchable command palette and responsive navigation drawers, with keyboard shortcut and page titles. On mobile, use five thumb-friendly destinations (Home, Assets, Play, Community, MY) plus an explicit Tools entry from the menu/search and contextual links.

- Home: visual hero, wallet snapshot, daily missions, economy signals, alerts, announcements; no sensitive payload in public/unauthenticated output.
- MY: dashboard, account security, notifications, profile, permissions and logout.
- Economy: wallet, banking, stocks/details/portfolio, bonds, treasury, central bank, mint, KDIC, pension, foreign exchange, enterprises, businesses, ventures, advisors and predictions.
- Gameplay: work, quests, prestige, seasons, arcade, casino, shop, inventory, collections, auctions, real-estate spaces and calendar.
- Community: forum, news, blog, messages, clubs, photos, help, notices and support.
- Tools: distinct family-specific calculators with validated assumptions and honest output labeling.
- Admin: separate, visually reserved operational surface; never infer authorization from the frontend or a public 200 response.
- Auth/legal: accessibility-first sign-in, social provider selection, consent, recovery, verification, privacy, terms and account deletion.

The English locale is the default design copy; Korean is the required second language. Existing supported languages/routes must not be removed or silently fall back to misleading Korean strings. The concept images use Korean to facilitate owner review, not as a production hardcoded localization strategy.

## 4. Detailed visual system

Preserve the prior approved dark fantasy-game aesthetic while refining it against docs/DESIGN_SYSTEM_GUIDELINES(.ko).md, docs/RESPONSIVE_DESIGN_GUIDELINES(.ko).md, docs/frontend-ui-anti-clash-master-spec.md and docs/design/FRONTEND_REFERENCE_CORPUS_v271.md.

- Base: near-black #0C1020; elevated cards #151D32; cool neutral body text #E9F1FF, muted #A8BCD8. Brand violet #9C83FF, secondary blue #64B7FF.
- Finance: emerald/cyan signal coloring, no false "gains" green for unknown data; portfolio and transaction amounts use tabular, unit-labeled text.
- Gameplay: violet/gold rewards and character/realm imagery, with decoration restrained outside home/onboarding sections.
- Administration: lower decoration, priority status, provenance, timestamp and failure detail; no decorative fake KPIs.
- Community/editorial: readable content grid rather than cloning the trading terminal.
- Tools: form/results layout with labeled units, precision notes and clearly marked assumptions.
- Shared spacing scale: 4/8/12/16/24/32px, density chosen per family; stable semantic color tokens, a clear focus ring and non-ambiguous statuses.
- Motion: 150ms hover transitions only where useful, respect reduced motion; no pulse on changing financial numbers.
- Sample figures in image previews are explicitly fictional. Production must never use illustrative fabricated finance balances, performance metrics, dates or "success" states as substitutes for real API output.

## 5. Responsive and accessibility acceptance

At minimum independently verify 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920 CSS-pixel widths. The intended compositions are not merely desktop screenshots shrunk to phone width:
- 320–639: single-column cards, mobile bottom navigation, bottom-safe spacing, full-width drawers/sheets.
- 640–1023: 2-column cards where content is readable and compact navigation.
- 1024+: multi-column desktop surfaces; data-heavy admin and stock views may have isolated table scrolling rather than body horizontal overflow.
- No unexpected document horizontal overflow, text overlap, clipped headings, occluded fixed widgets or unsafe z-index collisions.
- Interactive targets at least 44×44 CSS px; keyboard focus visible; full keyboard navigation; meaningful accessible names; screen reader headings and status announcements; 200% zoom; WCAG 2.2 AA contrast goals.
- Long Korean, English, Japanese, Chinese and Vietnamese labels, large balances and long UUIDs must wrap or truncate with accessible full text.
- Required page states per route: initial/guest, authenticated, loading, verified empty, access denied/reauthentication, validation error, API unavailable/stale, transaction pending, success with real receipt, retry without double mutation, high-contrast/reduced-motion.
- Private account and admin data must be private/no-store where required, excluded from public SEO and not echoed into URL parameters or public logs.

## 6. Behavior and security contracts by family

Admin: RBAC and step-up authentication validated by Spring/security middleware; no privileged UI actions shown as successful on local-only mock data; auditable action actor/time/target/reason; destructive controls require confirmation, CSRF protection and idempotency where appropriate.

Finance: binding to authoritative DB-backed APIs only, exact decimal or BigInt-safe WLD formatting, stable numbers, specific read-versus-write permissions, explicit confirmation before transfers/trades; never emulate or mutate balances in the UI; handle unknown/stale/503 separately from zero.

Gameplay: quest progress calculated from verified source data, rewards credited only after server authorization, inventory equip/expiration/upkeep meanings respected, out-of-stock and disabled states visible. Do not imply game cash has real-world value or investment guarantees.

Social: protected submission, moderation, reporting, provenance/date, safe content rendering and suitable image fallbacks. Member visibility and privacy checked on the server.

Calculators: named units, input validation and methodology, effective date, localized formats, mathematical test cases and explicit illustrative/not-financial-advice disclaimers.

Auth/legal: OAuth/account identity and consent states, safe account deletion with confirmation, required legal policy accessibility, no secret values in static preview artifacts.

## 7. Collaboration and safe implementation handoff (NOT started)

This branch and PR own docs/planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.* and docs/design/all-pages-v2026.11.18.12/** only, plus carefully scoped master planning headers, records and update logs. Do not edit existing frontend files as part of this scope. Gemini and Spring migration owners retain their respective implementation branches and code.

Future implementation, ONLY after separate written approval and architecture/plan review:
1. Determine true runtime owner of each route after Spring consolidation, and reconcile GitHub main vs mini-PC route drift.
2. Create a new UI implementation branch/worktree, freeze exact base SHA, assign file ownership to prevent Gemini conflicts.
3. Build design tokens/layout/nav in isolation with feature flags and a dedicated test server; do not repoint production nginx.
4. Convert family-specific templates one at a time, with functional API error-state tests and accessibility/visual regression screenshots.
5. Gate exact-SHA Test on actual Spring backend health and authenticated end-to-end flows; destructive finance and admin mutations are never preview data.
6. Rebase or re-read current main before integration, pass review and the existing CI/security gates, require independent rollback rehearsal and deployment receipts before any separate production promotion decision.

## 8. Artifacts, evidence and explicit limitations

This v2026.11.18.12 change is a design/planning-only candidate. Visual previews do not assert design approval per individual page, production completeness, test server health, authenticated financial correctness, or operational release. Do not call this TEST_VERIFIED or PRODUCTION_VERIFIED.

Evidence required before declaring this planning deliverable complete: generated manifest is internally consistent; 180 unique accessible SVGs exist; desktop/mobile components render; source-route discrepancies are flagged; English/Korean specs and internal/public updates agree; Git diff includes NO frontend/ or runtime change; branch worklog records start, mid and end; current remote main SHA is checked again before PR.