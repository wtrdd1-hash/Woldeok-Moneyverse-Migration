# Admin SEO Observation Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement each task with RED/GREEN verification.

**Goal:** Prevent the administrator crawler dashboard from claiming successful live observations when its authoritative API is missing, malformed or stale.

**Architecture:** A shared runtime parser validates the existing guarded NestJS SEO metrics contract. SSR reads only the administrator endpoint and renders an explicit error when invalid/unavailable; the client refresh uses the same parser and masks stale metrics on failure. No fake public fallback, new DB migration, or privileged gateway bypass.

**Tech Stack:** Next.js 16, React 19, Vitest, existing NestJS/PostgreSQL API.

### Task 1: Validate the SEO observation contract
- [x] Add failing tests for numeric counts, distributions, URL/visit fields, duplicate records, partial payloads and a valid backend-shaped response.
- [x] Implement a focused pure parser with bounded arrays, safe counters and internal consistency checks.
- [x] Run targeted tests GREEN.

### Task 2: Fail closed on initial and refreshed observations
- [x] Add failing SSR test: no public fallback, no invented metrics, no operational status when administrator endpoint errors.
- [x] Add failing client tests: refresh rejects bad JSON/HTTP failure, reports error accessibly, masks stale values; successful retry restores observations.
- [x] Wire parser into SSR and refresh. Keep responsive buttons, private API, noindex.
- [x] Run targeted tests GREEN and existing SEO tests.

### Task 3: Verify and release decision
- [ ] Re-fetch main and canonical EN/KO planning; rebase if advanced.
- [ ] Run exact-HEAD lint, typecheck, tests, builds, security and app-api/DB/CI where available.
- [ ] Publish Draft PR and hold if any required gate fails; do not modify other worktrees.

### Candidate build incident
- [x] Reproduce clean Alpine Turbopack Google font resolver failure in candidate workflow.
- [x] RED regression for Dockerfile compiler selection.
- [x] Use known-working Webpack build in candidate Dockerfile; GREEN regression.
- [ ] Repeat exact-HEAD gates and candidate build.
