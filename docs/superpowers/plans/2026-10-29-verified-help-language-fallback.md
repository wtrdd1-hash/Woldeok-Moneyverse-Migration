# Verified Help Language Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development task by task.

**Goal:** When no verified help article exists in the requested language, allow an explicit opt-in search of the other approved language without inventing translations or weakening publication gates.

**Architecture:** NestJS validates an optional boolean and queries the existing `public.help_public_search` SECURITY DEFINER function twice only when the first result is empty and fallback was requested. Next.js server action preserves query privacy and exposes the opt-in checkbox and visible language notice. Android uses the existing allowlisted POST `/app-api/v1/help/search` with a backwards-compatible optional body field.

**Tech Stack:** NestJS, Next.js App Router, Vitest, PostgreSQL 17, TypeScript.

**Spec:** `docs/planning/PROJECT_PLAN.md` (canonical English), `docs/planning/PROJECT_PLAN.ko.md` (secondary); existing verified-help source-approval rules from migration 282. No migration in this change.

## Global Constraints
- Feature remains gated by `VERIFIED_HELP_CENTER_V1` and source approval; never activate flags, deploy, or write Production DB.
- Fallback is opt-in, default false; do not merge result sets or hide a successful primary-language result.
- Never send query text in URL, log, telemetry or client cache; POST body only.
- Both languages must use existing approved-only DB read function; fail closed on any DB error, no false empty or fallback success.
- Android must expose only public help read routes, not admin endpoints.

## Review Focus
- Primary empty and fallback disabled => no second DB call.
- Primary nonempty and fallback enabled => never replace primary results.
- Secondary empty => clear empty state, not a false fallback success.
- Invalid fallback values => 400/invalid, never implicit truthiness.
- DB outage in either language => unavailable; do not claim verified results.

### Task 1 — Backend API/DB read path
- [x] RED: Add NestJS controller tests for primary, fallback, strict boolean and failure paths.
- [x] GREEN: Implement optional `fallbackToOtherLocale` and response language provenance, querying existing DB function via repository.
- [x] VERIFY: Backend help tests and database query-boundary tests.

### Task 2 — Next.js user experience
- [x] RED: Add server-action and UI tests for opt-in, language notice, invalid input and no-cache failure.
- [x] GREEN: Extend server action and accessible checkbox; render explicit language fallback notice and locale-correct article links.
- [x] VERIFY: Frontend help tests and accessibility assertions.

### Task 3 — Android app-api parity and evidence
- [x] RED: Extend Android route/contract tests for POST help search with fallback body.
- [x] GREEN: Preserve allowlisted path and document optional body/response shape in app API guide.
- [ ] VERIFY: lint, typecheck, unit/integration, isolated PG if feasible, build and CI. Draft PR only while exact SHA Test E2E/finance/security gates remain blocked.
