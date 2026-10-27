# Planning v1390 — F675-153 Cash Watch Source Attestation / 현금 알림 원천 증명

- Date: 2026-10-28 KST; cycle Previous Addition v1388 / Current Improvement v1390 / Next Addition v1392 (provisional).
- Scope: docs-only continuation of unmerged Draft #1620; development issue #1619; no runtime/DB/WLD/ledger/Test/Production changes.
- Main start/mid b1cd54fda1123fb07ca81b6e5b3ead70f59f556c; AGENTS.md, README.md, canonical English PROJECT_PLAN.md and Korean equivalent checked; remote GitHub PRs and QA reviewed.
- Source: wallet.service overview Promise.all two independent queries; wallet.repository balance and recent ledger are separate, timestamps not commit sequence; wallet cash/bank split; DEV read-only aggregate USER_CASH accounts 19, moneyverse_app account_balances UPDATE TRUE. QA #1507 season_claim_reward structural unbalanced cash write; no historical loss proven.
- Decision: do not use wallet overview or updated_at as verified source; require finance-owner attested monotonic source version, owner-bound reconciliation proof, fail-closed gaps, fresh baseline, transactional generation fencing and idempotent notification receipts. Complete contracts in integrated master EN/KO.
- Backlog P0: ENV1390-01, SEC1390-02, REL1390-03, CASH1390-04. P1: CASH1390-05, CASH1390-06, CASH1390-07, CASH1390-08, CASH1390-09, CASH1390-10.
- QA v1329 reviewed; main migration 283 duplicate, DEV broad DML, missing Test/Production release targets; exact-SHA official Test and independent restore not verified. Synthetic 10,001/100/100 tests NOT RUN.
- External evidence newly approved 0; cumulative independently deduplicated accepted UNKNOWN/10,000; BLOCKED/IN PROGRESS.
- Release HOLD, feature OFF, no merge or deployment; GitHub Draft PR #1624 opened; final SHA recorded in miniPC completion log.
