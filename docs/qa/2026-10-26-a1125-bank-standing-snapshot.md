# A1125 QA — Private Virtual Bank Cash/Deposit Snapshot — 2026-10-26 11:25 KST

## Verdict: PARTIAL / BLOCKED — PRODUCTION RELEASE HOLD

### Source and branch evidence
- Debian 13.6 miniPC directly inspected via PC MCP; backend/frontend/bot/MCP/nginx/docker active, DB connected. Root 94% (~6.5GiB available), data 82% (~35–36GiB available).
- Start remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, unchanged at midpoint and pre-integration. Read `AGENTS.md`, `README.md`, canonical EN and secondary KO `docs/planning/PROJECT_PLAN.*`, integrated EN/KO planning master, previous QA, 244 open PRs and CI. Latest planning Draft #1402 is an unmerged security archive proposal; do not treat as main.
- Worktree `/srv/moneyverse-data/worktrees/hourly-a-bank-standing-snapshot-20261026-1125`, branch `auto/hourly-a-bank-standing-snapshot-20261026-1125`. Start remote branches 248, open PRs 244. Mid-audit remote branches 250, open PRs 244; 249 non-main; duplicate branch-tip SHA 0, duplicate open-PR tip SHA 0; conflicts #1107/#1110/#1143; no branches deleted. Other workers contributed independent changes. Exhaustive per-branch unique commit reachability is NOT proven; all branches preserved.
- Code checkpoint `ee1a7d5a545f36afeb1dbb1f723b0efc7f579778`; final QA/report commit SHA to be recorded in PR discussion after push. Source changes include bank controller, strict snapshot projection, frontend CSV BFF and CTA, app-api privacy headers, Android contract, EN/KO banking docs and regression tests. No applied migration changes.

### User-visible behavior and security boundaries
- `GET /api/v1/banking/standing/snapshot`: existing SessionGuard/AuthenticatedGuard/ConsentGuard and server-derived `requireUserId`; PostgreSQL `bank_get_my_standing(actor)` is the read source. DB function accepts actor argument and does not independently authenticate the caller; backend session binding is mandatory.
- Only canonical integer strings for cash, deposit and estimated unclaimed interest (up to 38 digits), fixed scope/source, and response-generation UTC time. No loan/bond/third-party data, no transaction or payout claim. Invalid or unavailable source fails closed.
- `/bank/standing.csv` requires a known signed-in viewer, validates entire payload before writing bytes, returns private no-store/noindex/nosniff CSV. App API `GET /app-api/v1/banking/standing/snapshot` forwards session and forcibly applies private/noindex/nosniff headers; Android contract generated to 180 endpoints. New CTA is keyboard-reachable with >=44px target and four-locale explanation; private `/bank` has robots noindex.

### Tests actually executed
| Gate | Evidence |
| --- | --- |
| RED TDD | Missing backend/CSV modules and missing Android privacy header reproduced; failures recorded. |
| Backend focused | 11 PASS (new projection/controller/auth-boundary tests). |
| Frontend focused | 23 PASS (CSV, signed-in/out/error, Android gateway). |
| Isolated real PostgreSQL 17.11 | `wdmv_v761_test_acl`, 281 migrations; 7 PASS bank gameplay tests including new actor-scoped 2^53+1 WLD precision, 42501 private table denial and 28000 invalid actor; tests run in rollback transactions. Production DB writes 0. |
| Typecheck | PASS. |
| Lint | PASS: 0 errors, 1,128 warnings. |
| Contract | 180 endpoint generation and committed-artifact `api:contract:check` PASS. |
| Build | PASS (`NODE_OPTIONS=--max-old-space-size=1024 pnpm build`). |
| Full workspace test | FAIL: backend 1,324 PASS / 399 SKIPPED; contract 38 PASS; database 15 PASS / 3 SKIPPED; frontend 1,410 PASS / 6 FAIL. Skipped != PASS. |
| Frontend regressions | Existing SEO/i18n 3, login touch-target 1, calculator registration link 1, admin M2 telemetry 1. Unmerged QA #1317 covers this area; do not duplicate without coordinated repair branch. |
| Bot test | 8 PASS after installing isolated bot dependencies (initial missing-module environment failure was repaired). |
| Production dependency audit | FAIL: 2 High (body-parser, multer). |
| Full dependency audit | FAIL: 2 Critical / 10 High / 11 Moderate / 3 Low. |
| Bot audit | FAIL: 1 Critical / 5 High. |
| CI / official exact-SHA Test | CI candidate for checkpoint in progress at report preparation; final SHA required. No exact-SHA authenticated Test deployment/E2E; BLOCKED. |
| Accessibility/SEO | Private noindex headers and keyboard-target source/unit coverage; official browser/Android screen-reader E2E NOT proven. |

### Release and rollback
- Test `/api/version` `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `/api/version` `6a989b5ac0c6155587d43426d64f6def6b62c917`. Both `/status` HTTP 200; neither is the candidate SHA or current main SHA. Exact-SHA Test, authenticated login, backend/API/DB end-to-end and GitOps release gates NOT satisfied.
- No merge to main, Test promotion, Production deploy, DB migration, production ledger mutation, service restart or branch deletion. Preserve all other worker branches and unique commits.
- Rollback of candidate source: revert only the isolated branch/PR's endpoint, CSV route, UI link, app-api header override, contract and docs after review. No production rollback performed because no deployment occurred. Financial data remains unchanged.
