# Planning v1368 — Verified Support Reply Alerts (2026-10-27)
**Status:** IN PROGRESS / DRAFT / RELEASE HOLD. Previous v1366 Improvement → Current v1368 Addition → Next v1370 Improvement (provisional). Issue #1562; predecessor unmerged Draft #1555.

## Source evidence
- Debian 13 miniPC connected; frontend/backend/bot/nginx active, dev PostgreSQL connected. Root 81% used (19GiB free), data 72% (53GiB free); /srv/moneyverse link target missing.
- Main c2a9306ddc0424438bc0ab297ea9543bb167aee6 checked twice, canonical AGENTS.md, README.md, PROJECT_PLAN.md (English authority) and Korean counterpart reviewed.
- Current member notification tabs contain hard-coded sample items; Next/NestJS have authenticated notification APIs. NotificationService references in_app_notifications but no tracked table creation was located. Migration 196 stores support replies without alert outbox. Production incident not proven.
- QA #1558 reports CI integration rate-limit; Development B Draft #1560 is separately responsible. No overlap with Gemini, Development A/B/C or QA changes.

## Design and gates
- F675-149 in-app verified admin-reply alert, owner-safe deep link, preference, atomic outbox and immutable receipt; reuse notification feed, no demo fallback, no external delivery, no WLD changes.
- P0 ENV1368-01 SEC1368-02 REL1368-03 NOTIF1368-04. P1 NOTIF1368-05 NOTIF1368-06 NOTIF1368-07 NOTIF1368-08 NOTIF1368-09 NOTIF1368-10.
- Proposed 10,001 synthetic records, 100 concurrent requests, 100 authorization negatives: NOT RUN. Independent 10,000 external evidence gate: newly approved 0; cumulative deduplicated/classified UNKNOWN; BLOCKED/IN PROGRESS.
- Engineering needs separate branch, isolated real PG, RED/GREEN, security/backup restore, exact-SHA official Test, approved GitOps; no merge/deploy of planning Draft.

## Execution record
Start and midpoint evidence are in miniPC planning-v1368-records. Updated existing English/Korean master, feature review, project plan and update logs; this worklog is the only new documentation file. No runtime, DB, WLD, ledger, feature switch, Test, Production or automation changes.
