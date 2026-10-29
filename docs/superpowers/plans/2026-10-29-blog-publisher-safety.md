# Verified Blog Publisher Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans, test-driven-development, systematic-debugging and verification-before-completion. Steps use checkboxes.

**Goal:** Remove a legacy unverified JSON publisher which falsely marks generated finance posts as reviewed, and give administrators an honest read-only view of the actual verified backend publisher status.

**Architecture:** Preserve the existing authenticated `GET /api/admin/blog/publisher-status` BFF, whose backend source is `GET /api/v1/admin/blog-verified/publisher-status` backed by the verified publisher repository. Retire the old `POST /api/blog/generate` file writer even for cron/admin callers. The admin client may refresh the real backend status but cannot create an unverified post; preserve existing moderation table.

**Tech Stack:** Next.js 16 App Router, React 19, Vitest, NestJS verified blog controller, PostgreSQL verified publication repository (read only).

## Task 1 — RED baseline and endpoint retirement
- [x] Reproduce four existing failing frontend tests on clean origin/main (`test/baseline-red.log`, 4 FAIL).
- [ ] Replace `frontend/src/app/api/blog/generate/route.ts` with 403 unauthenticated, 503 authorized retired publisher, and read-only admin GET; no disk writes or fabricated publication receipts.
- [ ] Verify `route.test.ts` GREEN and ensure unauthorized cannot query internal status.

## Task 2 — Truthful admin status UX
- [ ] Replace synthetic publish controls in `frontend/src/app/admin/blog/admin-blog-client.tsx` with initial pending state, actual refresh from `/api/admin/blog/publisher-status`, failure state, and a disabled/unavailable manual publish explanation.
- [ ] Verify `admin-blog-client.test.tsx` GREEN and publisher-status BFF contract test.
- [ ] Preserve the existing moderated article listing and accessibility labels.

## Task 3 — Regression and release evidence
- [ ] Verify frontend full tests, lint, typecheck, build, backend/DB/bot/app-api/security/SEO/a11y; record exact SHA.
- [ ] Re-fetch main and living EN/KO plan mid-run and pre-integration.
- [ ] Publish Draft PR and evidence, hold merge/release if official exact-SHA Test, ledger integrity, privilege/migration parity, backup restore, or CI is blocked.
