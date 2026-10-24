# Planning v1246 — Notification provenance/read receipt hardening / 알림 근거·읽음 영수증 보완

**Date / 일자:** 2026-10-25T03:10:52.719554+09:00
**Cycle / 회차:** Previous Feature Addition v1244 → Current Feature Improvement v1246 → Next Feature Addition v1248 (provisional / 잠정).
**Result:** PARTIAL / DRAFT / RELEASE HOLD. Documentation-only; no runtime code, DB mutation, WLD ledger change, Test/Production deployment or other worker branch touched.

## Evidence / 확인 근거
- miniPC Debian 13.6 services active, PostgreSQL connected; root disk 100% (~594 MiB free at start), data volume ~110GB free. Latest completed QA v1249 FAILED/HOLD.
- Main `c9a868b1e622341e2daa8b936ddf0988eda9988e` verified remotely at start and mid. `AGENTS.md`, `README.md`, canonical main EN/KO project plans and v1244 integrated docs read.
- Main `backend/src/notification/notification.service.ts` direct owner-filtered SELECT with `created_at DESC LIMIT/OFFSET`; `markRead` boolean, `markAllRead` count. Main Next `/api/notifications` array-only validation.
- Development C Draft #1206 head `857d3244243fc8edcafdced09e78308ddca84755` already owns truthful feed UI and BFF validation. GitHub CI `runtime-check` FAILED; no exact-SHA release pass. Keep all C/B/A/QA/Gemini branches intact.
- QA v1249: app UPDATE+DELETE 235/241 tables, 3 PUBLIC bank EXECUTE, migration266 checksum mismatch, four migration280 collisions, Test authenticated exact-SHA E2E/isolated restore absent. No live database writes or test fixtures.

## Decision / 결정
- Do not duplicate C #1206. Improve F675-118 via trusted publisher/source proof, immutable owner read receipts, snapshot-safe cursor, fail-closed finance copy, Android parity, admin aggregates, privacy, SEO/a11y and release gates.
- P0: ENV1246-01 SEC1246-02 REL1246-03 NOTIF1246-04. P1: NOTIF1246-05 NOTIF1246-06 NOTIF1246-07 NOTIF1246-08 NOTIF1246-09 NOTIF1246-10. Tests (100-way concurrency/cross-owner and 10,001 synthetic pagination) are planned only, not executed.
- Independent external reference gate: 0 newly approved, cumulative verified UNKNOWN/10,000, BLOCKED / IN PROGRESS.

## Verification / 검증
- Confirm bilingual backlog ID parity across all six planning documents, diff whitespace, worktree cleanliness after commit, remote main recheck and GitHub PR/issue record. Never claim runtime test PASS from documentation checks.
