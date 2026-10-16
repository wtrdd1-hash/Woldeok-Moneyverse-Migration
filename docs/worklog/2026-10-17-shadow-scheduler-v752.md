# v2026.10.17.752 schedule safety worklog
Status: STARTED, isolated Test scheduler P0 fix.
Starting main 25a0301a912a17f0f4636583be71a00735ff7972.
Observed shadow v751 node with NODE_ENV=test unexpectedly executed scheduled DB work in synthetic-only shadow. Immediately stopped transient unit. Production/Test unchanged.
Owned paths: backend/src/scheduler/* and paired records. No other agents paths modified.

## Mid-work / exit evidence
- Real synthetic PostgreSQL 17.11 shadow named `wdmv_release_v751_shadow` was created with exactly 271 versioned SQL migrations through 272; source Test v751 staged but public Test v735.2 and Production v717 untouched.
- Shadow ran old v750 backend and returned `/health` 200, `/api/version` exact SHA and arena listing HTTP 200, but accidentally started scheduler jobs despite `NODE_ENV=test`. Stopped immediately; two failing scheduler job logs observed only against disposable synthetic shadow. Never promote this uncontrolled build.
- New source v752 TDD 3 RED then 5/5 GREEN, scheduler suite 15/15 PASS, complete backend 1,235 PASS / 396 DB skips, Nest build PASS. No live role/grant/account alteration.
- Release Test identity and Production financial gates still unmet, no deployment claim. CI result is appended to PR after actual run.
