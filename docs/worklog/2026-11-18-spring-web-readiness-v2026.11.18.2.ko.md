# v2026.11.18.2 — 전체 Spring 웹 전환·운영 승격 준비 점검

**상태:** 진행 중 / 미배포 · [English](2026-11-18-spring-web-readiness-v2026.11.18.2.md)

## 작업 전 (테스트·코드 변경 이전 기록)
- 사용자 지시: 모든 프론트엔드와 백엔드를 Spring으로 전환하고 무중단 운영 승격. 작업 승인은 검증 완료 증거가 아님.
- 권위: 최신 origin/main `e96e8f81f4d6b99b221392a2b6fe46356361b145`, 프로젝트·통합 기획(v2026.11.17.5 RELEASE HOLD), AGENTS.md, 문서 정책, Spring G0–G6 계획. 기존 PR #3213·#3253 위에 적층한 독립 작업 트리 `feat/spring-web-readiness-v2026.11.18.2` HEAD `e569ba10aa5e50faa61e538673258c758a11cf7e`.
- 미니PC 관찰 2026-11-18 07:29 KST: 전용 MCP 연결 가능. Java21 Spring :4550 및 socket :9092, Next 관리자 긴급 복구 :4524 가동. 외부 홈·계정삭제·상태 200, 관리자 302, 공식 Test 버전 200. 단순 응답이지 전체 동등성 검증 아님.
- 다른 작업자 분리: `feat/spring-web-frontend-v2026.11.18.0718`는 홈/가이드 별도 프리뷰 구현 중이며 PR #3252는 관리자 긴급 복구 전담. 해당 브랜치·서버·Nginx·운영 symlink를 변경하지 않음.
- 전체 전환 대상: Next 정식 페이지 178개, route handler 124개. 현재 Spring 화면은 PR #3213/#3253의 선택적 비정식 프리뷰 위주. Spring 전역 permitAll/CSRF 비활성, 금융 단일 작성자 및 인증 E2E 미검증.
- 예정: 독립 Spring 웹 후보 빌드·테스트, 오류 분석, 충돌 없는 작은 수정, 중간 최신 main 재조회, 공식 Test 검증. 운영 금융 쓰기 없음. 정확한 소스·전역보안·금융 및 독립복원 게이트 충족 전 운영 승격 금지.

## 작업 중
측정 대기.

## 종료
측정 대기.

### 2026-11-18 07:33 KST — 실제 첫 테스트
- 독립 JDK21 Gradle `clean test bootJar` 실행. **실패:** 총 116개 테스트 중 1개 실패(`Phase7IntegrationTest` 40행, ServletException/IllegalStateException). Java 및 테스트 컴파일, bootJar 단계는 수행됐으나 전체 릴리스 게이트는 실패함.
- Spring 웹 선행 브랜치의 공통 조상은 예전 `2c1ea4cd77`; 최신 main은 출석/도파민 중복 라우트 수정 포함. 병합하여 다시 검사할 것.
- Next 페이지 178개 및 API 핸들러 124개 실제 재집계, 정식 Spring 전체 동등성 미확보. 운영 Next 복구 기능 유지.

### 2026-11-18 07:35 KST — 최신 main 통합·두 번째 RED
- 최신 main `e96e8f81f4...`를 독립 브랜치에 병합. 영어 기획 충돌 2개를 최신 main v2026.11.17.5 금융/보안 RELEASE HOLD와 사용자 전체 웹 전환 지시 v2026.11.17.2를 **둘 다 보존**하며 해결. 한국어 최신 main 본문 유지. 병합 커밋 `65cd987b78`.
- 전체 JDK21 Spring `clean test bootJar` 재실행: **141개 중 1개 실패**. `SpringWebPreviewDisabledTest`에서 비활성 `/spring-web` 예상 404가 기존 SPA 정적 폴백으로 실제 **200** 응답. main 통합으로 Phase7 이전 실패는 해소됨.
- 실패 재현 후 미리보기 플래그 OFF/미설정에만 적용되는 명시적 404 차단 컨트롤러와 캐시/검색 차단 헤더 및 테스트 보강. 정식 `/`, `/status`, Next, 운영 edge는 변경하지 않음.
- 경로 인벤토리 단위 테스트 **4/4 통과**. Next 페이지 178개, BFF 124개, 정식 전환 인증 0개, Spring 프리뷰 기존 2개. 전부 완료라고 주장 금지.

## 작업 종료 — 2026-11-18 07:43 KST
- **Spring 소스 GREEN:** 최신 main 통합 JDK21 `clean test bootJar` 성공. Gradle XML 실측 **36개 스위트, 141개 테스트, 실패 0·오류 0·건너뜀 0**. 실행 JAR 94MB, 테스트 당시 소스 HEAD `0b83f52f6e42764ad6890289e077e8651141815c`에서 SHA256 `268ce25a3eb37d6bc836f19497277abbf818c1ff90c34067a595f19cc4e7130b`. 이후 변경은 문서/경로 인벤토리만 해당.
- **인벤토리 GREEN:** 계정삭제 프리뷰가 누락된 것을 RED 테스트로 재현, 기존 v2026.11.17.2 문서를 보존하고 v2026.11.18.2를 추가. 인벤토리 검사와 Python 단위 테스트 4/4 통과. Next 정식 페이지 178·BFF 124·Spring 비정식 프리뷰 3·**정식 전환 인증 0**.
- **공식 외부 경로 실측 07:42 KST:** Test `/api/version` 200이지만 후보 SHA가 아닌 일반 문자열 `v2026.11.14-spring`; Test `/frontend-version` **HTTP 502**. 운영 `/api/version`도 같은 일반 Spring 버전 200, 운영 `/frontend-version`은 버전 증명 대신 **HTTP 200 HTML의 `__next` 로딩 화면** 반환. 정확한 빌드 신원과 프론트엔드 공식 Test 게이트 실패. Spring :4550 `/health` 200. Spring 및 Next 관리자 긴급복구 서비스 계속 가동.
- **공식 Test 배포·운영 승격 수행 안 함.** 정식 웹/핸들러 동등성 0, Spring 전역 permitAll/CSRF 비활성, 금융/OTP/세션/WLD, 독립 복구·롤백, 브라우저/Android 전체 QA 미충족. Spring 단위 테스트만으로 무중단 전면 전환 근거 부족.
- 독립 브랜치 `feat/spring-web-readiness-v2026.11.18.2` GitHub 푸시. [적층 초안 PR #3255](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3255) → #3253 → #3213. 다른 AI 관리자 복구 #3252 및 홈·가이드 작업 트리 미변경.
- 변경 범위 롤백: 브랜치 내 소스 변경뿐, 프리뷰 플래그 기본 OFF. 운영 바이너리·DB·Nginx 변경 없어 운영 롤백 필요 없음. G0–G6 검증 전에 후보 JAR를 운영 :4550에 덮어쓰거나 Next 서비스를 중단하지 말 것.
