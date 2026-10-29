# QA A1225 — verified shop compare recovery / FAILED-HOLD

Source main: `a28bed9aa40ff74d492824ae12892a7d52132fdd`; code SHA `e6c4782d27ddf9fbf9e7dda7e34d27bcc26cc20f`.

| Gate | Evidence | Result |
| --- | --- | --- |
| RED and targeted Backend/Frontend tests | 03, 15, 12 logs | PASS after isolated dependencies |
| Backend all | 20-backend-all.log | 1933 PASS / 441 SKIP |
| Frontend all | 20-frontend-all.log | 1870 PASS / 1 FAIL (pre-existing admin blog) |
| Database unit | 20-db-all.log | 45 PASS / 3 SKIP |
| Bot | 22-bot-tests.log | 11 PASS |
| Typecheck / lint | 20-typecheck, 20-lint | PASS / 0 errors, 1102 warnings |
| Backend / Next production builds | 20-backend-build, 20-frontend-build | PASS |
| Android app-api contract | 30-contract-after-code-commit | 181 endpoints PASS |
| Real isolated PostgreSQL 17.11 | 24/25 SQL+log | PASS, synthetic schema and actual migration-123 read function |
| Security audit | 26/27 JSON | root High/Critical 0, Moderate 1; bot 0 |
| Root project tests | 31-root-project-test.log | FAIL at unchanged admin blog test |
| Authenticated exact-SHA official Test / E2E / backup restore / Production | No valid proof | BLOCKED |

Risk: active PR #1677 modifies overlapping shop controller and app-api route; do not force merge. P0 #1663 rescue refs 352/352 preserved. Shared DB app-role privileges and Production identity remain unverified. No deployment permitted.
