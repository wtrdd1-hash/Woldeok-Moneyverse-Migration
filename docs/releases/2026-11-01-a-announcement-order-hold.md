# Release decision — public announcement snapshot ordering

**HOLD / NOT DEPLOYED** (2026-11-01, Development A).

Base main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; candidate branch `auto/hourly-a-20261101-2055-announcement-order`. No migration or runtime/database mutation. Local targeted checks and the 2560 MB frontend build pass. The initial full suites were run without the required `NODE_ENV=test` and are invalid release evidence; corrected runs yielded Backend 2976 PASS / 518 SKIP and Frontend 2909 PASS / 0 FAIL. DB unit suite 62 PASS / 4 SKIP; 518 backend skips are not live DB evidence. DEV least-privilege P0 #993 remains, and official Test exact-SHA authenticated E2E plus independent backup restore are not certified. Candidate CI must pass before any merge. Test/Production remain unchanged. Rollback plan is a revert of the unmerged candidate (no live rollback performed). No branch cleanup until proven fully merged/replaced and owner cleared.
