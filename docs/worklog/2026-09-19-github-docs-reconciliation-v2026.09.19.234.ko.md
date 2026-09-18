# GitHub 문서 브랜치 자동통합 복구 — v2026.09.19.234

## 기준
- 작업 시작 exact main: `e9710efe8c365f683a045ad319da51435f720bb5`.
- 열린 PR #492 (`docs/project-plan-v232`)는 CI 성공 상태지만 main 전진 후 `mergeable=false`가 되었다.
- 근본원인: `auto-integrate-promote.yml`이 feat/feature/fix/bugfix/integrate/ops/auto/test-candidate/security 브랜치만 처리하여 `docs/*`는 자동 충돌해소·재검증·병합 대상에 포함되지 않았다.
- 미니PC 주 checkout은 삭제된 원격 planning 브랜치와 미추적 compose 파일이 남아 있으므로 reset하지 않고 exact-main 격리 worktree에서 수정한다.

## 변경
- Auto Integrate and Promote의 관리 브랜치 분류에 `docs/*` 추가.
- 반복 실패 정리/재조정 분류에도 `docs/*`를 추가하여 문서 브랜치도 exact-SHA 검증 수명주기를 따른다.
- `planning/*`는 계속 예약/제외한다. 임의 기획 브랜치의 고유 내용을 main 우선 충돌해소로 버리지 않도록 범위를 제한했다.

## PR #492 보존
- #492의 고정/설치당 플랫폼 수수료와 민감행위 재인증 내용은 유효하지만 canonical plan 수정 기준점이 v232 관리자 변경 및 v233 회차보다 오래되었다.
- 따라서 강제병합하지 않는다. Git 이력으로 고유 의도를 보존하고 다음 순차 기획 회차에서 재통합한 후 stale 충돌 PR을 닫는다.

## 검증·승격
- 로컬 `git diff --check`와 분기 패턴 검사는 통과했다. 로컬 YAML 보조 패키지가 없어 GitHub Actions 자체 파서를 권위 검증으로 사용한다.
- 브랜치 exact SHA를 push하고 Build Test Candidate 성공을 병합 조건으로 사용.
- 병합 후 자동 drain을 다시 실행해 `docs/*` 탐지/재조정과 예약 브랜치 제외를 확인한다.
- workflow-only 수정으로 런타임 서비스를 직접 변경하지 않으며 운영 승격은 exact-SHA Test → main → Production 게이트를 유지한다.
