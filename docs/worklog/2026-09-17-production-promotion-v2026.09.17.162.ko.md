# v2026.09.17.162 — Production exact-SHA 승격 및 런타임 수렴

- 날짜: 2026-09-17
- 브랜치: `ops/production-promotion-v2026.09.17.162`
- 애플리케이션 릴리스: `18c7a1324013099e47b2d6e22c5108c4d378139c`
- Test/Production 릴리스 워크플로: `35113806254`
- GitOps Production 조정 워크플로: `35117875121`
- 인프라 Production 커밋: `bb7f683d7b0a494d41dcbf35dda5dcd793c2e164`
- 영문 기준: [2026-09-17-production-promotion-v2026.09.17.162.md](2026-09-17-production-promotion-v2026.09.17.162.md)

## 범위
검증된 현재 `main` exact SHA를 Test, production-ready, DB 백업, migration, 공개 smoke 게이트를 우회하지 않고 Production으로 승격했다. 동시에 승격 중 확인된 실제 런타임 라우팅도 기록한다. GitOps는 선언형 릴리스 권위이지만 현재 공개 edge는 호스트 systemd 서비스가 실제로 서빙한다.

## 릴리스 증거
- 애플리케이션 `main`, 공개 Test `/api/version`, 공개 Production `/api/version`, GitOps Production manifest가 모두 `18c7a1324013099e47b2d6e22c5108c4d378139c`로 수렴했다.
- `Build Production Release`가 exact-SHA Test gate를 통과하고 backend/frontend Production 이미지를 빌드했으며 성공한 `production-ready` 신호(deployment `6484314782`)를 발행했다.
- `Auto Reconcile Woldeok Moneyverse`가 같은 SHA로 Production manifest를 갱신하고 공개 Production smoke까지 성공했다.
- 스키마 변경 전에 Production DB 백업 `/srv/moneyverse-data/backups/prod-before-18c7a1324013-20260917-005112.dump`를 생성했다(관측 크기 9.2 MiB).
- exact 릴리스 migration runner로 `203-work-reset-convergence.sql`을 Production에 적용했고 checksum `1371d66027bc62bbbdac71b0b7a0a9a771ea1782362941674768ce1a2fc1ba54`를 기록했다.
- 공개 host runtime 전환 전 기존 systemd drop-in을 `/srv/moneyverse-data/backups/prod-systemd-20260917-005707`에 보존했다.

## 공개 검증
- `/`, `/login`, `/work`, `/casino`, `/shop/catalog`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`가 모두 HTTP 200이었다.
- 공개 catalog의 backend/DB 경로에서 146개 항목을 반환했다.
- Production에는 `X-Robots-Tag: noindex`가 없고 Test의 `noindex, nofollow` 경계는 승격 전 유지됐다.
- 전환 뒤 `moneyverse-backend`, `moneyverse-frontend`, `moneyverse-economy-ai`가 active였고 최근 severe log 검사에서 fatal/uncaught/OOM/panic 일치 항목은 0건이었다.
- 경제 제어도 유지됐다: `economy_ai_policy_review=enabled`, `economy_auto_policy=enabled`; 선택 모델은 `llama3.2:3b`, `gemma3:1b`다.

## 런타임 수렴 규칙
GitOps manifest가 선언형 릴리스 권위이지만 현재 공개 Nginx edge는 호스트 systemd 서비스(Production `3000/3001`, Test `3100/3101`)를 사용한다. 따라서 manifest만 바뀌었다고 릴리스 완료로 처리하지 않는다. 공개 host runtime이 동일 exact SHA를 반환하고 catalog/status/SEO probe를 통과해야 한다. 이 host mirror는 공개 ingress가 완전히 cluster runtime으로 이전될 때까지의 운영 호환 계층이다.

## 롤백
이전 Production 릴리스와 unit 설정을 보존한다. 애플리케이션 롤백 시 이전 systemd drop-in을 복원하고 backend/frontend를 재시작한 뒤 공개 `/api/version`, catalog, status를 검증한다. forward migration이 구 코드와 호환되는 경우 코드 롤백만을 위해 DB를 되돌리지 않으며, 실제 데이터/스키마 복구가 필요할 때만 사전 백업을 사용한다.
