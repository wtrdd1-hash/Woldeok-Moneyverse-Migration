# QA — Verified Editorial Topic Discovery — 2026-11-01 10:25 KST

**Verdict: DRAFT / RELEASE HOLD.** No Test or Production deployment; no main merge.

## Scope and evidence
- Read-only published editorial subject filter (`ECONOMY`, `CODING`, `COMPUTER`) on Nest, PostgreSQL SECURITY DEFINER projection, public Next blog, and Android app-api.
- The source is **only the latest 150 published verified articles**, not the full archive. A filter with zero rows is not evidence that no matching older article exists.
- Reject unsupported/duplicate/empty topic and unknown query keys; mobile refuses ignored filters, malformed success envelopes, withdrawn rows and admin blog paths.
- No financial writes, direct table grants, applied migration changes or rollout.
- RED then GREEN targeted tests; real DEV PostgreSQL 17.11 `moneyverse_app` read-only / ROLLBACK: EXECUTE=true, table SELECT=false; published 3 (1 per subject), CODING filtered 1.

## Gates
- Backend full: 2,960 PASS / 517 SKIP (not equivalent to real DB integration).
- Backend focused: 12 PASS (including 2 HTTP); frontend focused: 34 PASS.
- Typecheck: PASS; target lint: PASS after one test formatting correction.
- Frontend full: **2,912 PASS / 2 FAIL** (both pre-existing admin console fixture expiration tests, issue #2292); independently reproduced unchanged main: 2 FAIL / 35 PASS.
- Database unit: 62 PASS / 4 SKIP.
- Workspace lint: exit 0, 0 errors / 1,022 warnings. Backend and Frontend builds: PASS (Next 603 static pages). Production dependency audit: no known vulnerabilities. CI and exact SHA official Test/auth E2E: PENDING/BLOCKED.

## Release blockers
- Existing DEV app-role ACL P0 #993 is not fixed by this read-only feature: `user_items DELETE=true`, `account_balances UPDATE=true`, `users SELECT=true`. Production ACL cannot be inferred from DEV.
- Official Test and Production do not run this candidate; exact-SHA authenticated E2E, independent restore and GitOps release gate absent.
- Start audit: 69 remote branches including main; 67 non-main branches with unique commits, 1 ancestor branch preserved for other owners. 66 open PRs, 7 with failed CI, none reported merge-conflicted against main. No branch deletion or main merge.
- Preserve all unique branches and open PRs; no cleanup without proof.
