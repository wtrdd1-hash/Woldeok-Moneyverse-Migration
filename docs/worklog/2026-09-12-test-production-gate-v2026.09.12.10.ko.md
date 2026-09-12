# 2026-09-12 — 테스트→운영 배포 게이트

업데이트 버전: `v2026.09.12.10`

## 확인 사항

- Living Project Plan은 전용 테스트 스택이 있으면 운영보다 먼저 사용하도록 계속 요구합니다.
- `kuber-infrastructure`에는 독립 `wdmv-test` Flux Kustomization과 별도 PostgreSQL DB가 존재합니다.
- `docs/architecture/deployment-flow.md`는 오래되어 테스트 게이트가 없다고 잘못 기록하고 있었습니다.
- 앱의 테스트 후보 워크플로는 `main`에서 자동 실행되지 않았습니다.

## 변경 사항

- `Build Test Candidate`의 push trigger에 `main`을 추가했습니다.
- 배포 문서를 현재 GitOps 테스트 → 검증 → 운영 계약에 맞췄습니다.
- 정확한 SHA 이미지 식별과 테스트/운영 DB 분리를 유지했습니다.

## 검증 및 배포

- 테스트 승격 전 GitHub CI와 테스트 이미지 빌드 성공을 요구합니다.
- 테스트 승격은 `kuber-infrastructure/.github/workflows/wdmv-promote.yml`을 사용합니다.
- 동일 앱 SHA가 테스트 origin 검증을 통과한 뒤에만 운영 승격합니다.
- 롤백은 GitOps 이미지 참조 되돌리기이며 운영 DB/PVC 삭제는 금지합니다.
