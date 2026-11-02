# v2026.11.03.1626.6 — Financial legacy reset: verified real Production execution

## START / 2026-11-03 08:09 KST
User reaffirmed the existing permission to reset affected legacy finance data and required actual operation and Production promotion. Read merged DOCS_INDEX, AGENTS, Master Treasury Core, SQL325–328 and financial incident notes. GitHub main remained `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`, PR #2545 merged and CI 41473508960 SUCCESS. Production initially served backend/front at `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, with 552 Treasury, 744 SOE dividends, 238 old pension payouts active; Test pointer and identity mismatched due to overlapping systemd drop-ins. Dedicated release worktree and prior candidates kept separate from other contributors.

## MID / official Test
Exact merged main backend+frontend build and immutable Test release `test-v2026.11.03.1626-f5c3fbedae1c`. The initial Test cutover failed and safely rolled back because stale overlay environment files supplied a different SHA. Inspected effective systemd drop-in precedence, reconciled last effective Test SHA and atomic release pointer. The second corrected Test task `v1626-final-test-pointer` passed `verify-host-runtime-identity` with `ok:true,failures:[]`; public Test backend and frontend SHA identical, Treasury HTTP200.

## MID / actual Production DATA reset
- Full live pre-reset Custom pg_dump saved at `/srv/moneyverse-data/backups/v1626-finance-reset-20261102/prod-final-before-reset.pgdump`; SHA256 `67aa7851e7cf866a4fa2439c54622d8fc1a2c02430c6745f45b9b7b99fb00559`. `pg_restore --list` successful; earlier 121/122 MB backups retained separately. Versioned backups, archive, and Nginx rollback config retained.
- Executed `v1626-prod-reset-apply.sh f5c3fbed...` by explicit owner authorization. PostgreSQL migration 325–328 installed with exact checksums and explicit serializable `finance_legacy_reset_v1626(verified_backup_sha256)` committed.
- `V1626_PRODUCTION_RESET_AND_CANONICAL_PRESERVATION_PASS`: **1546** original uncertified model rows archived with JSON payload + per-row SHA256; **0 archive SHA mismatches**. Active old Treasury 552→0, SOE dividends 744→0, pension payout 238→0. Archived history still independently reconciles Treasury 552/552, SOE 744/744 with `invalid_new_sources=0`.
- Preserved canonical monetary invariants: `ledger_transactions=891`, `ledger_postings=1829`, 19 `USER_CASH` accounts, total account balance 0 WLD both before and after. No member money was moved or new currency minted during Production reset. KDIC unbacked model fund reset to zero.

## MID / actual Production APP promotion
- Staged immutable `prod-v2026.11.03.1626-f5c3fbedae1c`, ran independent canary backend port 4214 / frontend 4215, verified health and route responses. Former v1624 backend/frontend 4204/4205 retained active for rollback.
- `v1626-prod-zero-downtime` task exit code 0: `V1626_PRODUCTION_CUTOVER_PASS f5c3fbed...`. Nginx syntax PASS, backend and frontend public exact main SHA, `verify-host-runtime-identity --channel prod` `ok:true,failures:[]`.
- Public `/`, `/status`, `/admin/kdic`, `/admin/pension`, `/admin/enterprises`, `/admin/treasury`, `/api/treasury/overview` each HTTP200. Anonymous KDIC overview/integrity and funded NPS position correctly HTTP401. Public Treasury reports RECONCILED, 0 WLD. New member WLD Treasury donation function was separately tested in restored Production PostgreSQL with balanced two-entry 1000 WLD and idempotency; *no real Production donation created*.

## END — scope and unresolved blockers
**Fully verified**: old uncertified financial-model active-data reset, originals retained in verified archive+backup, canonical ledger/member accounts unaltered; read-only Treasury reconciliation, actual main CI/Test/Production release identity and HTTP smoke.

**Not yet operational due to no spendable supply (all 0 WLD)**: historical/basic pension hourly payments, SOE dividend settlement, KDIC premiums/loans/payouts, and Mint/Central Bank issuance certification. Backend intentionally continues monetary settlement holds (HTTP503) until new funded journal-backed paths and approval policies exist. Do not claim these payments succeeded, bypass guards, or introduce fabricated provenance. Logged-in administrator click-through / member donation UI click-flow was not independently confirmed. See P0 issue #2366 and merged PR #2545.

Source/UI and production release are separate audit subjects; recorded for Gemini/multi-agent collision avoidance. All operations were direct foreground commands or mv-task jobs, not promised future work.
