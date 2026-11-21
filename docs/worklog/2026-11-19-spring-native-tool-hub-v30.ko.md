# 시작·중간·종료 — v2026.11.19.30.1 Spring 금융 계산기 신UI 운영

**2026-11-19 06:59~07:19 KST · [영문 정본](2026-11-19-spring-native-tool-hub-v30.md), [상세 QA](../findings/2026-11-19-spring-native-financial-hub-v30.ko.md). 실제 운영 `/calculators`만 승격, 전체 웹·API 완료 아님.**

**시작:** 통합기획·PROJECT_PLAN·사용자의 최신 “전 프론트/모든 기능 Spring 및 신디자인 운영 승격” 재확인. 기존 본 Nginx SHA306b4aa, 정적 스니펫06059c2e, Spring4550/주식4650/계산기4653/상태4656. 원격 main0590fac4, v29기준c9fd505a, Gemini 공유 체크아웃 미변경. 독립 MiniPC `migration/spring-native-tool-hubs-v20261119-v30`, START600. 금융 원장 쓰기 금지.

**중간1 실제 소스 위험:** 옛 Next `/calculators` 17링크·4분류·광고 슬롯·FAQ/JSON-LD (실 정적 캡처 AdSense 태그/스크립트0), 운영은 Next4638 정적 HTML. 옛 `/tools`는 국고·복권·테일러 마진·룰렛·예측배틀·추천인6개 컴포넌트 및 사이트맵. 단순 Spring 목록으로 대체하면 삭제되는 기능 발생. **기존 운영 `/tools` 미변경**, 신규 `/tools` Spring 소스는 격리 Test 후보만. 새 `/calculators`는 기존17링크 유지, Spring 검증2만 확정, 나머지15는 legacy/QA 대기 표시.

**중간2 TDD/코드:** Spring MVC 테스트5개 RED→GREEN, 검색 `compound`가 다른 복리 문구까지 매치한 것을 확인하여 정확히 `compound interest` 검색 계약 수정. Java Spring 컨트롤러·Thymeleaf UI·버전CSS, 네이비/보라 EN기본/KO두번째, JS없는 HTML 검색/분류(6종), 검색64자·잘못된 분류400, 스크립트 입력 이스케이프, RSC406/POST405, 접근성/44px·SEO canonical/언어별 alternate/OG/정적 JSON-LD17. 전체 Java `clean test bootJar` **237/237 PASS 61스위트**, 코드 SHA d34835b3, 불변 JAR SHA `3e17ecb8fd3b8270a73e3b2a9a884c7d75b28d6f7ccd6397f6a19981d413fe73`.

**중간3 실제 Test:** Test DB readonly Spring4657, 운영DB readonly4658(봇·스케줄 OFF), 구 운영4550 보존. Chromium 2환경×2후보 화면×EN/KO×320/390/1440=24/24 +검색5·비JS 키보드 폼1·실제 Spring 계산기 링크2·언어1 합 **33/33**; 가로넘침·React 오류0. `/tools`는 개발후보만. 별도 Nginx Test4455에서는 정확히 `/calculators`/슬래시/CSS만 새 Spring, 옛 `/tools` 유지, `nginx -t`/실브라우저 **15/15 PASS**.

**중간4 실제 운영 승격:** 작업 중 GitHub 최신 main/통합기획 재확인, 두 Nginx 원본600권한 백업, 변경 전 본 SHA `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873` 그대로, 공개 스니펫 `06059c2e621ad0f96af7484937abc64c1eb91b104591bfc2b9b3bbe880d68c20`→`b5a316420b0e9946837041d00744e3cd8887f093885acf97d64fd1fde6ef2a28`. `nginx -t`/무중단 reload, 구 Spring4550 PID368434 보존, 운영 사용자·원장 쓰기 없음. 외부 HTTPS 이전 39경로 **39/39** 회귀, 새 계산기 센터15 HTTP/보안 **15/15**, 운영 Chromium 6화면+검색5+비JS폼1+계산기 실제 클릭2+언어1 **15/15 PASS**. 17카드/검증2/기존15, 기존 `/tools` v24 그대로.

**종료·미완료:** [Next 원천180 경로 추적표](../qa/2026-11-19-spring-only-frontend-migration-board-v30.json)에서 **실제 새 Spring 운영 브라우저 검증5개,175개 미인증**(모두 다운 아님). `/tools` 게임·예측·국고·추천인6/사이트맵 Spring 대체 불완료, API503 28, 상태 수집 중단 #3286, 관리자·회원/실채팅·금융 원장/정산·외부 Test403·광고/SEO 전체 QA·원복 훈련 보류. 영/한 분석/업데이트·변경이력·운영 복구 기록, 민감 정보는 MiniPC private600, GitHub 코드 Draft/Gemini main 미변경.
