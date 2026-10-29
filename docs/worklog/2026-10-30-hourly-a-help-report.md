# A 01:25 — Verified Help Article Issue Report (P1, DRAFT / RELEASE HOLD)

## BEFORE WORK — 2026-10-30 01:23 KST
- Remote main: `62c6cd038951d65c94b709302bdaec6e75b080b6`; 20 remote branches including main; 14 open PRs. Exact snapshots and CI in `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0125-help-report/`.
- Debian 13.6 services active; DEV PostgreSQL connected; no Production/Test mutations authorized.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md` and `.ko.md`, integrated English/Korean plan, QA v1376/v1377, `docs/RELEASING.md`, prior A worklogs and current open PRs.
- Existing public verified-help articles and owner-only support threads exist, but there is no article-bound correction report action. No overlapping open PR for this precise workflow. Feature `VERIFIED_HELP_CENTER_V1` is disabled in deployed environments; this change must not turn it on.
- Decision: add a narrow, opt-in member correction report for a *currently approved exact revision* using existing `support_create_thread` SECURITY DEFINER function. No new schema, financial writes, or role grants. Preserve user-visible receipt verification and reject stale revisions. Android must use same authenticated/CSRF-protected endpoint; do not expose admin help endpoints.
- Mandatory full lint/test, mobile contract, exact-SHA official Test and finance/backup gates are not currently green. No merge or deploy without independent proof.

## PLAN
1. RED: backend route/guard/revision/receipt tests, web server-action tests, Android allow-list negative tests.
2. GREEN: backend dedicated guarded controller, existing support DB function and readback; Next.js accessible article report form/server action; Android allow-list for this single POST.
3. Verify targeted tests, security/SEO/a11y, lint/typecheck/build, app API, real isolated PostgreSQL, full CI; re-fetch main and integrated plans before integration.
4. Preserve all unique branches and other developers' work. Record exact SHA and all blockers in EN/KO QA/release/worklog. Draft PR only unless every gate is PASS.

## IN PROGRESS
- Worktree: `auto/hourly-a-help-report-20261030-0125` from current `origin/main`, no shared-checkout changes.
- RED/GREEN, verification and final release evidence pending.
