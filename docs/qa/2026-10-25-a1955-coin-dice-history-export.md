# QA — Development A — 2026-10-25 19:55 KST — Coin/Dice History CSV

**Verdict: PARTIAL / BLOCKED — DO NOT MERGE OR DEPLOY.**

## Scope and evidence
- Fresh origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; isolated branch `auto/hourly-a-casino-history-export-20261025-1955`; implementation commit `c58e3ec020cbad0b1d4c5292615c3964b86b94ce`.
- P1 user feature: authenticated member CSV export of up to 100 server-recorded coin/dice plays, using existing `member_casino_history(actor, limit)` SECURITY DEFINER DB read function. Includes exact integer strings, ledger transaction **reference** (not independent posting verification), privacy/noindex, formula-neutralized CSV and keyboard-accessible UI link. Android JSON app-api forwards limit and member cookie; default 20 preserved.
- No migrations or ledger writes. Never call these records proof of payout; no other theme games are included.
- RED observed before code: backend parser/SQL/limit 3 failures, frontend route/UI absent, Android test expected compatibility alias corrected. GREEN: backend 14/14, frontend 12/12.
- Isolated PostgreSQL 17 `wdmv_v761_test_acl`: 281 migrations, 32 active members, 0 coin plays and 0 dice plays. `BEGIN READ ONLY; SET ROLE moneyverse_app;` history EXECUTE true, private coin/dice table SELECT false, ledger INSERT false, owner history query limit 20/100 executed; `ROLLBACK`. Positive fixture/authenticated actual-play E2E **BLOCKED** (no play records).
- `pnpm typecheck` PASS after fixing a test-only TypeScript inference error. `pnpm lint` PASS (0 errors, 1128 warnings). `pnpm build` PASS, route `/arcade/history/export` included. Android `pnpm api:contract:check` PASS (179 endpoints); bot 8/8 PASS after offline dependency installation.
- `pnpm test` FAIL: backend 1326 PASS / 398 SKIPPED; frontend 1407 PASS / 6 FAIL. Failures: SEO/i18n 3, login touch targets 1, calculator registration link 1, admin M2 telemetry 1. Independent QA Draft #1317 owns proposed regression repair; do not cherry-pick without release review.
- Security: `pnpm audit --prod --audit-level high` FAIL (2 High); full audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low); bot audit FAIL (1 Critical, 5 High). QA Draft #1317 may address prod advisories but remains unmerged.
- Official exact-SHA Test authenticated web/Android and financial E2E, backup/restore, GitOps release gate **NOT PASS**. Official Test SHA parity not established.

## Integration / rollback
- Production-linked DB 5433 untouched; isolated DB read-only and rolled back. No service restart, Test/Production release, main merge or branch deletion.
- Rollback: revert candidate commits or remove export route/link; backend history default remains 20 and existing DB function unchanged. No data rollback required.
- Start remote branches 182 (181 non-main), open PRs 178; conflicts #1107/#1110/#1143. All 181 pre-existing non-main refs had unmerged unique commits; preserve them. Final counts and exact final PR SHA must be confirmed in GitHub PR.
