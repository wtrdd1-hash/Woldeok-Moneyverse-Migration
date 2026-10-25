# Backend B v538 — Marketplace P2P service fail-closed

## Before
- Start main: 1c5b84a1c45baafcca83f375a6f99698121e9bb5.
- Branch: auto/hourly-b-marketplace-p2p-service-hold-v538-20261025-2035.
- miniPC Debian 13.6, root 98% (2.6GiB free), data volume 62% (72GiB free).
- Baseline marketplace controller tests: 5/5 PASS.
- P1 #1314; C Draft #1313 holds browser P2P; NestJS service still has unjournaled direct SQL and owner-scoped read that is unauthorized under DB least privilege.
- Scope: read and all four P2P service mutations; no new API route, DB grant/migration, WLD, or live DB write.
- Required full-stack gates and official Test exact-SHA not waived. Production HOLD.

## During — actual code and API contract
- RED: seven new tests failed on baseline service, including direct DB mutations that returned true and absent-pool errors.
- GREEN: five P2P MarketplaceService methods now throw HTTP 503 with stable code MARKETPLACE_P2P_SETTLEMENT_UNAVAILABLE, before any query: GET /marketplace/trades; POST /marketplace/trades; POST /marketplace/trades/:id/accept, /confirm, /cancel.
- Controller preserves SessionGuard, AuthenticatedGuard, ConsentGuard, mutation CsrfGuard and returns Cache-Control: no-store for all five P2P endpoints. Swagger summaries no longer promise atomic swaps. Existing mocked controller test renamed to distinguish delegation from settlement evidence.
- No route added/removed, DTO change, schema/migration, database grant, ledger write, or WLD movement. Existing non-P2P marketplace paths unchanged.
- Development C Draft #1313 already holds Next.js P2P entry points. This branch closes the separate NestJS service bypass, not the complete feature. Existing legitimate cancellations remain unavailable pending safe escrow and consent design.

## Verification — miniPC Debian 13.6
- Focused controller+service regression: 13/13 PASS; prior controller baseline 5/5 PASS.
- Backend full: 1320 PASS / 398 SKIPPED; Backend typecheck and build PASS.
- Database package: 15 PASS / 3 SKIPPED.
- API contract generator/check: 179 endpoints, 638 controller methods, PASS.
- Repository lint: exit 0, 0 errors, 1128 existing warnings. Full workspace typecheck PASS.
- Frontend full tests: 1397 PASS / 6 FAIL across four files (outside this Backend P2P change); default Turbopack build FAIL due to symlinked dependency resolution outside worktree; alternative Next Webpack build PASS.
- Production dependency audit FAIL (body-parser, multer: 2 High). Full audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low).
- Isolated disposable PostgreSQL 17.11: synthetic app role direct P2P SELECT denied SQLSTATE 42501; real pg client invoking all five service methods got 503 (5/5), seeded trade remained PROPOSED. Disposable container removed. This is NOT full migration parity or official Test evidence.
- Authenticated frontend/Android E2E and official Test exact-SHA finance/core flow NOT RUN. CI status pending PR creation. All required release gates not green.

## Mid and release hold
- Remote main remained 1c5b84a1c45baafcca83f375a6f99698121e9bb5 at start, mid and pre-push; English/Korean PROJECT_PLAN re-read. QA and A/C PRs compared; no overlapping backend P2P service PR found.
- Test version (read-only): 6f697e74b7bf0cd1e4521d36534cfd9c140f8010; Production version: 6a989b5ac0c6155587d43426d64f6def6b62c917. Neither is this candidate.
- miniPC root 98% (about 2.5GiB free), data volume 63% (about 71GiB free).
- Draft PR only. No main merge, Test deployment, Production deployment, branch deletion, service restart, or live database write. All A/C/QA/Gemini worktrees preserved.
