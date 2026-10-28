# Verified Admin Support Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; evidence-bound RED/GREEN.

## Scope
`frontend/src/app/admin/support/actions.ts` currently returns `void` and silently ignores invalid input, while the UI treats any resolved action as success. Backend `AdminSupportController` already returns `{message}` and `{status}` and guards writes with admin session and CSRF. Do not change SQL grants or schemas.

### Task 1: RED contract tests
- [ ] Add `frontend/src/app/admin/support/actions.test.ts` using mocked `api` and `revalidatePath`.
- [ ] Assert invalid UUID/status/body reject; missing/invalid POST message receipt rejects; mismatched receipt body rejects; missing readback rejects; PUT status mismatch rejects; missing status readback rejects; successful reply/status verify authoritative data.
- [ ] Run focused Vitest and record expected failures.

### Task 2: GREEN server actions
- [ ] Enforce UUID, 2000-character body, allowed status and validated CSRF token.
- [ ] Parse Backend POST message and PUT status receipts, check message ID, sender, body and date.
- [ ] Re-read authorized messages/threads, check exact mutation persisted, then revalidate path; throw on uncertainty.
- [ ] Run focused tests, lint and typecheck.

### Task 3: Integration and release gates
- [ ] Verify admin UI only reports success when action returns after authoritative readback.
- [ ] Execute HEAD exact-SHA build/lint/typecheck/unit/integration/real-PostgreSQL/security/app-api/E2E/CI where possible, mark gaps explicitly.
- [ ] Fetch main and plans again, compare SHA and update branch as needed.
- [ ] Publish English/Korean log and Draft PR; never merge or deploy on incomplete gates.
