# v2026.11.18.1 — Spring 프론트엔드 계정 삭제 SSR 후보

**상태:** 소스 구현 / 테스트 차단 / 운영 승격 보류. [English](2026-11-18-spring-web-account-deletion-v2026.11.18.1.md)

- Spring MVC/Thymeleaf 읽기 전용 `/spring-web/account-deletion` 추가. 기본 비활성.
- 기존 Next의 계정 삭제·보관 정책, 계정·개인정보 링크, 이메일 비밀정보 주의사항 유지. 영어 기본·한국어, 모바일 반응형 CSS, JS 및 계정 변경 없음.
- 언어·private/noindex/CSP·정식 경로 소유권·비활성 플래그의 Spring MockMvc 테스트 소스 추가.
- 운영 정식 `/account-deletion`, Next/API/금융 기능 변경 없음.
- Spring 웹 기반 PR #3213 위에 적층하고 별도 프론트 장애복구 PR #3249와 격리.
- Gradle 실측, 공식 Test 배포, 운영 전환, DB 마이그레이션 없음. 미니PC MCP 오프라인. [전환 검증 기준](../migration/SPRING_ACCOUNT_DELETION_G2_v2026.11.18.1.ko.md) 및 [작업 기록](../worklog/2026-11-18-spring-web-account-deletion-v2026.11.18.1.ko.md).
