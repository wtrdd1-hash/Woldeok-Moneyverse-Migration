# v2026.10.16.717 — Host release identity gate correction (engineering log)

**English canonical** | [한국어](2026-10-16-release-identity-v717.ko.md)

## Start
- User asked to re-read authority/official references, implement, test CI/PR, perform Production promotion only under the existing zero-downtime Test/finance/auth/backup gates.
- Initial `origin/main=e69058a51509fb66b99776be42df455bf940fb22`, after bank fix PR #884 merged by a concurrent worker. Running Test and Production are both immutable v712 app source `142e36b5b0955c575992ca95b1706ba85e8dc909`.
- v716 banking read-only feature passes CI and actual Test canary; Test returned to v712 with healthy 200/version. Its financial/auth release blockers remain.
- Separate `fix/release-identity-v2026.10.16.717` worktree; no migration, member transaction, Production service, DB data, service env or switch change. Prework record `/srv/moneyverse-tasks/release-identity-v717/WORKLOG.md`.

## Reproduced failure
- Read-only `node scripts/release/verify-host-runtime-identity.mjs --channel prod --sha 142e36b5...` failed the production identity gate even though public version, manifest and built frontend all matched current v712.
- Cause: verifier selected retired **v600 systemd services** `moneyverse-backend/frontend` and stale fixed `/etc/moneyverse/*-release.env`; actual v712 serving services are `moneyverse-release-v712-backend/frontend.service` with their distinct effective release env. Failed code was preflight-only, not v712 runtime corruption.
- Unprivileged Test check hit EACCES reading protected env; run with approved sudo (read-only), never print secrets.

## Design and RED-GREEN
- Versioned immutable Production service names are selected from a strictly matched release-manifest version; Test selects dedicated `test-main-*`. Malformed versions fail closed. A service's own systemd effective EnvironmentFiles are read in ordered precedence; duplicate BUILD_ID inside one env is refused and missing/invalid effective ID blocks release; no stale path fallback.
- Existing independent SHA consistency gates remain unchanged: public version, immutable manifest, built frontend ID and both actual live systemd CWDs.
- Added 2 regression tests. Pre-change RED failure on missing exports; post-change `node --test scripts/release/verify-host-runtime-identity.test.mjs` **10/10 PASS**.
- On actual Debian host, authorized read-only Test and Production preflight for current **v712** each exit 0, `ok:true`, all 5 SHA fields correct and `failures:[]`. Negative Production check with unserved v716 source exits 1, reports expected mismatches.
- EN/KO `docs/RELEASING.md` paired operational note updated; no claim this verifier alone certifies finance, logged-in member sessions, migrations, five-pass UI or Production promotion.

## Mid and finish
- Re-fetch `origin/main` during execution and before PR. Other agent ownership and source diff checked; no overlapping changes to verifier or release-guide at initial recheck.
- Tests, branch SHA, GitHub PR/CI state and final observed Production/Test pointers recorded in GitHub PR and private task evidence when actually measured.
- **Production promotion of bank v716 remains blocked** by independent financial ledger/DB least privilege/authenticated Test-session and backup-restore gates. This ops fix is a safety monitor correction, not an authorization to bypass those gates.
