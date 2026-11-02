# Dopamine Quota Source Truth Implementation Plan

> **For agentic workers:** Apply test-driven-development and verification-before-completion; keep all unverified reward settlement disabled.

**Goal:** Prevent owner-facing API responses from claiming remaining daily mini-game quota or vote participation without durable owner-scoped evidence.

**Architecture:** The existing status route has no owner-specific quota read function and returns fixed counters. Until a reviewed database-owned receipt path exists, the authenticated GET returns a private 503 error with a stable machine-readable code; it does not manufacture counts or modify reward paths.

**Tech stack:** NestJS, Vitest, Supertest, existing session and consent guards.

- [x] Inspect source, current main, QA, and overlapping claim PRs.
- [x] Write controller RED tests for missing and unrelated repository fixtures; observe both fail against fabricated successful counters.
- [x] Implement 503 `DOPAMINE_QUOTA_UNVERIFIED` with private no-store/noindex response.
- [x] Add HTTP 503/401 regression tests and update existing Pet Fortune expectation to the stronger fail-closed contract.
- [ ] Run all authoritative workspace and isolated PostgreSQL gates; never treat skipped or production-mode failures as passing.
- [ ] Open Draft PR and HOLD until exact-SHA Test, recovery and GitOps release gates are green.
