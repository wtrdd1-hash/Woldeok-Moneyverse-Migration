# 상태 화면/API 실제 PostgreSQL 기반 Spring 복구·운영 QA — v2026.11.19.29.1

**2026-11-19 KST · [영문 정본](2026-11-19-spring-status-real-api-v2026.11.19.29.md). 부분 운영 정상 승격 성공, 전체 180개 UI/903 API 완료 아님.** 최신 사용자 요구는 웹 HTML 모든 페이지와 API를 Spring Boot로 제공하고 신UI/실동작 QA 후 운영 승격하는 것. 과거 Next 유지 기획보다 최신 [Spring 단독 운영 지시](../planning/SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.ko.md)를 우선함.

## 실제 장애와 DB 원천
- 기존 실운영 `/status`는 HTML200이었으나 화면이 호출하는 **`GET /api/v1/status`는 실제404**, `/api/status`도404. HTML이 열린다고 상태 기능 성공 아님.
- 운영 PostgreSQL `content_status_sources` 공개·활성 3개(`web`,`api`,`database`), 비공개 `minecraft` 제외, `content_status_snapshots` 약242만 기록/최신 인덱스 보유. 최신 공개 관측은 **2026-11-17 07:10 UTC**, 설정상 유효시간 각 **180초**보다 오래됨. 옛 기록은 operational이라도 **현재 상태는 ‘확인 중(unknown)’**이어야 함. Test PostgreSQL은 감시대상4개 정의/관측 기록0개.
- Test용 Spring DB 계정이 상태 두 테이블 SELECT 권한이 없어 신규 Test API가 처음503, 운영 계정은 두 테이블 읽기 권한 이미 보유. **운영 DB 권한 변경 없이 Test DB에서 두 테이블 SELECT 권한만 정밀 부여**, Test 실제 읽기 가능 및 기존 인증/소유권 보호 유지. Test에는 기록이 없으므로 ‘기록 없음(unknown)’, 운영에는 ‘기록 만료(stale, state unknown)’ 정확 구분.

## Spring 전용 데이터/API/UI 구현
- `StatusTruthService`는 공개+활성 설정만 뽑아 source별 최신 기록을 인덱스 기준 조회(최대200), 비공개 감시대상/자유형 내부 detail/연결주소/실사용자 데이터 미노출. SQL 원천 실패하면 **503**, 가짜 정상200 금지.
- `StatusSourceTruthPolicy`의 `status-v1` 정본 JSON: sourceKey/displayName/state/detail:null/observedAt UTC밀리초/freshnessState/ageMs/policyVersion. 오래되거나 없거나 미래/잘못된 값이면 `state=unknown`, 확인된 장애는 우선 표시. 이전 Next `parseStatusRows` 검증 필드 규격과 일치.
- 새 `/api/v1/status`·`/api/status` **GET200 실DB**, 새 `/status`는 **Spring MVC+Thymeleaf 네이비·보라색 반응형 신UI**(영어기본/한국어2번째, 공개 상태 카드3개, 관측시각·유효시간 설명·문의 링크/새로고침). API·HTML 캐시 금지, 검색 비노출, CSP, Next React/RSC 필요 없음. Spring HTML에 Flight 요청 시406, 지원하지 않는 POST는 Nginx405. **실제 수집기 자체가 11월17일 이후 멈춘 문제는 아직 별도 P0**, 현재 정상이라고 허위 표기 금지.

## 진짜 Test·브라우저·운영 검증
- 결함 TDD 먼저 정책4+Spring 통합2 실패→수정 GREEN. 최종 Java `clean test bootJar` **JUnit232/232 PASS, 60스위트, 오류/스킵0**. 소스 커밋 `9626746a892d91ce37de2bb091bd87eab6772ec1`, 불변 JAR SHA `2c92302aca1ce5001132baef69b3c6b7ba382897f36c1b9d183fd76916e98f3c`, 경로 `/srv/moneyverse-data/releases/spring-frontend-v2026.11.19.29.1-9626746a/app.jar`.
- **격리 Test PostgreSQL readonly Spring4655**, **운영 PostgreSQL readonly Spring4656**, 봇/예약 작업 OFF, 기존 실제 Spring4550 PID368434 그대로. Test는 관측0/공개3 unknown, 운영은 오래된 관측3 stale/unknown, 비공개 minecraft 숨김 확인. JSON 규격/타임스탬프·HTML/스타일/언어·RSC406 검증. 임시 Test 회원 실세션: 상태 API200, 보유자 상점 상품146/지원·채팅 조회200, 타인ID 위조3건403, 임시 계정/세션 **삭제 PASS**. 운영 DB 회원·원장·스키마 쓰기 없음.
- 실제 headless Chromium 격리 Test+운영DB 후보 **2환경×EN/KO×320/390/1440 = 12/12 PASS**, 공개 카드3개·모바일 가로 넘침0·앱 React 오류/스크립트 없음·언어 클릭 정상. 별도 Nginx Test4454 **6화면+언어클릭=7/7**, 실 외부 HTTPS Chrome도 **6화면+언어클릭=7/7 PASS**. 외부 Cloudflare가 자체 Analytics beacon 스크립트 1개를 삽입하므로 브라우저 QA는 그것만 허용, Next/React 앱 스크립트는 불허.
- Nginx 본설정 SHA **`306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`** 전후 불변. v24 스니펫 변경 전 **`0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`**, 변경 후 **`06059c2e621ad0f96af7484937abc64c1eb91b104591bfc2b9b3bbe880d68c20`**. 전체 원본2개 private600 백업/정확 SHA 조건 확인, `nginx -t`/무중단 reload. 오직 상태 새 HTML/슬래시 리다이렉트/공개 API2/상태CSS 5경로만 변경, 기존 계산기/주식/상점/관리자·금융 보안 경로 보호 유지.
- 운영 외부 HTTPS 실제 **39/39** 검증: 신규 API·HTML/EN·KO·상태3개, 구 계산기/상점146/주식10/사업·홈·건강, 회원401/금융·관리자403/비로그인 관리자302, RSC406/204, 공개 상태 POST405. 최초 2건 테스트 실패는 외부 Cloudflare Analytics 스크립트 삽입을 앱 스크립트로 오인한 엄격한 주장 때문; **Cloudflare beacon만 허용** 후 실제 정상39/39. 최종 Test Spring OpenAPI **903경로/GET580**, **실 GET459건: 200 160/401 271/503 28/예상밖 500·502·504 0**. 903개 전체 양성 기능 테스트 아님.

## 미해결 중요 사항
- 공개 상태 **자동 수집기 마지막 기록 2026-11-17**: API는 이제 올바른 ‘확인 중’을 표시하지만 실제 최신 상태 수집 재가동은 아직 완료 아님.
- 503 API28경로(14기능), 전체 관리자/회원·채팅 실제 전송, 금융 장부·멱등성, 외부 공식 Test Cloudflare403, 전 화면 모바일/접근성·독립 복원 테스트 미완료. [180개 화면 추적표](../qa/2026-11-19-spring-only-frontend-migration-board-v29.json)의 **신규 Spring 디자인+실브라우저 증명은4개**(주식1,계산기2,상태1), 나머지 **176개 인증 미완료**(모두 다운이라는 뜻 아님). Gemini 공유 main 변경 없이 독립 브랜치/PR 유지.

**Open collector incident:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3286 — stale ingestion must not be treated as current green.
