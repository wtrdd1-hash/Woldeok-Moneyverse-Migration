# Worklog — v2026.10.15.654 Web Functional Remediation

**Preflight 11:02 KST:** User authorized remediation. Inspected current canonical planning docs, AGENTS and release rules, both GitHub draft PRs #844/#846, connected miniPC status, origin/main and independent agent worktrees. Logged prior-to-edit under /srv/moneyverse-tasks/remediation-v654/start.log. Created independent worktree from main bf55b057; never touched shared main.

**Implementation:** Applied 34 app/test files selectively from isolated tested v639 commit 94c2dc6a (excluded superseded v639 documentation). New RED-GREEN tests prove Pg client destroy on BEGIN and ROLLBACK failure; implementation passes `release(true)` on poisoned client. Explicit NODE_ENV=test Vitest runner eliminates inherited production React.act failures, with regression. Extended synthetic finance DB guard for dedicated v654 only.

**Midflight:** Origin/main moved by concurrent v652 operations audit docs; no app source edits in delta. First full test inherited production Node env and created non-code frontend act failures; corrected and reran. Bot required separate dependencies (npm ci) and then passed. Four real PostgreSQL concurrency/failure injection tests passed against fresh synthetic schema-only v654 DB. Local standalone Next at 127.0.0.1:3164 verified 6 redirects, broken UUID returns 400; server stopped. Real Production and Test pointers remain prod-v600 and test-v618.

**Closeout / acceptance:** See findings and release for exact suite gates. Code fix is an isolated candidate, not canonical double-entry settlement, least-privilege migration, full Test, authenticated browser five-pass or Production. Full Test acceptance BLOCKED; no live SQL, feature switches, balances, Test or Production changes.
