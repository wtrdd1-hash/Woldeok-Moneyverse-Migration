# 2026-10-27 — Owner-scoped bank loan response privacy (Development A)

## Before work (21:28 KST)
- Authority: main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`, isolated branch `auto/hourly-a-bank-private-cache-20261027-2125`.
- Reviewed `AGENTS.md`, `README.md`, English/Korean `PROJECT_PLAN`, integrated English/Korean planning masters, QA v1323/v1324, existing bank SQL function and app API contract, prior A worklog and open PR inventory.
- Existing `public.bank_my_loans(p_actor)` is owner-scoped and limited to 20 rows; `GET /api/v1/bank/loans` is authenticated; `/bank` is dynamic/noindex. The Android gateway copies upstream cache headers for `bank/*`, allowing an upstream `public, max-age` header to persist owner-specific loan records across account changes. The backend loan GET also lacks an explicit private no-store header.
- Approved user goal: a P1 end-to-end security/privacy hardening of an existing bank loan feature without touching money, schema, roles, sessions or migrations. Scope: NestJS loan read response + Android bank/banking proxy success/error/version-denial paths; preserve public app contract metadata. RED→GREEN regression tests. Other A/B/C/Gemini changes untouched.
- Production/Test hold: existing main migration duplicate 280, security audits, Test exact-SHA identity and DB ACL concerns. No merge or deployment without independent full gates.

## In progress
- [ ] RED tests for backend loan response and Android bank/banking success/failure/version rejection.
- [ ] Minimal implementation without changing bank SQL or money types.
- [ ] Focused and broad verification; record exact SHA, PASS/FAIL/SKIP.
- [ ] Recheck latest main and integrated plans before integration.

## Finished
- Pending.

### Mid-work checkpoint (21:30 KST)
- Fresh main recheck: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` unchanged. Integrated planning EN/KO SHA256 unchanged (`506c291f...`, `630a8293...`).
- RED backend loan cache metadata **1 FAIL**; RED Android bank/banking cache cases **4 FAIL / 12 PASS**. Failures are missing no-store headers, not environment failures.
- GREEN backend focused **2 PASS**, including real Nest HTTP 200 with exact integer-string outstanding amount `9007199254740993` and private no-store; Android gateway focused **16 PASS** (bank loan, banking standing, 502, 426 and public contract metadata unaffected).
- Minimal implementation: `@Header('Cache-Control', 'private, no-store')` on authenticated Nest bank loans GET; Android gateway always overrides bank/banking response cache headers after proxy, including early errors. Existing SQL owner-scoped function, session guards, amount representation and public contract unchanged.
- Broad gates and isolated DB authorization still pending; no release/merge authority claimed.

### Verification and release decision (21:38 KST)
- Candidate code SHA `44517731aea99d74c0f3b6ca280fe7be01cce7bc`, main start/mid/pre-integration SHA `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`. Integrated English/Korean plans remained unchanged by SHA256. Main is ancestor; GitHub PR #1580 reports mergeable, but **no merge is authorized**.
- Full gates: typecheck PASS; lint PASS (0 errors/1,122 warnings); backend **1,546 PASS/412 SKIP**; frontend **1,490 PASS**; contract **38 PASS**; Android contract **179 endpoints PASS**; backend build PASS; frontend Webpack build PASS; bot **8 PASS**; route-ledger unit **3 PASS**.
- FAIL: root `pnpm test` due main's duplicate migration 280/missing 282 (19 database PASS/1 FAIL/3 SKIP); `qa:route-ledger:check` missing required `--inventory`; full dependency audit Critical 2/High 8, bot audit Critical 1/High 5. GitHub Build Test Candidate run 40504193346 reproduced migration parity FAIL. CI run 40505060961 was in progress at 21:37; not claimed PASS. Separate existing #1564 repair remains Draft/HOLD.
- Isolated PostgreSQL setup command was denied by remote execution safety policy before execution; no ephemeral DB fixture or full-chain bank ACL test was completed. This is BLOCKED, not PASS. Read-only query of the known Production-connected DB confirmed `moneyverse_app` can EXECUTE `bank_my_loans(uuid)` **and** directly SELECT/UPDATE `virtual_bank_loans`; this is P0 least-privilege exposure documented in existing #993, not fixed by this cache PR. No member rows or balances were read or modified.
- Official Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals candidate or main. Test canonical symlink is dangling. Exact-SHA authenticated Test E2E, real-PG full-chain proof, full accessibility/SEO browser evidence, independent backup restore and GitOps release gate remain BLOCKED.
- GitHub audit start/end: 369→370 non-main branches; 360→361 open PR; 345→346 Draft. End 65 conflicting PR, 216 PR with failed/cancelled/timed-out checks, 0 duplicate head SHA groups, 1 unavailable Git object, 365 unique-unmerged branch heads, 4 merged heads. **0 branches deleted**; merged heads retained pending ownership/cleanup permission review, all unique unmerged work protected. No overlapping A/B/C/Gemini/QA workspace changed.
- Changed paths: `backend/src/wallet/wallet.controller.ts`, new `backend/src/wallet/bank-loan-cache.test.ts`, `frontend/src/app/app-api/v1/[...path]/route.ts`, its `route.test.ts`, and this worklog. No DB migrations or grant changes.
- Test/Production deployment **0**, main merge **0**, production SQL writes **0**, ledger changes **0**, feature switch changes **0**, service restarts **0**, rollback **0**. Before merge rollback = close Draft PR and retire branch only after preserving evidence; after future merge = code-only revert after review, no schema rollback needed. **Final disposition PARTIAL/BLOCKED — Production RELEASE HOLD**.

## Finished (21:38 KST)
- [x] RED tests for backend loan response and Android bank/banking success/failure/version rejection.
- [x] Minimal implementation without changing bank SQL or money types.
- [x] Focused and broad verification; PASS/FAIL/SKIP recorded, real-PG and exact-SHA Test explicitly BLOCKED.
- [x] Rechecked latest main and integrated plans before integration; Draft/HOLD PR #1580 created, no integration performed.
