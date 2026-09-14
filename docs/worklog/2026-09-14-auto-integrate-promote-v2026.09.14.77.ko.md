# v2026.09.14.77 — 브랜치 자동 통합 및 승격

## 범위

- 브랜치: `ops/auto-merge-promote-v2026.09.14.77`
- `.github/workflows/auto-integrate-promote.yml` 추가
- 개발 브랜치는 현재 HEAD와 정확히 일치하는 `Build Test Candidate` 성공 기록이 있고 통합 PR이 충돌 없이 병합 가능한 경우에만 `main`으로 통합
- 한 번 실행할 때 최대 한 브랜치만 처리하고 squash merge 후 소스 브랜치 삭제 요청
- 병합 직후 `main`의 Test Candidate를 명시적으로 실행
- 기존 격리 Test exact-SHA 확인, 백엔드/DB 공개 카탈로그 스모크 검사, 동일 SHA Production 이미지, GitOps 운영 승격 게이트는 그대로 유지
- `.github/workflows/cleanup-merged-branches.yml`은 2차 정리 안전장치로 유지

## 작업 순서별 버전

1. `v2026.09.14.77-01` — 기존 브랜치 정리 및 Test→Production 체인 점검
2. `v2026.09.14.77-02` — 검증 기반 자동 브랜치 통합 워크플로 추가
3. `v2026.09.14.77-03` — 배포 문서 및 한국어 2차 문서 정합성 반영
4. `v2026.09.14.77-04` — 변경 브랜치 CI/Test 체인 검증
5. `v2026.09.14.77-05` — `main` 통합 후 Test 백엔드 확인 및 기존 Production GitOps 자동 승격 허용

## 실패 시 동작

정확한 HEAD의 Test Candidate 성공 기록이 없거나, 병합 충돌이 있거나, 검증 후 HEAD가 변경되었거나, 허용된 브랜치 prefix 밖이면 자동 병합하지 않고 건너뜁니다.
