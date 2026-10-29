# Planning v1404 — F675-157 verified support unread receipts

## 2026-10-28 10:12 KST — Planning v1404 / F675-157 (Feature Addition; DRAFT/HOLD)
- Previous Improvement v1402 / Current Addition v1404 / Next Improvement v1406. Latest main `a28bed9aa40ff74d492824ae12892a7d52132fdd` start/mid. GitHub issue #1669. Verified source, DEV aggregate/ACL, QA v1337 and runtime version; no private member content exported.
- Design: owner-only support new-admin-reply count, explicit read-through-message receipt, ordered sequence, legacy baseline, no GET mutation, Android parity, noindex/no-store, P0/P1 and Test/rollback gates. `ENV1404-01 SEC1404-02 REL1404-03 SUP1404-04 SUP1404-05 SUP1404-06 SUP1404-07 SUP1404-08 SUP1404-09 SUP1404-10`.
- Source-only: no runtime/DB/finance/Test/Production writes. Tests specified not run. QA v1337 and #1663/#1661/#1660 remain HOLD; Test exact SHA, independent restore, Production release unverified. External approved 0 new, cumulative UNKNOWN/10,000 BLOCKED.

**Detailed spec:** [English](../planning/INTEGRATED_PLANNING_MASTER.md) / [한국어](../planning/INTEGRATED_PLANNING_MASTER.ko.md).

### GitHub / verification finalization (2026-10-28 10:14 KST)
- Draft PR #1670 OPEN against main, issue #1669 OPEN; initial pushed commit `a1df79023da2b9e634673eba43de7a8e7048faec`.
- Start/mid/final main `a28bed9aa40ff74d492824ae12892a7d52132fdd`. Six bilingual doc pairs contain all ten backlog IDs; docs-only diff check PASS. PR release-input check SUCCESS; classify/verify checks IN PROGRESS at observation. No main merge, runtime tests, official Test, backup restore or Production promotion.
- Independent 10,000-source approval gate remains BLOCKED / IN PROGRESS: newly approved 0, cumulative UNKNOWN.
