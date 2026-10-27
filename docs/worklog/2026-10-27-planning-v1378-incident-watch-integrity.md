# Planning v1378 — F675-151 Watch Revocation/Delivery Integrity (2026-10-27)

**START** 23:01 KST miniPC Debian 13.6 connected; Superpowers connector returned no skill URI; read installed using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion. Read main AGENTS.md, README.md, PROJECT_PLAN.md English canonical and Korean counterpart. **MID** 23:03 KST main unchanged `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`.

**Cycle:** Previous Feature Addition v1376 → Current Feature Improvement v1378 → Next Feature Addition v1380 provisional. **Scope:** design-only improvement to F675-151/#1583, stacked on Draft #1584 (and #1578/#1573), no runtime, DB, WLD/ledger, Test, Production or automation mutation. A/B/C/Gemini/QA own implementations and release. New branch/worktree separate.

**Observed:** current /status is a cached collector status page, notification controller has auth/consent and CSRF read actions, notification service has direct SELECT with OFFSET. Approved incident revision/watch and real owner-safe outbox remain unmerged. Existing v1376 lacked precise subscribe/publish linearization and revoke/worker commit order. Specify incident-first locks, subscribe revision watermark, single revision outbox + bounded fanout, worker/watch row lock, stable idempotent receipt and non-retroactive history. This is a design risk, not an observed production incident.

**Backlog:** P0 ENV1378-01 SEC1378-02 REL1378-03 WATCH1378-04; P1 WATCH1378-05 WATCH1378-06 WATCH1378-07 WATCH1378-08 WATCH1378-09 WATCH1378-10. QA latest reviewed v1324 main root FAIL duplicate migration 280, full audit Critical 2/High 8, bot Critical 1/High 5, exact-SHA Test/independent restore unverified; Test and Production symlinks dangling. Root 45% used, data 57% used. Proposed 10,001/100/100 tests NOT RUN. External newly accepted 0, cumulative deduped approved UNKNOWN/10,000 BLOCKED/IN PROGRESS. Release HOLD.

**Verification and GitHub:** verify diff, EN/KO six-doc parity, source-only docs, remote SHA, stacked Draft PR and issue updates. No independent merge.

**GitHub:** stacked Draft PR #1588 (base #1584), commit and remote SHA verified; issue #1583 update recorded.
