# v2026.10.31.1541 — CI monetary fail-closed contract correction

STATUS: STARTED / ISOLATED branch integrate/prod-finance-admin-v1540 / NO PROD OR DB MUTATION.

START: User approved exact-SHA Test and zero-downtime Production promotion. Re-read AGENTS/DOCS_INDEX, authoritative PROJECT_PLAN/INTEGRATED_PLANNING_MASTER, RELEASING, prior v1540. At 14:40 KST GitHub `8d74ef011f51a1237c2c3ffb794e714c93512638` CI and Test Candidate BOTH FAILED: same runtime-check backend unit test `backend/src/economy/monetary/finance-execution-hold-v1415.test.ts` 1 FAIL in 435 passed files. Live public Test c212 returns uncertified Treasury 60M 200; Production SHA mismatch persists. Local main advanced to 45998b3 while origin/main remains 761a55a; another agent running shop QA. Changes stay isolated; do not alter their files or use stale promotion.

CAUSE: v954 durable central-bank controller delegates base/reserve GET/PUT to `DurableCentralBankPolicyService`, but v1415 legacy test constructs controller with only old service and asserts all base/reserve GET/PUT still use `LEGACY_MONETARY_AUTHORITY` 503. Actual test throws TypeError getBaseRate from missing injected dependency, violating current source/test contract. Do not remove safe 503 or disable test. Split old noncanonical endpoints from durable policy endpoints: test approved durable endpoints with missing DB fail 503; verified persistent policy functionality remains covered by dedicated durable policy tests.

MID/FINISH: PENDING.

## MID / FINISH
- Reproduced identical 8d74 CI TypeError from missing injected durable central bank policy in obsolete v1415 controller test.
- Legacy synthetic mint/monetary endpoints remain HTTP 503. Durable base/reserve GET and audited PUT now assert HTTP 503 if canonical Postgres is absent, while dedicated durable service tests retain persistent policy and transactional audit/rollback.
- Focused 12/12 tests PASS; monorepo typecheck and touched-file ESLint PASS. Production, DB, WLD and official Test untouched. Re-run new GitHub exact-SHA full CI after commit; previous 8d74 runs remain FAILED.
