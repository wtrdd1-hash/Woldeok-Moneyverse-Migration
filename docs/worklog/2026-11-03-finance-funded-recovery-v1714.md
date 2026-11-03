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
