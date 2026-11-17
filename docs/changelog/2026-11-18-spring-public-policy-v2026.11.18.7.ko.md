# 변경 내역 v2026.11.18.7 — Spring 영/한 정책 화면 SSR

**한국어** · [EN](2026-11-18-spring-public-policy-v2026.11.18.7.md) · **정식 Spring 5경로 부분 운영, 전면 전환 보류**

Spring MVC 정식 약관 `/terms`, 개인정보 `/privacy`, 계정삭제 `/account-deletion` 및 영어·한국어 원문 그대로인 Thymeleaf 정책·모바일 CSS 추가. 기존 Java 홈·가이드와 새 불변 Spring JAR로 통합, H2-only 읽기 전용 분리. Java21 Gradle 161/161, 정책 원문 동등성 2/2, 경로 인벤토리 4/4 통과. 공식 Test→운영 실제 공개 영/한 화면·CSS 200, 정책 POST 405. 나머지 Next 화면 173·BFF124 및 기존 API/금융 유지. Cloudflare가 이메일 문의 링크를 난독화하고 CSP가 이를 푸는 JS를 차단해 **연락처 표시 결함 잔존**, 후속 수정 필요. [릴리스 증빙](../releases/v2026.11.18.7-spring-public-policy.ko.md).
