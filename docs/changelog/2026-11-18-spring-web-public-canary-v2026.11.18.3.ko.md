# 변경 내역 — v2026.11.18.3 Spring 공개 미리보기 실제 승격

**상태:** Test·운영 제한 경로 실제 승격 성공, 사이트 전체 운영 전환 보류. [English](2026-11-18-spring-web-public-canary-v2026.11.18.3.md)

운영 DB와 격리된 H2-only Spring SSR 프로파일 및 읽기 전용 허용 경로 외 전부 거부하는 필터, MockMvc 테스트 2개, 불변 아티팩트/라우팅 원복 체계 추가. Java21 Spring 143/143 통과. Test :4576·운영 :4577 독립 실행, 외부 실제 SSR 한/영 200·private/noindex·잘못된 경로 404·POST 405 확인. 기존 홈·관리자·API·금융 미변경. [릴리스 증빙](../releases/v2026.11.18.3-spring-web-public-preview.ko.md).
