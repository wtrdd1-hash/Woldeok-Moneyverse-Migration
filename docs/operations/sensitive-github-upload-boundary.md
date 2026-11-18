# Sensitive Data Boundary for GitHub (v2026.11.18.11)

**English canonical** | [한국어](sensitive-github-upload-boundary.ko.md)

## Policy
GitHub contains source and sanitized evidence only. Never commit secrets, OTP values, auth/session cookies, personal/member identifiers or balances, actual SQL/PG dumps, encrypted backup blobs, raw MCP call arguments, operator host backup configs, production shell history, raw incident screenshots, private signing files, runtime logs or unredacted internal worklogs. Repository private visibility does **not** waive these restrictions.

The full sensitive operational audit may be kept on the authorized mini-PC under a root/admin-protected, access-controlled path with retention and encryption appropriate for the data; GitHub receives an EN/KO redacted summary recording version, date, source and verification SHA, command categories (never raw credential-bearing commands), results, issue/PR, blocker, deployment evidence and next action. Owners should not paste literal secrets into pull-request descriptions or GitHub issue comments.

## Enforcement and limits
- Web `.gitignore` blocks new local private files; `scripts/security/check-repository-security.mjs` scans all tracked files for high-confidence secrets and blocks changed internal/private paths. Existing main CI `policy` job executes the test and checker. Android has its own Python checker/Actions workflow.
- `.gitignore` does not untrack already committed files and never blocks `git add -f` or direct GitHub uploads. **Protected required CI checks and organization push protection must be configured in GitHub settings**. The checks do not guarantee every credential format or PII can be detected.
- Historic GitHub internal records cannot be made secret merely by new rules. Review historical exposure privately, revoke/rotate any genuine leaked credentials, and follow approved Git-history remediation if needed. Do not copy suspected values into PRs, tests, logs or issue bodies.
- No server restart, production code promotion, DB/ledger mutation, historic purge or credentials rotation is performed by this documentation change.

## Verification
The web and Android scanner unit tests each returned 3/3 PASS in an isolated mini-PC temporary directory on 2026-11-18. Full GitHub PR CI and repository ruleset enforcement remain to be confirmed; do not claim push prevention until mandatory checks are configured.
