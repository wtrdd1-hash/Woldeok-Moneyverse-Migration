# Backend B v546 — IPv6 mapped-address SSRF boundary (P1 / HOLD)

## Before work (2026-10-26 04:35 KST)
- Source: origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; isolated branch `auto/hourly-b-ssrf-ipv6-v546-20261026-0435` and separate worktree.
- Reviewed AGENTS.md, README.md, English/Korean living plans, current open PRs, QA #1317, issues, and CI. No active SSRF-specific PR found. Existing security `ssrf-defense.ts` checks dotted mapped IPv4 but not the equivalent IPv6 hextet encoding. No production data touched.
- Safety: do not modify shared branches/worktrees, applied migrations, DB roles, financial ledger, Test or Production. Root disk 99%, 1.3GiB free; use data volume.
- Scope: reject mapped private IPv4 regardless of IPv6 text representation; preserve public mapped IPv4 behavior. Write RED tests, minimal fix, run verification; no release before full gates.
- Planned: [x] RED mapped IPv4 tests; [x] fix; [x] unit/build/typecheck/lint; [x] CI and Test evidence; [x] final HOLD record.

## In progress (2026-10-26 04:33 KST)
- Reproduced security bypass before implementation: `isPrivateIp('::ffff:7f00:1')` returned false; mocked DNS `::ffff:7f00:1` was accepted by `assertSafeOutboundUrl`. TDD RED: 2 failures / 9 tests.
- Root cause: `isPrivateIPv6` handled only `::ffff:` dotted-decimal strings. Equivalent hexadecimal/expanded mapped IPv4 escaped the private-range classifier.
- Added `node:net` CIDR-based mapped-prefix recognition and decoded final two hextets to IPv4 bytes before applying the existing IPv4 private/reserved policy. Public mapped IPv4 remains allowed.
- GREEN: `ssrf-defense.test.ts` and `ssrf-redirect-credentials.test.ts` 14/14 PASS. No API path, response shape, DB schema, migration, ledger or WLD changes.
- Mid-run `origin/main` checked and English/Korean living plans reread; no main advancement.
- Remaining: full gates, PR/CI, official exact-SHA Test.

## Finished (2026-10-26 04:42 KST) — PARTIAL / BLOCKED
- Security regression RED 2 failures (DNS private mapping accepted); GREEN 14/14 tests on fix.
- Backend unit suite 1,314 passed / 398 skipped; DB package 15 passed / 3 skipped; contract package 38 passed; API contract 179 endpoints verified.
- Workspace typecheck PASS; backend build PASS; lint PASS (0 errors, 1,128 existing warnings); repository security and control-byte scans PASS; 18/18 security baseline and 6/6 additional security tests PASS; bot 8/8 PASS after linking existing offline dependencies.
- Frontend suite 1,397 passed / 6 failed (SEO x3, mobile login, calculator registration, admin M2); root `pnpm test` FAIL on same 6. Default Turbopack build FAIL due to isolated symlinked `next` package resolution; fallback Webpack build PASS.
- Supply chain audit FAIL: production 2 high; full 2 critical, 10 high, 11 moderate, 3 low. Existing QA Draft #1317 addresses some of these; not in main.
- Real isolated PostgreSQL app-role/migration tests NOT RUN (no DB change; do not access shared live dev/Production DB); official authenticated Test exact-SHA/E2E BLOCKED by failed required gates. No main merge, no Test deployment, no Production promotion, no branch cleanup.
- Last verified main SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; candidate SHA is recorded in PR/CI. Test `/api/version` SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917` (both HTTP 200, not candidate).
- Root filesystem 99% (~1.3GiB free), data volume 71% (~56GiB free). No other worker branch/worktree or automation schedule changed.
- API contract: no endpoint, status or payload change; outbound SSRF validation rejects DNS answers mapping to private IPv4 even if represented in IPv6 hex. DB schema, applied migrations, grants, WLD and immutable ledger unchanged.
- **Release gate: HOLD.** Keep Draft PR unmerged until full CI, dependency audit, real isolated Test exact-SHA, authenticated API/security/core-flow E2E, and approved GitOps release evidence pass.
