# 월덕 머니버스 기획서 v2 — 런타임/배포 정정안 (2026-09-09)

이 문서는 `2026-08-30-spec-v2.md`의 제품 기능 결정을 바꾸지 않고, 실제 구현과 달라진 인프라·배포 부분을 최신 상태로 정정한다. 충돌 시 이 문서의 런타임/배포 설명이 우선한다.

## 정정 1 — 데이터베이스

초기 기획서 §8의 `MVP DB: SQLite WAL` 계획은 더 이상 현재 구현이 아니다.

현재 애플리케이션은 PostgreSQL을 사용하며, 경제·권한 정합성의 핵심은 PostgreSQL `SECURITY DEFINER` 함수와 불변 번호 마이그레이션에 있다. 운영 릴리스는 PostgreSQL 마이그레이션 체크섬과 DB 연동 테스트를 통과해야 한다.

## 정정 2 — 테스트/운영 분리

초기 기획서의 “테스트/운영 DB, 비밀값, 도메인, 봇 분리” 원칙은 유지한다.

2026-09-09 기준 GitOps 저장소에 `wdmv-test` 격리 스택이 다시 구성되었다. 테스트 환경은 별도 frontend, backend, PostgreSQL, secrets, registry credential, routing, readiness probe를 갖고 정확한 `<sha>-test` 이미지를 검증한다.

운영은 `wdmvp` 네임스페이스이며 테스트와 데이터·비밀값을 공유하지 않는다.

## 정정 3 — 운영 배포 정본

운영 호스트는 NixOS + Kubernetes/containerd이며 Flux가 `wtrdd1-hash/kuber-infrastructure`의 선언을 반영한다. 따라서 Docker Compose/SSH 롤아웃은 더 이상 운영 배포 계약이 아니다.

정식 흐름은 다음과 같다.

1. 애플리케이션 `main`의 전체 CI 성공
2. 동일 SHA의 격리 테스트 이미지/스택 성공
3. 동일 SHA의 production 이미지 생성
4. `kuber-infrastructure` 운영 매니페스트 PR
5. Flux reconciliation
6. Kubernetes rollout 완료 확인
7. 공개 health/smoke check
8. 데이터 변경 시 무결성/백업·복구 게이트 재확인

## 정정 4 — 운영 데이터 보호

스키마 변경·파괴적 작업은 검증된 복구 경로가 없는 동안 운영에 승격하지 않는다. 동일 호스트 임시 dump는 장애 대비 보조 수단일 뿐 별도 매체 복구의 대체가 아니다.

## 정정 5 — 릴리스 성공의 정의

CI 성공이나 이미지 push만으로 “배포 성공”이라고 부르지 않는다. 변경된 Kubernetes workload의 rollout 완료, 의도한 SHA 이미지 실행, 공개 smoke check, 필요한 데이터 무결성 검증까지 확인되어야 한다.

## 최신 기준 문서

- `docs/architecture/deployment-flow.md`
- `docs/RELEASING.md`
- `docs/RELEASING.ko.md`
- `docs/worklog/2026-09-09-ops-recovery-audit.md`
- GitOps 저장소 `wtrdd1-hash/kuber-infrastructure`
