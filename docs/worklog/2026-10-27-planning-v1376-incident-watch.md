# Planning v1376 — F675-151 Verified Incident Watch (2026-10-27)

**START:** 22:08 KST, Debian 13.6 miniPC connected; Superpowers connector returned empty, local using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification-before-completion read. Source-of-truth main AGENTS.md, README.md, PROJECT_PLAN.md (EN), PROJECT_PLAN.ko.md (KO). **MID:** main 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c unchanged. Previous Feature Improvement v1374 → Current Feature Addition v1376 → Next Feature Improvement v1378 provisional.

**Scope:** Design-only F675-151 per-incident explicit watch, dependent on approved F675-150 incident revisions and F675-149 real owner-safe in-app notification. Issue #1583. No runtime code, DB migration, WLD/ledger, Test, Production or automation mutation. Development A/B/C/Gemini/QA own their runtime changes. Isolated branch docs/planning-v1376-verified-incident-watch based on v1374 SHA 4f441fa3614387acfba1ed0bbe6787fa892c0740; stacked unmerged PR #1578, do not merge independently.

**QA evidence:** v1324 21:28 KST main root FAIL due migration 280 duplicate, DB 19 PASS/1 FAIL/3 SKIP; full audit Critical 2/High 8, bot Critical 1/High 5. Test and Production symlinks dangling; active services do not prove official release identity. Exact-SHA official Test and independent restore NOT VERIFIED; Production BLOCKED. Root 44%/data 55% at start. Proposed 10,001 synthetic/100 concurrent/100 forged tests NOT RUN. External newly accepted 0, cumulative deduplicated approved UNKNOWN/10,000, BLOCKED/IN PROGRESS.

**Backlog:** P0 ENV1376-01 SEC1376-02 REL1376-03 WATCH1376-04; P1 WATCH1376-05 WATCH1376-06 WATCH1376-07 WATCH1376-08 WATCH1376-09 WATCH1376-10. Acceptance and rollback defined in integrated master EN/KO. **Verification:** diff check, six-doc EN/KO backlog parity, clean worktree after commit, remote SHA/PR checks required. Release HOLD.

**GitHub:** Issue #1583 OPEN; stacked Draft PR #1584 OPEN, base #1578, do not merge independently.
