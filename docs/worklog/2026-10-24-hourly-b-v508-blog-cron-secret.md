# B v508 — Blog Cron Credential Hygiene (P1, #1137, HOLD)

## Start
- Canonical `origin/main`: `49788d09494fed3e463651945b83386e87dd47bc` (2026-10-24 15:40 KST).
- miniPC Debian 13.6 active; live 04:00 debian cron contains an inline x-cron-secret; value not copied or logged.
- P1 #1137 is not being modified by A/C/QA; separate worktree/branch.

## Checklist
- [x] Read AGENTS, README, EN/KO plans, open PRs, QA/CI, and relevant code.
- [ ] RED: add isolated no-network script regression tests and demonstrate failure.
- [ ] GREEN: add safe credential-file runner and remove scheduler hardcoded fallback.
- [ ] Verify focused tests and full gates; record failures/skips.
- [ ] Re-fetch main/plans and CI, create Draft PR only if verified.
- [ ] Exact-SHA Test, production rollout and cron replacement: HOLD pending security/release gates.

## Contract
- No change to POST /api/blog/generate API; still rejects missing/invalid scheduler credential.
- Host cron operator must provision private header file and rotate server credential in coordinated approved rollout. Existing 04:00 cron is NOT altered by this PR.
- No DB/migration/ledger changes.

## Midpoint (2026-10-24 15:44 KST)
- RED: 6/6 tests failed against missing script and insecure scheduler fallback; output recorded internally as `red.txt`.
- GREEN: 6/6 passed with private-file runner, strict owner/mode/header checks, curl `--header @file`, and scheduler default-deny when credential absent.
- No credential contents were read into command-line arguments or copied to task logs.
- Main re-fetched unchanged `49788d09494fed3e463651945b83386e87dd47bc`; no open PR overlaps code files.

## Operator-only rollout (NOT executed)
1. After security review, generate a **new** credential using an approved secret manager and update the Frontend's `INTERNAL_API_SECRET` (or `CRON_SECRET`) using the authorized release procedure. Never include the value in shell history, arguments, GitHub, or logs.
2. Provision `/etc/moneyverse/blog-cron-header` containing exactly one line `x-cron-secret: <rotated-value>` and trailing newline, owner `debian`, mode `0600`, protected parent directory. Use an approved secret-file provisioning mechanism, not `echo` or `printf` with literal values in the shell command.
3. On the approved host rollout, replace only the legacy `0 4 * * *` blog-generation entry with `0 4 * * * /path/to/approved/release/scripts/ops/run-blog-generation-cron.sh` (and an appropriate non-sensitive exit-status log); do not leave duplicate writers. Check the actual installed release path rather than assuming `/srv/moneyverse` exists.
4. Verify on an isolated exact-SHA Test stack with a **test-only** secret, an unauthorized 403, one authorized 201, no credential in `ps`/cron/logs, and no duplicate blog publication. Coordinate server/caller cutover and revoke old credential after acceptance.
5. Roll back only via approved GitOps/security procedure, never by restoring the inline secret. If no safe credential is available, keep the job disabled rather than bypassing the check.

**Current host:** the original 04:00 cron still embeds its old credential. This PR does **not** remediate live exposure until approved host rollout and rotation; P1 #1137 remains OPEN/HOLD.

## Final local verification (2026-10-24 15:47 KST)
- Second RED/GREEN: new non-201 test failed before status check; after fix **7/7 PASS** (isolated fake curl, no HTTP to live service).
- Backend scheduler unit tests **15/15 PASS**; DB package **15 PASS / 3 SKIPPED**; API contract PASS.
- Full lint PASS (0 errors, 1,137 warnings); typecheck PASS; build PASS.
- Frontend suite **1,395 PASS / 5 FAIL** (existing locale, SEO ×3, login touch-target).
- Root `pnpm test` FAIL: 1,349 backend PASS / 185 FAIL / 393 SKIPPED because `DATABASE_URL` was deliberately set to invalid local port 1, preventing access to shared live Production/dev DB. This is **not** a valid PostgreSQL integration pass. No live DB writes performed.
- Production dependency audit FAIL: 2 High (`body-parser`, `multer`); bot audit FAIL: 1 Critical / 5 High.
- Isolated real PostgreSQL integration, authenticated end-to-end, official Test exact-SHA, and required GitHub CI are **NOT PASS**; no merge/Production promotion permitted.
- Main re-fetched before PR: `49788d09494fed3e463651945b83386e87dd47bc`, unchanged. EN/KO plan read again.
- No migration, DB, ledger, live cron, credential, Test or Production mutation. No branch cleanup.

## Exit
- [x] RED/GREEN security regression: 7/7 PASS.
- [x] Backend scheduler focused tests, DB package, API contract, lint, typecheck, build recorded.
- [x] Main/plan synchronization before PR.
- [ ] Full test, security audit, isolated PG, exact-SHA Test, CI, security-approved rollout: BLOCKED/HOLD.
- [ ] Production secret rotation and live crontab replacement: not authorized by release gates.
- Outcome: **PARTIAL / BLOCKED**, not production-remediated. Keep issue #1137 open and draft PR unmerged.
- Packaging check found the repository's global `*.sh` ignore rule. The new runner was explicitly force-added to Git; CI must verify the file exists at the candidate SHA.
