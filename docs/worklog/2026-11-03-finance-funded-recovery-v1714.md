# v2026.11.03.1714 — Actual finance code remediation

## START — 2026-11-03 17:00 KST
Owner requests functional finance recovery, not another read-only incident explanation. Dedicated miniPC worktree and separate branch created from latest merged main. No other contributor workspace modified.
Read DOCS_INDEX (integrated master first), AGENTS, Treasury Core, finance v1626.6/v1713 incident, release rules, and open P0 #993/#2366. Baseline Production SHA 07fa93a; canonical 891 transactions/1,829 balanced postings, 42 exact accounts, member 4,841,510 WLD, Treasury and funded NPS 0. Archived legacy finance 1,546 hashes valid.
Active operational goals:
1. Identify and repair unauthorized app-role direct account_balances UPDATE boundary with isolated PostgreSQL access and real caller regression.
2. Implement only genuinely financed features from canonical Treasury/NPS accounts, and distinguish unfunded state from permission/transport failure.
3. Test source/real database, integrate current main without trampling concurrent agents, exact-sha Test and zero-downtime Production only on successful gates.
Do not create synthetic money, disable CSRF, forge receipts, remove ledger holds without funded atomic payment, or claim untested monetary features restored.

## MID — IN PROGRESS
- [ ] Trace exact ACL cause & runtime uses
- [ ] Select isolated smallest implementable fix and TDD
- [ ] Real DB positive/negative safety tests
- [ ] Test and release identity proof

## END — PENDING

## MID — isolated PostgreSQL evidence (2026-11-03 17:40 KST)
- Restored a 122 MB v1701 Production database backup into a NEW network-isolated PostgreSQL 17.11 container named mv-v1714-finance-clone. The original production DB, official Test DB, and the parallel v1701 worker container were not modified.
- Original records on the clone: 891 canonical transactions, 1,829 postings, 42 account balance rows, 1,546 immutable finance archive entries. Reproduced prior broad app-role table grants on the clone only.
- Applied v1701 SQL329 followed by v1714 SQL330 on the clone: both committed successfully. Post-apply effective privileges for moneyverse_app on accounts/account_balances INSERT/UPDATE are false, and account balance SELECT remains true. A real session SET ROLE moneyverse_app SELECT count(*) succeeds (42 rows).
- Independent read-only checks on the clone: 0 unbalanced transactions, 0 mismatched account balances, 0 archive SHA256 mismatches; USER_CASH + USER_BANK combined 4,841,510 WLD, unchanged.
- Local Node.js source regression: 4 tests passed; git diff --check clean. Explicit UPDATE permission-denial SQL call was blocked by tool safety review, therefore the runtime negative-call test is NOT claimed as passed; effective privilege check is passed instead.
- No real Production ACL, member-money, issuance, session, or service change. Parent finance-integrity PR #2632 remains draft/unmerged; v1714 is a dependent SQL330 layer.

## MID — scoped database verification completed
- Committed source SQL330 follows SQL329, not a replacement for the other worker's independent finance integrity PR.
- v1714 SQL read-only assertion was executed against network-isolated restored Production DB; output: FINANCE_ACL_V1714_VERIFIED accounts=42 member_wld=4841510, transaction mismatch 0, account drift 0 and effective app account DML denied. No SQL grant has changed on Production.
- Backend/frontend authenticated money flows remain untested. The official Test and Production releases must not be called completed.
