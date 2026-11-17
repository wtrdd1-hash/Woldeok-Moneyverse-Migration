# v2026.11.18.2 — Spring 전체 웹 전환 안전 게이트 및 미리보기 복구

**상태:** 소스 테스트 통과 / 공식 Test 차단 / 운영 보류 · [English](2026-11-18-spring-full-web-gate-v2026.11.18.2.md)

- 목표는 모든 백엔드·프론트엔드·Next BFF를 Spring Boot MVC/Thymeleaf로 전환하는 것. PostgreSQL 원장·세션/MFA·CSRF·롤백 요구사항 유지.
- Spring 미리보기 #3213/#3253 코드를 최신 main e96e8f81f4와 통합하면서 금융·보안 제한 보존.
- `/spring-web`, `/spring-web/status` 프리뷰 비활성 상태의 SPA 폴백 오류(잘못된 HTTP 200)를 재현하고 명시적 404 및 private/noindex로 복구.
- 실측: 구형 브랜치 116개 중 1개 실패(Phase7), main 병합 후 141개 중 1개 실패(비활성 프리뷰 200), 수정 후 JDK21 Gradle `clean test bootJar` **141개 모두 통과 / 실패·건너뜀 0**, JAR 생성. 실제 Spring 내장 HTTP 테스트 포함.
- 재생성 인벤토리 v2026.11.18.2: Next 페이지 178, BFF 124, 비정식 Spring 미리보기 3. **정식 경로 전환 인증은 페이지·BFF 모두 0개**. 이전 v2026.11.17.2 스냅샷은 보존.
- DB 마이그레이션·원장 쓰기·공식 Test/운영 배포·systemd/Nginx 변경 없음. 141개 Spring 테스트만으로 전체 웹/Android·금융 E2E 검증을 대체하지 않음.
- [작업 기록](../worklog/2026-11-18-spring-web-readiness-v2026.11.18.2.ko.md) · [경로 인벤토리](../migration/SPRING_FRONTEND_ROUTE_INVENTORY_v2026.11.18.2.json).
