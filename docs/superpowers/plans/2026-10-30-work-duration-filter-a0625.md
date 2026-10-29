# Work task duration filter repair — implementation plan

1. RED: assert that duration input is strict 1..86400 and that the authenticated actor and bound SQL filter are used. Preserve existing `minReward` argument and its exact-string precision. Run the focused tests and record failures.
2. GREEN: implement `parseWorkTaskMaxDuration`, controller `maxDurationSeconds` query, and optional SQL predicate on `public.work_task_board($1)`; never grant catalogue table access.
3. RED/GREEN: test the web preset route and accessible form. Show a reset and avoid hiding task duration metadata for active assignments when a filter is selected.
4. Verify Android gateway query forwarding and `private, no-store`/`noindex` on success/error. Run real isolated PostgreSQL ACL/owner tests, focused tests, typecheck/build/lint, security and full CI. Record exact SHA and HOLD if any gate fails.
