# A 13:25 — Owner Business Catalogue Budget Filter

## BEFORE WORK — 2026-11-01 KST
- Scope: P1 member-visible read-only maximum acquisition cost filter on the existing business catalogue; backend SQL `business_catalog()` source, Nest `/business-types` and `/businesses/catalog`, Next `/businesses`, Android app gateway parity.
- User intent: find available in-game businesses within a manually entered WLD cost cap, not assert affordability or equity, and never alter purchases or ledger.
- Design: canonical nonnegative decimal string up to 18 digits; no float conversion; duplicate/invalid parameter 400; owner/consent guards preserved; backend filters source SQL before owned exclusion; web preserves the unfiltered ownership summary and uses a form; Android rejects invalid/unchecked filtered 200 and forces private/no-store/noindex. No migration, no new grants, no financial writes.
- TDD plan: RED backend controller/repository/service and Android validation + web page tests; GREEN implementation; build/lint/typecheck/DB read-only check; CI and exact-SHA Test gate. Draft/HOLD until all required gates pass.
- Existing work protected: A/B/C/QA/planning branches and PRs; no deletions. Recheck origin/main and living English/Korean plan before code, mid-work and before any integration.
- Main baseline: see task `main-start.sha`; branch and CI snapshots in task directory. Release: HOLD; no Test or Production deployment without exact SHA evidence.

## IN PROGRESS
- Initial checkpoint only; implementation and tests not yet run.

## FINISHED
- Pending evidence.
