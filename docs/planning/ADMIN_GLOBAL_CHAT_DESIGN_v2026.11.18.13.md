# Admin Console Redesign & Everywhere Floating Chat — v2026.11.18.13

Status: ISOLATED IMPLEMENTATION PREVIEW; PRODUCTION INTEGRATION BLOCKED
Parent: [180-page responsive redesign v2026.11.18.12](ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md).
Korean: [companion](ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md).
Main baseline: `0590fac4e8a82bc986ba1b8c64f014d18daca9e9`; parent design SHA `cf928183b38f8b01b70ab66780d3e2ad7c750930`.

## User-approved intent
Keep the current live frontend 100% untouched; create an administrator page design consistent with the approved PC/mobile visual direction and include images in authoritative planning. Independently implement a floating *circular* inquiry/DM interface accessible across pages, with strong focus on mobile convenience, while not modifying the current frontend or enabling insecure live APIs.

## Existing surface and significant security blockers
- Existing production-source `FloatingSupportChatWidget` provides Support and 1:1 DM over `/app-api/v1/support` and `/app-api/v1/chat`. Reuse its public contracts when future integration is permitted; do not create another unsupported database or API.
- `RouteAwareFloatingUtilities` returns null for all `/admin` paths. This is an existing functional gap; resolve it only after admin-mode permission review, not by exposing ordinary member chat data inside the admin.
- Spring `SupportController` and `ChatController` resolve user identity from request-supplied `X-User-Id` / `x-actor-user-id` and use a hardcoded fallback UUID for missing/invalid input. `SupportService` reports `success=true` with fabricated fallback thread after database errors. Security and money-related accuracy demand server-resolved session identity and fail-closed errors before connecting this prototype. Existing QA/repair work belongs to other branches; this branch does not modify Java controllers.

## Administrator view hierarchy
Desktop admin home: left navigation (Dashboard, Members, Money/Ledger, Inventory, Content, Monitoring, Security, Support), status header (real backend status or UNKNOWN), overview cards only with actual server data; monitoring chart, action queue, recent audit activity; no fake production data on the actual service.
Admin member screen: permission-aware filter/search, paging, detail, audit of high-risk changes.
Money/ledger: read-only monetary truth until authorized, unit/precision, source timestamps, explicit two-phase confirmation and reason for any operation.
Support Inbox: queue, unassigned / waiting / resolved filters, assigned agent, thread details and receipts, safe redaction.
Logs: Nginx/Spring/application/Discord logs, timestamps, origin, severity and accessible filtering.
Mobile: accessible navigation drawer, 1-column status cards, scroll-isolated data, panel collapse, bottom-safe offset for a global chat trigger.
The reference images use synthetic sample indicators only, visibly labeled as DESIGN SAMPLE, and must not be mistaken for running metrics.

## Global round inquiry and chat: functional UX
The page-mounted global chat launcher is a 56px round icon at bottom-right on desktop and above the 64px mobile bottom nav plus ≥16px clearance. A single launcher hosts two tabs: **Customer inquiry** (staff-supported ticket) and **Member chat** (1:1 messages), with clear unauthenticated, loading, error, empty and unread states. Avoid a second duplicate floating launcher, including the existing Deoki assistant; follow the existing anti-clash dock geometry.
- Clicking the circle opens a popover/sheet with an accessible heading, close button, tabs, context-specific short FAQ links, text input, and keyboard Escape behavior. Focus moves inside on open and returns to trigger on close. Click outside may close only if no unsent draft.
- Route changes keep the open panel and in-memory draft during SPA navigation. Never persist message body, account IDs, tokens or private thread contents to `localStorage`/disk. When signing out or switching identity, clear sensitive state.
- Use a conservative route *category* (e.g., admin, wallet, stocks, shop) for context. Never include query values, transaction IDs, slugs or URL fragments in a support ticket without user inspection. Allow a user to remove the context.
- Compose validates non-empty, maximum 1000 characters; disables repeated submissions in a true request state; distinguishes SENT (actual server receipt) from PENDING/ERROR. Demo mode explicitly states that no message was transmitted, and never displays fake server success.
- Categories include Account, WLD ledger, Trading, Item/Quest, Bug Report, Other. Appropriate links to full help and safety/report tools are visible.
- On small devices the sheet fills available width and respects safe-area insets; no horizontal scroll or overlap with bottom navigation, onboarding or advisor controls. 44px minimum target, WCAG 2.2 AA semantics, aria live response, keyboard-only support and reduced-motion.

## What is implemented in this change
A self-contained **offline runnable preview** lives at `docs/design/admin-chat-v2026.11.18.13/preview/`. It uses no existing frontend JavaScript/CSS, Spring service or production traffic. Demo navigation imitates multiple site route families and maintains a floating support state across those screen switches. Inquiry and DM are simulated **only inside the preview**: any draft/submit action is explicitly marked PREVIEW / NOT SENT, no network mutation, no storage. Self-contained administrative desktop/mobile reference SVGs are attached in `references/` and embedded in this plan.

![Admin desktop and floating chat concept](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png)
![Admin mobile and floating chat concept](../design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png)

## Future gated integration (not approved as a release)
1. Security owners fix identity mapping to the validated signed-in server session; remove hardcoded UUID fallback and client identity headers. Use DB tenant/member ownership checks and CSRF/authorization, with negative cross-user tests.
2. Support service must return genuine 503/4xx error or recorded receipts, never `success:true` after failed DB writes or empty-list fallback for errors. Verify exact-SHA Java Spring API and authenticated user/admin flows.
3. Integrate ONE global dock under the approved UI worktree; decide the admin-surface support operating mode separately from user mode and avoid an administrator using a member ID to read private DM history.
4. Validate account switching, 320/360/390/768/1440 widths, high-contrast/reduced motion, keyboard, screen reader, screen overlaps, route persistence, idempotency and authorization; test backend, then Test environment from exact SHA.
5. Only after full security/QA, documented rollback and release verification may a separate change be promoted, with production frontend unchanged until that authorized promotion.

[Dedicated Spring support/chat security finding](../findings/2026-11-18-spring-support-chat-auth-gate-v2026.11.18.13.md) / [한국어](../findings/2026-11-18-spring-support-chat-auth-gate-v2026.11.18.13.ko.md).

## Status
Implemented preview & planning docs are not the deployed product. No Test/Production deployment and no existing frontend change. This is a draft design/development candidate, with backend security work explicitly blocked.
