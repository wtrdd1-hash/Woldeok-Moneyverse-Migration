# 작업로그 — 전체 Spring 웹 프론트엔드 지시 및 v2026.11.18.28 → .28.1

**시작 2026-11-18 23:35 KST, 운영 반영·종료 2026-11-19 KST · [영문 정본](2026-11-18-spring-only-frontend-v2026.11.18.28.md), [분석 결과](../findings/2026-11-18-spring-only-frontend-real-release-v28.ko.md). 운영 일부 통과 / 전체180화면·전901 API 완료 아님.**

**시작·준비** 최신 INTEGRATED_PLANNING_MASTER 우선, PROJECT_PLAN 및 v17 디자인·v27 QA 재확인. 사용자의 모든 웹 페이지 Spring·전체 API·새 디자인·운영 지시 명시. 원격 main0590fac4, v27기준ca96112c, Gemini 공유 main 미변경, 독립 MiniPC 분리 브랜치 `migration/spring-frontend-modern-web-v20261118-v28`, 600권한 START. 기존 운영 Spring4550 PID368434, 읽기 전용4650, 현 Nginx main306b4aa·HTML include8bc6d032 스냅샷.

**중간1 — 실제 영상/최신 가이드** YouTube `7F_TQyV-3C4` 메타·제작자 설명 직접 열어 Modern Web Guidance1.0 및 CLI 확인. 영상 자막 데이터 미확보(음성 완전 전사 주장은 하지 않음). Chrome 공식 문서·GitHub 교차 확인. 공식 CLI 1.0.1의 Next 계산기만 `legacy-scan` 규칙52/가이드38 자동 발견0(전체 정상 의미 아님), forms/accessibility/form-factor/CSS 지침 직접 읽음. 기존 Next 운영 유지 기획은 최신 사용자 지시로 대체한다는 내용 통합기획/프로젝트 기획 최상단 및 영한 상세 ADR 추가.

**중간2 — 실제 Spring UI 구현** 기존 Spring 기본 라우트 동작 테스트 5개 실패부터 재현(RED). 캐시된 Spring Thymeleaf 의존성 오프라인 해결 PASS. 새 `SpringCalculatorMath`, `SpringNativeCalculatorsController`, 공통 Thymeleaf 레이아웃·복리/주식 페이지, 자체 CSS. 기존 Next 계산식 기본값 유지, 검증되는 수학만 구현. 기본 영어/한국어 전환, 네이비·보라 UI·접근성·반응형, HTML GET 폼(클라이언트 JS 없이 작동), 읽기 전용 문의 링크, 사용자 입력 부적절 시400. 계산식 5개 단위 테스트(복리1000+100×24개월=3400; 주식평균44/250주/원가11000/목표50.63, 잘못된 값 등) GREEN.

**중간3 — Test/브라우저** 소스 커밋 `3d22c5b7`, 최종 Java `clean test bootJar` **226/226 통과, 58스위트, 실패·스킵0**, 불변 JAR SHA `e0f8ac8be500321efdfc8c60450e9a42f8205c37d04b58dcbd838e020b939f57`. 격리 Test DB read-only Spring4652, 별도 운영 DB read-only4653(봇/스케줄러 OFF). Chromium EN·KO × 320·390·1440 두 화면 **12/12 PASS**, 가로 넘침0·JS 오류0·CSS 정상·Next 번들 없음. JavaScript 완전 OFF 상태 키보드 폼 제출 **2/2(복리3400/주식평균44) PASS**, 잘못된 원금 HTTP400 알림1/1.

**중간4 — 실제 무중단 승격** 별도 Nginx4453 Test 구성, 기존 `/tools`에서 새 계산기 실제 링크 이동 **2/2 PASS**. 예전 Next 정적 경로25 중 **계산기2개 및 슬래시 별칭2개만 Spring4653**, 버전 CSS1개 추가, 나머지21개 유지. 통합기획·main 재확인 뒤 Nginx 원본 두 파일 mode600 백업·정확 SHA 비교. `nginx -t` PASS, 무중단 reload. 메인 SHA306b4aa 그대로, HTML include 기존8bc6d032→`0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`. 원 운영 Spring4550·사용자·금융 원장 쓰기/재시작 없음.

**중간5 — 운영 실제 확인** 외부 HTTPS **33/33** 대표 URL/응답·401/403/관리302·잘못된 계산400·RSC406(구 정적은204) 통과. 실제 운영 Chromium **15/15**(두 화면12/노JS2/오류1) + 기존 도구에서 새 계산기로 클릭 **2/2 PASS**, React#418 및 CSS 누락 새 화면에서는 발생하지 않음. 전체 API는 Test GET457건 200 158/401 271/503 28, 500·502·504 0. 제작·주간 브리프·퀀트 등의 정본 DB 함수·테이블 미확인, 가짜 성공으로 200 처리 금지.

**종료/보류** 실제 새 Spring 디자인과 브라우저까지 검증된 Next 소스 경로 **3개**(v27 주식1+v28 계산기2), **177개 새 디자인 Spring 전환 검증 미완료**. 관리자·회원/전역 채팅 실제 작성·동적 공개5·금융/정산·API503 28·외부 Test403·모바일 모든 페이지·복원 훈련 남음. 영문/한글 통합기획 수정·상세 ADR/작업로그/결과/변경이력/운영 복원·180경로 JSON 공개, 개인 로그·Nginx 백업은 MiniPC600권한. 코드 Draft PR/Gemini main 미병합, 전체 정상이라고 주장하지 않음.
