# Production journal privilege containment — v2026.10.18.804

## Before work
- Operate in isolated two-disk worktree based on exact current main; another worker is editing the banking API PR #931, avoid its paths.
- User authorized Production promotion and defect repair, not fabricated ledger balancing or permission bypass.
- Read AGENTS, PROJECT_PLAN + INTEGRATED_PLANNING_MASTER, documentation policy, 2026.10.16 v713 finance blueprint, v737/790 financial gate and RELEASING before this change.
- Production v717 live read-only ACL inventory: moneyverse_app has INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN on two immutable public.ledger_transactions/ledger_postings tables, unlike isolated v761 Test. Production source v717 and latest main application dist/source contain ledger tables for SELECT/JOIN only; no direct INSERT/UPDATE/DELETE/TRUNCATE for them was found. Other 3 protected tables retain unsafe DML and 19 account opening/projection differences +4,779,188 WLD.
- Scope: revoke direct write/maintenance rights **only on the two immutable core journal tables**, retain SELECT and EXECUTE on owner-scoped ledger functions. Test in disposable isolated DB before any Production ACL DDL. Record no member monetary writes. Do not change direct app grants on accounts/balances/vaults until other writers are migrated.

## Midpoint
- RED: new database migration regression failed because migration 277 was absent. GREEN: added immutable numbered 277; focused database tests 7 passed; full database package tests 9 passed, 3 skipped.
- Verified independent v753 Production snapshot SHA256 `4e495fb18bc9bd811a35853f8a3a734463a68034931635e7aac4f0fedf8a60ae`.
- Restored **SCHEMA AND ACL ONLY, NO MEMBER DATA** from that backup to disposable PostgreSQL 17 Test database `wdmv_v804_ledger_acl`, never running an app against it. Baseline showed app could UPDATE postings and TRUNCATE transactions. Migration execution PASS (BEGIN / REVOKE / GRANT / COMMIT); after migration app SELECT=true, INSERT/UPDATE/DELETE/TRUNCATE=false on both tables. Replaying migration also PASS.
- Core journal definer function remains owner `moneyverse_migrator` with `prosecdef=true`, and the app deliberately lacks direct EXECUTE on the broad core function (scoped callers retain their own function boundaries). No general money mint/grant was introduced.
- Scanned actual running Production v717 dist and current source for direct SQL DML on the two ledger tables: none observed, only SELECT/JOIN; keep this scoped independent of account/balance/treasury-vault writers.


## Verification checkpoint
- Full `pnpm test` exit 0: root 14 pass, contracts 31 pass, database 9 pass/3 skipped, backend 1,257 pass/396 skipped, frontend 1,268 pass. `pnpm typecheck` and `pnpm lint` exit 0 (inherited frontend lint warnings 1,068; 0 errors). `git diff --check` pass.
- Production ACL untouched pending GitHub PR/CI approval; actual v753 Production SCHEMA+ACL isolated clone used for live SQL replay and negative privilege evidence, no real member data copied.

## Closing
- PR/CI and actual Production ACL results are recorded after independent approval. Other 3 protected tables and 19 projection drift accounts remain release blockers.
