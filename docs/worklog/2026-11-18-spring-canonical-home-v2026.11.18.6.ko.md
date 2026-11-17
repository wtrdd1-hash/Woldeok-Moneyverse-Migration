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
