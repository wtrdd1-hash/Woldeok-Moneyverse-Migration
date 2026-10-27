# Planning v1384 — F675-152 Verified Account Security Event Alerts (2026-10-28)

**START** 00:04–00:06 KST: miniPC Debian 13 connected; services ACTIVE, development PostgreSQL CONNECTED; skills connector returned no skill URI, installed using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion read on miniPC. Canonical main AGENTS.md, README.md, PROJECT_PLAN.md English and PROJECT_PLAN.ko.md inspected; GitHub PRs and QA evidence inspected. Branch/worktree created separately from developer/QA work.

**Cycle:** Previous Feature Improvement v1378 → Current Feature Addition v1384 → Next Feature Improvement v1386 (provisional). v1380/v1382 labels already allocated to parallel blog planning PRs #1592/#1595; no collision or overlap. Planning-only Draft on #1588, Issue #1597; no main merge or runtime/DB/WLD/ledger/Test/Production/automation modification.

**Source observations:** /account/security already shows 20 recent security events and sessions, not pushed alerts. Migration 180 auth_security_events; Migration 214 SECURITY DEFINER accepts p_user_id without internal session binding; backend controller passes authenticated user but DB direct-invocation privilege is a concern needing isolated negative proof. Existing notification list directly queries in_app_notifications with OFFSET and created_at-only sort; F675-149 remains unmerged. Do not imply OAuth full coverage, a security incident, or delivered alert.

**QA:** v1326 evidence 2026-10-27 23:14–23:26 KST: DB/root FAIL duplicate migration 280, full dependency audit Critical 2/High 8, bot audit FAIL; typecheck/lint/build and separate backend/frontend tests passed. Official exact-SHA authenticated Test and independent backup restore not verified. Disk root 45% used / ~52GiB free; data 59% / ~77GiB free. Test/Production release symlink provenance not verified.

**Plan:** committed login/password/email event → atomic outbox → idempotent owner-only in-app alert → review receipt. Admin aggregate only, Android owner API parity, noindex/no-store, WCAG 2.2 AA, KPI, feature OFF. P0 ENV1384-01 SEC1384-02 REL1384-03 AUTH1384-04; P1 AUTH1384-05..10. Acceptance 10,001 synthetic events/100 concurrent races/100 forged-owner requests NOT RUN. Independent references newly approved 0, cumulative deduped accepted UNKNOWN/10,000 BLOCKED/IN PROGRESS.

**MID** 00:07 KST: main and canonical plan blob SHA rechecked; no conflicting planning changes to this branch. **DONE** to be verified after documentation checks, GitHub push, Draft PR, remote SHA comparison. Never merge independently or claim deployment.


**MID RECHECK:** main advanced from 656a89947f2261c12de20d4612e88f251ba6c6a6 to f3d7a3fb4d693f75a14a8edbacb0af20321fb9c4; canonical AGENTS/README/PROJECT_PLAN EN/KO blob SHAs unchanged.

**DONE (documentation):** GitHub Draft PR #1598 on #1588, issue #1597, bilingual integrated master/project plan/review/update log and worklog. Document diff/backlog verification PASS; runtime/DB/Test/Production unchanged. Final remote SHA in miniPC records.
