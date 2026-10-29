# Private Security Events Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans, test-driven-development, verification-before-completion.

**Goal:** Allow members to view their verified latest 20 security events and download the same owner-only, metadata-minimized activity as CSV.

**Architecture:** Reuse the existing authenticated NestJS `GET /account/security/events` and migration 214 owner-scoped function. Next.js GET `/account/security/events.csv` gates membership before fetching, validates the complete response, and returns a bounded CSV with safe literal cells. The existing Android app-api forwards the same JSON resource with privacy headers. No new table, privilege or migration.

**Tech Stack:** NestJS, Next.js App Router, TypeScript, Vitest, PostgreSQL 17.

## Task 1 — Test-first contract
- [x] Add failing tests for all 20 visible items, private download affordance and no false empty state.
- [x] Add failing CSV route tests for authenticated owner API, no-store/noindex, strict data, spreadsheet injection and backend failure.
- [x] Run RED tests; record failures.

## Task 2 — Minimal implementation
- [x] Implement CSV formatter and gated GET route; only type and ISO timestamp, never raw metadata.
- [x] Render all 20 verified events and accessible download link; disclose 20-event cap.
- [x] Add NestJS privacy response headers for existing JSON API; verify Android route mapping.
- [x] Run GREEN tests and review spec, quality, privacy.

## Task 3 — Verification and release hold
- [ ] Verify affected Vitest, Typecheck, Build, Lint, security and real isolated PostgreSQL owner ACL.
- [ ] Fetch latest main and PRs, avoid overlapping branches, record full gate results and exact SHA.
- [ ] Open draft PR with evidence; never merge or promote without full gates.
