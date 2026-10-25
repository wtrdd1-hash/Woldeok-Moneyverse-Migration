# Owner-private recent work receipt CSV — implementation plan

**Scope:** Add a bounded export for the existing 20 most recent work reward receipts; never claim complete lifetime history or verified settlement when transaction_id is absent. This is a P1 member-facing read-only feature. English is canonical; Korean is a second-language UI.

**Dependencies:** Existing immutable `095-work-task-board.sql` SECURITY DEFINER `work_my_receipts(p_actor)` with owner filter and LIMIT 20; do not modify applied migrations, ledger or privileges.

1. RED: Add controller tests for owner-only selection, bound and fail-closed DB errors; add frontend CSV tests for private headers, formula injection, big integer, missing ledger references, malformed upstream, authorization and exact recent-20 scope; add app-api gateway test for authenticated route forwarding.
2. GREEN: Add Nest `GET /api/v1/work/receipts/export` using the existing owner-filtered repository; enforce `recent_20` scope, 20-row maximum and private headers. Add Next same-origin CSV endpoint with validation, escaping, no-store/noindex. Add visible keyboard-accessible export CTA and explicit 20-most-recent/transaction-reference disclaimer. App gateway uses existing `work` route family.
3. REFACTOR/VERIFY: Focused tests, contract, typecheck, lint, build, full suites, isolated PostgreSQL owner ACL, security, accessibility/SEO, Test exact SHA and CI. No merge/production without all required PASS.
4. Record start/mid/end SHA, branch/PR counts, changed files, failures, Test/Production/rollback and retained branches in QA/release/worklog. Keep candidate Draft/HOLD if gates fail.
