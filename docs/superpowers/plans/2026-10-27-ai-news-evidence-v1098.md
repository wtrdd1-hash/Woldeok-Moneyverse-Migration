# C v1098 — AI Newsroom evidence contract

1. RED: Test rejection of malformed settings/models/batches/runs and valid empty data; test rendering of an unavailable API vs empty records, and safe elapsed time.
2. GREEN: Validate all three read endpoints at runtime against the actual NestJS response contracts. Reject malformed, duplicated, inconsistent or impossible rows. Fail closed: do not render scenario publish controls from unverified batches, and do not allow generation without verified settings and run state. Show accessible error/retry state; no SEO indexing.
3. REFACTOR: Keep helpers pure, do not change SQL, money movements or existing backend security guards. Verify mobile keyboard and 44px actions.
4. GATES: Run exact-SHA focused/full tests, typecheck, lint, builds, API contract, PostgreSQL CI, audits and official Test only when deployed exact SHA. Hold merge and Production if any mandatory gate fails.
