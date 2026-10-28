# A1825 — Member-owned pending photo withdrawal (English canonical)

## Before work — 2026-10-28 18:29 KST
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and its Korean counterpart, latest QA v1346, planning Draft #1727 and prior A1725 reports. The authoritative main SHA was 35971c600f25869c96f1c666d4b9f58927202730.
- Started a separate worktree and branch auto/hourly-a-photo-pending-withdraw-20261028-1825. No edits to shared main, other workers or incident backup refs.
- P1 gap: an authenticated member can submit a photo but cannot withdraw an unreviewed submission. No WLD/ledger effect is permitted. Existing operator publication must remain authoritative.
- P0 release blockers: 18,000 WLD cash/ledger drift, broad application DB DML privileges, missing official Test exact-SHA, independent backup restore not proven, 97% data disk. Production HOLD.

## In progress — 2026-10-28 18:34 KST
- TDD RED confirmed: repository lacked withdrawal method; Android gateway leaked upstream public cache headers. TDD GREEN: repository/controller unit 3 PASS, Android gateway 26 PASS, web action 3 PASS.
- New, unapplied migration 292 defines a least-privilege SECURITY DEFINER withdrawal, owner/row lock, stable idempotency digest and immutable withdrawal tombstone. It deletes only a private pending photo row, immediately revoking all existing media/queue/publication read paths. It never deletes physical bytes or issues a refund.
- Replaced only the existing submit function definition in the new migration to prevent withdrawn UUID reuse and preserve the 5-per-day cap. Existing migration 098 remains unchanged.
- Isolated PostgreSQL 17.11 applied 291 numbered migration files through 292; real rollback-only SQL tests 4 PASS, including ownership, replay, quota, post-withdraw media denial, publication fence and app-role table DML denial. No shared Test or live DB touched.
- Backend and frontend typechecks passed, Android API contract check passed (180 curated endpoints). Full lint reported 0 errors / 1099 warnings. Full regression and build gates still pending.
- Other workers' branches/PRs and incident backup refs are not deleted or changed. No Test/Production deployment.

## Finished — 2026-10-28 18:43 KST
- Local full Backend: 1,942 PASS / 444 SKIP. Full Frontend: 1,875 PASS. Database: 46 PASS / 4 SKIP. Bot: 11 PASS after resolving missing local dependencies using an identical-lockfile dependency directory without changing any coworker source.
- Full lint: 0 errors / 1,099 warnings. Typecheck: PASS. Backend and Next.js Webpack builds: PASS. Android API contract: 180 curated endpoints PASS. Root audit: 3 Low / 9 Moderate / 0 High or Critical.
- Exact current migration source replay: 291 numbered SQL files through new migration 292 PASS in a dedicated PostgreSQL 17.11 container; 4 transactional SQL tests PASS, 3 Backend focused PASS and 29 Android gateway focused PASS. The first DB migration wrapper failed to connect as root; the wrapper was corrected and full migrations replayed twice; all failure evidence retained.
- Security review: foreign and missing photo IDs return indistinguishable 409 errors. Owner-only row locks and post-withdraw denial verified. No physical media deletion or daily submission quota refund. Existing 098 and other applied migrations unchanged.
- Official Test exact-SHA authenticated E2E, full live-schema ACL, independent backup restore and GitOps release gate remain BLOCKED. Draft PR only, no main merge or Test/Production deployment, no DB/ledger mutation on shared services, no branch deletion.
