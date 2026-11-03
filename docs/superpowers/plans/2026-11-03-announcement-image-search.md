# Published Announcement Image Description Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let visitors and Android clients find approved recent notices by their verified image descriptions without confusing a filtered empty set with a site-wide search.

**Architecture:** Keep the existing PostgreSQL SECURITY DEFINER published-announcements function as the sole source, limit to its latest 20 approved rows, then filter image_alt_text literally in the read-only SQL projection. Nest rejects invalid query values; Next renders an accessible filter with noindex metadata; the Android gateway rejects malformed query/response and prevents indexing or caching filtered results. No schema, financial, authorization or session changes.

**Tech Stack:** PostgreSQL, NestJS, Next.js, Vitest, pnpm.

**Scope:** GET /api/v1/announcements?imageAlt= and /api/v1/content/announcements?imageAlt= (same service), /announcements?imageAlt=, /app-api/v1/content/announcements?imageAlt=. Query length 2-80 Unicode code points after trimming, reject control characters, angle brackets and duplicates; case-insensitive literal substring; 20-row recent published snapshot only. Unfiltered requests retain existing behavior. Invalid input 400; upstream failure must not be presented as verified empty. Search URLs must not be indexed; Android filtered responses no-store/noindex.

- [x] 1. Write failing Nest controller/repository tests for query validation and bounded literal DB filter; run RED.
- [x] 2. Implement repository and controller/service forwarding; run GREEN and relevant backend tests.
- [x] 3. Write failing Next parser/UI and Android gateway tests; run RED.
- [x] 4. Implement accessible Next search and fail-closed Android query/response handling; run GREEN.
- [ ] 5. Run build, lint, typecheck, unit, integration, real-PostgreSQL, security, accessibility, SEO and app API gates where available. Recheck main and planning; record exact SHA and blockers.
- [ ] 6. Push only task branch and create Draft PR; never merge or deploy without exact-SHA official Test and release gates.
