# Planning v1330 — F675-139 Support Draft Send-Intent Integrity (2026-10-26)

**Previous:** Feature Addition v1328. **Current:** Feature Improvement v1330. **Next:** Feature Addition v1332 (provisional). **Status:** DRAFT / RELEASE HOLD.

## Scope and source evidence
- Remote main `0fe614b2ca1a7bc0df540514e54db78130479e2a` checked start and mid; AGENTS.md, README.md, canonical PROJECT_PLAN.md and Korean parity reviewed. v1328 Draft #1457 is stacked on v1326 #1452.
- `frontend/src/app/support/actions.ts`: `randomUUID()` per invocation. `frontend/src/components/floating-support-chat-widget.tsx`: `crypto.randomUUID()` per send; attachments supported but planned drafts TEXT-ONLY.
- `packages/database/migrations/196-user-admin-support-chat.sql`: `support_create_thread` owner-only idempotency replay without original subject/body comparison; `support_add_message` SELECT→INSERT concurrent 23505 risk. No verified Production duplicate incident.
- QA v1301 evidence: 1,423 frontend tests pass, typecheck/lint/build/API contract pass, full audit 2 Critical/8 High fail; production dependency audit clean; development DB 235/241 app DML, 3 PUBLIC bank SECURITY DEFINER functions, migration266 mismatch; exact-SHA official Test/restore unverified. Root 98% (~2GiB) and data 90% (~20GiB).

## Design decisions
- Explicit member Save/Discard/Send/Check delivery; owner-only server drafts, stable send intent, server-calculated versioned canonical payload digest, CAS/ETag, immutable receipt, draft tombstone and unknown-commit recovery; no localStorage PII, no implicit read or send.
- Additive SECURITY DEFINER migration with PUBLIC revoke and strict app role, atomic draft→thread/message→receipt transaction, 23505 same-intent safe recovery, changed-payload conflict. Keep Migration196 immutable and existing widget attachment send behavior.
- Next.js/Android App API parity, CSRF/session/consent/owner, rate limits, private noindex/no-store, WCAG 2.2 AA, redacted k>=20 admin metrics and privacy expiry/export/erasure.
- Acceptance: real isolated PG 100 same-intent + 100 different-intent concurrent sends, 100 BOLA, 10,001 synthetic rows, 23505, crash-after-COMMIT, audit rollback, session/logout, widget attachment, Android and 320px/200% a11y.
- P0: ENV1330-01, SEC1330-02, REL1330-03, SUP1330-04. P1: SUP1330-05, SUP1330-06, SUP1330-07, SUP1330-08, SUP1330-09, SUP1330-10.
- External independent 10,000-source gate: 0 newly approved, cumulative verified UNKNOWN; BLOCKED/IN PROGRESS. No claimed completion.

## Release boundary and handoff
Documentation only. No runtime code, schema/data, balances, ledger, feature flags, Test or Production changes. Implementation belongs to independent developer branch with design review, exact-SHA real Test E2E, restored isolated backup, security gates and authorized GitOps zero-downtime promotion. Reconcile stacked docs with latest main before merge; preserve other workers' branches.
