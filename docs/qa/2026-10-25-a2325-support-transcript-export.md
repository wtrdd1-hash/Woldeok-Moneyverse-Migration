# QA — A2325 Owner-Bound Support Transcript CSV (2026-10-25, RELEASE HOLD)

## Scope and identities
- Debian 13.6 miniPC direct MCP status + shell verification: backend/frontend/Discord/MCP/Nginx/Docker ACTIVE. Root disk 98% used, data disk 66% used.
- Branch: `auto/hourly-a-support-transcript-export-20261025-2325`, independent worktree under `/srv/moneyverse-data/worktrees/`.
- Authoritative `origin/main` at start, midpoint and pre-final: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Initial worklog commit `5c04ad80fae481c284765805445c0b338ce21540`; implementation commit `d131a4b3302573c3a3c8f9afd5bd468be9e1b64e`; final PR head is recorded on Draft PR #1341.
- English README, AGENTS.md, `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, Korean secondary plan, previous A2225 QA/worklog and all open PR/CI reviewed. No edits to other agents' worktrees or applied migrations.

## Delivered P1 code (not deployed)
- Backend `GET /api/v1/support/threads/:id/transcript` requires Session/Authenticated/Consent guards and a UUID. Existing `support_thread_messages(p_actor,p_thread,500)` SECURITY DEFINER function rejects foreign/unknown threads. Only its specific 42501 refusal becomes generic 404; genuine missing-table grants remain server errors. Maximum first 500 messages; cap hit yields `truncated: true`, never an unverified complete-history claim.
- Web `/support/threads/[id]/export`: same-origin server-only API, canonical UUID validation, 401/403/404/428 and 503 fail-closed responses, private no-store/noindex, safe content disposition and CSV formula/control/quote defense. Selected support thread has an accessible 44px-minimum download link and explicit limit warning.
- Android app-api proxies the same owner-bound JSON and session cookie, forcibly marks the transcript private no-store/noindex even for errors. EN and KO mobile contract schema reference generated for the new endpoint; 180 endpoints in catalog.
- Existing PostgreSQL function reused; no migration, no direct app-role table access, no ledger change, no WLD or external file storage.

## Verification evidence
- TDD RED: 3 missing backend handler tests failed; 2 frontend suites failed to import missing modules. GREEN: Backend 4/4; Frontend/Android/CSV/UI 8/8.
- `pnpm typecheck` PASS after correcting a test-only Vitest mock tuple typing defect. `pnpm lint` PASS, 0 errors / 1,128 warnings. `pnpm build` PASS; backend and frontend built. `pnpm api:contract:generate` produced 180 endpoint docs; final `pnpm api:contract:check` must be re-run after the generated contract is committed.
- `pnpm test` FAIL: Backend **1,317 PASS / 398 SKIPPED**; Frontend **1,405 PASS / 6 FAIL**. Six failures: SEO/i18n 3, login mobile touch target 1, calculator registration link 1, admin M2 telemetry 1. Database-backed tests skipped in generic test suite are not counted as PASS. Separate real-PG proof below.
- Bot tests initially failed because the isolated worktree lacked `youtube-dl-exec`; using existing local bot dependency tree yielded **8 PASS**, and temporary symlink was removed. No repository dependency or lockfile change.
- Security: `pnpm audit --prod` FAIL (2 High); full `pnpm audit` FAIL (2 Critical / 10 High / 11 Moderate / 3 Low); bot `npm audit` FAIL (1 Critical / 5 High). Security gate is RED.
- Changed-surface accessibility/SEO: member route robots noindex/nofollow; 44px accessible download link with description; no-store/noindex on web and Android; focused tests PASS. Full SEO/a11y suite remains FAIL.

## Real isolated PostgreSQL evidence (2026-10-25 23:32 KST)
- Existing isolated `moneyverse-test-db` PostgreSQL 17.11, database `wdmv_v761_test_acl`, 281 applied migrations. Do not confuse this with the Production-connected dev database on port 5433; **no writes to that database**.
- Transaction created one temporary support thread and message for an existing active synthetic test member. `SET LOCAL ROLE moneyverse_app` returned exactly 1 owner message from `support_thread_messages(actor,thread,500)`; unrelated actor received SQLSTATE 42501 `support thread not available`. Direct `SELECT public.support_messages` and `INSERT public.ledger_transactions` both failed with permission denied.
- Explicit `ROLLBACK` and post-check confirmed `FIXTURE_REMAINS|0`. No persistent test fixture, Production data modification, or schema mutation.
- The exact production frontend→backend→DB authenticated end-to-end flow is **NOT** proven on the candidate SHA.

## GitHub branch/PR audit and release gate
- Starting remote heads 197 and open PRs 193; post-implementation inventory before PR creation: 199 heads, 193 open PRs (other agents contributed). Of 198 non-main heads, 198 held unmerged commits; missing Git objects 0; duplicate tip/tree/last-patch groups 0. Conflicting PRs #1107, #1110, #1143 retained; failing CI PRs retained. Branch deletions **0**.
- Draft PR #1341. Re-fetch `main` and living plan before integration; all existing unique B/C/Gemini/QA/planning work protected. No rebase, cherry-pick, main modification, branch deletion or PR merge.
- Public official Test API `/api/version` returned `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` (HTTP 200); Production API `6a989b5ac0c6155587d43426d64f6def6b62c917` (HTTP 200), both different from candidate. Exact-SHA Test deployment, authenticated owner/foreign HTTP E2E, host release identity, full CI, security and GitOps gate not PASS.
- **Production RELEASE HOLD**. No official Test promotion, Production deployment, service restart, financial mutation or migration.

## Rollback
- Before merge: close/abandon Draft PR; leave `main` and deployments unchanged. After an authorized merge (not attempted), revert the new backend read endpoint, web CSV route/link, Android privacy path and mobile contract docs as one change. No migration rollback needed; existing `support_thread_messages` is untouched. Verify authenticated member support conversations still work, no private CSV path leaks, and production version/session/DB smoke checks only after an approved release.

**Final: PARTIAL / BLOCKED — no full green gates, no release.**
