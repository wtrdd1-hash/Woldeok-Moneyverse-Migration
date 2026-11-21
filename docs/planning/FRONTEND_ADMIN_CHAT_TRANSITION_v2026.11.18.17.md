# Admin Design + Global Support UI Frontend Transition v2026.11.18.17

Status: ISOLATED IMPLEMENTATION — Test/Production HOLD
Approved: 2026-11-18 KST, "프론트엔드 전환진행승인".
Default language: English; Korean companion: FRONTEND_ADMIN_CHAT_TRANSITION_v2026.11.18.17.ko.md.
Related: Draft designs #3268 and #3270; Spring routing #3264; Spring repair #3267. The approved screenshot direction is violet/navy with functional admin clarity, not a request to show synthetic statistics as actual operations.

## Architecture and scope
- Spring Boot SpaWebMvcConfig in #3264 serves exported Next.js browser assets (file:/srv/moneyverse-data/frontend-static/ or classpath:/static/). We update the frontend source on a branch stacked on Spring security repair #3267; Test must export/copy assets into an isolated Spring runtime and prove HTTP before promotion. Do not presume the live site has already switched.
- Current frontend root layout mounts RouteAwareFloatingUtilities; existing FloatingSupportChatWidget already offers customer Support + Direct chat across non-admin routes, while /admin routes currently hide it. Do not introduce two overlapping buttons.
- This candidate adds **one admin-only read-only help/chat navigation dock** on /admin and /admin/* (no transport) and retains **the existing single member chat widget** on other routes. Admin-only launcher links users to existing /admin/support, /help, /support entrypoints; it does not read member chats or send support messages. Non-admin launcher improves round target, mobile safe-area and accessible state without changing network semantics.
- Apply a scoped admin shell/theme to the existing AdminSubNav and all 40 admin route templates, preserving authorization, data/API calls and "unknown" states. Do not build a fake new admin API or modify Spring auth.
- No Spring/controller/database/Nginx changes; no finance writes; no real customer data; no automatic update to current frontend server or production.

## Security release gate
Code observations on the Spring source: SupportController and ChatController resolve actor UUID from user-controlled X-User-Id / x-actor-user-id headers (fallback to a fixed UUID), and SupportService can answer success after failing to write a ticket. These defects are **P0 release blockers**; no admin widget may call these endpoints before server authenticated principals/CSRF/resource ownership and fail-closed receipts are verified by the Spring owner.

## UI/UX and accessibility acceptance
- Admin shell: dark navy / semantic violet and blue active highlights, high-contrast labels, real API evidence without fabricated green metrics; layout stays one column at narrow widths and supports contained table scrolling. All 40 admin routes inherit theme safely.
- Admin dock: 56×56 circular fixed control at bottom right (desktop right 24px bottom 24px; mobile right 14px, bottom at least 80px plus env(safe-area-inset-bottom)). Dedicated aria label, expanded state, Escape close, initial focus, return focus to the opener, visible no-live-chat warning, accessible focus ring. Links open existing admin support and help surfaces with a clear role distinction.
- Member dock: same 56px visual touch target; mobile safe-area clearance; supports existing ticket/DM in non-admin routes, 44px minimum nearby controls. Do not claim Spring API health, ticket submission or a green status without a verified server receipt.
- Route categories: admin matching exactly /admin or /admin/*; /administrator etc must not receive privileged admin help dock.
- Internationalization: retained existing locale function for chat; English canonical/Korean required. Admin help strings include English and Korean. No full translation of all legacy admin pages in this candidate.
- Tests: route selection and admin component behavior incl guest/read-only, request non-invocation and keyboard behavior; static layout/class assertions; member original tests; frontend typecheck; backend static serving smoke if safe. Release gate includes exact-SHA Spring test runtime, authentic session 401/403/503 cases, production rollback evidence and owner acceptance.

## Trade-offs and deferred tasks
This is an incremental real frontend source integration rather than a wholesale replacement of 180 route implementations. The page-specific 180-screen visual plans remain in #3268, and the independent demo in #3270; their asset paths are preserved. Full visual review and admin source-bound API redesign require later work, not silent changes to financial systems. Production remains untouched and unverified until security/QA gates pass.
