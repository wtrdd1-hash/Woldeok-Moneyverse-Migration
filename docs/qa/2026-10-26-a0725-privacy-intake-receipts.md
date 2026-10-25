# QA A0725 — Private privacy-request intake receipts CSV

**PARTIAL / BLOCKED — Draft only. No main merge, Test promotion or Production release.**

## Scope
- Branch `auto/hourly-a-privacy-request-receipts-20261026-0725` from remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (start/mid/pre-PR rechecked). Final SHA and CI in PR audit.
- Authenticated member downloads **recent maximum 30 intake receipts** from `/account/privacy/requests.csv`, not an exhaustive history, personal-data package, processed request or deletion certificate. NestJS session actor and consent guards call existing PostgreSQL `privacy_list_my_requests` SECURITY DEFINER function. Android snapshot uses member cookie and private no-store/noindex/nosniff. Strict UUID/type/status/ISO date/row cap/duplicate/unknown field validation, CSV formula and zero-width/control-character defense. No migration or ledger writes.
- Machine-readable mobile contract and EN/KO schema references: **180 endpoints**. Historical original-route map remains unchanged at 93.

## Evidence
- RED/GREEN: missing backend snapshot, CSV module, Android cache protection, missing gateway credential and zero-width formula payload; all focused regressions now GREEN. Initial route-map addition caused historical count failure and was removed.
- Focused: backend **2 PASS**, frontend CSV **4 PASS**, CSV route **3 PASS**, Android gateway **13 PASS**, privacy page **3 PASS** = 25 total focused.
- Isolated PostgreSQL 17.11 `wdmv_v761_test_acl`: owner 1, foreign owner 0, status/detail 1, direct privacy table SELECT denied, ledger INSERT denied, ROLLBACK left 0 fixtures. Shared live/dev DB untouched.
- Typecheck **PASS**, lint **PASS** (0 errors/1,128 warnings), backend/frontend build **PASS**, contract **38 PASS**, DB **15 PASS/3 SKIP**, backend **1,317 PASS/398 SKIP**, Bot **8 PASS** after isolated install.
- Full Frontend **1,406 PASS / 6 FAIL**: SEO/i18n 3, login touch target 1, calculator registration link 1, admin M2 telemetry 1. Same baseline failure family as preceding A0625; not waived.
- Security **FAIL**: prod High 2, full Critical 2/High 10, Bot Critical 1/High 5. `api:contract:check` must be rerun after committing generated artifacts because it compares against HEAD.

## Audit and release gate
- Start 234 remote branches/230 open PRs; pre-PR 235/231, 234 non-main branches all have unique unmerged commits; duplicate tip SHA 0, conflicts #1107/#1110/#1143. No deletion or overwrite of other worktrees.
- Debian 13.6 services active; root disk **100%**, data ~76%, `/tmp` tmpfs ~84%. Two A-owned 2026-10-24 scratch workspaces relocated intact to data and original symlink paths preserved. No other development worktree changed.
- Official Test `/api/version` `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither matches candidate. Exact-SHA authenticated Test E2E, full CI/security, restore evidence and authorized GitOps gate **BLOCKED**.
- Rollback: retain Draft unmerged; after any future approved deployment, reviewed revert PR and exact-SHA/ledger verification. No shared/Production DB write, restart, deployment or branch deletion.
