# v2026.11.19.30 → .30.1 — Spring 금융센터 새 UI 실제 운영 변경이력

**2026-11-19 KST · 일부 운영 PASS, 전면 웹/시스템 Spring·API 미완료.** [영문 정본](2026-11-19-spring-native-finance-hub-v2026.11.19.30.md) / [상세QA](../findings/2026-11-19-spring-native-financial-hub-v30.ko.md).

- **기능 기획:** 기존 `/calculators` Next17링크, 이전 `/tools`는 국고·복권·출석·예측·추천인 등6개 위젯/사이트맵과 별도 UI. 후자 새 목록으로 갈아 끼우면 기능 소실되므로 **옛 운영 `/tools` 유지**. 광고 컴포넌트/FAQ/JSON-LD 원소스는 있으나 실 정적 AdSense태그0, 전체 광고·SEO 검증 아님.
- **신 UI 개발:** Java Spring MVC/Thymeleaf 네이비·보라 EN/KO 새 금융센터17링크, 실 검증 Spring2/기존15 분리, HTML 비JS 검색/6분류, 입력 오류400/이스케이프/RSC406, canonical·OG·정적 JSON-LD. TDD5실패→수정, 전체 Java **237/237 PASS 61스위트**, 코드 d34835b3, JAR SHA `3e17ecb8fd3b8270a73e3b2a9a884c7d75b28d6f7ccd6397f6a19981d413fe73`.
- **Test/실운영:** Test readonly4657/운영 readonly4658, 후보 Chromium33/33, 독립 Nginx4455 15/15, 정확 Nginx 스니펫 전`06059c2e...`→후`b5a316420b0e9946837041d00744e3cd8887f093885acf97d64fd1fde6ef2a28`, 본설정306b4aa 그대로, 이전 원본600 백업/문법 통과/무중단 reload. `/calculators`만 운영 Spring 적용/슬래시308/CSS, 기존 `/tools` 유지. 외부 HTTPS 기존39/39·신규15/15, 운영 Chromium15/15. 구 Spring4550 PID368434·금융 보호 및 사용자 DB/원장 유지.
- **미완료:** 180원천 경로 중 신 Spring 실검증5/남은175 미검증, `/tools` 실제6기능·사이트맵, API503 28, 수집기중단 #3286, 관리자/회원/전역채팅 실전송·금융·광고/SEO·외부 공식 Test403/독립 원복. 코드 Draft만, Gemini/main 미병합.
