# 릴리스 런타임 라우팅 복구 — v2026.09.15.113

## 범위

exact-SHA 운영 승격 게이트를 약화하지 않고 미니PC 릴리스 경로에서 빠진 공개 Test 라우팅 연결부를 복구한다.

## 변경 전 런타임 근거

- `test.easy-scraping.com`과 `easy-scraping.com`이 모두 Nginx 기본 upstream인 `127.0.0.1:3001`로 들어갔다.
- 분리된 Test 프론트엔드는 `3101`, Test 백엔드는 `3100`에서 이미 실행 중이었다.
- 이 호스트에는 Kubernetes/Flux 런타임이 없어 GitOps 선언 변경만으로 로컬 공개 런타임이 바뀌지 않았다.
- 릴리스 계약은 계속 fail-closed다. Test 런타임이 정확한 candidate/main SHA를 반환해야만 운영 승격이 가능하다.

## 변경

- 운영 Next.js middleware에 opt-in `TEST_FRONTEND_ORIGIN` 호스트 rewrite를 추가한다.
- `Host: test.easy-scraping.com` 요청만 해당 origin으로 전달한다.
- 환경변수가 없으면 기존 동작은 그대로다.
- Test 빌드에는 이 변수를 넣지 않아 자기 자신으로 프록시되는 루프를 막는다.

## QA / 승격 순서

1. 라우팅 비활성/활성 단위 테스트.
2. 프론트엔드 typecheck 및 build.
3. 별도 포트에서 라우팅 빌드를 띄워 Host 기반 Test 전달 검증.
4. 현재 main의 정확한 SHA로 Test를 다시 빌드하고 로컬 exact-SHA/noindex/backend smoke 검증.
5. 라우팅 빌드를 운영 프론트에 부트스트랩 적용한 뒤 공개 Test exact SHA 검증.
6. 기존 exact-SHA 운영 게이트를 재실행하고 SHA/backend/catalog/noindex 중 하나라도 다르면 승격하지 않는다.
