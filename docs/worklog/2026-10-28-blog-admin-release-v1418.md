# v2026.10.28.1418 — Mobile blog administration and verified publisher control

## Start
- User screenshot of live Production /admin/blog shows the disabled manual “AI blog immediate generate and publish” control, “server verification required” wording, and mobile control-panel heading/status layout breaks.
- Owner policy (v1405): schedule each 2 hours rotate KR/US/JP/CN native economy/coding/computer, source/uniqueness verification, automatically public when verified, NO mandatory human approval or automatic withdraw; manual edit/withdraw/delete only by administrator.
- Recheck latest origin/main, canonical integrated planning EN/KO, AGENTS, releasing, and v1417 Production blog-only live backend/frontend, previously CI/Test verified SHA. Keep financial/member apps and immutable legacy 13 posts unchanged. No false active writer claim.
- Review actual backend publisher/model runtime, protected auth paths, and performance before choosing safe fixes. Work on separate branch. Recheck main before merging.

## v1418.2 — Implementation and middle recheck
- Actual code hardcodes manual generation, country and topic inputs as disabled, not a transient UI bug. Isolated Production frontend API_ORIGIN points to old backend 3000 rather than verified Blog API backend 3481. Real model writer timed out at 125 seconds; auto scheduler OFF and zero DB-verified posts.
- Implemented admin-only backend GET /api/v1/admin/blog-verified/publisher-status behind existing Session/Authenticated/Consent/Admin/AdminSession guards. It returns scheduler configuration, model certification flag (default false), verified count and next KST rotation; manualEnabled remains false. Never claims a working manual publisher, and has no writes.
- Same-origin admin Next BFF GET /api/admin/blog/publisher-status: anonymous 403, authenticated backend call with internal token/session, fail-closed 503, no-store/noindex.
- Mobile admin card stacks heading/badge, wraps text and exposes a clickable 44px full-width publisher status-refresh. Displays actual backend state, pending model verification, verified count and next country/topic. Replaces inert manual-publish and country/topic buttons.
- Backend/Frontend TS and contract build PASS, 6 focused tests PASS (backend 2, frontend admin 1 and BFF 3), changed-file ESLint PASS.
- Latest main rechecked and code isolated; Production/runtime unchanged pending exact SHA CI/Test and canary.
