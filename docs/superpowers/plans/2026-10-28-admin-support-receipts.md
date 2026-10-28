# Verified Admin Support Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; evidence-bound RED/GREEN.

## Scope
`frontend/src/app/admin/support/actions.ts` currently returns `void` and silently ignores invalid input, while the UI treats any resolved action as success. Backend `AdminSupportController` already returns `{message}` and `{status}` and guards writes with admin session and CSRF. Do not change SQL grants or schemas.

### Task 1: RED contract tests
- [x] Add `frontend/src/app/admin/support/actions.test.ts` using mocked `api` and `revalidatePath`.
- [x] Assert invalid UUID/status/body/key reject; missing/mismatched POST DB receipt rejects; valid DB receipt accepted without depending on oldest-500 message listing; PUT status mismatch and missing authorized status readback reject.
- [x] Run focused Vitest: RED 7/10 then GREEN 17/17, including browser retry and accessibility.

### Task 2: GREEN server actions
- [x] Enforce UUID, 2000-character body, allowed status and validated CSRF token.
- [x] Parse Backend POST message and PUT status receipts, check message ID, sender, body and date.
- [x] Re-read authorized status list and check persistence; rely on DB function reply receipt instead of oldest-500 message history to avoid rejecting legitimate replies. Throw on invalid/uncertain evidence.
- [x] Run focused tests and changed-file lint; typecheck initial Promise mismatch corrected, final run pending.

### Task 3: Integration and release gates
- [ ] Verify admin UI only reports success when action returns after authoritative readback.
- [ ] Execute HEAD exact-SHA build/lint/typecheck/unit/integration/real-PostgreSQL/security/app-api/E2E/CI where possible, mark gaps explicitly.
- [ ] Fetch main and plans again, compare SHA and update branch as needed.
- [ ] Publish English/Korean log and Draft PR; never merge or deploy on incomplete gates.
