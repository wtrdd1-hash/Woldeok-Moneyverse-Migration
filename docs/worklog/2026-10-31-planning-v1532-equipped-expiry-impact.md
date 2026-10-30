# Planning v1532 — Worklog

## v2026.10.31.1532 — F675-189 Owner Equipped Expiry Impact Preview (FEATURE ADDITION / DRAFT / RELEASE HOLD)
- **Cycle:** Previous Feature Improvement v1530 → Current Feature Addition v1532 → Next Feature Improvement v1534 (provisional). Remote main bf8d0d48f810932b43783d8605dce53954c60cff start/mid; stacked after Draft #2066; engineering #2074, P0 #2031.
- **New feature:** owner-only `/inventory/expiring/equipped-impact?withinDays=7|30` previews currently equipped slots with holdings due to expire. Eight slot names from migration 114; migration 071 nullable expires_at, 123 separate effect expiry. Never claim auto-unequip, payment, refund or historical catalog name. F675-188 prerequisite, no duplicate calendar/ICS (#1267) or presets (#1142).
- **Contract:** Nest/Next/Android guarded GET; one DB read-only repeatable-read snapshot and statement_timestamp, `quantity>0 AND is_equipped AND asOf<expires_at<=asOf+N*24h`, owner SECURITY DEFINER EXECUTE-only, no pagination, duplicate/null slot fail-closed, validUntilUtc earliest expiry or 60s, 400/401/403/409/429/503. private/no-store/noindex/no-referrer, account-switch reset, WCAG AA, admin >=20, flag OFF. No DB/finance writes.
- **Backlog:** P0 OPS1532-01 SEC1532-02 FIN1532-03 REL1532-04; P1 IMPACT1532-05 IMPACT1532-06 IMPACT1532-07 IMPACT1532-08 IMPACT1532-09 IMPACT1532-10 (4+6). QA v1400 backend 126 FAIL/2653 PASS/501 SKIP, frontend 55 FAIL/2701 PASS; official exact-SHA Test/independent restore BLOCKED. Proposed 10,001-row and boundary tests NOT RUN; release HOLD.
- **External independent evidence:** new verified 0, cumulative deduplicated/classified UNKNOWN/10,000, BLOCKED / IN PROGRESS. Full criteria in integrated master and #2074. Documentation-only; no merge/deploy.

**Start:** miniPC Debian 13.6, seven services active, DEV DB connected; skill connector returned no URI, local using-superpowers/brainstorming/writing-plans/worktrees/verification read. Main and parent verified.
**Mid:** main/plan rechecked; schema 071/114/123, Next inventory, Nest holdings, Android edge, open PRs inspected. #2074 created. QA v1400 is last confirmed report, not rerun.
**Finish:** document-only validation, Draft PR #2075 OPEN; exact final SHA and CI status tracked in miniPC complete.log. No runtime/DB/WLD/Production changes.
