# 운영 배포

[English](production-deployment.md) | **한국어** | [문서 색인](../INDEX.ko.md)

이 문서는 운영 배포 절차를 설명합니다. 클러스터 구조, 이전 Docker 호스트의 잔여 요소, 이미 발생했던 장애 유형을 포함한 실제 장비 상태는 먼저 [`../INFRASTRUCTURE.md`](../INFRASTRUCTURE.md)를 확인합니다.

## 배포 철학
`main`은 지속적으로 검증되며 일반적인 Test→Production 승격 경로는 자동화되어 있지만 실패 시 닫히는 구조입니다. 애플리케이션 저장소는 정확한 SHA가 격리된 Test에서 정상 동작한 뒤에만 변경 불가능한 릴리스 이미지를 만들며, Production 상태는 `wtrdd1-hash/kuber-infrastructure`에 선언되고 Flux가 조정합니다.

Docker Compose는 Production 배포 제어면이 아닙니다.

## 예상 순서
1. 검증된 애플리케이션 코드를 `main`에 병합합니다.
2. CI가 정확한 SHA의 `-test` 이미지를 자동 빌드합니다.
3. GitOps 자동 조정기가 격리된 Test를 최신 성공 `main` SHA에 고정합니다.
4. `Build Production Release`는 `test.easy-scraping.com/api/version`이 동일 SHA를 보고하고 공개 카탈로그 백엔드/DB 경로 및 noindex 경계가 통과할 때까지 기다립니다.
5. 같은 SHA의 `-production` 이미지를 빌드하고 성공한 `production-ready` 신호를 게시합니다.
6. GitOps 자동 조정기는 현재 성공한 Test/main SHA와 일치하는 신호만 받아 Test 스모크 검사를 다시 실행하고 Production 매니페스트를 갱신합니다.
7. Flux가 Production을 조정하고 공개 Production 버전이 정확한 SHA인지, `/status` 및 백엔드/DB 카탈로그 경로가 정상인지 확인합니다.
8. 이전 Production 이미지 참조를 롤백용으로 보존합니다. 스키마 변경/파괴적 릴리스는 복구 선행조건을 계속 요구하며 자동화가 DB 안전 규칙을 면제하지 않습니다.

## 이미지

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-production
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-production
```

GitOps 매니페스트는 정확한 SHA 태그를 참조해야 하며 `latest-*`는 릴리스 식별자가 아닙니다.

## GitOps 기준 저장소

```text
wtrdd1-hash/kuber-infrastructure
  apps/wdmvp/backend.yaml
  apps/wdmvp/frontend.yaml
```

일반 릴리스에서 `kubectl set image`나 호스트 로컬 매니페스트 수정을 사용하면 Flux/Git과 드리프트가 생기므로 사용하지 않습니다.

## 롤아웃 검증

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

변경된 워크로드가 Ready이고 의도한 이미지 SHA로 실행되기 전에는 성공으로 보고하지 않습니다.

## 데이터베이스/데이터 안전
일반 애플리케이션 배포는 Production 데이터베이스/PVC를 재생성하거나 삭제하지 않고, 원장/감사 이력을 지우지 않으며, 명시적 마이그레이션 없이 기존 경제 계약을 소급 변경하지 않습니다. 필요한 검증 복구 게이트가 비정상인 상태에서 스키마 변경/파괴적 승격을 수행하지 않습니다.

현재 별도 매체 복구 위험은 issue #139에서 추적합니다.

## 배포 후 검사

```text
/
/login
/work
/quests
/casino
/wallet
/shop/catalog
/progression
/terms
/privacy
/status
/announcements
/robots.txt
/sitemap.xml
/ads.txt
```

외부에서 접근하면 안 되는 내부 전용 경로가 계속 차단되는지 확인하고 데이터에 영향을 주는 릴리스는 종합 데이터 무결성 감사를 다시 실행합니다.

운영자 체크리스트는 `docs/RELEASING.md`와 `docs/RELEASING.ko.md`를 참고합니다.
