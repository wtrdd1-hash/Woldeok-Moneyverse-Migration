# Verified Help Publication Date — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use test-driven-development, isolated worktrees, and verification-before-completion.

**Goal:** Display the verified, database-backed publication date on help search cards and article detail pages in Korean/English.

**Architecture:** Reuse `published_at` returned by PostgreSQL `help_public_search` and `help_public_article` via NestJS. Next renders only well-formed ISO timestamps as accessible `<time>` elements; Android app-api preserves the same backend timestamp and refuses cache reuse. No schema, role, ledger or migration changes.

**Tech Stack:** Next.js, TypeScript, Vitest, NestJS, PostgreSQL.

**Spec:** The existing approved-only help feature in migration 282, AGENTS.md and bilingual integrated plan.

## Constraints
- Never fabricate publication dates, approval status, or cached search results.
- Keep feature OFF by default; no new public cache, robots indexing or direct database grants.
- Do not alter applied migrations, finance, authentication, or other agents' branches.

## Steps
- [ ] Add RED tests for date formatter, help search/detail accessible timestamp, backend SQL source and Android passthrough.
- [ ] Observe RED failures on clean main.
- [ ] Add minimal presentation implementation, with malformed timestamps omitted.
- [ ] Run GREEN targeted tests, then full lint/typecheck/build/tests and targeted real PostgreSQL validation.
- [ ] Re-fetch main and integrated plans, audit all PR heads, record evidence, open Draft PR; never merge without exact-SHA Test E2E and release gates.
