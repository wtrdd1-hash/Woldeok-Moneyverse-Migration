# Planning v1328 — F675-139 Member Support Draft Recovery
- Draft PR / 기획 초안: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1457 (stacked on #1452; no main merge). Engineering issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1456

- 2026-10-26 21:10–21:xx KST; Previous Improvement v1326 / Current Addition v1328 / Next Improvement v1330 provisional.
- Main 0fe614b2ca1a7bc0df540514e54db78130479e2a changed after v1326; reviewed main AGENTS.md, README.md, English canonical and Korean PROJECT_PLAN, support/page.tsx, support/actions.ts, support.controller.ts and Migration196. Draft PR #1452 unmerged. New v1328 docs branch stacked on it; latest main reconciliation and independent merge remain BLOCKED.
- Evidence: plain support forms submit immediately; no server-side member draft. F675-139: explicit owner-only Save/Discard/Send for new inquiries/replies, no autosave or localStorage; version CAS, retained tombstone, original idempotency receipt, atomic actual support message send and audit, fail-closed 503/unknown commit. Proposed 30-day expiry, 20 live draft cap require privacy review.
- P0 4/P1 6: ENV1328-01 SEC1328-02 REL1328-03 SUP1328-04 SUP1328-05 SUP1328-06 SUP1328-07 SUP1328-08 SUP1328-09 SUP1328-10. Root 98% ~2.4GiB; data 90% ~21GiB. Latest completed QA v1299 pertains old main (test/audit fail), not new exact-SHA QA. DB grants, migration266, authenticated Test and isolated restore require fresh evidence. Production RELEASE HOLD.
- External independent reference gate: new approved 0, cumulative deduplicated/classified approved UNKNOWN/10,000, BLOCKED/IN PROGRESS.
- Nine docs-only files, EN/KO planning parity and worklog; no runtime code, DB, WLD, ledger, Test, Production or other workers' worktree modifications.
