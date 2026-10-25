# QA — A0425 Private Shop Upkeep and Arrears CSV (2026-10-26 KST)

**Decision: PARTIAL / BLOCKED — PRODUCTION RELEASE HOLD.** The initial generic inventory CSV overlapped unmerged Draft #1299 and was replaced before integration by a distinct P1 maintenance-exposure snapshot. Main base: 1c5b84a1c45baafcca83f375a6f99698121e9bb5. Draft PR #1367.

## Delivered source
- Guarded owner-only GET /api/v1/shop/holdings/upkeep-snapshot, using existing shop_my_items_v2 SECURITY DEFINER function. Only current holdings with weekly upkeep, arrears or suspension. No client actor parameter, no financial writes or migration.
- Strict completeness cap of 100 **relevant** holdings, fail-closed on missing/corrupt upkeep/arrears/cap/unpaid weeks/suspension. Minimal JSON field allowlist. WLD values remain exact canonical bigint strings.
- Member /inventory links to /api/shop/holdings/upkeep-export (CSV), private/no-store/noindex, UTF-8 BOM/CRLF, CSV formula/invisible-control defense, malformed source and auth failure refuse attachment. Android app-api forwards cookie and private response.
- This is a current exposure report, not a payment receipt, debt settlement, purchase record, or proof of financial reconciliation.

## Verification
| Gate | Result |
| --- | --- |
| MiniPC | Debian 13.6; backend/frontend/bot/MCP/nginx/docker active; root 99%, data 71% |
| TDD RED→GREEN | New upkeep backend 18 PASS + frontend/Android 21 PASS; privacy allowlist RED→GREEN backend 19 PASS |
| Typecheck | PASS after deleting stale Next generated route types |
| Lint | PASS, 0 errors, 1128 warnings |
| Build | PASS (isolated offline pnpm install; Next/Nest/contract) |
| Contract | 38 PASS; Android private-session test PASS |
| Database package | 15 PASS / 3 SKIPPED |
| Backend full | 1319 PASS / 398 SKIPPED on pre-privacy-whitelist source; focused privacy 19 PASS |
| Frontend full | 1408 PASS / 6 FAIL: SEO/i18n 3, login a11y 1, calculator CTA 1, admin M2 1 |
| Bot tests | 8 PASS |
| Production dependencies | FAIL: 2 High |
| Full dependency audit | FAIL: 2 Critical / 10 High / 11 Moderate / 3 Low |
| Bot dependency audit | FAIL: 1 Critical / 5 High |
| Real isolated PostgreSQL | 17.11, wdmv_v761_test_acl, 281 migrations; synthetic upkeep item owner 1 / foreign 0; function EXECUTE true, user_items SELECT/INSERT false, ledger INSERT false; exact monetary fields, ROLLBACK, 0 fixture rows |
| Official Test exact-SHA authenticated E2E | BLOCKED: Test runs 6f697e74b7bf0cd1e4521d36534cfd9c140f8010 |
| Production | HOLD: runs 6a989b5ac0c6155587d43426d64f6def6b62c917 |

The DB function accepts the actor UUID passed by NestJS; it does not independently authenticate a PostgreSQL principal. Session/auth/consent guards are mandatory. No operational member E2E on the candidate SHA was claimed. Final exact SHA CI results and any changes to gate counts must be appended to PR #1367.

## Branch and release audit
Initial remote 219 heads / 215 open PRs; later 221 / 217, including other workers. Duplicate remote tip SHAs: 0. Conflicting #1107/#1110/#1143 preserved; unique unmerged branches and Draft #1299/C #1176 protected. Deleted branches: 0. No main merge, Test/Production promotion, service restart, Production DB/ledger write, GitOps change or rollback executed. Rollback if authorized: revert feature routes and link; schema/data unaffected.

**Merge and release blocked** until all full gates PASS, final SHA CI, isolated PostgreSQL and official Test exact-SHA authenticated owner flow, security remediation, approved GitOps gate, smoke/login/version/DB verification.
