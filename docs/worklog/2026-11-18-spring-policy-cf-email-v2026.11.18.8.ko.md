# v2026.11.18.8 — Cloudflare 이메일 난독화·강한 CSP 충돌 복구

**한국어** · [English](2026-11-18-spring-policy-cf-email-v2026.11.18.8.md) · 시작 / 패치 승격 전

## 작업 전 — 2026-11-18 08:46 KST
- 사용자 목표는 전체 웹 프론트엔드 Spring 전환. 이전 v18.7 공개 정책 SSR 5개 경로 실제 운영이지만 **부분 전환**, Next 나머지 173개·BFF124·인증/금융 미완. 100%라고 보고하지 않음.
- main SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145`와 최신 프로젝트/통합 기획·v18.7 운영 증빙 확인. PR #3259 브랜치에서 독립 패치 작업트리를 생성, 다른 AI 작업 공간 미수정. 기존 v18.7 Test :4580·운영 :4581 및 v18.6, Spring 기존 백엔드, P0 Next 복구, 프리뷰 서비스 가동.
- **실제 운영 P0:** 외부 `https://easy-scraping.com/privacy?lang=ko`가 Spring SSR 200이지만 Cloudflare가 이메일 `mailto:jungchwimisaenghwal63@gmail.com`을 `/cdn-cgi/l/email-protection#...`으로 바꾸고 `email-decode.min.js`를 주입함. 원본 Spring에는 정상 mailto·스크립트 0. 강한 `default-src 'none'` CSP가 주입 JS를 차단해 문의 링크 장애 위험. HTTP 코드만으로 추정하지 않고 내부/외부 실제 HTML 대조. Cloudflare 문서의 `<!--email_off-->...<!--/email_off-->`는 특정 이메일만 자동 변환 대상 제외하며 전체 보안 설정 변경 불필요.
- TDD: 영/한 정식 약관·개인정보 및 정식/미리보기 계정삭제 메일 링크에 주석 예외 있는지 RED 테스트 우선. 정책 원문/링크/제목 전수 동등성과 JS 없는 CSP 보존. 새 JDK21 불변 Spring JAR→격리 Test :4582·운영 :4583. Nginx 기존 v18.7 정확한 5경로+CSS만 v18.8로 교체, Test 외부 `mailto` 정상·주입 JS 0·CSP 유지 검증 후 운영에 적용. 실패 시 해당 include만 원복. 기존 로그인/금융/관리자/Next/P0 보존, 운영 PG 쓰기 없음.

## 작업 중 — 2026-11-18 08:55 KST
- Cloudflare 난독화/강한 CSP 충돌의 외부 HTML 원본을 확보. 정책 링크 4종(terms/privacy EN/KO)과 계정 삭제 공통 템플릿의 *해당 이메일 태그만* `<!--email_off-->...<!--/email_off-->` 범위로 감쌈. 원본 이용약관/개인정보 텍스트·링크/헤딩과 영문/한국어 문구는 그대로. Python RED 이후 3/3 GREEN, 기존 전체 인벤토리 4/4 통과.
- JDK21 Spring Boot `clean test bootJar` **42개 스위트, 162개 테스트 전부 통과, 실패/오류/건너뜀 0**, 추가 Java MockMvc 실제 템플릿·CSP·email_off 증빙 포함. 아티팩트 SHA256 `130eb378dae628dde87de10b4c3e55a3a7e4468de66fcf05506a29ab53dab37e`. 실제 Test/운영은 아직 이 새 JAR로 승격하기 전. 기존 v18.7 운영과 별도 사용자/원장 서비스 계속 유지.
- Nginx 원본 스니펫 v18.7을 통째로 덮어쓰지 않고, `v18.8` 새 정확한 8경로 스니펫 Test :4582·운영 :4583 및 원자적 사이트 include 교체/백업/실패 복구 스크립트 구축. Cloudflare 외부 `mailto`/주입 JS/CSP/언어를 확인하는 전용 실제 HTTP 검사 스크립트 추가. 인증·금융 DB 수정 없음.


## 종료 — 2026-11-18 09:02 KST — 공식 Test·운영 문의 링크 복구 완료 (전체 UI 미완)
- **TDD/아티팩트**: Cloudflare 이메일 예외 주석 부재를 RED로 재현, 수정 후 Java21 Spring Boot 3.3.5 `clean test bootJar` 42개 스위트 **162/162 성공**, 실패·오류·건너뜀 0. 정확한 코드 SHA `f211128df3278d1e31be417f10009c308e2c8dff`, 불변 JAR SHA256 `130eb378dae628dde87de10b4c3e55a3a7e4468de66fcf05506a29ab53dab37e`, 경로 `/srv/moneyverse-data/releases/spring-policy-email-csp-v2026.11.18.8-f211128df327/spring-public-frontend.jar`, 매니페스트/해시 검증. 원본 Next 정책 문구 3/3 및 인벤토리 4/4 통과, 기존 Next 파일 미수정.
- **Test**: H2-only 독립 Spring :4582 기동, 영/한 약관·개인정보·계정삭제 6개 로컬 HTTP 200, 원본 `mailto`, HTML 주석 1쌍씩, JS 없음. 회원·관리자·금융 API 요청 404. Nginx 원자적 정확한 Test include 교체 후 문법 검사·무중단 reload. 초기 옛 워커에 v18.7 헤더가 잠시 보였지만 신규 워커·공식 외부 Test에서 v18.8 확인. Cloudflare는 처리용 `email_off` 주석을 **정상적으로 외부 HTML에서 제거**하지만 원래 `mailto`를 남기고 난독화/JS 주입하지 않음. 스크립트는 최종 사용자에게 보이는 링크·CSP만 검사하도록 수정. **실제 Test 외부 6/6 통과**.
- **운영**: 동일 불변 JAR을 독립 H2-only :4583 기동, 로컬 영/한 6경로 200·메일/JS0, 금융/관리자/Discord 인가 요청 404. main SHA·JAR 해시·Test 6/6 재검증 후 운영 Nginx v18.7→v18.8 정확한 공개 5경로+CSS3개만 교체, `nginx -t` 성공·무중단 reload·설정 원본 백업. **실제 운영 외부 영/한 6개 연락처 테스트 6/6 통과**, 강한 CSP 유지, 원래 `mailto` 노출, `/cdn-cgi/l/email-protection`·`email-decode.min.js`·JS 없음. Spring 공개 5화면·CSS3 200, 정책 POST 405. 기존 `/login`, `/wallet`, `/stocks` Next 200, `/admin` 302, `/api/version`·`/health` 200. Spring :4550·Next 관리자 긴급복구 :4524·Nginx 계속 가동. 운영 PG/원장·금융·인증·세션 변경 없음.
- **메모리·운영**: 신규 v18.8 Test/운영 서비스 부팅 자동시작. 직전 v18.7 :4580/:4581은 즉시 원복용 유지. 실제 `nginx -T`에서 구형 v18.6 :4578/:4579 참조 **0** 확인 후 해당 두 서비스만 종료·비활성화. Java SIGTERM 종료 143 때문에 systemd 실패 표시가 남았지만 `reset-failed`로 inactive 정리. 공개 요청 계속 정상, 메모리 available 약 1.7GiB 확보.
- **원복**: `sudo -n python3 /srv/moneyverse-data/tasks/spring-policy-email-cf-v20261118/worktree/scripts/release/spring-policy-email-csp-v20261118.py prod disable` 후 `sudo -n nginx -t`와 외부 HTTP 확인. 이전 v18.7은 가동 중이나 CF 연락처 버그가 있어 정상 v18.8 유지. 실제 정상 운영을 원복하지는 않음. 백업 `/srv/moneyverse-data/ops/recovery/spring-public-canonical-v2026.11.18.8/`. [릴리스 증빙](../releases/v2026.11.18.8-spring-policy-email-csp.ko.md).
- **전체 Spring 전환 미완**: 공개 정식 경로 5개 Spring 부분 운영(원본 기능 동등성 전체 인증 아님), 나머지 Next173·BFF124, 원본 전체 기능/언어/권한 동등성 완료 0/178. `/auth/discord/authorize` 구형 가짜 로딩 200/475, Spring 전역 permitAll/CSRF 비활성, MFA/세션/금융 원장/Android/독립복구 G0–G6 차단. Next 중단·H2 금융/관리자 사용 금지. 이번 작업은 문의 링크 정상화로 종료하고 다음 단계에서 미전환 Spring 화면을 계속 작성해야 함.
