# 운영 배포

[English](production-deployment.md) | **한국어** | [문서 색인](../INDEX.ko.md)

이 문서는 운영 배포 절차를 설명합니다. 클러스터 구조, 이전 Docker 호스트의 잔여 요소, 이미 발생했던 장애 유형을 포함한 실제 장비 상태는 먼저 [실제 배포 인프라 구조](../INFRASTRUCTURE.ko.md)를 확인합니다.

## 배포 철학
`main`은 지속적으로 검증되며 일반적인 Test→Production 승격 경로는 자동화되어 있지만 실패 시 닫히는 구조입니다. 애플리케이션 저장소는 정확한 SHA가 격리된 Test에서 정상 동작한 뒤에만 변경 불가능한 릴리스 이미지를 만들며, Production 상태는 `wtrdd1-hash/kuber-infrastructure`에 선언되고 Flux가 조정합니다.

Docker Compose는 Production 배포 제어면이 아닙니다.

## 현재 공개 edge 런타임

GitOps는 계속 선언형 릴리스 권위이지만 현재 미니PC의 공개 Nginx edge는 호스트 systemd 서비스를 프록시합니다. Production backend/frontend는 `3000/3001`, Test backend/frontend는 `3100/3101`을 사용합니다. 공개 ingress가 완전히 조정된 cluster runtime으로 이전될 때까지 모든 승격은 승인된 exact SHA를 이 host 서비스에도 동일하게 반영하고 공개 `/api/version`을 확인해야 합니다. GitOps manifest 변경만으로 공개 사이트가 바뀌었다고 판단하지 않습니다.

host mirror는 동일 승인 SHA를 사용하고 이전 unit 설정을 롤백용으로 보존해야 하며, 릴리스 완료 보고 전에 같은 catalog/status/SEO probe를 통과해야 합니다.


### Stable Test 환경 소유권 — v2026.09.19.263

영구 Test service는 release 디렉터리의 `backend/.env` 또는 `frontend/.env.local`을 직접 로드하지 않습니다. systemd `EnvironmentFile=` 값이 후보의 `PORT`/`BUILD_ID`를 덮으면 잘못된 listener에 바인딩하거나 잘못된 release identity를 보고할 수 있습니다.

비밀값을 포함하는 안정 설정은 `/etc/moneyverse/test-backend.env`, `/etc/moneyverse/test-frontend.env`에 두고, 릴리스별 `/etc/moneyverse/test-backend-release.env`, `/etc/moneyverse/test-frontend-release.env`를 마지막에 로드합니다. 후자의 두 파일은 `ops/systemd/write-test-release-env.sh <exact-sha> /etc/moneyverse`로 생성합니다. 검토된 drop-in 예시는 `ops/systemd/test-main-backend-release.conf.example`, `ops/systemd/test-main-frontend-release.conf.example`입니다.

두 Test service는 같은 `/srv/moneyverse-data/releases/test-current` root를 사용해야 합니다. restart 전 같은 exact SHA의 backend/frontend build인지 확인하고, restart 후 backend `:3100/health`, 공개 Test `/api/version`, frontend BFF catalog, `X-Robots-Tag: noindex`를 모두 검증합니다. backend/frontend가 서로 다른 release면 각 process가 healthy여도 gate 실패입니다.

## 프론트엔드 런타임 캐시 소유권

host systemd frontend는 `debian` 사용자로 실행되고 Next.js는 서버 fetch 재검증을 위해 런타임에 `.next/cache`를 갱신합니다. root로 복사하거나 빌드한 릴리스는 canary/start 전에 이 mutable cache 하위만 준비해야 하며 immutable application release 전체의 소유권을 재귀 변경하면 안 됩니다.

먼저 Test에서 `ops/systemd/prepare-frontend-runtime-cache.sh <release-dir> debian debian`을 실행합니다. helper는 기본적으로 `/srv/moneyverse-data/releases` 밖 경로를 거부하고 `frontend/.next/cache`만 소유권 변경하며 runtime 사용자로 실제 쓰기를 검증합니다. 재검증이 발생하는 요청을 보낸 뒤 frontend journal에 새 `EACCES` cache-write 오류가 없는지 확인한 후 Production을 승격합니다.

## 백엔드 로그인 세션 연속성

Production 백엔드 승격으로 회원 로그인이 풀리면 안 됩니다. 일반 회원 세션은 PostgreSQL `auth_sessions`에 저장되며 브라우저 쿠키와 서버 세션 수명은 모두 30일입니다. 따라서 백엔드 프로세스 재시작이나 릴리스 디렉터리 변경 시 동일 Production DB를 계속 사용하고, 활성 세션 행을 revoke/truncate/recreate/re-key 하면 안 됩니다. 관리자 콘솔 세션의 별도 단기 만료 정책은 이 규칙으로 연장하지 않습니다.

호스트 systemd mirror에서는 비밀값과 `DATABASE_URL`을 immutable release 디렉터리 밖의 `/etc/moneyverse/backend-production.env`에 고정하고, 릴리스 식별자는 `/etc/moneyverse/backend-release.env`에 분리하며, `WorkingDirectory`는 `/srv/moneyverse-data/releases/production-current/backend`를 사용합니다. 검토된 drop-in 예시는 `ops/systemd/moneyverse-backend-session-continuity.conf.example`입니다. Production 승격 전 Test에서 재시작 전에 발급한 쿠키가 재시작 후 새 세션 발급 없이 그대로 승인되는지 확인하고, 실 DB 인증 테스트에서 로그인된 세션이 repository/process 재생성 후에도 유지되는지 확인합니다. 롤백은 코드/런타임 포인터만 되돌리고 `auth_sessions`는 변경하지 않습니다.

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

운영자 체크리스트는 [한국어 릴리스 가이드](../RELEASING.ko.md)를 참고합니다. 영문 정본이 필요한 경우에만 `docs/RELEASING.md`를 선택합니다.
