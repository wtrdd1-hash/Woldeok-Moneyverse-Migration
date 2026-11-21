# Spring 전용 금융 계산기 허브 신UI·실제 운영 승격 QA — v2026.11.19.30.1

**2026-11-19 06:59~07:17 KST · [영문 정본](2026-11-19-spring-native-financial-hub-v30.md). 결론: `/calculators` 실제 운영 완료, 전180화면·903 API/전체 시스템 Spring 전환 미완료.** 사용자 최신 지시는 프론트엔드·백엔드 모든 기능을 Java Spring으로 전환하고 새 네이비·보라 UI/실브라우저·운영승격까지 확인. 독립 MiniPC 작업트리/영한 기록, Gemini 공유 main·운영 원장 미변경.

## 실제 기능 퇴행 위험 확인
- 이전 `frontend/src/app/calculators/page.tsx` 직접 열어 **17개 계산기 경로**, 카테고리4개, 상·중·하단 광고 컴포넌트·FAQ/JSON-LD 확인. 운영의 옛 `/calculators`는 Spring 렌더링이 아니라 **4638에서 제공한 Next 정적 HTML**. 기존 실제 정적 캡처에는 AdSense 광고 요소·스크립트가 **0개**였으며 JSON-LD는 있었음. 새 메타/JSON-LD 구현은 부분적 SEO 복구이며 **광고의 실제 동작·전 SEO 기능을 인증한 건 아님**.
- **`/tools`는 절대 단순 목록으로 교체하면 안 됨**: 기존 실제 소스에 국고 잔고 시뮬레이터, 메가잭팟 복권, 테일러 대출 마진, 출석 룰렛, 예측 배틀, 추천인 시스템 **6개 인터랙티브 위젯**, 사이트맵 등록/탭 포함. 이 기능들의 진짜 Spring 대체/기능 QA 전까지 **운영 `/tools`는 옛 화면 그대로 보존**. 새로운 Spring `/tools` 후보 코드는 독립 Test에서만 화면 검증, 실제 Nginx에는 연결하지 않았고 완료 숫자에도 포함하지 않음.
- 신규 Spring UI에서 이전 `/calculators`의 실제 17개 링크 전부 유지. 이 중 `/tools/compound-calculator`와 `/tools/stock-calculator` **2개만 실 Spring 계산·UI 검증** 상태로 표시; 나머지 **15개는 기존 경로/추가 QA 필요**라고 정확히 표시하여 가짜 정상 광고 금지. 사용자 데이터/원장 실제쓰기 없음.

## 새 Spring UI 구현
- Java17 Spring Boot3.3.5 `SpringNativeToolHubController`+Thymeleaf `mv30/hub.html`+자체 `/mv-spring/v30/hubs.css`; 영어 기본·한국어 두번째, 승인한 네이비·보라색 공통 UI, 문의 동글, 모바일/PC. Next/React/Node 실행/JS 하이드레이션 없이 서버에서 HTML 구성. 기존17링크, Spring검증2/옛15 라벨.
- HTML 자체 GET 검색: 한글·영문 제목/설명, 서버에서 검색, 엄격한64자 제한·6개 허용 분류(전체/투자/세금/은퇴/대출/시뮬레이션). 실제 `compound interest`→1, `주식`→2, 은퇴→3, 세금→5, 미검색→0. 잘못된 검색/분류는 HTTP400, 사용자 `<script>` 입력 Thymeleaf 이스케이프; RSC/Next Flight406, 운영에서 POST405, CSP·no-store·키보드 포커스/접근성/44px 터치 타깃.
- 검색엔진: `/calculators` canonical, EN/KO/x-default 대체 URL, OG/title, 신뢰된 정적 JSON-LD `CollectionPage` 17종. 기존 FAQ/광고까지 모두 동등하다는 주장은 하지 않음. 게임돈/주식 매매·정산 기능 아님.

## 실제 Java/Test/운영 브라우저
- 새 Spring 통합5개 TDD 실패→수정. 전체 오프라인 `./gradlew clean test bootJar --offline --no-daemon` **JUnit237/237 PASS,61스위트, 실패/스킵0**. 코드 SHA `d34835b3437cbe29fc311bc1f73ce5d505c9355f`, 불변 JAR SHA `3e17ecb8fd3b8270a73e3b2a9a884c7d75b28d6f7ccd6397f6a19981d413fe73`, `/srv/moneyverse-data/releases/spring-frontend-v2026.11.19.30.1-d34835b3/app.jar`.
- 격리 Test PG 읽기전용 Spring4657 및 운영 PG 읽기전용 Spring4658(봇/예약 OFF), 옛 실제 Java4550 PID368434·거래소4650·계산기4653·상태4656 보존. Test/운영 후보 실제 Chromium **2환경×2허브×EN/KO×320/390/1440=24화면 +검색5/비JS 폼1/계산기 링크2/언어1 =33/33 PASS**. 단, Spring `/tools`는 Test 후보만, 기존 게임 콘텐츠 재현 완료 아님.
- 독립 Nginx Test4455 정확 복사/최소 수정: 구 `/tools` 및 `/tools/` 유지, `/calculators`만 Spring4658, `/calculators/`→308, 신규CSS. 실제 Chromium **15/15**(EN/KO×320/390/1440 6 +검색5/비JS 폼1/계산기 클릭2/언어1). Nginx 본설정 SHA **`306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873`** 그대로, 공용 스니펫 전 **`06059c2e621ad0f96af7484937abc64c1eb91b104591bfc2b9b3bbe880d68c20`**, 후 **`b5a316420b0e9946837041d00744e3cd8887f093885acf97d64fd1fde6ef2a28`**. 정확 SHA 가드·전체 두 원본 private600 백업·`nginx -t`·**무중단 reload**. 기존 Spring4550 PID368434·운영 계정/금융/원장 미변경.
- **실제 외부 HTTPS:** 기존 상태/상점146/주식10·회원401·금융403·관리자302 등 **39/39 회귀 PASS**, 신규 금융센터 15개 HTTP 응답·검색·400·RSC406/구 tools204·POST405 **15/15 PASS**. 실제 운영 Chromium 금융센터 EN/KO×320/390/1440 6화면+검색5/비JS 폼1/계산기 클릭2/언어1 = **15/15 PASS**, 모바일 가로 넘침0, 앱 React 오류/스크립트 없음. 외부 Cloudflare만 자체 Insights 스크립트 삽입(검사상 예외) 및 정적 JSON-LD는 비실행.

## 전체 지시 관련 미완료
- [Next 원천180 경로 전환 보드](../qa/2026-11-19-spring-only-frontend-migration-board-v30.json): **실 Spring 새디자인·운영 브라우저 검증5개**(주식1·계산기2·상태1·새 금융센터1), **175개 미검증**(전부 장애 의미 아님). `/tools` 구 게임·이벤트6/사이트맵·광고 실 대체 후 전환.
- 실제 상태 자동수집기11월17일부터 중단 [P0 #3286](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3286), API503 28경로(14기능), 관리자/회원 전면 UI·진짜 채팅 전송, MFA/CSRF/원장·정산 등 실제 영수증, 외부 공식 Test Cloudflare403, 광고·SEO 완전 동일·독립 롤백 훈련 미완료. 전체 Spring/모든 API 완료 주장 금지.
