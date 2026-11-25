# Isolated Test backend recovery
## Before work
- Exact application source: f0336fded6068f884c87f88efedeb770fd3387d4; approved CI44932169050 artifact.
- Owner-approved recovery delegated on existing task branch. Parent owns integration and release.
- Confirmed missing dedicated Test listeners; no host psql. Existing unclassified DB/processes are outside scope.
- Only new loopback Test API55438/DB55436, synthetic database and Test-only credentials permitted.
## Checklist
- [x] Read AGENTS, living plans, latest task plan and shared memory protocol.
- [x] Test bounded authority/config helpers RED then GREEN (10 tests; zero failures).
- [x] Independent review and parent source verification before runtime mutations; four findings fixed with regression coverage.
- [x] Fresh owned database bootstrapped using unchanged exact-source ci-apply.mjs; all348 migrations checksum/sequence parity.
- [x] Exact immutable full application started; effective Hikari readOnly true, scheduler/ticker off, bot offline and loopback sandbox observed.
- [x] Actual Test acceptance17/17 checks true; source/process/JAR/DB isolation, canonical reads and anonymous/forged boundaries verified.
- [x] Sanitized acceptance export delivered under ops/nov18-test-backend; parent alone integrates/promotes.
## In progress
Root cause: the previous dedicated Test backend is absent. No existing database or old JVM will be adopted.
## Finished
Scoped private Test recovery is complete. No Production or Nginx changes, commits or pushes were performed by this delegate.

Validation: Python helper suite10/10, zero failures; py_compile passed. Actual acceptance17/17 true on PID556244, source f0336fded6068f884c87f88efedeb770fd3387d4, immutable JAR8a1c75c685ad31805a772ff9af6a94e6f7fd2e57f66809412ac2e900b1d6f38c. New synthetic database has348 matching migrations, zero users/identities/sessions, restricted moneyverse_app, canonical stocks10 rows and board0 rows. Direct app-role SQL reads transaction_read_only=on, and runtime Hikari DEBUG confirms effective readOnly=true. Stock table SELECT and core money function EXECUTE remain refused.

Anonymous session is explicit signed out; private wallet/balance, administrator and forged identity reads return401. Test Origin200 with Test ACAO; Production Origin403 without ACAO. The public wallet summary intentionally returns200 with signedIn=false and null balance, including forged-header requests: this public redaction contract is recorded separately from private-wallet denial.

Observed first acceptance false was investigated: summary was the public guest contract, and class-level logger env casing did not activate Hikari diagnostics. The probe now covers actual private wallet endpoints plus summary redaction, and package-level Hikari logging was changed in the owned external Test environment with exact-unit/PID/artifact guard and private backup, followed by one owned-unit restart. No API/source behavior was changed to obtain acceptance.

Deployment state: only this independent private Test generation is running. New Docker container/volume and service are retained; installer deliberately refuses retry/adoption. Service Restart=no and Docker restart=no are initial-proof settings, not reboot continuity acceptance. Parent must assess persistent Test availability. Authenticated member/admin positives, financial/user mutations, all backend routes and Production backend promotion remain untested and unaccepted. Existing old/unclassified JVMs/DB resources were untouched.


Review checkpoint: canonical CI migrator bootstrap principal replaces postgres so functions/tables share intended ownership. Custom Test database name is supported by exact migration266 current_database(), despite stale CI comment. Separate image config/registry pins, explicit Test CORS origin, exact created-stage diagnostic ownership and manager/vendor/transient/drop-in/runtime-directory vacancy refusal are implemented. No runtime resources created at this checkpoint.

## Continuity continuation   before work
Parent approved bounded restart/reboot continuity for the already-owned Test generation before public browser acceptance. Preserve the original private backend.service and unit history; no credentials, SQL, sandbox, scheduling, public routing or Production changes.
- [x] RED/GREEN restart policy coverage; helper suite12/12, zero failures.
- [x] Exact current unit/PID/container and boot-link vacancy preflight; independently read and verified by parent before apply.
- [x] Private before/after inode/hash receipts; own unit enabled/restarted and container restart policy updated.
- [x] Fresh full Test acceptance17/17 and sanitized acceptance/continuity exports.

### Continuity   in progress
Original unit bytes were checked against the untouched private bootstrap backend.service. Current manager PID/unit/no-drop-ins/transient/disabled state, open JAR/CWD, exact owned container ID/label/image/volume/port and absent boot link were preconditions. Root-private history records prior/new unit inode/hash, original proof, source digests and the created root-owned boot symlink. Replacement was bounded by ownership and precondition checks; these checks are not an atomic filesystem compare-and-swap operation.

### Continuity   finished
The own unit now has Restart=on-failure, RestartSec=3, SuccessExitStatus=143, StartLimitIntervalSec=300 and StartLimitBurst=5, and is enabled for multi-user.target. Only the verified container policy changed to unless-stopped. Original bootstrap unit/history and credential environment bytes remain unchanged. Controlled own-unit restart yielded PID566098; fresh actual acceptance17/17 and policy evidence pass. Source/JAR remain exact f033/8a1c75c685ad31805a772ff9af6a94e6f7fd2e57f66809412ac2e900b1d6f38c. Parent can proceed with Test browser validation.

This verifies boot configuration and a controlled service restart, not an actual host reboot or induced-crash trial. No host reboot was performed. Existing Nginx, Production, unclassified processes/databases, SQL and application behavior were untouched. This continuation supersedes the earlier initial-proof Restart=no/Docker restart=no note only.
