# Explicit Direct Message Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development.

**Goal:** A navigation GET to a member's chat must not create a database conversation; only an explicit authenticated member action may do so.

**Architecture:** Keep NestJS session/consent/CSRF-protected POST and PostgreSQL SECURITY DEFINER owner-scoped creation. Replace the server-rendered auto-mutation with a user-submitted server action form, preserving existing conversations. The pre-existing browser composer is owned by B PR #2389 and is deliberately untouched. No new API, migration or money write.

**Tech Stack:** Next.js App Router, React, Vitest, NestJS, PostgreSQL.

- [ ] Test: update `frontend/src/app/chat/chat-page.test.tsx` to prove a new peer GET does not call `mutate` or redirect, but renders an accessible compose entry.
- [ ] RED: run targeted test and capture failing assertion.
- [ ] Implement: `frontend/src/app/chat/page.tsx` renders existing-room navigation or explicit conversation-start form, never auto-opens unknown peer on GET.
- [ ] GREEN: targeted tests, read-integrity regression and responsive/keyboard controls.
- [ ] Check backend POST contract and isolated PostgreSQL chat ownership/security tests without changing grants.
- [ ] Verify HEAD SHA build/lint/typecheck/frontend/backend/unit/contract/security/HTTP/E2E/CI where possible, record exact failures.
- [ ] Re-fetch main and plans; open Draft PR only, keep release blocked unless every gate is green.
