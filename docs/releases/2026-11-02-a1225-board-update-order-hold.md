# Development A release decision — 2026-11-02 12:25 KST

**RELEASE HOLD / no deployment.** Public board updated ordering is implemented on a Draft-only isolated branch, not on main.

Required gates not met: Backend full suite 2 profile HTTP tests fail; all-dependency audit 9 findings; full-route QA ledger absent; DEV app-role table DML least-privilege P0; Test and Production `/api/version` remain `510dbe6...`, not the candidate; exact-SHA authenticated Test E2E, isolated full PostgreSQL restore, verified rollback image and GitOps gate not demonstrated. Successful local build, targeted tests and candidate CI are not authorization to deploy.

No database migration, financial write, service restart, Test/Production deployment, main merge or branch deletion performed. The preexisting default remains newest-created posts. Future rollback after an authorized release: revert the branch's feature commit and rebuild/revalidate from main, or hide the updated option; do not rewrite applied migrations. Production data unchanged in this run.
