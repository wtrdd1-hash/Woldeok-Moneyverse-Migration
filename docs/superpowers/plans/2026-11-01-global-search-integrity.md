# Global Search Integrity Implementation Plan

> **For agentic workers:** Use test-driven-development and verification-before-completion; work only in the isolated v1265 worktree.

**Goal:** Prevent malformed multi-value search queries from crashing SSR and prevent false public/empty search results when authorization is required or unavailable.

**Architecture:** Pure input and visibility helpers in `frontend/src/app/search/search.ts`, existing Nest viewer API via `viewerOrUnknown`, server-rendered accessible state in `page.tsx`. No DB writes or new endpoints.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React SSR, Nest authenticated viewer.

**Spec:** `docs/worklog/2026-11-01-c-global-search-integrity-v1265.md`.

## Steps
- [x] Add regression tests for malformed `q`, Unicode bounds, guest/member/admin classification, API unknown and server rendering; verify RED.
- [x] Implement query normalization, source-status distinction and member-only public-nav exclusion; verify GREEN.
- [ ] Run focused and full validation, inspect remote CI, document remaining release blockers and keep PR draft.
