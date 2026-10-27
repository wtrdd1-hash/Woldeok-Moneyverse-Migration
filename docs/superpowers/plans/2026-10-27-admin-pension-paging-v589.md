# Admin pension payout pagination — v589 plan

1. Reproduce malformed limit acceptance before SQL via controller tests and repository boundary tests (RED).
2. Validate only canonical decimal integer limits 1–100; preserve omitted default 20; reject duplicates and non-strings with HTTP 400 before repository access. Guard direct repository calls too.
3. Verify auth guards unchanged, no WLD/migration changes, valid limit passes through.
4. Run focused and full gates, isolated PostgreSQL negative and positive queries, inspect CI. Remain Draft/HOLD until release gates pass.
