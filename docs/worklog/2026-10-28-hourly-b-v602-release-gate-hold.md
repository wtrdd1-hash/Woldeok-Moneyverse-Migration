# Backend B v602 — P0 exact-SHA release gate containment

## Before work
- Main SHA: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; branch: `auto/hourly-b-release-gate-hold-v602-20261028-0735`.
- QA v1335 PR #1646: local PostgreSQL and candidate CI passed; official isolated Test identity, authenticated finance/admin E2E, security and GitOps evidence remain BLOCKED.
- Root cause (#1088): `.github/workflows/auto-integrate-promote.yml` permits ready PR merge after Build Test Candidate success without independently verified Test deployment and finance/auth E2E, and dispatches `promote=true` after merging.
- Scope: CI workflow only; fail closed without inventing a positive attestation or changing schedules. Other workers' branches and jobs untouched.

## Plan / in progress
- [x] RED: two regression tests failed; fake ready PR with candidate success was merged and dispatched `promote=true`.
- [x] GREEN: ready PRs are held before any branch mutation/merge; automatic `promote=true` dispatch removed. Focused workflow tests 8/8 PASS.
- [x] Local gates: release 69/69 PASS, backend 1,688 PASS / 430 SKIP, frontend 1,681 PASS, Typecheck PASS, Build PASS, API contract 180 PASS, Bot 8/8 PASS, repository security PASS. Full lint FAIL (pre-existing blog-data.ts 2 errors), root test FAIL (pre-existing duplicate 283/missing 285), root audit FAIL (9 Moderate/2 Low), bot audit FAIL (1 Critical/5 High).
- [x] Draft/HOLD PR #1648, policy CI on initial PR head PASS; no main merge or deployment.

## In progress — verification evidence
- RED `scripts/release/auto-integrate-release-hold.test.mjs`: 0/2, real workflow shell against fake GitHub demonstrated a ready PR was merged and a Production promotion dispatch was requested from build-only evidence.
- GREEN: 8/8 focused tests including existing ready-filter; all release policy tests 69/69. Workflow shell `bash -n` PASS; diff check PASS.
- This is a **containment**, not a completed positive attestation implementation. The workflow intentionally blocks all ready PRs until a trusted independent exact-SHA Test/finance/auth/DB/security verifier is designed, implemented and certified. Build-only CI can never serve as a substitute.
- Baseline main lint and migration-parity failures remain owned by QA #1646; do not cherry-pick or mutate QA branches. No new migration, API, ledger, DB or WLD changes.

## 한국어 변경내역
- P0 #1088: 후보 이미지 빌드 성공만으로 PR 자동 병합 및 운영 승격을 허용하던 경로를 차단했습니다.
- 독립적인 Test·금융/인증 E2E·DB 권한·보안 증빙이 없는 경우 준비된 PR도 병합하지 않습니다. 자동 `promote=true` 요청도 제거했습니다.
- 현재는 안전 차단 단계이며, 공식 Test 증빙과 별도 승인 절차가 구현되기 전까지 병합·운영 배포를 진행할 수 없습니다.

## Finished — PARTIAL / BLOCKED
- PR: #1648, Draft + `hold`; initial PR head `a0e257e8304594dcdc5cbe1f0dd78a0d6c171240`.
- Exact-head CI #40597211756 SUCCESS (policy/classify); Build Test Candidate #40597192684 SUCCESS **non-runtime only**. Runtime-check, image build and production dispatch SKIPPED. This does not certify an actual isolated Test deployment.
- Public Test version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals this PR. Host Test pointer is dangling. Authenticated Test E2E and GitOps approval BLOCKED.
- Root lint/test/audits still FAIL on existing main. No migration or shared DB writes, no PR merge, Production promotion, service restart, branch cleanup or automation schedule changes.
- Next: independent trusted Test/finance/auth/DB/security attestation design and verification, then remove temporary hold only after all release gates PASS.