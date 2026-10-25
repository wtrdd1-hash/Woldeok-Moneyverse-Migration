# QA — A0225 Private Security Event CSV (2026-10-26 KST)
**Decision: PARTIAL / BLOCKED — RELEASE HOLD.** Code commit `eadcf571031c116926e12a316810a722f76c09eb`; main base `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. Final docs/PR SHA and CI outcomes tracked in Draft PR.

## Scope
- Owner-only recent security activity, up to 50, backed by existing immutable migration 214 `account_recent_security_events`. No direct table grants or migration changes. API returns event type and ISO timestamp only; CSV validates type/timestamp and excludes IP, tokens, device labels and arbitrary metadata.
- Next same-origin CSV route rejects malformed or unavailable upstream responses, uses no-store/noindex and attachment headers. Native accessible download link only when account page has confirmed events. Android app-api forwards member cookie and private response headers.
- Existing SQL function accepts a UUID argument, not an independently authenticated DB principal: **NestJS session/authentication/consent guards are a required trust boundary**. Do not claim DB-enforced actor identity.

## Evidence
| Gate | Result |
| --- | --- |
| MiniPC / services | Debian 13.6, Backend/Frontend/Bot/MCP/Nginx/Docker ACTIVE |
| Focused RED→GREEN | Backend 8 PASS, Frontend/Android 18 PASS |
| Contract | 38 PASS, Android 179 endpoint match |
| Backend suite | 1,317 PASS / 398 SKIP |
| Database package | 15 PASS / 3 SKIP |
| Frontend suite | 1,404 PASS / 6 FAIL (SEO 3, login a11y 1, calculator CTA 1, admin M2 1) |
| Bot tests | 8 PASS after installing isolated bot dependencies |
| Typecheck | PASS after fixing duplicate test import |
| Lint | PASS, 0 errors, 1,128 warnings |
| Standard build | PASS after replacing out-of-worktree linked dependencies with isolated local copy |
| Production dependency audit | FAIL: 2 High |
| Full dependency audit | FAIL: 2 Critical, 10 High, 11 Moderate, 3 Low |
| Bot npm audit | FAIL: 1 Critical, 5 High |
| Real PostgreSQL | 17 / `wdmv_v761_test_acl` / 281 applied migrations; read-only app-role 3 own sample, 0 other sample; direct raw event SELECT denied, ledger INSERT denied, ROLLBACK |
| Official Test authenticated exact-SHA E2E | BLOCKED; Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` differs |
| Production | HOLD; running `6a989b5ac0c6155587d43426d64f6def6b62c917` |

## Branch audit and release gate
At start: 210 remote branches (209 non-main), 206 open PRs, 0 duplicate tip SHAs. Known conflicts #1143/#1110/#1107 retained. Other agents' unique unmerged changes preserved; deletion 0. New isolated branch `auto/hourly-a-security-events-export-20261026-0225` from exact main. End counts, exact final docs SHA and remote CI outcomes to be recorded in Draft PR. Root 99% full, data 69%; no unauthorized cleanup or production writes.

Required before merge: resolve all six frontend regressions and critical/high audits; verify final candidate exact SHA with all mandatory CI, isolated real-PG authentication/API/DB/E2E, Test deployment SHA, privacy and rollback evidence; re-fetch main and EN/KO plans; only then consider merge and GitOps. None are waived.
