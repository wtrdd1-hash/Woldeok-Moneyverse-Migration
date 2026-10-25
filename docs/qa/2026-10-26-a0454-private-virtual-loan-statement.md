# A0454 QA — Private recent-20 virtual loan statement (PARTIAL / RELEASE HOLD)

## Scope and provenance
- Start: 2026-10-26 04:54 KST; main SHA 1c5b84a1c45baafcca83f375a6f99698121e9bb5; isolated branch auto/hourly-a-credit-loan-export-20261026-0454.
- Other workers: A0425 PR #1367, QA #1317, B/C and planning branches untouched. No deletions.
- User feature: /progression private CSV, Backend GET /api/v1/progression/credit/loans/statement-data, Android /app-api/v1/progression/credit/loans/statement-data, existing PostgreSQL bank_my_loans(uuid).
- Important DB correction: the function internally LIMITs to 20; this is NOT a complete archive or a payment/settlement receipt.
- SessionGuard + AuthenticatedGuard + ConsentGuard + server-derived requireUserId; bank_my_loans filters supplied UUID but does not independently authenticate the caller.
- CSV validates the entire payload before sending, preserves WLD integer strings, escapes formulas/controls, and sends no-store/noindex/nosniff. Keyboard-accessible member CTA; Android session forwarding/private headers; 180 endpoint contract EN/KO.

## Test results
- RED tests failed before implementation; GREEN focused Backend 14 PASS and Frontend/Android 18 PASS.
- Typecheck PASS, Lint PASS (0 errors, 1128 warnings), Build PASS; Next dynamic CSV route confirmed.
- Full pnpm test FAIL: Backend 1317 PASS/398 SKIP; Frontend 1405 PASS/6 FAIL; Database 15 PASS/3 SKIP; Contract 38 PASS. Six failures: SEO/i18n 3, login touch target 1, calculator register link 1, admin M2 1. Independent QA PR #1317 has candidate fixes; not copied or merged.
- Production dependency audit FAIL 2 High; full audit FAIL 2 Critical/10 High/11 Moderate/3 Low; bot audit FAIL 1 Critical/5 High.
- pnpm api:contract:generate PASS, 180 endpoints. Verify committed artifacts after commit.

## Isolated PostgreSQL 17.11
- moneyverse-test-db / wdmv_v761_test_acl, 281 applied migrations; Production-linked 5433 never used.
- In one transaction inserted temporary loan (1000 WLD principal, 50 interest, 1050 outstanding), SET LOCAL ROLE moneyverse_app; owner query 1, stranger 0; exact values preserved.
- ACL: bank_my_loans EXECUTE allowed, virtual_bank_loans SELECT denied, ledger_transactions INSERT denied.
- ROLLBACK; remaining test loans 0; Production DB writes 0.

## Release blockers
- Frontend 6 FAIL, audits FAIL, official Test exact candidate SHA not running, no official authenticated login/finance E2E, GitOps gate unapproved.
- Test public backend SHA 6f697e74b7bf0cd1e4521d36534cfd9c140f8010; Production 6a989b5ac0c6155587d43426d64f6def6b62c917.
- Debian 13.6 active services, root disk 99%, data disk 71%. No main merge, official Test/Production deployment, live DB write, restart, branch deletion.
- Final: PARTIAL / BLOCKED; Draft PR and Production RELEASE HOLD.
