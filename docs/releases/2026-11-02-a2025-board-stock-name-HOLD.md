# A2025 Stock-Name Search — RELEASE HOLD

- Candidate: Draft PR #2526, branch `auto/hourly-a-20261102-2025-board-stock-name`; exact head SHA in PR/evidence.
- Implemented: bounded public stock-name discovery across Nest, PostgreSQL function read, Next SSR, Android app-api and 184-endpoint contract. No migration, financial writes or privilege expansion.
- Local gates: focused regression PASS, typecheck/build/lint PASS after fix; **Backend full FAIL (2 profile auth tests), Frontend full FAIL (worker exit despite 2,945 assertions PASS), full dependency audit FAIL (9)**. DEV app-role ACL P0 persists.
- Official Test and Production publicly serve older different SHAs; neither serves candidate. Both Treasury overview endpoints returned 200, contrary to mandatory 503 HOLD policy. Exact-SHA Test authenticated E2E, backup restore, rollback proof and GitOps release gate not satisfied.
- Decision: **DO NOT MERGE / DO NOT DEPLOY**. Keep all unique branches and PRs. No Production or Test mutation, no rollback performed. Reassess from current main only after independent evidence closes every required gate.
