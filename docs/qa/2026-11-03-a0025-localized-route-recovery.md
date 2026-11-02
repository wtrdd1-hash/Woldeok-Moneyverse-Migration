# QA — 2026-11-03 A 00:25 P0 localized route rewrite

**State: isolated candidate verified, RELEASE HOLD.** Issue #2534. This is a runtime defect repair, not a new finance or database feature.

## Evidence and diagnosis
- Exact initial main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`, updated main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` during work. Isolated branch `auto/hourly-a-20261103-0025-localized-tools` rebased onto latest main before final verification.
- Production public read-only HTTP: `/tools` 200; `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap` 500; physical `/en/blog` 200. The failed rewrite advertised `https://localhost:4205/tools?__mv_path_locale=en` even though Next listens over HTTP at `127.0.0.1:4205`.
- TDD RED: 5 failures / 2 passes; GREEN: 7 passes / 0 failures. Narrow fix: only locale rewrites whose destination hostname is loopback and scheme is HTTPS are changed to HTTP. Public HTTPS origin is never downgraded; path, query and locale header are preserved.
- Isolated candidate Next.js 16.4.2 on HTTP port 4325 behind simulated HTTPS ingress: `/tools`, `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap`, `/en/blog` all HTTP 200. HTML has correct `lang=en/ja/zh`, localized H1 and canonical URL for all three tools pages. Production remained HTTP 500 for `/en/tools` at last check.

## Initial code-candidate gates (before main rebase)
- Contract build, frontend typecheck/build, backend typecheck/build, focused lint, root lint: PASS (root lint 0 errors / 1,027 pre-existing warnings).
- Frontend tests: 2,945 PASS; backend tests: 2,983 PASS / 518 SKIP; database package tests: 62 PASS / 5 SKIP. Database-dependent skips are not PASS.
- Android App API contract: 184 endpoints checked, PASS. No API route/schema changes.
- Dependency audit: full tree 9 vulnerabilities (1 low, 8 moderate) FAIL; production-only dependencies: no known vulnerabilities.
- Actual dev PostgreSQL 17.11 read-only ACL query: `moneyverse_app` direct `account_balances UPDATE=true`, `user_items DELETE=true` (P0 release blocker). No SQL migration or data mutation.
- Following main advancement, a new full-test/typecheck/build/lint run was requested; final exact-SHA results must be appended to PR evidence. Do not extrapolate the prior code-candidate gates to a new SHA.

## Outstanding acceptance
- Official isolated Test must run the **exact candidate SHA** and prove localized routes, auth/session continuity, backend/API/DB, private responses, SEO, accessibility and mobile contract. This local HTTP candidate is not the official Test release.
- Independent backup restore, current immutable executable/rollback provenance, DB least-privilege remediation, full supply-chain audit and GitOps/host-release gates remain incomplete. Production deployment and main merge prohibited.

Evidence: `/srv/moneyverse-data/tasks/mv-a-20261103-0025-localized-tools/evidence/` (red/green tests, full gates, live HTTP, isolated HTML, audit, ledger). No secrets are included in committed artifacts.

**Overlap:** Draft QA PR #2263 already contains a related loopback fix. Preserve its unique test/documentation commits; this branch is a newer-main replacement candidate with independent HTTP E2E and extended negative coverage, not an additional feature to merge alongside it.

## Post-rebase full-test checkpoint
At rebased source SHA `40bdddab76ca02c4577949235c758e8b5ae4b4cf`, `pnpm test` passed with contract 41 PASS, database package 72 PASS / 5 SKIP, backend 2,985 PASS / 518 SKIP, frontend 2,954 PASS. Additional negative tests increased focused proxy coverage to 10 PASS. Root typecheck and build/lint results are tracked in the PR evidence; final documentation commit SHA will differ from this checkpoint.
