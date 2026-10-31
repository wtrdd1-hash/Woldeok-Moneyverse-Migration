# A 17:25 — Verified shop sold-out discovery (2026-10-31)

## BEFORE — 17:25 KST
- Remote main: `ed401215a4c47db9bb1ddeb88840ffb703fe4e93` (English canonical plan, Korean translation and AGENTS.md read).
- Isolated branch: `auto/hourly-a-20261031-1725-shop-stock-filter`; independent worktree, no shared checkout modifications.
- Start: 102 remote branches including main, 90 open PR; previous QA v1417 found existing P0 ACL/checksum and exact-Test concerns. Preserve all unique/unknown work; delete none.
- Gap: the verified member catalogue includes `quantity = 0` rows, but the member cannot select sold-out-only listings. Existing `filter` parameter explicitly rejects `sold_out`; a dedicated `stock` query avoids ambiguous generic filter dispatch. The existing definer function `shop_catalog_list_v2(uuid)` already supplies inventory counts without direct table grants.
- Safety: no ledger writes, no migration modifications, no direct grants, no production/Test changes. A successful isolated test is not an official Test deployment.

## PLAN / IN PROGRESS
- [ ] TDD RED: backend stock mode and controller tests; frontend search selection tests; Android app-api malformed response, duplicate query and private headers tests.
- [ ] GREEN: dedicated `stock=all|available|sold_out` backend filter after authorized definer read, preserving exact WLD strings; frontend server-side filtered catalogue and accessible form; Android fail-closed validation.
- [ ] Verify: focused tests, lint/typecheck, builds, full suites, isolated real PostgreSQL read-function and negative ACL, Android contract and CI exact SHA.
- [ ] Re-fetch latest main and planning, check open PR overlap and conflicts; record SHA/CI/QA and release HOLD if any gate is absent.

## MIDPOINT — 17:38 KST
- RED: backend 8 failed, frontend 1 failed, Android 4 failed. GREEN: backend 20 PASS, frontend stock/catalog 38 PASS, page SSR 2 PASS, Android 4 PASS.
- Full local backend 2,793 PASS / 501 SKIP / 0 FAIL; frontend 2,782 PASS / 0 FAIL, isolated bounded systemd cgroup. Typecheck/build/lint PASS (0 lint errors, 1,049 warnings). Security/release tests 22 PASS; production dependency audit no known vulnerabilities.
- Isolated PostgreSQL 17.11 network=none: 312 migrations applied; real `shop_catalog_list_v2(uuid)` app EXECUTE=true, direct SELECT on catalog=false, direct UPDATE inventory=false; seeded quantity 0/3/null yielded 1 sold-out and 145 available of 146, ledger transactions 0, transaction ROLLBACK returned seeded stock to null. No existing DB touched.
- `api:contract:check` initially reported drift solely from a stable, unrelated generated `stocks[].id` ordering change (184 endpoints unchanged). Generated three reference files are included to make the deterministic current generator output match tracked artifacts; no contract semantic changes.
- Latest main checked again: `ed401215a4c47db9bb1ddeb88840ffb703fe4e93`, English/Korean planning SHA256 prefixes `0e18217e147699` / `2a384f4c842eac`, unchanged. No overlapping sold-out PR found.


## FINISHED — code candidate prepared, exact GitHub gates pending
- Files: backend controller + regression; frontend catalogue page, helper, helper/page tests; Android gateway + regression; bilingual QA/release/worklog; generated contract reference ordering.
- No migration or finance write, Test/Production deployment, service restart, main merge or branch deletion. Draft/HOLD until exact SHA CI, candidate image, official Test authenticated E2E and independent restore are verified.


## MIDPOINT — 17:31 KST
- TDD RED observed: backend 8/8 failed; frontend 1/2 failed; Android 4/4 failed. These were actual behavioral assertion failures, not missing dependencies.
- Implemented strict dedicated stock query, server-side member shop form and Android fail-closed verification; existing definer read and integer-string prices preserved. Awaiting GREEN verification.
