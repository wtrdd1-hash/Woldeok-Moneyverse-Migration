# Moneyverse planning v1214 — F675-110 publish/replay and privacy lifecycle hardening

**Date:** 2026-10-24 11:08 KST. **Previous:** Feature Addition v1212. **Current:** Feature Improvement v1214. **Next:** Feature Addition v1216 (provisional). **Verdict:** PARTIAL / DRAFT / RELEASE HOLD.

## Sources and investigation
- miniPC Debian 13.6 connected; services active. Canonical main 46794ff0ac3deeae87862ac9b74d209798e8d074 and main EN/KO plans rechecked at start and midpoint. This is a stacked documentation-only branch on open/unmerged v1212 Draft PR #1103, not a deployed feature.
- QA v1219 (10:18–10:32 KST) FAILED/HOLD on another SHA. Four frontend failures, prod pnpm audit 2 HIGH, full 2 CRITICAL/10 HIGH, bot 1 CRITICAL/5 HIGH; app UPDATE+DELETE 235/241 tables, three PUBLIC bank functions, migration266 checksum mismatch, Production/dev shared DB and 5433 wildcard; deployed exact-SHA Test authenticated finance E2E and isolated restore absent. Classifier overlap #1106/#1107 and auto-merge #1088 require separate engineering.
- Source: board-forms.tsx Preview removes named body; stock-actions.ts generates a new key inside each server action; board controllers accept UUID keys; migration 044 replays by globally unique key+actor without original payload digest; migration 181 stock-tagged create and context insert share a transaction. No evidence of actual duplicate publication. Editorial blog drafts are a different subsystem.
- v1212 proposal also needed correction of seven-day receipts versus 30-day recovery, owner RESTRICT FK/account erasure and published postId SET NULL after hard purge.

## Planned improvement and backlog
- Owner-only stable publish intent, canonical digest, immutable receipt, same-key retry after unknown commit, terminal CAS, Preview body field, accessible conflict/recovery and session-generation fences.
- Privacy-approved erasure/retention, owner-verified expiry, image upload reservation/orphan cleanup, private no-store/noindex, Android parity, aggregate admin, WCAG 2.2 AA and safe KPI. No WLD effect.
- P0: ENV1214-01 SEC1214-02 REL1214-03 BOARD1214-04. P1: BOARD1214-05 BOARD1214-06 BOARD1214-07 BOARD1214-08 BOARD1214-09 BOARD1214-10. Acceptance 100-way concurrent save/publish and owner probes, isolated 10,001 synthetic cursor fixture, rollback default OFF and exact-SHA gate. See integrated English/Korean master for exact API, DB, transaction, UI and release conditions.
- External sources: https://www.postgresql.org/docs/16/sql-insert.html ; https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API ; https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html . Publisher families reviewed 3, newly approved deduplicated evidence 0, cumulative approved UNKNOWN/10,000 => BLOCKED / IN PROGRESS.

## Safety
- Only six official EN/KO planning/update files and this one worklog modified. No runtime, DB, WLD, feature flags, Test, Production, merge, migration, coworker worktree or branch cleanup. Documentation consistency is not runtime QA. Feature OFF until independent exact-SHA deployed Test, authenticated finance E2E, isolated PG ACL/restore, security and authorized GitOps approval.
