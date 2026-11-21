# Spring 프론트엔드 전면 전환 지시·최신 웹 가이드·실제 운영 승격 QA — v2026.11.18.28.1

**시작 2026-11-18 23:35 KST · 운영 적용 2026-11-19 00:03 KST · [영문 정본](2026-11-18-spring-only-frontend-real-release-v28.md). 상태: 일부 Spring 새 UI 운영 적용 완료, 전체 UI·API 완료 아님.** 최신 지시는 통합기획·프로젝트 기획 상단에 최우선으로 추가하고 [영/한 변경 계약](../planning/SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.ko.md)을 작성했으며, 이전 Next 유지 기획은 과거 기록으로 보존.

## 유튜브 실제 확인 및 Modern Web Guidance 적용
- 제공된 `7F_TQyV-3C4` YouTube 실제 메타데이터·제작자 설명 직접 조회: **「AI로 웹사이트 만들면 이건 필수입니다」**, 백개발의 AI 활용. GoogleChrome/modern-web-guidance 1.0 권고와 `npx modern-web-guidance@latest install`, 직접 만든 JS 대신 브라우저 네이티브 UI 사용 비교, AI 가이드를 읽는 시간이 추가된다는 설명까지 확인. 캡션 URL은 있었으나 실제 자막 데이터 0바이트라 영상 음성 전사까지 확인한 것은 아님.
- Chrome 공식 사이트·GoogleChrome GitHub로 도구 존재 확인. 프레임워크가 아니라 AI용 최신 브라우저 표준 가이드. 공식 CLI **1.0.1** 사용, 기존 Next 계산기만 국소 `legacy-scan --json`한 결과 **52규칙/38가이드에서 매치0**(전체 서비스 무결성 뜻 아님). 실제 `forms`, `accessible-error-announcement`, `form-factor-adaptation`, `css-layout` 지침을 읽어 Spring 렌더링에 네이티브 GET 폼/시맨틱 HTML·명시적 라벨·키보드/44px 터치·CSS Grid/컨테이너쿼리·축소 애니메이션 반영.

## 기존 상태 및 지시 우선순위
- v27.1 이전 운영은 백엔드 Spring이지만 **프론트 전체 Spring 아님**: 구 Spring4550이 회원/관리자 기존 페이지·일부 SPA 홈, Spring4638이 Next 정적 HTML13개, 새 Spring4650이 실제 주식 거래소1개. Next 소스 페이지 경로 **180개**, 새 관리자/회원 테마·전역 채팅은 대부분 미반영. 계산기 직접 접속 React#418, RSC 요청에 잘못된 HTML 응답, GET API503 28개 확인.
- 사용자가 **프론트 모든 URL과 API를 Spring Boot로 통합**, 승인한 새 네이비·보라 디자인·전역 문의를 전 페이지에 적용하라는 최신 명시 지시를 했으므로, 과거 `Next.js/React 운영 유지` 기획을 **최신 지시로 대체한다는 변경 기록**을 PROJECT_PLAN·INTEGRATED_PLANNING_MASTER 상단에 추가. 옛 문서 본문을 삭제하거나 이미 전환됐다고 주장하지 않음.

## 실제 개발·운영에 적용한 Spring UI
- Spring Boot3.3.5/Java17에 캐시된 **spring-boot-starter-thymeleaf** 추가, `SpringNativeCalculatorsController`, `SpringCalculatorMath`, 공통 `mv28/layout`과 복리/주식 템플릿·`/mv-spring/v28/styles.css` 구현. 이 두 화면의 HTML은 **Java Spring MVC + Thymeleaf 서버 렌더링**, Node/Next RSC/React hydration/`_next` 번들 없이 동작.
- 디자인: 네이비·보라색 공통 메뉴/헤더·반응형·한 개 읽기 전용 **문의 링크 동글**(실제 메시지 전송 인증 아님), 기본 영어(EN)·한국어(KO) 전환, 시각적인 결과 카드, 년도별 성장표, `<details>` FAQ, 브라우저 자체 입력 검증, CSS 포커스/축소 애니메이션/모바일. 모바일 320/390, PC1440 확인.
- **복리:** 기존 Next 소스의 초기 원금100000/월 적립10000/연이율8.5%/3년 기본값 및 매월·매일·매년 복리/월말 납입/연말 성장표 수학 계약 유지. 검증 예시 초기1000+월100×24개월·연 0% → **3400** 정확, 예상 이자0. 범위 오류는 가짜 성공 없이 HTTP400+접근성 알림. 실제 투자 수익 보장 아님.
- **주식 평균단가:** 기존 소스의 초기50×100+추가40×150, 목표15%, 수수료0.05% 기준 **평균44 / 250주 / 총원가11000 / 목표 매도가50.63** 재현. 입력 수학 시뮬레이션이지 주식 주문·잔고·체결/API 결과 아님. 큰 값/잘못된 수수료 400. Thymeleaf에 의한 입력 HTML 이스케이프, JS 없이 동작.
- 새 Spring HTML에 Next Flight/RSC가 요청되면 거짓 HTML200을 반환하지 않고 **406**. 남은 Next 정적11개 페이지는 이전 네이티브 링크 및 RSC204 임시 보호 유지.

## 실제 테스트/운영 반영
- 개발 전 Spring 통합 테스트5개 실패(RED), 수정 후 통과, 순수 계산 수학5개 추가. 전체 `./gradlew clean test bootJar --offline --no-daemon` **JUnit226/226 통과, 58스위트, 실패/오류/스킵0**. 불변 JAR SHA `e0f8ac8be500321efdfc8c60450e9a42f8205c37d04b58dcbd838e020b939f57`(`/srv/moneyverse-data/releases/spring-frontend-v2026.11.18.28.1-3d22c5b7/app.jar`), 코드 커밋 `3d22c5b7`.
- 격리 **Test DB 읽기 전용 Spring4652**, 운영 DB **읽기 전용 Spring4653**(디스코드·스케줄러 OFF), 기존 실제 운영 Spring4550 PID368434 보존. Test·운영 후보의 HTML2개/CSS·건강·기존 API 응답200 확인.
- **실제 Chromium Test와 외부 운영 HTTPS:** 2화면×EN/KO×320/390/1440 **12/12** 화면 검사 통과, JS 오류0·CSS 로드·가로 넘침0·Next 스크립트0. **JavaScript 사용 안 함** 상태에서 실제 키보드 Enter로 폼 제출2/2 정상(복리3400/주식평균44), 잘못된 값 HTTP400+알림1/1, 기존 `/tools`에서 새 Spring 화면 실제 클릭 **2/2 통과**, 화면 진입 React#418 없음. 이 결과가 전체 180화면 실브라우저 검사인 것은 아님.
- 별도 Nginx4453 Test에서 구 Next 정적 경로25중 **계산기2개 및 슬래시 별칭2개만 Spring4653으로 이관**, 새 CSS 정적1개 추가. **기존 다른21개 정적 경로와 금융·관리자/개인정보 보호 규칙 그대로 유지**. 이전 스니펫 SHA `8bc6d032135bad86707c7161a1678d1e76d5a5346e96d9db0041c55db7e39fbb`, 이후 `0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`. 메인 Nginx SHA `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873` 미변경. 실설정 전 SHA 대조·600권한 사본·`nginx -t`·무중단 reload. 기존 Spring/DB 원장 쓰기 없음. 실제 외부 HTTPS **33/33 대표 경로·계약·401/403·계산400·RSC406/204 PASS**.
- 최종 격리 Test 실제 API GET457: **200 158 / 인증필요401 271 / 정본부족503 28 / 500·502·504 0**. 남은503은 별칭 중복을 합쳐 14영역(벤처 투자, FX·선물, KDIC, 주간 브리프, 퀀트, 제작, 주식 파생상품)이며, 일부 데이터 원천 테이블/함수가 Test DB에 없음을 확인. 가짜 수치나 영수증으로 200 만들지 않음.

## 전체 완료로 판정할 수 없는 부분
- [공개 180경로 전환 현황 JSON](../qa/2026-11-18-spring-only-frontend-migration-board-v28.json)에서 실브라우저로 증명된 신규 Spring UI는 **3경로**(`/stocks` v27.1, 이번 계산기2). 다른 **177 Next 소스 경로는 새 Spring 디자인 검증 미완료**(177개 모두 다운이라는 의미 아님). 다른 11 Next 정적, 구 회원/관리자 v17, 전역 채팅 실제 작성, 블로그/공지/뉴스/검색 등 동적 공개5, 광고·SEO, 전 페이지/모바일·관리자 로그인·국고/정산/금융, 외부 공식 Test Cloudflare403 및 독립 롤백 미검증.
- OpenAPI901 경로 전체 및 변경 API를 실제 양성 검증한 것이 아니며, 503 28개 그대로. **사용자의 ‘모든 API 정상·전체 UI 무조건 운영 승격’ 지시를 완료로 허위 표시하지 않고, 검증된 안전 경로만 먼저 무중단 실제 운영에 반영**. 이후 모든 경로의 DB 정본/권한·실브라우저·금융 영수증/원복 테스트 단계별 진행 필요. Draft PR·협업자 main 무변경.
