# v2026.11.18.6 — 사용자 명령 준수: Spring MVC 정식 프론트엔드 전환

**한국어 두 번째 언어** · [English](2026-11-18-spring-canonical-home-v2026.11.18.6.md) · 시작

## 작업 전 — 2026-11-18 08:19 KST
사용자가 기존 Next.js 복구는 Spring 프론트엔드 전체 전환 지시 위반임을 명시함. 이전 Next fallback은 13개 이상 경로의 UI를 임시로 복구한 조치일 뿐 Spring 전환이 아님. 기존 Spring SSR v2026.11.18.3는 `/spring-web` 미리보기만 실제 운영, 이것도 전체 전환이 아님.

08:16 KST GitHub main SHA e96e8f81f4d6b99b221392a2b6fe46356361b145, 통합·최신 기획 확인. 금융/보안 G0–G6 RELEASE HOLD 유지. 다른 작업자의 `feat/spring-web-frontend-v2026.11.18.0718`에는 독립 Spring MVC/Thymeleaf 정식 홈/가이드 및 테스트가 준비돼 있음. 해당 브랜치/작업 트리 수정하지 않고 새 독립 브랜치에 선택적으로 통합. Java21, 영어 기본·한국어 선택, H2-only Spring 실행, DB/금융/인증 API 차단.

실행: 홈/가이드 Spring 소스·테스트만 병합, 전용 Spring 서비스에서만 정식 Java 라우트 플래그 켬. RED/GREEN 테스트, 불변 JAR, 별도 Test `/`와 `/guide` 정상 HTML·CSS 검증. 동일 JAR의 운영 인스턴스로 해당 정식 2경로만 무중단 승격, Next로 되돌렸던 정확한 홈·공개 기본 라우팅은 다른 미전환 페이지의 임시 호환 용도로 유지. 기존 API/관리자/금융/로그인·Spring 프리뷰 보존. Next 178페이지/BFF124 전체 전환으로 보고하지 않음. 롤백 기록.

## 작업 중
대기.

## 종료 — 2026-11-18 08:23 KST: 정식 Spring 경로 실제 운영, 전체 전환 미완
- **코드·QA:** 독립 `feat/spring-canonical-home-v2026.11.18.6` 브랜치에서 다른 작업자의 Spring 구현을 원본 수정 없이 통합. 배포 소스 커밋 `7df50a94d038fe2d311bd312d37c9083169beb07`, 불변 JAR SHA256 `16cae5c03c8a115f06b86e40cdaa0dc20b0bb3abe2d40b090bf283c67feb2d33` 실제 검증. Java21 Gradle `clean test bootJar` **41개 스위트·154개 테스트·실패/오류/건너뜀 0**. H2-only 프리뷰 필터는 API·금융·관리자·인증 요청 404 차단.
- **Test→운영:** 독립 Test :4578 기동, 공식 외부 Test `/?lang=ko/en`, `/guide?lang=ko/en` 진짜 Thymeleaf 200·CSS 두 개 200·버전 헤더. Test 통과 후 같은 불변 JAR의 운영 :4579 기동, 로컬 Java SSR/CSS 200과 API/관리자 404 확인. Nginx 정확한 홈 경로만 이전 v2026.11.18.4 Next에서 v2026.11.18.6 Spring으로 전환하고 정확한 가이드/CSS 경로 추가. 문법 검사 통과·무중단 reload. 실제 공개 영/한 `/`, `/guide` **200 진짜 Spring SSR**, 가짜 475바이트 로딩 HTML 없음, CSS 200, 버전 헤더. 두 Spring 서비스 재부팅 자동시작 등록.
- **유지:** 기존 Spring :4550, Next 복구 :4524, H2 프리뷰 :4577, API·관리자·금융·세션 라우팅 유지. `/login`, `/wallet`, `/stocks`, `/account-deletion` 기존 SSR 200, `/admin` 302, `/health`·`/api/version` 200. 운영 DB·원장·기존 프로세스 중단/재시작 없음.
- **롤백:** 소스 `scripts/release/spring-canonical-home-v20261118.py`, 원본 백업 `/srv/moneyverse-data/ops/recovery/spring-canonical-home-v2026.11.18.6/`. 원복 명령 `sudo -n python3 /srv/moneyverse-data/tasks/spring-canonical-home-v20261118/worktree/scripts/release/spring-canonical-home-v20261118.py prod disable` 및 `sudo -n systemctl disable --now moneyverse-spring-canonical-prod-v20261118.service`; `sudo -n nginx -t` 검증. 정상 운영 배포를 실제 되돌리지는 않음.
- **미완·P0 로그인:** `/auth/discord/authorize`, `/auth/google/authorize`는 기존 정규식 Nginx 프록시 때문에 Spring 가짜 200/475바이트 화면 발생. Next 직접 무쿠키 요청도 공급자가 아닌 로그인 오류 307로 이동해 OAuth 시작 정상 인증 미확인. 기존 Next의 로그인 후 지갑·게임 등 홈 기능 동등성 미완, Next 정식 화면 178·BFF124 기능 전환 미완. Spring 전역 permitAll/CSRF 비활성, 세션·MFA·OTP·원장·Android·SEO·G0–G6 운영 보류. 다시 흰 화면을 만들지 않도록 미전환 경로는 기존 Next 임시호환. 사용자의 **Spring 전체 전환 지시 자체는 아직 완료되지 않았음**.


## 작업 중 — 2026-11-18 08:20 KST
- 다른 에이전트의 깨끗한 독립 브랜치에서 Spring 홈·가이드 컨트롤러/모델/Thymeleaf 템플릿·CSS·실제 HTTP 테스트를 복사해 새 독립 브랜치에 통합. 원래 브랜치는 변경하지 않음. 별도 H2 프로파일에서만 정식 `/`와 `/guide` 활성화, CSS 허용, 관리자·금융·API 쓰기 차단 필터 유지.
- Java21 Gradle `clean test bootJar` BUILD SUCCESSFUL. Spring 전체 테스트·내장 실제 HTTP 테스트 통과. 별도 Spring Test 검증 전까지 기존 Next 긴급복구 라우팅 유지. Test/운영 정확한 경로 전용 Nginx 소스 및 동시수정 감지·자동롤백 도구 준비.

- GitHub: [초안 PR #3258](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3258), #3256 기반. 테스트된 JAR 소스 SHA 이후 기록 커밋만 추가되며 빌드 아티팩트 불변.
