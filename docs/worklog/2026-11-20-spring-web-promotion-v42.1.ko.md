# v2026.11.20.42.1 — 작업 시작·중간·종료 기록

**시작 2026-11-20 08:03 KST:** 사용자가 PC·모바일 Spring **웹사이트** 운영 승격을 재지시. 미니PC 원격 접근, main 최신 SHA `f488088bf50eb4659f59782dc0300a9c3bc74c69`, API/웹 통합 PR #3304 SHA `c5a34353d73088d6dcbb4001358d3dc5e088e81c` 확인. 통합기획서 국영문·G442 180페이지 ×5회 전체 QA·G0–G6, 운영 Nginx/정적파일/PR/기존 QA 확인. Gemini 작업 디렉터리 무변경. 별도 브랜치 `fix/spring-web-route-qa-v2026.11.20.42` 생성.

**중간:** 초기 Test Spring은 기본 DB localhost5432로 기동 실패. 기존 미니PC 별도 **읽기 전용 Test DB 설정**을 비밀 복사 없이 참조해 localhost4682에서 정상 기동, 실제 HTML/게시판/주식/비인증 관리자 HTTP 확인. 정적 HTML281개 5회 GET에서 2경로 405를 발견하고 정확한 Spring HTML GET별칭 수리, JUnit 추가, Java 전체 268/268. 프론트엔드 불변 Test 빌드와 실제 Chromium 5회×6해상도/5언어/메뉴/클리핑 검사 30/30. 이어서 Test API208개 검사 중 Java 직접 `/admin/...` JSON 13개가 비로그인 200인 보안 P0 발견. Java 필터에 구형 관리자 REST 경로 추가, 인증되지 않으면 401, 실제 관리자 HTML은 302 유지. 새로운 통합 JUnit 3개, Phase13 이전 가짜 성공 기대 수정. Java 전체 **271/271 PASS**, 최종 JAR SHA `185f9caed4cc99cfedf5dd5a4b40677ee22ade66d97986730a0237b3a7544698`. 실제 Test API208개 결과 200 84/401 108/406 1/503 15, HTML281×5 에러0, Chromium30/30.

**실제 운영 부분 수정:** 운영에서도 `/collections/index.html`, `/stocks/alerts/index.html` 405 확인. 변경 전 Nginx SHA `9b6ad397...`, 로컬 보호 전체 백업, `nginx -t`·무중단 reload·공개 HTTPS 후 두 경로 302로 개선. 일반 홈200, 관리자302, 관리자 블로그302, 관리자 API401, 회원 세션200, 주식200 유지. 현재 Nginx SHA `161cbce538be78d4ed666e6b2c62141caf3694a18923644c388e8b1dda70d5b9`. **운영에 적용된 것은 이 두 HTML 경로 수정뿐.**

**종료/판정:** 공식 Test HTTPS403, Test에서 15개 503 기능, 실계정 관리자/2회원 금융원장·거래 영수증·180 동적·관리자 웹경로 5회 전기능 인터랙션·독립 롤백 미검증. **신규 Java JAR·전체 PC/모바일 프론트엔드 운영 승격은 하지 않음.** 운영 데이터·금융 쓰기·main 변경 없음. 관련 EN/KO 기획/QA/업데이트 문서와 내부용 기록을 모두 분리. [영문](2026-11-20-spring-web-promotion-v42.1.md) · [QA](../qa/2026-11-20-spring-web-promotion-v42.1.ko.md).
