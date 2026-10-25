# QA A1521 — Ledger-verified attendance status and unsafe settlement hold

- Date: 2026-10-25 KST. Baseline main: 1c5b84a1c45baafcca83f375a6f99698121e9bb5. Branch: auto/hourly-a-attendance-truth-20261025-1521.
- Scope: one P0 member attendance flow across Backend, PostgreSQL SELECT, Next BFF, /tools and Android app-api. No schema or financial write.
- Finding: /tools invented a three-day streak and 1M–100M WLD jackpots; Backend attendance/spin inserted attendance before ledger posting without an atomic transaction and had a synthetic success fallback. Isolated Test lacks daily_attendance_logs.
- Fix: verified Seoul-date streak from owner MINT_TO_USER ledger postings plus attendance outbox event; explicit unavailable/guest states, private no-store, 503 for unsafe claims in Backend/web/Android. Dormant legacy reward repository is not approved for use.
- TDD: initial Backend 3 FAIL / 1 PASS, Frontend 7 FAIL / 1 PASS, Android 2 FAIL / 10 PASS. Focused final Backend 8 PASS, Frontend/Android 20 PASS.
- Real isolated PostgreSQL: Docker moneyverse-test-db, wdmv_v761_test_acl, 281 migrations; moneyverse_app SELECT on ledger_transactions/postings/outbox/accounts PASS, posting INSERT denied; exact query under BEGIN READ ONLY + SET LOCAL ROLE + ROLLBACK PASS with zero rows. Positive paid-receipt E2E NOT VERIFIED.
- Full Backend: 1,321 PASS / 398 SKIPPED. Frontend: 1,407 PASS / 6 FAIL (SEO 3, login a11y 1, registration link 1, admin M2 1). Database 15 PASS / 3 SKIPPED; contract 38 PASS.
- Typecheck PASS; ESLint PASS (0 errors, 1,124 warnings); Backend build PASS. Frontend initial build failed due external symlinked node_modules, corrected via independent offline pnpm install; final Frontend build PASS. Android app-api contract 179 endpoints PASS.
- Security FAIL: production 2 High; full 2 Critical / 10 High; bot 1 Critical / 5 High. No suppression.
- Official Test checkout 64ef18f68e9ef364833da2bbf4f705f14410959e differs from candidate; /health 200 is not authenticated exact-SHA finance E2E.
- Infrastructure: root 92% used, data 56%; Production-linked 5433 wildcard-bound and dev/Production DB isolation unresolved. No migration, service restart, ledger mutation, main merge or promotion.
- Git audit: 158 remote heads, 153 open PRs, conflicting #1143/#1110/#1107; 0 branch deletions. Preserve all unique unmerged work and B/C/Gemini changes.
- Verdict: PARTIAL / BLOCKED, Production RELEASE HOLD. Rollback while unmerged: leave main and runtime unchanged. After any later approved deployment, use verified GitOps rollback image, never manual ledger edits.
