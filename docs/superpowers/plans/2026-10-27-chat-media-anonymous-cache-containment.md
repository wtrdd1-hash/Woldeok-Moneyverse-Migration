# Chat media anonymous-access and cache containment — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development. Follow RED–GREEN–REFACTOR.

**Goal:** Prevent unauthenticated access and shared-cache persistence for direct-chat/support uploaded media while preserving authenticated byte responses.

**Architecture:** Require existing SessionGuard + AuthenticatedGuard on the media GET route; use private no-store response headers. Do not claim participant authorization: storage lacks a binding from storageKey to conversation/case and this requires a separate DB-backed design and frontend integration.

**Tech Stack:** NestJS, Vitest, Express, TypeScript.

**Spec:** docs/planning/PROJECT_PLAN.md; docs/planning/PROJECT_PLAN.ko.md; AGENTS.md.

## Global Constraints
- Never mutate financial tables, existing migrations, or live database.
- Do not alter API URL, upload payload, storage format or successful response MIME/body.
- Preserve other agents' branches and pending PRs; Draft+hold only.

## Task 1 — RED
- [ ] Add tests to backend/src/content/chat-upload.controller.test.ts for route guard metadata and authenticated response cache headers.
- [ ] Run targeted Vitest; observe expected failures on baseline.

## Task 2 — GREEN
- [ ] Add existing session/auth guards to GET media and private/no-store response cache policy.
- [ ] Run targeted tests; verify pass.

## Task 3 — Verification and review
- [ ] Run backend tests, Typecheck, Lint, build, security audits and contract gates.
- [ ] Review diff for exposure, route compatibility and privacy limitations.
- [ ] Push Draft PR with explicit HOLD and record exact SHA, CI, Test and release blockers.
