# 런타임 수렴 v2026.09.16.151

## 범위

검증되지 않은 Kubernetes DB로 공개 트래픽을 옮기지 않고 실제 공개 Test/Production, GitHub 릴리스 증거, GitOps desired 참조를 정확한 애플리케이션 SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`로 수렴합니다.

## 증거 및 조치

- 작업 전과 Production 승격 직전에 최신 `main`과 Living Project Plan을 다시 확인했습니다.
- 이전 Production SHA `2b26308a46c1491a73ac1ad7911ce4eab0559b8f`에서 `3d87165f83bcb60903e85d4f3600fdf40074ef40`까지 backend/frontend/database/package 변경이 0개이고 복구 workflow/문서만 변경됐음을 확인했습니다.
- Test와 Production PostgreSQL 모두 201개 migration 행, 최신 `202-admin-traffic-and-ai-status.sql`까지 적용됐음을 확인했습니다.
- `/home/debian/releases/test-3d87165f83bc`에 exact-SHA Test를 빌드·승격했고 version, health, status, 상점 catalog, game clock, 익명 관리자 차단, Test `noindex` 경계를 공개 환경에서 검증했습니다.
- Production 승격 직전 `wdmv-pre-v150-20260916-162459.dump`와 SHA-256 sidecar 백업을 새로 생성했습니다.
- `/home/debian/releases/prod-3d87165f83bc`에 exact-SHA Production을 빌드·승격했고 공개 version, health, 상점 API, robots, sitemap, 색인 가능 상태를 검증했습니다.
- GitHub Production Release run `35068561793`이 isolated exact-SHA Test gate를 통과하고 두 `-production` 이미지를 빌드·푸시했으며 Production-ready 신호를 게시했습니다.
- GitOps Test PR #78과 Production PR #79를 검토·병합했습니다. 인프라 main `31673a795096490d280b42ea554c53d30d1964b9`는 Test/Production 모두 `3d87165f83bcb60903e85d4f3600fdf40074ef40`를 선언합니다.
- Production Flux `apps`는 의도적으로 `suspend: true`를 유지하며 Kubernetes Production rollout은 실행하지 않았습니다.
- Runtime Drift Watch run `35069150294`가 성공해 GitOps desired Test/Production SHA와 공개 live SHA 일치 및 공개 smoke를 독립적으로 검증했습니다.
- 임시 배포 자격증명 복구 파일과 Debian 임시 authorized-key 항목을 삭제했습니다.

## 남은 인프라 경계

`192.168.100.186:22` NixOS/Kubernetes 호스트는 네트워크상 도달하지만 현재 설정된 배포 자격증명을 거부합니다. 따라서 클러스터 관리자 접근과 클러스터 DB 대사는 아직 불가합니다. 현재 Debian 공개 런타임에는 영향을 주지 않지만 두 항목을 복구·검증하기 전까지 Kubernetes Production은 반드시 suspend 상태를 유지해야 합니다.

## 롤백 기준

- Production DB 백업: `/srv/moneyverse-data/backups/wdmv-pre-v150-20260916-162459.dump`
- 이전 Production 릴리스: `/home/debian/releases/prod-2b26308a46c1`
- 이전 Test 릴리스: `/home/debian/releases/test-cef23d5f0e36`
