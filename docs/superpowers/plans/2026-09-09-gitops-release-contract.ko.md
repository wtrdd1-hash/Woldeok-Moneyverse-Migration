# GitOps 릴리스 계약 구현 계획 — 2026-09-09

[English](2026-09-09-gitops-release-contract.md) | **한국어** | [문서 색인](../../INDEX.ko.md)

## 목표
애플리케이션 저장소에서 오래된 Docker Compose Production 변경 경로를 제거하고 Kubernetes/Flux GitOps를 유일하게 문서화된 Production 릴리스 계약으로 만듭니다.

## 현재 사실
- 애플리케이션 런타임: Next.js + NestJS + PostgreSQL
- Production: Kubernetes/containerd의 `wdmvp` 네임스페이스
- Test: 자체 frontend/backend/PostgreSQL/secrets/routing/readiness를 가진 격리 `wdmv-test` 네임스페이스
- 런타임 기준 저장소: Flux가 조정하는 `wtrdd1-hash/kuber-infrastructure`
- 기존 `.github/workflows/deploy.yml`은 호스트에 SSH해 Docker Compose를 실행하고 있어 현재 호스트와 맞지 않습니다.

## 구현
1. `.github/workflows/deploy.yml`의 오래된 롤아웃 부분을 릴리스 아티팩트 워크플로로 교체합니다.
2. 전체 재사용 CI 워크플로를 선행조건으로 유지합니다.
3. 변경 불가능한 `<sha>-production` backend/frontend 태그만 빌드합니다.
4. Production 이미지에 SBOM과 provenance attestation을 생성합니다.
5. 애플리케이션 저장소 워크플로에서 Production을 직접 변경하지 않습니다.
6. `kuber-infrastructure/apps/minipc/wdmvp/*.yaml`의 검토된 변경만 승격 경로로 사용합니다.
7. 성공 보고 전 Flux 조정, Kubernetes 롤아웃 완료, 공개 스모크 검사, 데이터 무결성/복구 게이트를 요구합니다.
8. 릴리스/배포 문서를 영어와 한국어로 갱신합니다.
9. 초기 기획서가 SQLite와 이전 런타임 토폴로지를 설명하므로 정정 명세를 추가합니다.

## 검증
애플리케이션 PR은 다음 저장소 CI 게이트를 통과해야 합니다.
- 커밋된 비밀정보 거부
- lint
- 원시 제어 바이트 거부
- typecheck
- build
- PostgreSQL 마이그레이션 적용
- tests
- Prisma 스키마 변경 거부
- Production 의존성 감사

워크플로 YAML은 PR 브랜치 평가 시 GitHub Actions가 파싱하며 Production 아티팩트 빌드는 `workflow_dispatch` 전용을 유지해야 합니다.

## 배포 경계
이 변경은 릴리스 엔지니어링 전용이며 스키마 변경이나 Production 데이터 변경을 수행하면 안 됩니다. Production 승격은 별도의 GitOps PR로 유지하고, issue #139의 별도 매체 복구 요구사항이 해결되지 않은 동안 스키마 변경/파괴적 승격은 차단합니다.

## 후속 작업
- GitOps 계약 문서와 오래된 Compose 롤아웃 제거가 병합되면 #126 종료
- 별도 매체 백업/복구가 정상이고 리허설될 때까지 #139 유지
- 남은 호스트 측 이미지 staging/prepull 워크플로는 별도로 재검토하고 두 번째 Production 기준 저장소가 되지 않도록 함
