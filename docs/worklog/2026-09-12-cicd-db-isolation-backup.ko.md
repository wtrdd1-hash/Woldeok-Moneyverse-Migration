# 2026-09-12 — CI/CD, 환경 DB 분리, 복구 DB

업데이트 버전: `2026.09.12-01`

## 범위

- 현재 열린 non-MCP 애플리케이션 PR(#147)을 `main`이 아닌 전용 통합 브랜치에 통합.
- immutable 테스트 후보 이미지 워크플로를 이번 통합 브랜치까지 확장.
- `wdmv-test`와 `wdmvp`를 서로 다른 Kubernetes 환경/DB로 유지.
- GitOps 인프라 저장소에 복구 전용 PostgreSQL과 운영 DB의 시간당 논리 복제 작업 추가.
- exact SHA를 받아 test 또는 Production 승격 PR을 만드는 GitHub Actions GitOps workflow 추가.

## 환경 계약

| 환경 | Namespace | Database | 앱 접근 |
| --- | --- | --- | --- |
| 테스트 | `wdmv-test` | `wdmv-test-db`의 `moneyverse_test` | 테스트 앱 전용 |
| 운영 | `wdmvp` | `wdmvp-db`의 `moneyverse_production` | 운영 앱 전용 |
| 복구 | `wdmvp` recovery component | `wdmvp-recovery-db`의 `moneyverse_recovery` | 앱 연결 없음 |

복구 DB는 빠른 논리 복구/점검용이며 별도 미디어 암호화 백업의 대체품이 아닙니다. #139의 별도 백업 매체 문제와 복구 리허설이 해결되기 전까지 DB 변경 운영 배포의 복구 리스크는 남아 있습니다.

## CI/CD 흐름

1. 애플리케이션 브랜치 push 시 전체 CI와 `<sha>-test` immutable 이미지를 생성합니다.
2. 인프라 promotion workflow는 전체 애플리케이션 SHA와 대상 환경만 입력받습니다.
3. 새 promotion 브랜치에서 exact-SHA GitOps 참조를 수정하고 PR을 생성합니다.
4. 테스트 승격/검증을 먼저 완료합니다.
5. 운영 승격은 `PROMOTE_PRODUCTION` 확인 문자열을 추가로 요구하며, exact-SHA 테스트 검증 전에는 병합하지 않습니다.

## 현재 검증 상태

- 통합 브랜치의 GitHub 테스트 후보 workflow가 시작되었습니다.
- 현재 세션에서는 미니PC 원격 장치가 연결되지 않아 Kubernetes 실제 rollout, 백엔드 `/health`, 복구 DB refresh 검증은 아직 수행하지 못했습니다.
- 운영 GitOps 변경은 병합하지 않았습니다.

## 롤백

- 애플리케이션: GitOps image-reference 승격 커밋을 이전 검증 SHA로 되돌립니다.
- 복구 DB: Production kustomization에서 recovery 리소스를 제거합니다. 운영 DB PVC는 건드리지 않습니다.
- 애플리케이션 롤백 과정에서 운영 DB/PVC/원장 데이터를 삭제하거나 재작성하지 않습니다.
