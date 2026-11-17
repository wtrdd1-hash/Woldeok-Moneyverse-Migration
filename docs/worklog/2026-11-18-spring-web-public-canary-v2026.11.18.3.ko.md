# v2026.11.18.3 — 사용자 지시 실제 Spring SSR 공개 카나리 운영 승격

**한국어** · [English](2026-11-18-spring-web-public-canary-v2026.11.18.3.md) · 시작 / 승격 범위 제한

## 작업 전 — 2026-11-18 07:50 KST
- 사용자 지시: 프론트엔드 전체 Spring 전환 및 즉시 운영 승격. 범위는 Next 페이지 178·BFF 124. G0–G6 미충족 상황에서 미리보기를 전체 전환이라고 허위 보고하지 않음. 검증 가능한 공개 경로만 단계적으로 승격.
- 권위: origin/main e96e8f81f4d6b99b221392a2b6fe46356361b145, 통합 기획·프로젝트 기획, AGENTS.md, 릴리스 지침. 기존 PR #3255 Java21 141/141 통과. 정식 경로 동등성 0, 인증/금융 Test 미승인.
- 미니PC: 운영 Spring :4550·Next 관리자 긴급 복구 :4524 가동. 운영 기본 Spring fallback에서 Next 로딩 화면 발생. Test `/frontend-version` 502, 운영은 200 HTML. 공식 Test 서비스 비활성.
- **안전 설계:** 실제 운영 PostgreSQL을 전혀 이용하지 않는 H2 메모리 DB 기반 독립 Spring 공개 프리뷰 프로파일. HTTP는 Spring 미리보기 GET/HEAD 및 CSS·헬스 외 모두 404 차단. 정확한 JAR 버전·해시 확인 후 별도 Test 로컬/외부 경로 검증하고 운영에서는 `/spring-web` 전용 경로만 Nginx로 승격. 기존 홈·관리자·API·정식 계정삭제·소켓·Next 복구는 보존. 운영 금융 데이터 쓰기 없음.
- Nginx 이전 설정 백업·롤백 명령 기록, syntax test 후 reload, Test 언어/헤더/에셋 검증 후 운영 외부 응답 확인, 실패 시 즉시 복귀. 승격 전 main 재확인.

## 작업 중
대기.

## 종료 — 2026-11-18 07:58 KST: 실제 운영 제한 승격 확인
- **소스/Test:** JDK21 Spring Boot 3.3.5 Gradle `clean test bootJar` 성공. 테스트 리포트 37개 스위트·**143개 테스트 전부 통과, 오류/실패/건너뜀 0**. 필터 인증/금융 차단 테스트 2개 추가. 코드 SHA `d2e17f33cfb4ec946fb64da63358b03c0b44d952`와 불변 JAR SHA256 `f7a498c94e6e173cc09595de739b33d36008a29bae59dfb294b44997619c9977`를 적용 전후 검증. main SHA e96e8f81f4d6b99b221392a2b6fe46356361b145 재조회.
- **Test:** H2-only 별도 Spring 서비스 :4576, 영/한 SSR 200·CSS 200·홈/관리자/API/금융 404. Test Nginx 정확한 경로 설정, 문법 검사·무중단 reload. 옛 워커에서 초기 502 1회 이후 새 워커 및 Test 공개 HTTPS 한국어 요청 연속 3/3 200, private/noindex; POST 405·없는 프리뷰 404. 기존 공식 전체 Test `/frontend-version` 502는 여전하여 전체 Test 동등성 검증 미완.
- **운영:** 별도 Spring :4577와 H2-only 메모리 데이터, 외부 네트워크 차단. 운영 직전 로컬 SSR·허용 외 요청 404 확인. Test 통과 뒤 Nginx 운영 공개 경로 추가, syntax PASS·무중단 reload. 옛 워커에서 처음 `__next` 로딩 HTML 1회 이후 로컬 3/3 Spring SSR, 실제 외부 `/spring-web?lang=en`, `/spring-web/account-deletion?lang=ko` **200**, CSS 2/2 200, 없는 경로 404·POST 405. 캐시 차단·검색 차단·CSP·버전 헤더 확인. 원천 관측이 없는 상태 미리보기는 의도적으로 503.
- **운영 기존 영역 유지:** 정식 `/` HTTP 200이지만 기존 Next 로딩 HTML 475바이트, 정식 `/account-deletion`도 동일, `/admin` 302, `/api/version`·`/health` 200. 기존 Spring :4550, Next 복구 :4524, Nginx 모두 가동. 기존 서비스 재시작·DB/원장/금융/권한·실행 JAR 교체·Next 종료 없음. 양쪽 추가 서비스 부팅 자동시작 등록. RAM 사용 약 4.7GB/8GB.
- **롤백:** 불변 JAR/소스 매니페스트 `/srv/moneyverse-data/releases/spring-web-preview-v2026.11.18.3-d2e17f33cfb4/`, Nginx 스니펫 `/etc/nginx/snippets/moneyverse-spring-web-preview-v20261118.conf`, Test/운영 각 단계 설정 백업 `/srv/moneyverse-data/ops/recovery/spring-web-preview-v2026.11.18.3/`와 원자적 원복 스크립트 `scripts/release/spring-web-preview-edge-v20261118.py`. 실제 정상 운영 공개 경로를 원복하지는 않았음.
- **전면 운영 보류:** Next 정식 178페이지·BFF 124개 미전환, Spring 전역 permitAll/CSRF-off, 금융·MFA·세션·Android 실제 동등성, Test 502·운영 홈 로더 미해결. 실제 **미리보기 한정 운영 승격** 성공이지 사이트 전체·금융 승격 아님. [릴리스 증빙](../releases/v2026.11.18.3-spring-web-public-preview.ko.md).


## 작업 중 — 2026-11-18 07:53 KST
- 운영 PostgreSQL 대신 H2 메모리 DB, 격리 스키마·로컬 임의 소켓만 사용하는 `spring-web-preview` 프로파일 구축. 미리보기 페이지 3개·CSS 2개·`/health`의 GET/HEAD 외 관리자·API·금융·쓰기 요청 전부 차단하는 필터 및 MockMvc 테스트 추가.
- 최소 권한 systemd 단위 템플릿, Nginx 정확한 경로 5개·나머지 preview 404 차단 스니펫 추가. edge에서 사용자 쿠키·인증·내부 토큰 헤더 전달 차단. 현재까지 운영 변경 없음, 검증 후 단계적 적용.

- GitHub 릴리스 독립 브랜치: [초안 PR #3256](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3256), #3255 적층. 이 기록 전 head `c6c9a7acc61f24f5ecd271e8fcac754aaff364b4`. 전체 전환 운영 보류 유지.
