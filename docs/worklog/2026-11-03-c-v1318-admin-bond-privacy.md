# C v1318 — Administrator bond evidence confidentiality

## BEFORE — 2026-11-03 03:5x KST
- Base: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` (`origin/main`). Isolated branch: `auto/hourly-c-v1318-admin-bond-privacy-20261103-0345`.
- MiniPC Debian 13.6: seven core services active; development PostgreSQL connected. Existing shared checkout has unrelated uncommitted security changes: untouched.
- Reviewed `AGENTS.md`, English/Korean README, English/Korean canonical project plan, current main, open PRs, CI, QA and A/B/C work. A/B own board and DB/CSRF changes; C #2492 covers bond policy writes, but no open PR was found for this administrator bond read-response confidentiality issue.
- Proven defect: Next BFF `frontend/src/app/api/admin/bonds/overview/route.ts` returns upstream `error.message` and arbitrary `error.status` without privacy headers; `frontend/next.config.ts` applies public `index, follow` HTTP headers to `/admin/bonds` despite page-level `robots` metadata.
- Bounded design: preserve backend session/admin authority and verified bond evidence; redact internal failure details, preserve 401/403 auth statuses, return 503 otherwise, and add private/noindex/no-referrer HTTP headers to the BFF and administrator page in default + five locale routes. Do not modify ledger, schema or other teams' files.
- Plan: (1) RED tests for proxy error and route HTTP policy; (2) minimal implementation; (3) focused + broad gates; (4) current-main recheck, PR, CI; (5) no merge/release unless all gates pass.

## IN PROGRESS
- [ ] TDD RED verified
- [ ] Implementation and focused GREEN
- [ ] Exact-SHA build/lint/typecheck/unit/integration/security/app-api/E2E and independent PostgreSQL evidence
- [ ] Remote CI and Test exact-SHA certification

## FINISHED
- Pending.
