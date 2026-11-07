# Development C v1327 — Password reset outage classification and token privacy

**Date:** 2026-11-03 KST. **Authority:** `origin/main` at `846844bf0bd573f0c0f0654e27ccb44321847106` (start); updated to `d22c36dbecad1fe136d3850715f1068a7d1df573` (mid-fetch, clean rebase). **Branch:** `auto/hourly-c-v1327-password-reset-outage-20261103-0845`. **Release:** DRAFT / HOLD.

## Start / source investigation

Connected to the authorized Debian 13.6 miniPC. All seven reported services and development PostgreSQL were healthy. Inspected AGENTS.md, both README language entry points, English/Korean canonical plans, recent main history, active A/B/C/QA/planning PRs and GitHub Actions. The host's pre-existing security-audit checkout has uncommitted changes; this cycle uses a separate clean worktree and never modifies that checkout. Prior C #2586 handles **request** acceptance, not **completion** outage semantics. No open PR was found for this completion-specific defect.

The existing Nest `POST /api/v1/auth/local/password-reset/complete` caught both invalid one-time tokens and thrown credential-store errors, returning 401 for either. The Next server action then displayed an expired/used-link warning even for a database/network outage. The reset page's token-bearing URL inherited public `X-Robots-Tag` and same-origin referrer behavior from the global Next configuration. This is a source-confirmed conditional privacy defect, not proof of crawler indexing in Production.

## Implementation / middle

- Backend: `false` from the existing owner-scoped credential-store function remains 401; thrown store/hash failures become generic 503 without SQL diagnostics. No migration or financial write-path changes.
- Frontend: HTTP 400/401 remain invalid-link, 403 remains password-policy, HTTP 5xx/transport errors become a retryable temporary-unavailability message. A verified `{ outcome: 'password-reset' }` remains mandatory for success.
- UX/SEO: an alert role announces failure to assistive technology; existing 44px mobile controls and confirmation are preserved. The default and five supported locale reset paths are assigned `private, no-store`, `noindex, nofollow`, `no-referrer` headers.
- TDD RED observed: backend 1 failure, frontend 6 failures. GREEN: backend focused 4 PASS, frontend focused 27 PASS. PostgreSQL 17.11 isolated container: 327 migrations applied, local-auth real DB + focused tests 8 PASS; `moneyverse_app` cannot SELECT/UPDATE `users` and may EXECUTE approved reset function. All DB mutations were isolated from shared Test/Production.

## End / gate status

At initial PR submission, full lint/typecheck/build/full suite/app-api/security/QA/CI, authenticated E2E and official Test exact-SHA are **not yet collectively approved**. Later verification belongs in the PR's SHA-bound comments. Do not infer release readiness from focused tests. The first full-DB suite was incorrectly run with a PostgreSQL superuser and its ACL failures are not accepted as valid app-role results; a corrected app-role/migrator split is required. No main merge, official Test or Production rollout, GitOps change, rollback, or branch deletion is authorized without all gates PASS. Preserve all other A/B/QA/Gemini branches and the five hourly automations.
