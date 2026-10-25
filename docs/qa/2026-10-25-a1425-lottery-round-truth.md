# QA A1425 — Verified public lottery round records (2026-10-25 KST)

**Decision: PARTIAL / BLOCKED. Production RELEASE HOLD.** Draft PR #1284. Follow-up P0 issue #1283.

## Baseline and scope
- MiniPC Debian 13.6 accessible, backend/frontend/bot/MCP/Nginx/Docker active. Root 90% used; data disk 54%.
- Original main 3a116b27556a577105b659b3bc9790802949d72d. Mid main 91babf77; branch synchronized through main 82ea48be; final pre-report main 91b60e506c41da7ce0e3e0b9369654e8eafdce6f (unrelated i18n tools copy). Code SHA 993779971fe4f20deb540b0d17aaecdd41fa5051.
- Existing /tools Mega Jackpot widget claimed fictional rounds 40–42, 1,450,000 WLD jackpot, 725,000 WLD burned, two owned tickets, fake 100 WLD purchases, and a fictional HMAC seed. Those claims were not backed by API, DB, ledger or receipt.
- Implemented bounded public GET /api/v1/lottery/rounds from PostgreSQL round records, Next GET /api/lottery/rounds with no-store/503, Android GET /app-api/v1/lottery/rounds via gateway allowlist, and an accessible read-only public card.
- Strict status, dates, unique draw numbers, integer-string WLD validation. No personal tickets or draw results before SETTLED; no burn, payout, cryptographic proof or real purchase claims. No migration, no money writes.

## Evidence
- RED tests reproduced missing backend/Next/API modules and Android allowlist before implementation.
- GREEN: backend repository/controller/HTTP 7/7; frontend new parser/route/card/gateway 7/7 plus existing gateway 14/14 = 21/21.
- Full suite on synchronized SHA 9552f6ae: contract 38 PASS; DB 15 PASS / 3 SKIPPED; backend 1,320 PASS / 398 SKIPPED; frontend 1,404 PASS / 6 FAIL.
- Frontend failures: SEO/i18n route integrity 3; login 44px accessibility 1; calculator registration route 1; admin M2 telemetry 1. Prior app-gateway allowlist regression was corrected and 14/14 retested.
- Full Typecheck PASS, Lint PASS (0 errors, 1,116 warnings), backend/Next build PASS on SHA 99377997. Full exact final-doc SHA test must be checked separately; no inference of PASS from focused tests.
- Production dependency audit FAIL: High 2; full pnpm audit FAIL: Critical 2, High 10, Moderate 11, Low 3 (26 total). Bot npm audit FAIL: Critical 1, High 5.
- Real isolated PostgreSQL 17.11 container mv-v855-postgres, database moneyverse_audit_v855, 276 applied migrations: as moneyverse_app in BEGIN READ ONLY, round 1 OPEN returned (price 1000, pool 100000000, tickets 0); INSERT on rounds and UPDATE on ledger_postings denied. ROLLBACK. No write or seed fixture.
- Official exact-SHA Test backend/API/DB/auth/finance E2E not performed. A passing local query or CI build is not Test attestation. CI/Test Candidate pending as of 14:42 KST.

## Branch and release audit
- Remote refs at start 152 (including main and symbolic origin); at report preparation 153. Open PRs 147 -> 148 (includes Draft #1284).
- 151 remote non-main refs with unmerged unique commits, one symbolic origin ref; no verified safe deletion. Branches deleted 0. Conflicting PRs #1143/#1110/#1107 and all Gemini/A/B/C work preserved.
- No main merge, no official Test promotion, no GitOps release, no production restart, no DB write, no financial rollback required. Release remains HOLD pending full frontend, security, exact-SHA Test and CI gates.
- External audit snapshots: /srv/moneyverse-data/reports/a1425-{branches.txt,open-prs.json,ci.json,branch-uniqueness.txt}. Test/build/audit logs likewise prefixed a1425; no credentials committed.

## Rollback
The change is isolated in an unmerged Draft PR; discard this branch if review rejects it. There is no DB migration or financial mutation to roll back. Do not re-enable fictional lottery purchases; P0 #1283 must supply audited ledger-backed commands before any activation.
