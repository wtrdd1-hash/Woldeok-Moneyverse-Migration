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
