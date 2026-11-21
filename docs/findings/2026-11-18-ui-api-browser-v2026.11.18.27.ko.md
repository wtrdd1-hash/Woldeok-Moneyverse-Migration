# 실제 브라우저 새 UI·Spring API 정본·운영 승격 정밀 QA — v2026.11.18.27 / .27.1

**2026-11-18 KST · [영문 정본](2026-11-18-ui-api-browser-v2026.11.18.27.md).** 판정: **신형 거래소 UI와 상점 조회 API 일부 운영 적용 검증 완료, 전체 프론트·전체 API 정상 아님.** 이전 [v26 전 화면 경로 목록](../qa/2026-11-18-frontend-route-inventory-v26.json) 및 최신 통합기획 우선, 분리 MiniPC/Gemini 공유 main 미변경.

## 실 브라우저로 재현한 기존 오류
- 실제 **headless Chromium**에서 운영 `/`, `/tools`, `/guide`, 계산기, `/shop`, `/stocks`, `/inventory`, `/dashboard`, `/login`, `/blog`, `/gallery` 및 관리자 비로그인 화면을 320px·390px·1440px로 점검. 공개 홈·도구 화면 가로 넘침은 없으나 **새 관리자 v17 네이비/보라 UI와 전역 문의 동글은 대부분 구 화면에 미반영**. `/dashboard`는 홈 기본 HTML; 전체 회원/관리자 새 화면은 미완료.
- 운영 `/tools`에서 복리·주식 계산기 링크를 직접 클릭하면 **React 수화 오류 #418**, `/stocks` 클릭은 **“화면을 정상적으로 불러오지 못했습니다”**가 표시됨. 원인: 새 Next HTML이 Spring에서 정적 파일로 제공되는데 실제 Next Flight/RSC 서비스가 없어 데이터 요청에 HTML200을 반환. 계산기 둘은 **직접 URL 접근 시에도 React #418**이 남아 단순 내비게이션 수정으로 해결되지 않음. 이 점은 P0 미완료로 유지.
- 13개 신규 공개 정적 페이지(슬래시 별칭 25개)에만 GitHub `spring-static-next-navigation-v27.js`를 Nginx에서 1회 삽입. 내부 링크 클릭은 새 창·Ctrl/Shift·해시·외부 링크 의미를 지키면서 **전체 문서 전환**으로 이동. Next RSC 요청에는 HTML 대신 204(임시 보호), **RSC 구현 완료가 아님**. 격리 Test 브라우저 링크3/3 목적지 정상; 운영 도구→거래소 클릭 이제 신형 Spring 화면으로 이동, 오류 없음. 계산기 React #418는 여전히 미해결.

## 상점 API 실제 계약 불일치 수정
- 새 상점 UI 소스는 비로그인 `GET /api/v1/shop/public-catalog`와 JSON `catalogItems`(정본17필드), 로그인 카탈로그도 `catalogItems`/본인 보유량을 요구. **수정 전 Spring 해당 공개 경로404**, 기존 `/catalog`는 실제146 상품이 있어도 **`items`만 반환해 새 UI 계약과 불일치**. 실패하는 테스트로 먼저 재현.
- Spring v27은 `/api/v1/shop/public-catalog`, `/api/shop/public-catalog` 추가 및 기존 `/catalog` 호환: **기존 `items`와 신규 `catalogItems` 모두 정본 `public.shop_catalog_list_v2(?::uuid)`**에서 읽어 반환. `code`·`rarity`·`preview_data`·만료/보유량 등 실제 SQL 반환17필드 유지, 가격·유지비는 BigInt 안전한 문자열. 회원 본인 보유량은 **DB 검증 세션 UUID**만 전달, `X-User-Id`를 믿지 않음. DB 소스 장애503, 가짜 카탈로그 금지. 검색어 `q`와 유지비 `maxUpkeep`(0 또는 최대30자리 정규식) 필터, 잘못된 값400.
- **실제 격리 Test PostgreSQL 읽기 테스트** 새/구 반환 각 **146개 UUID 전부 일치**, 신규17필드·가격 문자열 검증. 실제 이름 검색4개, 유지비0 이하140개, 조합4개, 존재하지 않는 검색0개(진짜 빈 결과), 음수/선행0/81문자 검색400. 임시 Test 실제 회원 세션: 신규/기존 카탈로그 모두200, 타인 ID 위조3건403, 임시 계정·세션 삭제 PASS. **운영 DB/자금원장 쓰기 전혀 없음**.

## 실제 Spring 새 거래소 UI
- 기존 운영 `/stocks`는 일반적인 오류 페이지가 나타났음. 새로운 Spring MVC **읽기 전용** 시장 화면은 정본 `StockService.list()`의 실제 상장10개·가격·전일 시초가 비교 등락·원천 업데이트 시각을 보여주며 가짜 매수·정산 버튼이 없음. 네이비·보라색 반응형, 기본 언어 **영어(EN)**, 두 번째 한국어(KO) 전환, 접근 가능한 읽기 전용 문의 바로가기 1개. HTML XSS 이스케이프, 실제 원천 불가/빈 결과503. 전체 주문·호가창·트레이딩 UI 대체 완료라고 주장하지 않음.
- 격리 Test와 **실제 운영 HTTPS Chromium** 모두 **320/390/1440px × EN/KO = 6/6 통과**, 실제 10종목, 가로 넘침0, JavaScript 페이지 오류0, 신규 릴리스 표시 일치. 운영 `/tools`의 거래소 링크 실제 클릭으로 신형 화면 정상 이동. `/stocks/`는 정규 경로 `/stocks`로 리다이렉트.

## 최종 테스트·승격 증적
- 최종 Java v27.1 `./gradlew clean test bootJar --offline --no-daemon` **JUnit216/216 통과(56스위트, 실패/오류/스킵0)**. 격리 Test readonly Spring **4649**, 운영 DB **읽기 전용** Spring **4650**, 봇·예약 작업 OFF. 원래 운영 Spring4550 PID368434 보존, 기존 v24/v25도 복구용 유지. 불변 JAR SHA `a241e3aeb677bbd15a86a3dae9aadc07ea2b671c96bbff2a05308be0b75078ad`, 새 내비 JS SHA `155d4e60c333091abf8495b283d9084698b1fb9181b21856afd4c80f6ca6afd9`.
- 운영 Nginx 메인 변경 전 SHA `8702a578f7c91348c98c90c7a44341e9863bbfeeac23cceed9dff284a6b8c2b4`, 이전 v24 페이지 스니펫 `76fb3dee20e19cf6d57182444e231046a9d4134a5b49c9263600b0fb9245b60c`; 600권한 백업, SHA 일치 확인, `nginx -t` 및 무중단 reload. 현재 메인 SHA `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`, v24 스니펫 `8bc6d032135bad86707c7161a1678d1e76d5a5346e96d9db0041c55db7e39fbb`. 내부4400/공개80에서 **`/stocks` GET 및 상점 공개/기존 카탈로그 GET만** 수정, 기존 금융/관리자 P0 차단 유지. 기존 v24 정적 원본 자체는 보존되고 Nginx가 JS태그 1개 추가하므로 **13/13 원본 HTML 해시는 태그를 제거한 후에만** 정확 일치; `verify-v27-snapshot-navigation.py`로 13/13 원본 해시·13/13 RSC 204·JS1회 검사 PASS. 기존 정적1005개 파일 그대로.
- 운영 외부 HTTPS 실제 **30/30** 경로·형식 QA PASS: 신형 거래소·상점 상품146·검색/유지비, 공개 사업/주식 API·홈/도구/가이드, 알림401·지원/채팅401, 금융/공간/성장·관리 SEO403, 관리자 SEO 비로그인302, 건강/robots, Next RSC 204. 후속 실브라우저 6개 해상도×언어 조합과 거래소 클릭 정상 확인.
- 격리 PostgreSQL Test API 비로그인 무매개변수 GET **457개**: **200 158 / 401 271 / 503 28 / 예상치 못한500·502·504 0**. OpenAPI 신규2경로 추가로 경로901개 추정(정확 이전899+2), 이는 전901개 실제 로그인·조회/금융 거래 검증과 다름. 매개변수 API, 금융 변경, 관리자 실제 로그인 등 별도 확인 필요.

## 남은 P0
아직 **503 28건(14기능 양쪽 별칭)**: 벤처 투자/공모, 외환·선물, KDIC, 주간 신문 브리프, 퀀트, 제작, 주식 파생상품 등. 계산기 2화면 React #418, v17 관리자 신규 디자인·회원 전체 UI·이전 SPA 기본 화면6개, 미승격 동적 공개5개, 전역 채팅 실제 메시지 영수증, 주식 주문·국고·세금·금융 정산, 공식 외부 Test Cloudflare403, 180페이지 실브라우저/모바일/접근성/복원 검증 미완료. **부분 읽기 UI/API 승격을 전체 시스템 성공이라고 표기 금지, Draft 유지.**
