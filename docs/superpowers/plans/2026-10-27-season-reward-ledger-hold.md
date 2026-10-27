# P0 #1507 — Season reward ledger containment plan (B v577)

## Scope and choice

QA v1312 reproduced a structural failure in migration 231: `season_claim_reward` credits `USER_CASH` directly, optionally debits SYSTEM, and writes no balanced postings. It may mark a claim complete even when the ledger transaction conflicts. No historical loss is established. A correct atomic, funded, actor-bound and replay-safe payout requires a separate reviewed design and cannot be assumed from a simple API patch.

For this bounded containment cycle, suspend **only** season reward claims at three boundaries (SQL, NestJS, Next server action/UI). Preserve read-only season information and unrelated event consumption. Keep applied migration 231 immutable, use forward-only migration 281, and make SQL role revocations explicit. Migration 280 from unmerged Draft PR #1481 is included verbatim solely to satisfy contiguous migration ordering; it is a **stacked dependency**, not independently authored functionality. PR must remain Draft/HOLD and be rebased after #1481 merges.

## Implementation and verification

1. Reproduce with RED tests: repository, service, controller, SQL migration and rendered claim banner. Do not treat mock service success as ledger evidence.
2. Introduce a typed HTTP 503 `SEASON_REWARD_LEDGER_UNAVAILABLE` at controller and repository; keep session/consent/CSRF guard annotations.
3. Add forward-only SQL function replacement that raises SQLSTATE 55000; revoke PUBLIC/app EXECUTE and app direct claim DML. Never update balances or synthesize ledger postings.
4. Disable Next server action and claim CTA; present earned but not-yet-paid reward with an explicit hold message.
5. Verify isolated PostgreSQL 17.11 synthetic fixture: privileged SQLSTATE 55000, app role 42501, read-only SELECT, 100 parallel rejected claims, unchanged balance/postings, repeated migration application, and migration 280+281 coexistence.
6. Run focused and full tests, typecheck, lint, default build, API contract, security scans, bot tests and audits. Record all failures and skipped tests. Check main before PR and before any merge. No Test/Production promotion unless all release gates pass.

## Unblock criteria (future separate work)

Implement a source-account-funded `economy_post_transaction`-equivalent atomic transfer and immutable claim receipt keyed by actor, season and request payload; prove 100-way concurrency, key replay and key conflict, missing funding account, insufficient funds, transaction abort/retry, exact postings/outbox/balance equality, app least privilege, historical reconciliation, independent restore and authenticated official Test exact-SHA E2E. Restore UI only after all are verified. No migration 231 checksum rewrite.
