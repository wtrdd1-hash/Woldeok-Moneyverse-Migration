# v2026.11.02.1623 — Financial recovery incident investigation / 작업 기록

## START — 2026-11-02 19:34 KST onward
- Operator demands full Treasury/Mint/Central Bank/NPS/KDIC repair. We must avoid fabricated canonical financial settlement, data erasure, and spoofing certificate statuses.
- Read current authoritative `DOCS_INDEX.md`, `AGENTS.md`, `docs/architecture/TREASURY_CORE.ko.md`, earlier v1618/v1622 incident and runtime records, systematic-debugging/TDD/worktree/verification skills. Remote main baseline `3eb1441090cb0602e054908547dcf43bfe4299dd`; running Production application `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`.
- Isolated worktree `fix/treasury-funded-v1623` at `/home/debian/moneyverse-worktrees/v1623-treasury-fund-recovery` created from main. Existing default checkout contains other agent's modified security branch; do not change it.
- Production read-only findings: Treasury legacy events 552/552 missing ledger_transaction_id; SOE dividends 738/744 lack ledger_tx_id; current Treasury account balance 0 WLD; pension fund and welfare escrows each 0; Treasury Core receipts 0. User cash accounts 19, positive 18, total 4,783,802 WLD. Mint account -5,078,810 WLD (not assumed as certified issuance). No mint certificates; one active monetary policy. These observations do not prove historical legitimacy.
- New funded pension SQL322 is deployed but real money movement had not been independently tested. KDIC funds/institution/premium records exist; read ACL on core KDIC tables exists. Anonymous public KDIC admin overview returns generic 503 from BFF, not proof that authenticated admin data fails; never convert unauthenticated errors into financial provenance.
- NO production monetary transfer or ledger mutation permitted for testing. Use fresh read-only production backup, restore to throwaway PG17.11, test real DB-owned commands under app role with balanced ledger and rollback/negative cases. Implement only source-proven defects after TDD RED/GREEN and full gates. Latest main can change due parallel development; reconcile before merge.
- Release gates: isolated real PostgreSQL test, full CI, exact-SHA official Test backend/frontend/cookie checks, audited backup and rollback before zero-downtime Production. Monetary settlement remains blocked for historical items unless unique canonical receipts exist.

## MID
Pending evidence.

## END
Pending factual results.

### MID — 2026-11-02 19:40–19:55 KST
- Fresh Production **read-only** full backup `/srv/moneyverse-data/backups/v1623-finance-20261102/production-fresh.pgdump` SHA256 `030b2bf1a556b140a619a98cd20281e1eaad1094443761d85f0a5acf94aa58a6`, approximately 120MB. Restored in isolated throwaway PostgreSQL17.11 `mv-v1623-finance-pg`; original prod remained untouched.
- Real PostgreSQL funded-NPS acceptance: eligible existing *WLD* cash holder funded 1000 WLD, got 1000 escrow balance and 1000 cash debit; replay with same key made no duplicate; withdrawing 1000 returned 950 WLD to wallet and 50 WLD to welfare escrow. Fund balance restored, total supply unchanged, two canonical immutable receipts and 2+3 balanced postings. `FUNDED_WITHDRAW_IDEMPOTENT_BALANCED_PASS`. **Only clone money moved; not a Production transaction and does not certify historical 238 pension payouts.**
- Clone negatives `NPS_FUNDING_NEGATIVE_GATES_PASS`: mismatched replay amount, other actor's key, unfunded withdrawal and app raw core receipt UPDATE were all denied.
- Two legacy active USER_CASH accounts use currency `W` (padded) rather than `WLD`, so a strict funded transfer correctly refused these accounts. Do not convert or move old balances without unique provenance proof.
- Source-proven Next BFF defect: KDIC overview/ledger read and NPS funded-position read/contribution/withdrawal all converted Nest HTTP401/403 into generic HTTP503 "ledger unverified". TDD observed 6 read failures, 2 pension-panel failures, 4 funded-POST failures, then preserved 401/403 with stable nonleaking error codes; real 503 still blocks unverified finance. Updated pension UI distinguishes login / authorization from invalid ledger proof.
- Targeted updated frontend suites `23/23` and funded-POST `8/8` PASS (some tests overlap); no payout/issuance hold bypass and no Production DB writes.
- Remaining gates: full typecheck/lint/build/CI, official exact-SHA Test, and safe Production deployment/rollback. No claim that the 552/744 historical entries have canonical proof.
