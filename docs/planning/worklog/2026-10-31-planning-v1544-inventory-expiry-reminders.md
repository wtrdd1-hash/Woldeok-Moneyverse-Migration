# Planning v1544 — Owner Inventory Expiry Reminder Opt-In (F675-192)
**Status:** DRAFT / RELEASE HOLD / docs only. **Cycle:** Previous Improvement v1542; Current Addition v1544; Next Improvement v1546 (provisional). **Main:** 761a55a094fb9dd383d213e817305e68c79fa23c; **parent:** #2105; **handoff:** #2112; **Draft:** PR_PENDING.

## Start
Read installed Superpowers using-superpowers plus brainstorming, worktrees, writing-plans, verification; skills connector returned an empty list, so no skill URI was available. Checked miniPC Debian 13.6, service health, GitHub PRs, AGENTS.md, README.md, canonical English and Korean plans. Created separate branch and worktree. No runtime/DB changes.

## Middle / findings
Re-fetched origin/main and re-read canonical plan. Inspected inventory page/view, migration 123, Nest notification controller/service, app-api and active PR/issue ownership. No numbered migration CREATE TABLE for in_app_notifications was located in this targeted search, so inbox schema and app-role privileges remain a prerequisite rather than assumed facts. Fresh GitHub issue #2111 reports Test FX portal 500 on table ACL; #2109 reports private-space access concerns. Latest previously documented full QA v1405 passed backend/frontend unit suites but failed dependency audit; newer exact-SHA route evidence incomplete (#2103). These do not establish current Test readiness.

## Feature, decision and handoff
Chose in-app opt-in over browser-only timers or external email/push. Full UX/API/DB/transaction/security/SEO/mobile/a11y/admin/KPI/QA/rollback design is in integrated English/Korean masters; issue #2112 has P0 4/P1 6 handoff. 7d/1d 24h windows, exact per-expiry dedupe, opt-out lock and same-transaction inbox receipt, feature OFF. No calendar, auto-equip, payment or WLD mutation. 10,001 synthetic acceptance proposed, not executed. External newly verified 0; cumulative UNKNOWN/10,000 gate BLOCKED.

## Completion
Commit/PR and CI results are recorded separately when available. Do not merge, deploy, or claim runtime tests from docs-only CI. RELEASE HOLD until exact-SHA Test, security/ACL, dependency audit and independent restore are independently evidenced.
