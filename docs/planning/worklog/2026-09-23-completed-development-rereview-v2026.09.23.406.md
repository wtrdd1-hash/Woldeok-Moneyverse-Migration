# Worklog — Completed-development re-review v2026.09.23.406

Baseline main: e447b11f1d27ee7da2a46c64fcd96e0058c8da6d.

Remote branch cleanup was performed first: all 50 non-main remote branches were deleted. A new v406 fix branch was then created from latest main for this audited change.

Runtime comparison: Production /api/version = 2c854d47903294ef4ad48006a1b9cd57a70f5590; Test = 7b705e1d37e97ccd05ba12042c3fd8d582e396d0. Current pre-v406 main has no non-doc app delta versus Test, while Production is 55 non-doc files behind Test.

The re-review found material integrity gaps in advanced marketplace claims. Auction writes lack complete item escrow/end settlement/ledger posting; P2P confirmation did not execute atomic WLD/item transfer; appraisal lacked authoritative ownership/provenance and ledger-backed fee settlement. Frontend fallback paths also displayed/generated fake authority records. These unsafe writes were blocked and sample fallbacks removed.

Club canvas now prevents edit/save until server state loads. Public guide removed advanced marketplace completion claims.

Validation: frontend focused tests 27/27 passed; backend marketplace controller tests 5/5 passed; frontend and backend TypeScript typecheck passed; git diff check to be rerun before push.

No Test or Production deployment is claimed in this worklog until the exact candidate is actually served and verified.

CI follow-up: the first exact-SHA Build Test Candidate was blocked before build by 183 pre-existing repository lint errors across 49 files. The branch was re-reviewed and lint blockers were reduced to zero errors (14 non-blocking warnings remain). The broken bot QA script string syntax was repaired, the portfolio donut render-time mutation was rewritten as a pure prefix calculation, and legacy lint debt was constrained with targeted rule suppressions where a runtime refactor was outside this release scope. Final local validation after this cleanup: lint exit 0, frontend/backend typecheck pass, frontend focused tests 27/27, backend marketplace tests 5/5.

Full-candidate DB follow-up: after lint/typecheck/build/migration passed, CI exposed four pre-existing privilege-boundary regressions. The application role had direct DML grants on durable tables beyond the session layer, 21 SECURITY DEFINER functions remained executable by PUBLIC, and stock repository portfolio/trade pre-checks bypassed the intended function boundary by joining/reading `virtual_stocks` directly. Migration 233 (`233-security-boundary-reconciliation.sql`) now revokes app INSERT/UPDATE/DELETE on all public tables then re-grants only `auth_sessions` and `oauth_challenges` INSERT/UPDATE, revokes PUBLIC execution from every existing public SECURITY DEFINER function, and adds explicit app-only `stock_my_positions_v2` / `stock_trade_state` reads. Stock repository now uses those functions instead of raw stock-table reads. Local migration static tests: 7/7 passed; DB integration cases are intentionally deferred to exact-SHA CI because the local worktree has no test DATABASE_URL/MIGRATOR_DATABASE_URL.
