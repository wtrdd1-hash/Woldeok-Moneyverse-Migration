# Immutable host release build identity preflight — v2026.10.17.791

## Before work — 2026-10-17 KST
- Separate worktree/branch on data disk, created from the current `origin/main=aa7eddb92aefbf318f6d029143aae070ba09873c` after PR #921/#922 merge. No other agent worktree or live release modified.
- Reviewed documentation precedence (`DOCUMENTATION_POLICY`, `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`), v530 full-route hard stop, Debian `RELEASING`, architecture deployment flow, and latest production financial BLOCKED findings.
- New live discovery: public isolated Test now advertises `4997cf2b...` across source manifest/backend/frontend, but actual Next `.next/BUILD_ID` is `1792212026459`; `verify-host-runtime-identity --channel test` fails `frontend_artifact_sha_mismatch`. Public 200 responses are NOT a sufficient release gate.
- Code cause candidate: `frontend/next.config.ts` defaults missing build-time `BUILD_ID` to `Date.now()`, while `ops/release/stage-host-release.sh` checks only frontend artifact existence and does not enforce approved SHA identity.
- Scope: reject a mismatched frontend `.next/BUILD_ID` *before copying* a staged Test/Production release, verify with RED/GREEN tests; no site UI, payments, active runtime, or DB changes.

## In progress
- [x] RED: new negative test FAILED against prior script: artifact `candidate-build` staged successfully (exit 0), confirming release identity gap.
- [x] GREEN: staging now rejects mismatched artifacts before release-root creation, while exact SHA artifact stages without .git metadata. Test fixture models ignored generated outputs. 3 focused tests PASS.
- [x] Revisited origin/main `aa7eddb9`, integrated master, release and version policy; release regression suite 56 PASS, 0 FAIL/SKIP; Bash syntax and `git diff --check` clean.
- [x] GitHub [PR #923](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/923) CI policy/classification passed and MERGED to main `92cb15824bcca1b9474d97caa5b40e388db55d9a`; GitHub Build Test Candidate non-runtime jobs skipped by workflow classification. **No new Test or Production cutover**; current Test live artifact identity still invalid, finance and v530 P0 unresolved.

## Finished
- Source fix completed and merged to main via #923 (v791); local release tests 56 pass/0 fail/0 skip. New stage safeguard does not repair already-running Test release. No Production deployment, DB change, balance mutation, secret change or runtime pointer change.
- Closing documentation based on refreshed origin/main; original fix source remains immutable.
