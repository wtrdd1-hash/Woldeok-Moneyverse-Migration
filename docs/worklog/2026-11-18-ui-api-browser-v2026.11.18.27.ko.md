# 신규 UI 실제 브라우저·Spring API 운영 검증 작업로그 — v2026.11.18.27 → .27.1

**2026-11-18 KST · [영문 정본](2026-11-18-ui-api-browser-v2026.11.18.27.md), [상세 분석](../findings/2026-11-18-ui-api-browser-v2026.11.18.27.ko.md). 일부 읽기 기능/UI 실제 운영 승격, 전면 UI/API 완료 아님.**

**시작 ~22:31.** 최신 통합기획·프로젝트 기획·v26 보고서 재확인. 미니PC 독립 브랜치 `repair/ui-api-browser-qa-v20261118-v27` 분리, 원격 main0590fac4/공유 Gemini main 유지. 600권한 START 기록. 기존 Spring4550, 공개 UI4638, 읽기 전용 API4646 확인.

**중간1 실제 Chromium UI:** 운영 홈페이지/도구/가이드/복리/주식 계산기·상점·주식·보관함·대시보드·로그인·블로그·갤러리·관리자 비로그인 등 320/390/1440 화면 확인. `/dashboard`는 예전 홈페이지 기본 화면, 관리자/회원 v17 새 디자인 전체 미배포. `/tools`에서 계산기 클릭 시 **React #418**, `/stocks`는 오류 화면. 직접 계산기 접속에도 #418이 발생하므로 내비게이션만 고쳐서는 해결되지 않음. 이유: Next 정적 HTML을 Spring이 제공하지만 Flight API는 없고 RSC 요청에 HTML200 반환.

**중간2 v27 화면 이동:** `spring-static-next-navigation-v27.js` 새 소스 및 11개 Node 이벤트 테스트 통과. 별도 Nginx4452 Test에서 새13 공개 HTML(슬래시 포함25경로)에만 내비 JS 한 번 삽입, 내부 링크 전체 문서 이동, 키보드/수정키/외부 링크 의미 유지. Next RSC 요청은 잘못된 HTML 대신204. 실제 Test 브라우저 링크3/3 통과, 원본 HTML13/13 SHA(삽입한 태그 제거 후) 및 RSC13/13 확인. **복리/주식 계산기 직접 진입 React#418 미해결**.

**중간3 Spring 상점 API:** 실제 새 Next 상점은 `/api/v1/shop/public-catalog` + `catalogItems` 요구, 구 Spring은404 및 `{items}`만 반환. 실패 테스트 선행 후 `public.shop_catalog_list_v2`의 진짜 자료만으로 구·신 형식 모두 제공하도록 수정. 익명 함수 NULL actor/실회원 검증 세션 actor, `X-User-Id` 위조 차단. 가격·유지비 문자열 정밀도, 필드17개, 검색·유지비 필터, 잘못된 인수400, DB 실패503. Test PostgreSQL 실제 상품146개 양 계약 일치, 검색4·유지비0 결과140·조합4·없는 검색0, 임시 회원 실제 조회200/타인 위조403 및 삭제 PASS. 운영 원장 쓰기 없음.

**중간4 새 Spring 거래소:** 정본 `StockService.list()` 기반 **새 네이비·바이올렛 읽기 전용** `/stocks` 구현(가짜 거래버튼 없음), 실제10종목·가격·등락/업데이트 시각, 기본 영어·두 번째 한국어, HTML 안전 이스케이프, 소스 장애503. TDD RED→GREEN, 최종 Spring `clean test bootJar` **JUnit216/216 PASS(56스위트, 오류0)**. Test DB read-only4649, 운영 DB read-only4650(봇/스케줄러 OFF). 격리 Test/운영 HTTPS 실제 브라우저 **320·390·1440 × EN/KO 6/6 PASS**, 화면 넘침0, JS 오류0, 거래소10개 표시. 도구에서 거래소 실제 클릭 성공.

**중간5 운영 단계적 승격:** 이전 Nginx SHA 메인 `8702a578f7c91348c98c90c7a44341e9863bbfeeac23cceed9dff284a6b8c2b4`, v24 HTML 스니펫 `76fb3dee20e19cf6d57182444e231046a9d4134a5b49c9263600b0fb9245b60c` 백업(600권한), 정확 SHA 대조 후 읽기 전용 주식 UI/상점 공개·기존 카탈로그 GET/정적 JS만 내부4400·공개80 갱신, `nginx -t`/무중단 reload. 변경 후 메인 SHA `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`, HTML 스니펫 `8bc6d032135bad86707c7161a1678d1e76d5a5346e96d9db0041c55db7e39fbb`. 구 Spring4550 PID368434 유지, 금융/개인정보 차단·지원/채팅 읽기 유지, 데이터 쓰기 없음.

**중간6 운영 확인:** 실제 외부 HTTPS **30/30 PASS**, v24 새13 HTML 해시·RSC 보안 응답13/13, 새 거래소 브라우저6/6, 도구→거래소 클릭 정상. 최종 Spring OpenAPI **901경로·GET578**, 격리 Test 실 GET457: **200 158/401 271/503 28, 500·502·504 0**. 전 API/금융 거래 양성이라고 주장 금지.

**종료/보류:** 영어/한글 분석·로그·변경이력·운영 롤백 기록·QA 코드 공개, 비공개 내부 기록/설정 백업은 미니PC에만. 독립 QA Nginx4452·이전 v27 Test4647 종료, 본 v27.1 Test4649/운영4650·구 Spring 정상. **남은:** API503 28(14기능), 계산기 React#418, 전체 회원·관리자 신UI/전역 문의, 미승격5 공개 동적 페이지, 금융·정산·MFA·CSRF 양성, 외부 Test403·모바일 전 페이지·완전 롤백 검증. Draft PR 유지, main 병합 금지.
