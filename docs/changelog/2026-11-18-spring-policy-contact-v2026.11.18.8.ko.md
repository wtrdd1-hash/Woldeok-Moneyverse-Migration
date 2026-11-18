# 변경 내역 v2026.11.18.8 — Spring 정책 문의 이메일 외부 링크 복구

**한국어** · [English](2026-11-18-spring-policy-contact-v2026.11.18.8.md) · **문의 링크 Test·운영 검증 완료 / 전체 Spring 미완**

Spring 정식 `/terms`, `/privacy`, `/account-deletion` 영/한에 존재한 Cloudflare HTML 이메일 난독화와 강한 CSP 충돌을 운영 중 재현·복구. 원본 Next 법적 문구 및 정식 경로 그대로, 이메일 한 태그만 난독화 예외 처리하여 CSP 완화·새 JS 없이 실제 `mailto:` 유지. Java21 전체 **162/162**, 원문 동등성 **3/3**, 경로 인벤토리 **4/4**; 공식 Test·실제 운영 외부 문의 링크 **각 6/6** 통과, 복호화 JS·난독화 링크 0. 동일 H2-only 불변 JAR을 Test :4582→운영 :4583 무중단 Nginx 정확한 경로 승격, 백업. 사용하지 않는 v18.6 Spring Test·운영 서비스만 종료해 메모리 여유 확보, v18.7는 즉시 원복용 유지. Next 미전환 173화면·BFF124 및 G0~G6 보안·금융 미완. [증빙](../releases/v2026.11.18.8-spring-policy-email-csp.ko.md).
