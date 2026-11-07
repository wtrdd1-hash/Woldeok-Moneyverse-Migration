# Release HOLD — A 19:30 author filter source-proof repair

Candidate branch: `auto/hourly-a-20261102-1930-board-author-filter`. Main baseline: `3eb1441090cb0602e054908547dcf43bfe4299dd`. This is a superseding repair for existing Draft author-search PRs #2286/#2393, not a second independent rollout. Preserve both PRs and do not merge their overlapping code alongside this candidate.

The feature is read-only and limited to 50 existing published posts. It requires source-window proof and validates post IDs, author, title, timestamp and comment count before web/Android success; missing proof returns 503. No database migration, direct grants, WLD posting or new permission. Rollback: stop sending `author`; default `{posts}` remains. No state rollback.

**HOLD gates:** Full dependency audit has 9 known vulnerabilities (1 low/8 moderate); DEV application role still has `user_items DELETE` and `account_balances UPDATE` (P0 #993). Test and Production currently serve `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`, not this candidate; six runtime SHA mismatches and Treasury public HTTP 200 violate the required 503 gate. Exact candidate authenticated Test E2E, independent restore and GitOps release authorization are absent. Local tests/build are not substitutes. No merge, release, service restart, production DB change or rollback was executed. Evidence in task directory and companion QA.
