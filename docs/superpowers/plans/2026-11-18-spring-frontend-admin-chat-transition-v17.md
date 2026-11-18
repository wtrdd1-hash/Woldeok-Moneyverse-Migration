# Spring-served Frontend Admin & Chat Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; TDD each behavior change, record red/green evidence, finish with independent verification.

**Goal:** Transition the approved administrator design and page-wide floating support experience from documentation-only previews to real Next frontend source destined for Spring Boot static serving, while preserving live frontend and excluding unsafe admin ticket/DM writes.

**Architecture:** Current Spring branch packages Next exported static pages through SpaWebMvcConfig. The site root already mounts RouteAwareFloatingUtilities. Add a client-only safe AdminSupportDock in admin routes; leave the authenticated general Support/DM widget on non-admin routes. Apply an admin-scoped design shell, and refine the circular member widget's geometry and ARIA without changing any API contract. Actual chat transport integration is withheld until the Spring security owners fix user identity.

**Tech Stack:** Next 16 / React 19 / Vitest 4 / Tailwind 4, Java Spring Boot 3.3.5 served export candidate.

**Spec:** docs/planning/FRONTEND_ADMIN_CHAT_TRANSITION_v2026.11.18.17.md and prior draft #3270.

## Global Constraints
- Do not modify Spring security code, DB, deployment, Nginx, API trust boundaries or production.
- Do not expose fake admin statistics, act on financial balances or allow admin unverified message sending.
- One floating button per route, keyboard and mobile safe-area >= 80px, 56x56 touch area.
- Preserve existing support functionality where already present; admin help must be read-only and security-aware.
- English canonical documentation + Korean companion; implementation labels can follow existing locale support.

## Tasks
### Task 1: Set up isolated branch and document baseline
- [x] Use separate exact-SHA worktree derived from Spring repair PR #3267, check remote main and collaborator PRs.
- [x] Record START worklog before editing and identify source ownership.

### Task 2: TDD admin-safe launcher and route selection
- [x] Write failing RTL tests: /admin sees only safe launcher and no chat API; /wallet sees existing support widget and onboarding; admin launcher opens/closes with Escape, FAQ and accessible focus.
- [x] Implement AdminSupportDock with safe links and labels; route-aware toggle uses it only on admin routes. Run focused tests.

### Task 3: Admin design integration + member bubble geometry
- [x] Write responsive geometry/style test or static layout assertions first; observe RED.
- [x] Add scoped admin design shell to admin layout without changing data/permission boundaries, update floating member button to 56px and safe bottom offset, enforce accessible aria-expanded/keyboard.
- [x] Run targeted frontend tests and typecheck.

### Task 4: Build & Spring test
- [x] Run best available frontend build and test gates, with dependencies isolated.
- [x] Validate exact SHA static UI target compatibility with Spring; run isolated Spring boot test/HTTP smoke if safe and feasible. Report gates not run transparently.
- [x] Do not touch public Test/Production or change Nginx.

### Task 5: Evidence and PR
- [x] Update bilingual master plans, detailed spec, internal/GitHub updates, QA, changelog and MID/END worklog; recheck main SHA.
- [x] Review diff for source-only scope and sensitive data, push PR stacked on Spring repair branch. Never auto-merge or claim deployment without evidence.

## Release-blocked acceptance gates
- The Spring JAR still embeds the OLD static admin HTML; Next admin and support are dynamic, so new UI is not Spring-served.
- Full frontend test timed out; actual authenticated chat and multi-viewport real browser QA not completed. Do not promote.

PR review URL: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3275 (DRAFT; security and Spring static handoff HOLD).
