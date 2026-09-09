# GitOps release contract worklog — 2026-09-09

## English

### Trigger

The current production host is Kubernetes/containerd reconciled by Flux, but the application repository still contained a Docker Compose/SSH production rollout workflow and a release guide describing the retired topology. Since the previous audit, `kuber-infrastructure` also added a complete isolated `wdmv-test` stack, making the old "no test server" release documentation stale.

### Changes

- `.github/workflows/deploy.yml`
  - removed SSH file shipping, Compose rollout, and Docker runtime reporting;
  - retained `main` enforcement and complete reusable CI;
  - builds exact-SHA production backend/frontend images only;
  - enabled SBOM and provenance attestations;
  - removed mutable `latest-production` from release identity;
  - explicitly reports that production promotion is a reviewed GitOps change.
- `docs/architecture/deployment-flow.md`
  - now documents CI -> isolated test -> production image -> GitOps PR -> Flux -> Kubernetes rollout -> smoke/data audit.
- `docs/RELEASING.md`
  - replaced the stale Compose procedure with the authoritative English GitOps release guide.
- `docs/RELEASING.ko.md`
  - added the Korean translation.
- `docs/superpowers/specs/2026-09-09-runtime-topology-amendment.md`
  - reconciles the original SQLite/test/deployment planning assumptions with PostgreSQL + Kubernetes/Flux reality.
- `docs/superpowers/plans/2026-09-09-gitops-release-contract.md`
  - records the implementation and validation plan.

### External references checked

- Kubernetes Deployment documentation: rollout completion requires updated/available replicas and `kubectl rollout status` is the supported completion monitor.
- Flux documentation: Git reconciliation is the intended declarative operating model.
- GitHub Actions documentation: `workflow_dispatch` is appropriate for explicitly requested release builds.

### Safety

This branch does not change database schema or production data. It intentionally removes the false production mutation path rather than replacing it with an unreviewed imperative Kubernetes command. Production remains unchanged until a separate GitOps PR is reviewed and merged.

## 한국어

### 작업 배경

실제 운영은 Kubernetes/containerd + Flux인데 애플리케이션 저장소에는 Docker Compose/SSH 운영 배포 절차가 남아 있었습니다. 또한 직전 감사 이후 GitOps 저장소에 frontend/backend/PostgreSQL/secrets/routing/readiness가 분리된 `wdmv-test` 스택이 새로 추가되어 “테스트 서버 없음” 문서도 최신 상태가 아니게 됐습니다.

### 완료한 수정

- 기존 `deploy.yml`의 SSH/Compose 운영 롤아웃 제거
- 정확한 main SHA의 production 이미지 빌드만 수행하도록 변경
- production 이미지 SBOM/provenance 생성
- GitOps PR만 운영 변경 정본으로 명시
- 격리 테스트 환경을 정식 사전 배포 게이트로 문서화
- 배포 아키텍처 및 릴리스 문서를 Kubernetes/Flux 기준으로 교체
- 영문 공식 릴리스 문서와 한국어 번역본 분리
- 기존 기획서의 SQLite/구형 배포 토폴로지를 정정하는 기획서 보정 문서 추가
- 구현계획 문서 추가

### 남은 위험

- 별도 백업 매체 복구 상태는 이슈 #139가 해결될 때까지 데이터 변경 릴리스의 게이트로 유지해야 합니다.
- `k8s-prepull.yml`은 운영 정본이 아니며 향후 필요성을 재검토해야 합니다.
- 관리자 2단계 인증의 frontend/backend 계약 불일치 등 애플리케이션 보안 잔여 이슈는 이번 release-engineering 변경 범위 밖이며 별도 수정이 필요합니다.

### 검증 상태

이 작업은 PR CI가 secret scan, lint, typecheck, build, PostgreSQL migration, tests, Prisma guard, production dependency audit를 모두 통과한 뒤에만 main에 병합합니다.
