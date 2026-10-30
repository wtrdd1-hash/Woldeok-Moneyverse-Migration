# Development A — Work task daily availability filter (2026-10-30)

## Before work
- Base: `origin/main` `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; independent branch `auto/hourly-a-20261030-1725-work-daily-availability`.
- Read AGENTS.md, README.md, canonical `docs/planning/PROJECT_PLAN.md`, Korean translation, integrated master, QA v1393, existing work task route/repository/UI and open PRs.
- Existing member task board supports duration and reward filters, but not a server-backed daily-availability-only filter. This change must not affect payout, quota enforcement, or the ledger.
- Safety: daily_limit <= 0 means unlimited. For a positive limit, show only rows with taken_today < daily_limit; use actor-bound `public.work_task_board($1)` before filtering. Strict `availableOnly=1` only, no user-supplied actor, private no-store/noindex, Android parity.
- Plan: RED tests (backend parser/controller/SQL, web query/UI, Android proxy); implementation; isolated PostgreSQL read-only verification; lint/typecheck/build/full tests/CI; exact SHA Test gate. Do not merge or deploy without all required PASS evidence.
- Existing P0 release blockers and independent branch changes are protected. No destructive Docker/git cleanup.

## In progress
- Worktree created from exact main. TDD and evidence pending.

## Finished
- Pending.

### Midpoint checkpoint (17:29 KST)
- RED first: backend 3 failing tests, frontend 4 failing tests; implemented the strict filter and re-ran.
- GREEN: Backend targeted 20 PASS; Frontend/Android targeted 20 PASS (`NODE_ENV=test`, since host defaults to production); typecheck PASS; changed-file ESLint 0 errors / 1 pre-existing warning; git diff --check PASS.
- Isolated PostgreSQL 17.11: own temporary container, schema core + migrations 002–306 (305 files) applied; owner-scoped function, unlimited/exhausted predicate and app-role direct catalogue SELECT denial verified in a rolled-back SQL fixture. No production DB touched.
- App API rejects duplicated/malformed availability filters and HTTP 200 payloads that contradict the requested availability; private no-store and noindex are enforced.
- Re-fetched main and canonical EN/KO plans: unchanged at 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef. Full gates, PR, official Test and release remain pending; no merge or deploy.

## Finished — candidate only / release hold (17:40 KST)
- Implementation: backend authenticated `availableOnly=1` parsing, owner-scoped SQL daily-limit predicate (unlimited `daily_limit <= 0` included), web GET checkbox, Android app-api validation and private caching/indexing protection; no migration or WLD/ledger write.
- Source changes: 12 files at first checkpoint `95087e7425c8b33557596d10085eb5aecb93a499`; final follow-up tightens copy to mean **daily quota remaining** (not guaranteed career eligibility), requires canonical UUID and valid feature state in app responses, and removes a redundant SQL assertion. Final SHA is the head of Draft PR #2020 after this log update.
- PASS evidence: backend targeted 20/20, frontend/Android targeted 20/20 before copy hardening and 5/5 after, full TypeScript typecheck after follow-up, backend build, mobile API contract 183 endpoints, DB unit 56 PASS / 4 SKIP, security/release policy 25 PASS, dependency audit no known vulnerabilities, changed-file ESLint 0 errors / 1 existing warning, isolated PostgreSQL 17.11 migration sequence 002–306 (305 files) and rolled-back SQL ACL/quota fixture PASS.
- FAIL evidence: backend full 2,566 PASS / 119 FAIL / 496 SKIP; exact SHA candidate CI #41026775837 FAIL at runtime; exact SHA CI #41027056803 FAIL at runtime. Full frontend build failed at 1024 MiB heap (OOM); retry at 2048 MiB encountered a Next.js build lock with a process still active, so no build PASS. Full frontend test not independently certified due concurrent resource-intensive developer jobs. Full lint emitted 0 errors / 1,043 warnings but its process completion status was not captured by the remote command channel.
- BLOCKED: official Test runs `c2129625aa6629c616fb31ce790950618b8d92b2`, not the candidate; production runs `94d38f47603e99aabc42fc8f292b89441afb9663`. No exact-SHA Test login/E2E, independent backup restore, full CI, release policy certification, or GitOps gate. Production HOLD.
- Rechecked main and English/Korean planning at integration decision: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`, unchanged. No merge, Test/Production deploy, operational DB change, service restart, branch deletion, PR closure or production rollback.
- Recovery: code is an opt-in filter and has no schema change. Revert this branch/PR to restore legacy full task board; no data migration rollback needed. Preserve every branch with unique unintegrated commits. Existing unrelated full-suite failures belong to separate QA/Backend workstreams and are not waived.
