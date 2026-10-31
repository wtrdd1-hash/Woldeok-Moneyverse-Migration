# Implementation plan: Android stock owner-private responses

1. Add Vitest tests for GET stock portfolio/history (200/401/503) and HEAD (204) with malicious upstream public cache/index, and public stocks quote control. Verify RED.
2. Add minimal path-scoped response header override after proxy for stock portfolio/history, applying to all statuses and HEAD. Keep public stock market endpoints untouched.
3. Run focused tests and static gates, inspect regression. Confirm latest origin/main and planning mid-work.
4. Run repository required gates and isolated PG if available; never count skipped tests as passes.
5. Commit and push isolated branch, open Draft/HOLD PR, log exact SHA and blockers. Do not merge or deploy without all release gates.
