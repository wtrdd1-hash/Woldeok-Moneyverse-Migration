# Planning v1612 — F675-209 Owner Expiry-Digest Snooze (English)
- 2026-11-01, Feature Addition. Previous Improvement v1610; next Improvement v1614 (provisional).
- Read installed using-superpowers/brainstorming/writing-plans/worktrees/verification skills via miniPC because skills__list exposed no URI; skills__read path BLOCKED.
- Source: latest main AGENTS.md, README.md, PROJECT_PLAN.md and .ko.md; source frontend/src/app/account/notifications/page.tsx and actions.ts, backend/src/notification/notification.service.ts, Android app-api proxy; existing page is engagement preference, not expiry-digest snooze.
- Read GitHub Draft #2349, #2343, open QA/security issues; issue #2354 / Draft #2355 created. Independent planning branch, docs only.
- Design: next-day 1/3/7 full KST-day pause, strict owner/session/consent/CSRF and DB lock/CAS/idempotency; no false worker-suppression proof, no other notification impact. 4 P0 and 6 P1 tasks.
- No PG/Android/browser acceptance executed. External independent newly verified/deduplicated/classified approved 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- Release DRAFT/HOLD. Detailed spec in PROJECT_PLAN.md; parity in .ko.md. Final SHA/CI and midpoint checks are recorded in miniPC run logs and PR.
