# Backend B v557 — Club charter ledger/idempotency P0

## Before work (2026-10-26 15:35 KST)
- Base main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Branch: `auto/hourly-b-club-charter-ledger-v557-20261026-1535`.
- P0 source: #1396; migration 222 directly updates balances before an ignored ledger transaction conflict and writes no postings.
- Read AGENTS, README, English/Korean living plans, open PRs #1417/#1418/#1419/#1420, QA #1412, latest CI, and other developer work. Do not edit other worktrees.
- Plan: add forward-only migration 280 with key-serialized, actor/payload-bound immutable receipt; use canonical balanced ledger primitive for charter fee; test replay, changed payload, insufficient balance, concurrency, and app privileges against disposable PostgreSQL. Fail closed on unrelated unsafe project contribution until ledger settlement is implemented. No shared DB writes.
- Release gates: main merge and Test/Production prohibited unless full tests, audits, isolated exact-SHA Test and GitOps pass.

## In progress
- [ ] RED regression evidence.
- [ ] Migration and regression tests.
- [ ] Local verification and PR review.

## Finished
- Pending.

### In progress checkpoint (2026-10-26 15:39 KST)
- RED: absent migration failed new Vitest regression suite; GREEN: 3 static ledger/replay/ACL tests passed.
- New forward-only migration 280 adds actor/payload-bound immutable receipt, key advisory lock before replay, balanced canonical ledger posting and transactional club creation. Legacy unposted keys refuse reuse. Unposted club project contributions fail closed (no false successful funding).
- Isolated PostgreSQL 17.11: all 279 SQL migrations (002..280) applied; 236 public tables. Synthetic app-role replay/role/rollback fixture passed after correcting its expected SQLSTATE and legacy hash. 100 concurrent requests using pgbench (20 clients, 5 calls each) all passed, exactly 1 club, 1 ledger transaction, 2 postings and 10,000 WLD debited once. Re-testing final bytes after additional sink/rollback assertions pending.
- Main mid-run fetch unchanged. No shared DB writes, no other worktree modifications.

## Finished — candidate / release HOLD (2026-10-26 15:51 KST)
- Start/mid/final authoritative main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; no main advance during this task. No merge.
- Code: forward-only migration 280; immutable `club_charter_receipts` key/actor/normalized payload/ledger linkage, key advisory lock before replay, legacy unposted-key refusal, two balanced 10,000 WLD postings through `economy_post_transaction`, atomic club/member/project creation. Direct app INSERT/DELETE on clubs and project funding writes revoked; app may still update only `clubs.member_count`. Unsafe legacy project contribution function fails closed. Wallet displays named charter/project transaction types.
- API/DB contract: `club_create(uuid,text,text,text,text,text,uuid)` signature and result unchanged; same-key same-payload returns same club; same key different actor/payload fails; insufficient balance and duplicate tag roll back all writes. `club_contribute_project` returns SQLSTATE 55000 until independent ledger-first fix. No applied migration edited.
- RED: migration absent test failed; wallet ledger-label test failed on `SINK_CLUB_CHARTER` before mapping. GREEN: static 3/3, wallet label 29/29, Backend 1314 PASS/398 SKIP, contract 38 PASS, DB 18 PASS/5 SKIP (CI-only PG tests skip locally), Typecheck PASS, Lint PASS (0 errors/1128 warnings), full Build PASS after isolated offline install, API contract 179 endpoints PASS, bot 8/8 PASS, repository security/control bytes/Prisma checks PASS.
- Disposable PostgreSQL 17.11 with no network or host port: 279 migrations (002..280) PASS, 236 tables; actual app-role SQL fixture verified same-key replay, changed payload/actor, insufficient balance, duplicate-tag rollback, legacy-key refusal, receipt immutability and least-privilege ACL. 100 requests with 20 concurrent clients: 100/100 PASS, 1 club, 1 ledger tx, 2 balanced postings, exactly one 10,000 WLD debit. Disposable containers removed. CI-only fixture + 100-concurrency Vitest added; they must pass in GitHub CI before merge.
- Blockers: Frontend 1397 PASS / 6 FAIL (SEO 3, mobile login 1, calculator signup 1, admin M2 1). Production audit High 2; full audit Critical 2/High 10/Moderate 11/Low 3. Official Test exact-SHA authenticated DB/core flow/E2E and GitOps release gates NOT run. Production HOLD.
- Coordination: A PR #1418 touches club listing/member pagination; B changes SQL charter settlement and wallet label, not A's files. C/QA need to treat project contribution as disabled and not show fake success. No branch cleanup, other developer worktrees untouched, reservations unchanged.
- Worklog final commit SHA is recorded by the PR head; documentation changes are not counted as implementation success. Main merge, Test deployment and Production promotion: NONE.
