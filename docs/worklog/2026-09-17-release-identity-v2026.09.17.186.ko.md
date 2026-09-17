# 릴리스 정체성 제어면 — v2026.09.17.186

> 상태: 작업 중
> 날짜: 2026-09-17
> 브랜치: `fix/release-identity-v2026.09.17.186`
> 정확한 기준: `17801cab463e9c93490b3f93f03c719f95896cb0`
> 영문 기준 문서: [2026-09-17-release-identity-v2026.09.17.186.md](2026-09-17-release-identity-v2026.09.17.186.md)

## 목표

`docs/planning/PROJECT_PLAN.md`의 현재 P0 릴리스 정체성 계약을 구현한다. 저장소 정체성을 애플리케이션 런타임 정체성으로 취급하지 않고, 권한이 필요한 릴리스 동작 전에 경로를 분류하며, 런타임 후보는 애플리케이션 소스·이미지·마이그레이션 증거를 불변 manifest로 남긴다. Production은 저장소 HEAD를 추정해서 폴링하지 않고 격리 Test에서 attested `applicationSourceSha`를 검증해야 한다.

## 체크리스트

- [x] 권위 통합기획서와 저장소 작업 규칙 재확인.
- [x] 구현 전 정확한 `origin/main`과 현재 릴리스 workflow 대조.
- [x] 정확한 main에서 독립 작업 브랜치/worktree 생성.
- [ ] 결정론적 릴리스 경로 classifier와 자동 corpus 테스트 추가.
- [ ] Test Candidate에서 불변 release-input/runtime candidate manifest 생성.
- [ ] Production Release가 이전 후보 증거를 소비하고 docs/control-plane-only에서 런타임 권한 동작을 수행하지 않도록 변경.
- [ ] Test/Production 검증을 `applicationSourceSha`, 이미지 digest, migration-set hash에 결합.
- [ ] 작업 중간 Living plan과 exact main 재확인 후 drift 반영.
- [ ] 로컬 classifier 테스트, lint, typecheck/build 필요 범위, workflow 정적 검증, diff check 실행.
- [ ] 체크포인트 push 및 exact branch SHA GitHub CI/Test Candidate 증거 확보.
- [ ] Production 변경 없이 격리 Test backend/API/noindex 경로에서 exact candidate 검증.
- [ ] exact-SHA Test 성공 후에만 병합하고 무중단 Production 승격 및 사후 smoke 수행.
- [ ] 내부 worklog, GitHub changelog, 통합기획 델타를 EN/KO 동기화하고 정확한 증거 기록.

## 최초 증거

- 작업 시작 `origin/main`: `17801cab463e9c93490b3f93f03c719f95896cb0`.
- 현재 `deploy.yml`은 `github.event.workflow_run.head_sha || github.sha`를 release SHA로 사용하고 candidate attestation을 소비하기 전에 Test `/api/version`이 해당 저장소 SHA를 제공한다고 가정한다.
- 현재 `test-candidate.yml`은 `GITHUB_SHA-test` 이미지를 만들지만 repository/application/control-plane identity, image digest, migration-set hash, Test deployment identifier를 분리한 release-input/candidate manifest를 게시하지 않는다.
- 이번 제어면 수정에는 애플리케이션 데이터 migration이 없다.

## 배포 상태

- Test: v186 미검증.
- Production: v186 미승격.
