# KDIC source truth implementation plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Tasks use RED–GREEN–REFACTOR and final SHA evidence.

**Goal:** Stop fabricated virtual WLD statutory insurance and unverified protection claims across Nest, Next and Android.
**Architecture:** Fail-closed public/owner Nest GET; independent app-api gateway protection; static accessible source-hold UI, no finance writes.
**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL read-only diagnostics.
**Spec:** `docs/worklog/2026-11-01-kdic-source-truth-v1258.md`.

- [x] Establish clean isolated branch at fetched main, inspect A/B/QA PRs and current source.
- [x] Write Nest/web/Android failing tests and reproduce legacy false success (RED).
- [x] Implement Nest 503, Android 503, mobile/a11y web source hold (GREEN).
- [ ] Verify exact final SHA: full lint/typecheck/build, unit/integration, isolated PostgreSQL, security, HTTP, required CI and authenticated E2E.
- [ ] Merge only after all required gates PASS; verify merged SHA in official Test, then gated Production and rollback evidence.
