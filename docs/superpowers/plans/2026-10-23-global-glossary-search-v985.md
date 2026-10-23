# Global Glossary Search v985 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans with test-driven-development and verification-before-completion.

**Goal:** Make global search return real, public, canonical financial glossary articles alongside navigation routes, without exposing private content or inventing search results.

**Architecture:** Reuse the published `GLOSSARY_TERMS` in the Next.js server search route, not a new API/DB table. A pure matcher returns bounded public article hits across four languages and routes to existing canonical detail pages. SSR renders a distinct accessible result group; `/search` remains noindex.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright Chromium.

## Task 1 — RED
- [x] Add `frontend/src/app/search/glossary-search.test.ts` for slug, KO/EN/JA/ZH names, public-only canonical URL, case-insensitive matching, blank query, deduplication and bounds.
- [x] Execute focused test and record RED failure.

## Task 2 — GREEN
- [x] Add pure `searchGlossaryTerms` helper in `frontend/src/app/search/search.ts` reusing canonical glossary data.
- [x] Add SSR results section to `frontend/src/app/search/page.tsx`, noindex and semantic headings, mobile layout and screen-reader count.
- [x] Execute focused test and component SSR regression.

## Task 3 — Verification and release
- [x] Re-fetch latest main and both plans; check open PRs for overlap.
- [x] Attempt exact-HEAD focused + full lint/typecheck/build/unit/integration/security/app-api/real PostgreSQL and mobile/desktop E2E; capture any failures precisely. Full lint/audit/CI failed and real PostgreSQL/official Test remain BLOCKED.
- [x] Open Draft PR only, preserve other agents' branches, do not merge/deploy without every gate PASS. Update English/Korean worklogs at midpoint and closeout.
