# Member notification page integrity implementation plan

> For agentic workers: use test-driven-development and verification-before-completion.

**Goal:** Prevent member inbox filters from showing contradictory or duplicated server rows and preserve verified read receipts.

**Architecture:** Existing authenticated Next API is authoritative for owner identity. A pure frontend boundary validates each page against requested category/read filters and previously displayed IDs; client preserves only validated rows. No new endpoint or SQL grant.

**Tech Stack:** Next.js, React, TypeScript, Vitest, NestJS and existing PostgreSQL owner functions.

**Spec:** docs/worklog/2026-11-01-dev-c-v1272-notification-page-proof.md

## Tasks
- [x] Add RED tests for contradictory category/read state, cross-page duplicates and confirmed receipt persistence.
- [x] Implement page proof and UI consumption; keep accessible error/retry, responsive layout and noindex.
- [x] Run focused GREEN, lint/typecheck/build/full suites and isolated DB/security/app-api/HTTP/E2E as feasible.
- [x] Re-fetch main mid-work and before any merge, create Draft PR with precise evidence; hold release unless all gates PASS.

**Release decision:** DRAFT/HOLD. Full-route QA, backend profile HTTP regression, dependency audit and canonical notification DB evidence block approval. Exact final-SHA evidence is recorded in PR #2373.
