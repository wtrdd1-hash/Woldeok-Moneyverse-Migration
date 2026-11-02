# Verified owner privacy requests implementation plan

> **For agentic workers:** Follow TDD, worktree isolation, systematic debugging and verification before completion.

**Goal:** Render only verified owner privacy-request records and fail closed on Android gateway malformed success.

**Architecture:** Existing authenticated Nest GET /api/v1/privacy/requests and PostgreSQL privacy_list_my_requests remain authoritative. A strict pure parser validates bounded owner list, optional request-type filter, UUIDs, status, date and detail; web and app gateway share it. Failures display retry on web and return 503 at Android edge.

**Tech Stack:** Next.js/TypeScript, Vitest, NestJS/PostgreSQL unchanged.

**Spec:** User requested a P0/P1 frontend/mobile integration fix with actual backend contract and no false success.

## Global constraints
- Never edit main, finance ledger or SQL grants; no runtime deployment without exact-SHA release gates.
- Preserve Korean product copy except necessary error messages; private no-store/noindex/referrer policy.

## Tasks
1. [x] Add RED tests for malformed response, duplicates, invalid timestamp, wrong filter and bounded count.
2. [x] Implement strict parser; GREEN tests.
3. [x] Add web retry and verified-empty distinction; focused page tests.
4. [x] Add Android GET privacy request validation and private headers; RED/GREEN gateway tests.
5. [ ] Run required gates, inspect main drift and PR overlap; record honest PASS/FAIL/BLOCKED, preserve changes.
