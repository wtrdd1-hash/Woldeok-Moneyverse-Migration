# Public Service Status Attention Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow visitors and Android clients to find monitored services that need attention without misrepresenting stale/unknown data as healthy.

**Architecture:** Keep `public.content_public_status()` as the authoritative read; normalize freshness in Nest before filtering. Add a strictly allowlisted `attentionOnly=1` GET option to `/api/v1/status`; the web page computes its filtered list from the same validated full snapshot so its global headline never hides an outage. Android app-api rejects invalid filters and unverified 200 responses, without widening database permissions.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, TypeScript, Vitest.

**Spec:** Bounded design: attention = any normalized status whose state is not `operational` (including unknown due to stale observations); default unfiltered behavior unchanged. No migration, no ledger writes, no production rollout without exact-SHA gates.

## Tasks
- [x] Add failing Nest controller/service tests: attentionOnly=1 returns only non-operational, stale is unknown, invalid/duplicate params reject 400.
- [x] Implement strict query parser and filter after PostgreSQL SECURITY DEFINER normalization.
- [x] Add failing web tests for attention-only selector and unfiltered global headline; implement accessible GET filter and explicit empty vs unavailable state.
- [x] Add failing Android gateway tests for invalid filter, unverified filtered 200, and positive verified filtered 200; implement fail-closed proxy checks.
- [ ] Run focused tests, full lint/typecheck/build/unit/integration, actual PostgreSQL read as app role, security/accessibility/SEO/app-api checks, exact SHA CI, official Test E2E; record blockers and release HOLD as appropriate. Local gates executed; full backend baseline failures and Test/CI/release gates BLOCKED.
