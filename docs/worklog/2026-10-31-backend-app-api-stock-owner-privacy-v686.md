# B v686 — Stock owner-private Android gateway privacy

- [x] Before work: inspect AGENTS, README, English/Korean plan, current main, QA v1412, active PRs and CI.
- [x] RED: reproduce public-cache upstream on owner stock portfolio/history success and failures.
- [x] GREEN: narrowly enforce private/no-store/noindex/no-referrer for owner stock paths.
- [x] Verify: focused and full tests, lint, typecheck, build, security, contract, isolated PostgreSQL; official Test exact SHA BLOCKED.
- [ ] Review latest main and plan, push Draft/HOLD PR, record deployment block.

Scope: only mobile app-api stock owner read privacy; no database, ledger, auth, money, route-map or public stock quote changes. Do not claim edge proxy or Production proof without live exact-SHA test.

## Mid-work
- RED: 5/6 focused tests failed on upstream public cache inheritance; public stock market control passed.
- GREEN: route-scoped response headers on stock portfolio/history only, all statuses including HEAD. No auth, DB, money or migration changes.

## Verification and review — 2026-10-31 13:08 KST
- [x] RED: 5/6 tests failed before implementation; public stock market control passed.
- [x] GREEN: focused stock-owner and existing app-api tests 58/58 PASS.
- [x] Full `pnpm lint`: PASS (0 errors, 1,049 existing warnings).
- [x] Full `pnpm typecheck`: PASS.
- [x] Full `pnpm test`: PASS; backend 2,778 PASS / 501 SKIP, frontend 2,776 PASS, contract 41 PASS, DB static 62 PASS / 4 SKIP, app-api contract 184 checked.
- [x] Full `pnpm build`: PASS with confirmed exit 0 (backend and frontend).
- [x] `pnpm audit --prod --audit-level low`: PASS, 0 known production advisories.
- [ ] Full `pnpm audit --audit-level low`: FAIL, 13 inherited development advisories (10 moderate, 3 low).
- [x] Disposable PostgreSQL 17.11 with `--network none`: all 311 source migrations applied; `moneyverse_app` DELETE on ledger_postings and audit_logs both denied; container removed.
- [ ] DB-backed authenticated API tests, official Test exact-SHA, real Android owner-switch E2E, external restore, GitOps release gates: NOT VERIFIED/BLOCKED. The disposable PG migration proof is not a substitute.
- [ ] Actual reverse-proxy/Production X-Robots-Tag precedence is unverified; the gateway response change does not modify Nginx/CDN.

Contract: `/app-api/v1/stocks/portfolio` and `/app-api/v1/stocks/history` GET/HEAD return `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` on success and failure. `/app-api/v1/stocks` public market cache policy is unchanged. No new endpoint, DTO, migration, direct DB grant, auth, transaction or WLD change.

Integration: B v684 Draft #2136 also edits `frontend/src/app/app-api/v1/[...path]/route.ts` for holdings. These are separate path-specific protections; rebase and run both test suites before any integration. Release HOLD. No main merge, Test/Production deploy, shared DB write, service restart, branch cleanup or automation modification.
