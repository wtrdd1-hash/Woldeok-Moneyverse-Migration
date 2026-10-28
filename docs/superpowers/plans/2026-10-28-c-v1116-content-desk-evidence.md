# Content Desk Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stop admin content management from mistaking failed/invalid reads for verified empty lists.

**Architecture:** Keep NestJS/DB endpoints and auth unchanged. Validate three independent read feeds on the Next.js server and fail closed per section. Render safe alert and retry link, with bounded coverage disclosure.

**Tech Stack:** Next.js SSR, TypeScript, Vitest, NestJS, PostgreSQL.

- [ ] Write SSR/validator red tests in `frontend/src/app/admin/content/content-evidence.test.tsx` and `content-evidence.test.ts`.
- [ ] Run red tests; prove incorrect empty-state and malformed data acceptance.
- [ ] Add `content-evidence.ts` strict response validators for backend camelCase announcements and snake_case photo rows; use in `page.tsx`.
- [ ] Run focused tests green; run full gates; keep original contracts.
- [ ] Verify branch, latest main, create Draft PR, preserve on any failing gate.
