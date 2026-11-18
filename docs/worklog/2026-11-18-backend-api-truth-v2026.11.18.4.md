# Backend API Truth Recovery Worklog — v2026.11.18.4

Status **QA SOURCE PASS / OFFICIAL TEST BLOCKED / PRODUCTION APPLICATION NOT PROMOTED**. See [full findings](../findings/2026-11-18-backend-api-data-truth-v2026.11.18.4.md).

## 01 START — 2026-11-18 KST
Owner prioritized website backend APIs and broken data retrieval. Re-read authoritative living plan, integrated master and local Superpowers debugging/TDD/verification instructions. Verified remote `main` 0590fac4, unchanged shared/local Git worktrees, separate v4 branch based on v3 SHA 462e230c. Private MiniPC start log exists and records privacy constraints, isolated Test-only read-only DB and no financial mutations. Base v3 clean 144/144 JUnit and earlier P0 Nginx guards were not treated as positive authenticated E2E.

## 02 MIDDLE — authoritative diagnosis and first TDD
Measured actual Production Spring API vs exact connected Production PostgreSQL **counts only**: shop 2/146, business 2/9, stocks 10/10. Prod anonymous work dashboard 200/29 assignments, trade history 200/2, private profile 200; confirmed dangerous default-actor/header impersonation in source. PostgreSQL function arguments/return fields did not match Java for work, business and stock transactions. First nine source-truth tests **8 RED**, then focused GREEN after admin/work/business/stock fixes. No production user rows printed or ledger writes.

## 03 MIDDLE — second source-truth cycle
Notification and Club services also returned invented empty/success on source error; missing club returned fake object; join/leave claimed success without persisted mutation. Six RED tests failed, GREEN after session/CSRF, source-truth, 404/503 fixes. Replaced historical H2 synthetic success expectations with expected fail-closed assertions; kept positive actor/CSRF unit checks. `clean test bootJar` passed 169/169, 0 errors/skips, and generated versioned JAR.

## 04 MIDDLE — independent HTTP and Production safety
Isolated candidate 8541a471 + immutable artifact bf626... bound only to localhost 4613, separate read-only Test DB `wdmv_v761_test_acl` on 5585, Discord bot disabled. HTTP public shop146, stocks10, business9 equals matching Test DB counts; invalid/anonymous private work/stocks/business/notification/profile/admin 401, missing club 404. 124 bounded read-only GETs 85/27/12 (200/401/503); 123 invalid-admin-path requests 401. Live official public Test still 502; static admin HTML still pre-renders an error. Not all 903 OpenAPI paths tested. Valid authenticated E2E and financial settlement not executed.

## 05 LIVE P0 containment, reversible
Due observed Production anonymous private data leakage, Nginx temporary restrictions expanded to private member APIs and stock/club mutation routes, with SHA-guarded previous-config backups, `nginx -t` and graceful reload; private sample 403, public samples 200. Production Spring process PID unchanged, Production canonical DB not mutated. Valid member functions are temporarily blocked too; this is a security hold, not a functional repair release.

## 06 END — outcome
Source commits `61f86efb2c775837142263750c15b05deac8a315` and `8541a47167b84248774cba8e92e168269c9683d2` on isolated v4 branch. English+Korean findings/worklog/public update/changelog prepared. Internal detailed updates stay mode 600 on MiniPC and remain excluded by `.gitignore`. **Production application promotion intentionally NOT performed**: official Test 502, authenticated positive/money ledger, all API owners and dynamic Web UI, backup/rollback acceptances are not certified. Audit issues #3265/#3202 stay open.
