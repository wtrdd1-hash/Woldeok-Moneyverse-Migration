# Development B v683 — Owner Notification Navigation Boundary

## Before work — 2026-10-31 11:39 KST

- Canonical `origin/main`: `761a55a094fb9dd383d213e817305e68c79fa23c`.
- MiniPC Debian 13.6, backend/frontend/nginx/docker healthy; QA v1411 release FAILED/P0.
- AGENTS.md, README, English/Korean integrated plans, QA evidence, concurrent PRs and CI inspected.
- P1 source finding: owner notification list returned the raw stored `link`; search sanitized untrusted URLs. No confirmed exploit, data disclosure or actual malicious record.
- Scope: backend-only safe navigation response, no new route, migration, WLD or ledger operation. Existing A/C/QA/planning work preserved.

## In progress — TDD and checks

- RED: `notification.inbox.test.ts` newly tested protocol-relative, external, script, encoded, backslash, control and unsupported paths; 1 failed, 2 passed before implementation.
- GREEN: a single server-side sanitizer now handles owner list and search; unsafe links become `null`, known internal links remain intact; focused tests 7/7 passed.
- Deliberately do not enable `/inventory/expiring`: that planned route is absent from canonical main and requires separate backend/Next/Android review.
- Midflight main refetch unchanged. English/Korean plan SHA-256 evidence recorded in host logs.

## Finished — candidate and release status

- Code commit: `79c358d0c4470189ca045eab59d4ce01ef7968f6`; Draft/HOLD PR #2130.
- API contract: GET `/api/v1/notifications` retains its fields but nulls unsafe `link`; POST `/api/v1/notifications/search` retains its existing sanitizer behavior. No database, role, migration, auth, financial or frontend changes.
- Local validation on code commit: `pnpm test` PASS; backend 2,779 PASS / 501 SKIP; frontend 2,770 PASS; database package 62 PASS / 4 SKIP; contract 41 PASS; 184 mobile API endpoints; targeted security/release 16 PASS; lint 0 errors/1,049 warnings; typecheck and build PASS; production dependency audit clean.
- Full dependency audit FAIL: 13 advisories (10 moderate, 3 low). Real PostgreSQL notification integration, authenticated E2E, independent restore, official Test exact-SHA and complete remote CI remain unverified. No skipped DB test is counted as passed.
- Read-only public Test backend/frontend SHA `c2129625aa6629c616fb31ce790950618b8d92b2`; Production `95485a299885693e3becb694dfc36ad45e832f97`. Both differ from canonical main and candidate.
- Coordination: reminder implementation issue #2112 updated; no invented reminder CTA or delivery proof.
- **RELEASE HOLD**: no main merge, Test/Production deployment, service restart, shared DB write, WLD/ledger mutation, other-branch cleanup or scheduled-task change.

Host evidence: `/srv/moneyverse-data/tasks/mv-b-v683-notification-link-boundary-20261031-1135/logs/`.
