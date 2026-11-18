# v2026.11.18.16 — Scheduled Semantic QA Execution Runbook

State: Test-only candidate, NOT authenticated full-route QA and NOT an application production promotion. [Korean](QA_SCHEDULED_SEMANTIC_RUNBOOK_v2026.11.18.16.ko.md). Parents: [PROJECT_PLAN](../planning/PROJECT_PLAN.md), [Integrated master](../planning/INTEGRATED_PLANNING_MASTER.md), [verified profile research](../planning/QA_PUBLIC_PROFILE_REFERENCE_v2026.11.18.16.md), [12-step QA draft PR #3269](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3269).

## Measured baseline 2026-11-18 KST

The existing moneyverse-qa.timer runs hourly at :00 and uses the final v2026.11.16.1 immutable script via systemd drop-in. At 15:00:09 KST it recorded 26 HTTP 200, 0 failures, 378 sessions; it explicitly said full_functional_QA=NOT_TESTED. Neither this unit nor its disk hygiene is modified. Official Test returned API/version 200 JSON but home, login, admin, robots and sitemap 502. Public Production returned unknown-route/robots.txt/sitemap.xml as 200 HTML fallback: status-only smoke false-positive risk.

## New Test-only independent scheduler

- Source script: scripts/qa/scheduled-semantic-qa.mjs; tests: scripts/qa/scheduled-semantic-qa.test.mjs.
- Immutable Test release: /srv/moneyverse-data/qa-scheduler-releases/v2026.11.18.16/scripts/qa/scheduled-semantic-qa.mjs.
- New separate moneyverse-qa-semantic-test.timer runs hourly at minute 20 (plus 0–30 seconds jitter), independent of legacy :00 QA.
- Seven anonymous sequential GET only, no session or cookie, no POST, no finance/DB/Discord/Android mutations, no Instagram requests, no cleanup. HTTP 8-second timeout each, 256KiB response cap, systemd 110-second deadline, 128MiB RAM, 25% CPU quota and read-only filesystem sandbox.
- Journald report records timestamp, source suite version, label, route, status, Content-Type, reason, PASS/FAIL/BLOCKED and duration. No responses, personal data or credentials logged. If candidate exact SHA is absent, label UNATTESTED. Full functional, admin-authenticated, finance-ledger, Android, Discord-voice and exact-SHA runtime tests explicitly NOT_TESTED; releaseCertification always BLOCKED even when all seven probes PASS.

| TC | Request | Assertion |
|---|---|---|
| SEM-HOME | GET / | 200 and a real HTML document |
| SEM-LOGIN | GET /login | 200 and HTML document |
| SEM-VERSION | GET /api/version | 200 JSON with Spring framework, engine and version fields |
| SEM-ADMIN | anonymous GET /admin | 401/403 or same-origin login redirect; 200 is never an authorization pass |
| SEM-ROBOTS | GET /robots.txt | 200 text/plain with User-agent directive |
| SEM-SITEMAP | GET /sitemap.xml | 200 XML with urlset/sitemapindex |
| SEM-404 | GET fixed intentionally nonexistent path | 404 or 410, not a 200 fallback |

PASS = that individual semantic contract matches. FAIL = endpoint replied but violated the contract. BLOCKED = transport, timeout or inaccessible response. NOT_TESTED = beyond this probe. A PASS count never certifies all routes or financial/administrative functionality.

## QA execution process and phase mapping

1. Analyze latest canonical requirements, actors, admin roles and route/API ownership; detect main drift and write required-case traceability (manual).
2. Define exact candidate SHA, risk, independent worktree, rollback, expected UI and Test endpoint (manual).
3. Create normal/negative/recovery scenarios; 4. write boundary/partition/decision/transition TC with expected persisted effects (manual/CI).
5. Establish working Test environment and authenticated fixtures; 6. synthesize no-real-user test data (manual/CI). This anonymous scheduler only checks endpoint accessibility.
7. Execute these seven GETs and log outcomes (automated). Real Test Spring+PostgreSQL, five complete browser passes incl. admin, Android, Discord voice, actual finance and recovery are separate.
8. Register a defect on any FAIL/BLOCKED; 9. verify fixes on exact SHA; 10. rerun full impacted regression suite (manual/CI).
11. Report PASS/FAIL/BLOCKED/NOT_TESTED separately and cite sanitized evidence (scheduler and QA owner).
12. Release GO/NO-GO remains an independent G0–G6 decision; source-truth, security, ledger, exact-SHA Test and independently proven rollback block application Production promotion if incomplete.

## Build, verification and operations

- Start with a separate worktree; log BEFORE/MID/AFTER. Run Node tests including RED-to-GREEN, source diff check, validate systemd units, then official Test HTTPS. Never treat 502 as PASS just because version API is 200.
- On miniPC, install only immutable new candidate script and isolated Test service/timer, never replace the old hourly scheduler. Test one-shot, then check timer activation, next run and journal. Do not promote the app to Production.
- Review actual journal with: systemctl status moneyverse-qa-semantic-test.timer; journalctl -u moneyverse-qa-semantic-test.service --since today --no-pager.
- Manual Test probe: node scripts/qa/scheduled-semantic-qa.mjs --base-url https://test.easy-scraping.com --label test
- Rollback: disable --now only moneyverse-qa-semantic-test.timer, reset-failed only its service, remove only /etc/systemd/system/moneyverse-qa-semantic-test.service and .timer, then systemctl daemon-reload. Preserve legacy moneyverse-qa.timer and its disk cleanup.
- Keep sanitized journal evidence with normal operations retention; internal artifact evidence in access-controlled server storage. GitHub includes no secrets, production logs or personal user screenshots.
