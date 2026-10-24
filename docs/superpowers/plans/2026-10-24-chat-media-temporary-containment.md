# Chat Media Owner-Authorization Gap — Temporary Containment Plan

> **For agentic workers:** Follow test-driven development, isolated worktree, and verification-before-completion. This plan is a bounded emergency containment, not the final F675-105 evidence vault.

**Goal:** Prevent the existing chat/support image upload + media routes from issuing or serving private object URLs without durable owner/recipient authorization.

**Architecture:** The current shared endpoint has no durable upload-to-owner/recipient association, and media GET uses a public immutable cache. There is no sound way to distinguish private support from general chat images on existing objects. Until a forward-only owner-scoped schema and legacy link inventory are reviewed, reject all new uploads (503) and all media GETs (404) without reading stored bytes. Return `private, no-store` on denied media. Preserve text-only support and direct chat; the existing client already displays a non-successful upload response as an error. Existing images become unavailable during containment. Never delete existing files.

**Tech Stack:** NestJS, Vitest, TypeScript; no DB migration or Production data writes.

**Source:** GitHub issue #1037 and English/Korean living project plans (F675-105 v1192/v1194). Existing route: `backend/src/content/chat-upload.controller.ts`.

## Global Constraints
- Do not change main, other agents' branches, applied migrations, real DB, Test or Production.
- No raw object keys in new successful responses, no image bytes to unauthenticated or wrong-owner clients.
- No backend-only fake success: every upload must return a real error; text chat stays functional.
- This is a feature-availability reduction pending durable owner ACL and E2E; issue #1037 remains open.

## Tasks
1. Add RED tests to `backend/src/content/chat-upload.controller.test.ts`: uploads reject before storage; existing legacy media key rejects without reading disk and emits `private, no-store`.
2. Run targeted test and capture failing assertions; only then remove unsafe upload/media implementation, retain route paths and upload authentication/CSRF guard.
3. Run targeted tests GREEN, full lint/typecheck/build/test, dependency audit and API contract. Record PASS/FAIL/SKIP distinctly.
4. Re-fetch main and planning; review diff and overlaps; create Draft PR with explicit text/image availability impact, Test exact-SHA and release HOLD. Do not merge or deploy without full gates.

## Review Focus
- Legacy URLs and browser cache copies cannot be retroactively revoked.
- Rejected multipart requests must not reach antivirus/storage or report upload success.
- GET must not read the filesystem or leak whether a key exists.
- Text-only chat must remain unaffected.
- Authenticated owner, admin, and unrelated member must all receive denial until durable ACL exists.
