# Owner security-session HTTP privacy implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent shared-cache, indexer and referrer exposure of authenticated security-session response metadata.

**Architecture:** Keep existing NestJS session/consent/CSRF/reauth guards and repository unchanged. Apply explicit response headers to all four `AccountSecurityController` handlers; prove via route metadata regression tests. Do not add an interceptor or alter global caching.

**Tech Stack:** NestJS, TypeScript, Vitest.

**Spec:** `docs/worklog/2026-10-31-b-v693-security-session-privacy.md`.

## Global Constraints
- No new route, DB migration, privilege grant, financial or account write.
- `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` on owner session/event read and revoke responses.
- Preserve existing guards and API shapes. Fail release closed until official Test exact-SHA, authenticated E2E and all CI gates pass.

## Review Focus
- Unauthorized/forbidden responses must not be cached by edge layers.
- Session list contains device/session metadata; no global cache fallback.
- Revocation responses must be private even when no other session is revoked.
- Security event response must not leak referrer.
- Public unrelated endpoints retain their existing policies.

## Task 1 — TDD and implementation
- [x] Add dedicated metadata regression tests for all four owner handlers.
- [x] Capture metadata RED (4 fails) and HTTP guard-denial RED (1 fail).
- [x] Add route metadata plus pre-auth privacy guard to cover guard-denied responses.
- [x] Focused 10/10 PASS including actual HTTP 403 privacy headers.

## Task 2 — Verification and handoff
- [ ] Run repository gates and report actual pass/skip/failure.
- [ ] Re-fetch main and EN/KO plan; verify no conflicting PR changes.
- [ ] Commit/push isolated branch and open Draft PR with RELEASE HOLD.
- [ ] Preserve all existing A/C/QA/Planning reservations and production services.
