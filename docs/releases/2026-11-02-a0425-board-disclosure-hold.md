# Release HOLD — A 04:25 public self-disclosure filter

- Candidate: PR #2425, branch `auto/hourly-a-20261102-0425-board-disclosure`, main base `a8541927c3a351d980454c66e95a3356c47e0722`.
- Gate: Backend 2,987 PASS/518 SKIP, Frontend 2,938 PASS, database 62 PASS/5 SKIP, builds/typechecks/lint and 184-route mobile contract PASS; full dependency audit 9 findings FAIL. Test exact-SHA identity FAIL, P0 DEV ACL FAIL, independent restore/auth E2E BLOCKED. No authorization to promote.
- Actual Test and Production public backend/frontend SHA: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` (public version only). Candidate is not staged. Both public Treasury probes HTTP 200. Production executable/rollback provenance not certified.
- CI: first code SHA failed mobile contract drift, fixed by generated artifacts in `d87f3ab6ed7f0336f2451f29fd4f6ac78cc851f4`. New exact-SHA CI/image pending at document preparation; final status tracked in PR.
- DB: no new migration; existing function used in read-only transaction with ROLLBACK. No financial, ledger or stock-trade write.
- Deployment: main NOT merged, Test NOT staged, Production NOT changed, services NOT restarted, no rollback executed. Rollback strategy if ever released: revert read-only filter UI/API in a new immutable release after exact-SHA Test and backup verification; no SQL rollback.
- Unique branches and concurrent PRs protected; no deletion. See QA and worklog for evidence.
