# 2026-10-25 — Planning v1282 F675-127 Status and Snapshot Integrity

**Cycle:** Previous Feature Addition v1280 → Current Feature Improvement v1282 → Next Feature Addition v1284 (provisional). **Result:** DRAFT / RELEASE HOLD; planning only.

## Evidence
- Debian 13.6 miniPC services ACTIVE, dev PostgreSQL connected. Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` checked start/mid. Authority: AGENTS.md, README.md, canonical English PROJECT_PLAN.md and Korean counterpart. Isolated sparse docs worktree based on unmerged Draft #1324; QA/Development A/B/C/Gemini untouched.
- Source: `packages/database/migrations/196-user-admin-support-chat.sql`, `backend/src/support/support.repository.ts`, `backend/src/support/support.controller.ts`, `backend/src/core/db.ts`, `backend/src/core/with-transaction.ts`. Identified idempotency check-before-insert race, no-op status audit, unconditional status/last_message_at update, timestamp regression under contention, and unpinned Queryable export snapshots. These are design risks, not proven Production incidents.
- Corrective contract: versioned admin status idempotency, thread row lock before timestamp and event_seq, atomic message/status/audit, pinned read-only REPEATABLE READ and immutable owner-scoped snapshot for cross-request consistency, no silent truncation, HMAC cursor/redaction invalidation, Android/Next parity, WCAG/SEO/privacy, staged feature-off rollback.
- Latest completed QA v1275 (20:24 KST) FAILED/HOLD: exact-main frontend 1397 PASS/6 FAIL, dependency audits FAIL, route ledger integration missing inventory, DB ACL/migration 266, no authenticated exact-SHA Test finance E2E/isolated restore; root 98%/2.5GiB. No release promotion.
- Backlog P0 ENV1282-01 SEC1282-02 REL1282-03 SUP1282-04; P1 SUP1282-05 SUP1282-06 SUP1282-07 SUP1282-08 SUP1282-09 SUP1282-10. Future concurrency/late commit/100 foreign-owner/10,001-message tests NOT EXECUTED. External references newly approved 0; cumulative verified UNKNOWN / 10,000 BLOCKED/IN PROGRESS.
- Documentation only, no runtime code, DB data, WLD ledger, feature switch, Test or Production changes; no merge.
