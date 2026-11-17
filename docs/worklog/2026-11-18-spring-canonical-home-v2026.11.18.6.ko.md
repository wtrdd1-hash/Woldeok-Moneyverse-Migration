# v2026.11.18.6 — 사용자 명령 준수: Spring MVC 정식 프론트엔드 전환

**한국어 두 번째 언어** · [English](2026-11-18-spring-canonical-home-v2026.11.18.6.md) · 시작

## 작업 전 — 2026-11-18 08:19 KST
사용자가 기존 Next.js 복구는 Spring 프론트엔드 전체 전환 지시 위반임을 명시함. 이전 Next fallback은 13개 이상 경로의 UI를 임시로 복구한 조치일 뿐 Spring 전환이 아님. 기존 Spring SSR v2026.11.18.3는 `/spring-web` 미리보기만 실제 운영, 이것도 전체 전환이 아님.

08:16 KST GitHub main SHA e96e8f81f4d6b99b221392a2b6fe46356361b145, 통합·최신 기획 확인. 금융/보안 G0–G6 RELEASE HOLD 유지. 다른 작업자의 `feat/spring-web-frontend-v2026.11.18.0718`에는 독립 Spring MVC/Thymeleaf 정식 홈/가이드 및 테스트가 준비돼 있음. 해당 브랜치/작업 트리 수정하지 않고 새 독립 브랜치에 선택적으로 통합. Java21, 영어 기본·한국어 선택, H2-only Spring 실행, DB/금융/인증 API 차단.

실행: 홈/가이드 Spring 소스·테스트만 병합, 전용 Spring 서비스에서만 정식 Java 라우트 플래그 켬. RED/GREEN 테스트, 불변 JAR, 별도 Test `/`와 `/guide` 정상 HTML·CSS 검증. 동일 JAR의 운영 인스턴스로 해당 정식 2경로만 무중단 승격, Next로 되돌렸던 정확한 홈·공개 기본 라우팅은 다른 미전환 페이지의 임시 호환 용도로 유지. 기존 API/관리자/금융/로그인·Spring 프리뷰 보존. Next 178페이지/BFF124 전체 전환으로 보고하지 않음. 롤백 기록.

## 작업 중
대기.

## 종료
대기.

## 작업 중 — 2026-11-18 08:20 KST
- 다른 에이전트의 깨끗한 독립 브랜치에서 Spring 홈·가이드 컨트롤러/모델/Thymeleaf 템플릿·CSS·실제 HTTP 테스트를 복사해 새 독립 브랜치에 통합. 원래 브랜치는 변경하지 않음. 별도 H2 프로파일에서만 정식 `/`와 `/guide` 활성화, CSS 허용, 관리자·금융·API 쓰기 차단 필터 유지.
- Java21 Gradle `clean test bootJar` BUILD SUCCESSFUL. Spring 전체 테스트·내장 실제 HTTP 테스트 통과. 별도 Spring Test 검증 전까지 기존 Next 긴급복구 라우팅 유지. Test/운영 정확한 경로 전용 Nginx 소스 및 동시수정 감지·자동롤백 도구 준비.
