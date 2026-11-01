# Release gate — A 09:25 market-event direction filter

**DRAFT / PRODUCTION HOLD.** No release or migration was executed. Public read-only `direction=up|down` is implemented on a separate branch; the original unfiltered endpoint is preserved. Main merge forbidden pending full Frontend gate (2 baseline admin-session failures), exact candidate SHA CI, official isolated Test authenticated backend/API/DB/E2E, P0 DEV app-role ACL remediation and independent restore / Production executable provenance. Test and Production remain on pre-candidate SHA. Rollback is a code revert or link removal; no DB/ledger rollback required.

Start 64 remote branches / 62 open PRs; end 65 / 63 after Draft PR #2293. No branches deleted or merged; all existing unique work retained. Initial candidate SHA `0ec87cf3d55ab669699f6e7da4b0146c00a000d6`; final record SHA in PR. Exact-SHA CI pending.
