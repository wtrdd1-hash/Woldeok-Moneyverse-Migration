# A 13:25 — Owner Business Catalogue Budget Filter

## BEFORE WORK — 2026-11-01 KST
- Scope: P1 member-visible read-only maximum acquisition cost filter on the existing business catalogue; backend SQL `business_catalog()` source, Nest `/business-types` and `/businesses/catalog`, Next `/businesses`, Android app gateway parity.
- User intent: find available in-game businesses within a manually entered WLD cost cap, not assert affordability or equity, and never alter purchases or ledger.
- Design: canonical nonnegative decimal string up to 18 digits; no float conversion; duplicate/invalid parameter 400; owner/consent guards preserved; backend filters source SQL before owned exclusion; web preserves the unfiltered ownership summary and uses a form; Android rejects invalid/unchecked filtered 200 and forces private/no-store/noindex. No migration, no new grants, no financial writes.
- TDD plan: RED backend controller/repository/service and Android validation + web page tests; GREEN implementation; build/lint/typecheck/DB read-only check; CI and exact-SHA Test gate. Draft/HOLD until all required gates pass.
- Existing work protected: A/B/C/QA/planning branches and PRs; no deletions. Recheck origin/main and living English/Korean plan before code, mid-work and before any integration.
- Main baseline: see task `main-start.sha`; branch and CI snapshots in task directory. Release: HOLD; no Test or Production deployment without exact SHA evidence.

## IN PROGRESS — 13:29 KST
- Main rechecked unchanged at `f13bbce273ffc65e8576170992d82ea00c27a1c9`; living EN/KO plan and previous QA inspected. Other teams' branches untouched.
- TDD RED: backend 10 tests failed as expected after correcting CsrfGuard test harness; frontend parser module missing and Android budget/response/cache tests failed. Logs: `red-backend3.log`, `red-frontend2.log`.
- GREEN: backend 10/10, frontend 14/14 targeted PASS under one-core resource isolation (`taskset -c 1`); first backend retry hit concurrent host process/thread exhaustion, not a pass. Logs: `green-backend2.log`, `green-frontend2.log`.
- Changed: Nest controller/service/repository, SQL read filter, Next member catalogue search, Android app-api verification/private headers, targeted tests. No migration, new direct grants, WLD/ledger writes or Production mutations.
- Next: review, full gates, real PostgreSQL, exact-SHA CI and official Test evidence. Release HOLD.


## FINISHED
- Pending evidence.
