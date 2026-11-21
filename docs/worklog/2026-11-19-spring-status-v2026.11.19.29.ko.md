# 시작·중간·종료 작업기록 — Spring 상태 화면/API 실동작 v2026.11.19.29.1

**2026-11-19 KST · [영문 정본](2026-11-19-spring-status-v2026.11.19.29.md).** 일부 운영 실제 성공, 전체 Spring180화면/모든903 API 및 금융 기능 아직 미완료. [상세 결과](../findings/2026-11-19-spring-status-real-api-v2026.11.19.29.ko.md).

**시작 00:35.** 사용자의 “전 프론트 Spring·모든 기능 실제 QA·운영 승격” 재확인. 통합기획 최우선·PROJECT_PLAN·v28 최신 지시 확인. 독립 MiniPC 작업트리 `migration/spring-ui-public-navigation-v20261119-v29`, 기준 v28 `6d063ddd`, 원격 main0590fac4/Gemini 공유 main 미수정. 내부 START 600권한. 이전에 새 Spring 거래소1/계산기2만 운영 증명, Next 소스177 미인증, API503 28개 남음.

**중간1 실제 원인:** `/status` HTML200이지만 화면이 호출하는 **`/api/v1/status`404** 및 `/api/status`404 확인. 실제 운영 PostgreSQL 공개3 소스(web,api,database), 비공개 minecraft 제외, 과거 약242만 스냅샷, 마지막 공개 관측 11월17일07:10 UTC, 유효180초 초과. 이전 정상 기록은 지금 정상 아님. Test DB 관측0, 소스4. 정책4+통합2 테스트 RED 재현.

**중간2 Spring 코드:** 공개·활성 source만 최신 인덱스로 조회, 상세 내부값 NULL/최대200, 실패503, 운영 과거 정상 자동 만료→`unknown/stale`, 실시간 건강 상태 가짜표시 금지. 정본 `status-v1` JSON 구 Next 파서 필드 전부 유지. 신규 `/api/v1/status`·`/api/status` GET200, `/status` Spring MVC Thymeleaf 신네이비 UI/영어·한국어/접근성/새로고침·읽기 문의, CSP/no-store/noindex, RSC406. 전체 Java `clean test bootJar` **232/232 통과·60스위트**, 코드 SHA9626746a, JAR SHA `2c92302aca1ce5001132baef69b3c6b7ba382897f36c1b9d183fd76916e98f3c`.

**중간3 실제 Test 권한:** Test용 Spring 계정은 두 상태 테이블 SELECT 없음이라 처음 Test503. 운영 DB 계정은 이미 SELECT 있음. **Test DB에서만** 두 상태 테이블 읽기 권한을 실계정에 추가하고 운영 DB 권한/계정/원장 미변경. Test PG read-only Spring4655 기록0으로 공개3 unknown, 운영 PG readonly Spring4656 마지막 기록 오래돼 공개3 stale/unknown. 실제 임시 Test 회원 세션 상태200·상점146·지원/채팅200, 타인 ID 위조3건403, 임시 회원/세션 삭제 PASS.

**중간4 실제 브라우저/운영:** Test/운영 후보 Chromium 2환경×EN/KO×320/390/1440=**12/12 PASS**, 별도 Nginx4454 6화면/언어클릭7/7. Nginx 메인 설정 SHA306b4aa 그대로, v24 스니펫 변경 전 `0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`, 변경 후 `06059c2e621ad0f96af7484937abc64c1eb91b104591bfc2b9b3bbe880d68c20`. 두 설정 전체600권한 백업·일치 확인·`nginx -t`·무중단 reload, 상태 페이지·API 별칭2·리다이렉트·CSS **5개 정확 경로만 수정**, 기존26개/금융·관리자 P0 보호 유지. 구 운영4550 PID368434, 운영 사용자·금융·DB 쓰기 없음.

**중간5 운영 결과:** 외부 HTTPS **39/39 PASS**, 실제 공개 Chromium6/6+언어 이동1/1, 상태 API 실데이터3개와 과거 기록 만료 정확, 구 Spring 계산기·상점146·주식10·로그인 보호401·금융403/관리302·RSC406/204·POST405 보존. 최초 HTML 스크립트 테스트2개는 외부 Cloudflare Insights 자체 삽입 스크립트 탓으로 확인하고 그것만 별도 허용(React/Next 앱 스크립트는 불허). 최종 Spring OpenAPI903경로 GET580, 격리 Test 실 GET459 **200 160/401 271/503 28/예상밖500·502·5040**.

**종료/보류:** 실 UI·브라우저까지 검증된 신규 Spring 경로4개(`/status` 추가), Next 원천180 중176개 미검증. **상태 자동수집기는 11월17일 이후 갱신되지 않음(별도 P0)**, API503 28/관리자·회원·전역 채팅 실제쓰기·금융 정산·외부 Test403·독립 롤백 미완료. 영어/한글 기획·분석·작업로그·업데이트/변경이력·운영 복구·180경로 JSON 공개, 비공개 테스트/설정 백업은 MiniPC600권한. 코드 Draft PR/main 병합 없음.
