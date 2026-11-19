# Spring 5개 언어 수동·자동 선택 및 PC/모바일 반응형 — 작업 기록 v2026.11.19.39.1

일자: 2026-11-19 KST / 시작. 독립 브랜치, 공식 Test·운영 미배포.
브랜치: feat/spring-responsive-five-locales-v20261119-39
기준: feat/spring-violet-ui-clean-v20261119-38, SHA e4c26f5f2143ac2e740c8e0913c0960e23a51cd3
작업 시작 GitHub main: c131ef1039fddbba064e04a9c07bbba06e0a38a2

## 시작 — 코드 전
- 사용자 지시: PC·모바일 **전 화면 반응형** 신규 UI, 자동 감지+사용자 수동 언어 선택, 기존 5개 언어 및 운영 승격 승인. 기능을 실제 Spring에서 실행하고, 이미지만 업로드해서 끝냈다고 보고 금지.
- 통합 마스터/최신 사용자 전체 Spring 지시/AGENTS, 기존 프론트 locale.ts와 language-switcher.tsx, Spring v38 공통 UI·테스트/QA 확인.
- 현재 지원 언어 **en, ko, ja, zh, vi** 확인. 옛 Next fallback은 ko이나 최신 사용자 기획은 영어 기본/한국어 2차이며, 자동 모드에서는 브라우저 언어, 수동 선택하면 `wdmv_locale` 쿠키 우선.
- 동시 소유자 브랜치 feat/spring-responsive-i18n-ui-v2026.11.19.38에서 홈·계정·게시판·퀘스트·상점·주식·지원·지갑·투자 정적 파일/5개 언어 스크립트를 수정 중이므로 **그 파일은 건드리지 않음**.
- 본 담당: 별도 `/mv-spring/v39/` 자바스크립트/스타일을 만들어 진짜 Java Thymeleaf 계산기·상태·도구·관리자 공통 화면에 5개 언어+자동 선택기 재사용. 44px 터치, 반응형, 읽기 가능/키보드 접근, 수동 쿠키 저장·브라우저 자동·영어 fallback.
- 현재 Spring 네이티브 계산기·관리자 본문은 EN/KO 위주다. JA/ZH/VI 선택기를 제공하더라도 **전체 내용 번역 완료로 주장 금지**; 네이티브 화면은 영어 대체 표시 명시. 별도 동시 작업 8개 화면은 완전한 번역 사전 개발 중.
- 구현 전 Node 단위 RED, Spring JUnit/HTTP/CSP RED→GREEN, 미니PC 격리 빌드·QA 예정.
- DB/원장/인증/운영·Nginx/Gemini 소유 파일 미변경. 실제 공식 Test/브라우저/보안/롤백 통과 전 운영 승격 불가.

## 중간 — 자동/수동 구현 및 RED→GREEN
- GitHub main c131ef1, 상위 v38 e4c26f5 및 병렬 8화면 PR #3296 재확인. 동시 사용자의 홈/지갑/투자/퀘스트/상점/게시판/문의/계정 정적 파일·CSS/JS 소유 경로는 수정하지 않음.
- 순수 /mv-spring/v39/locale-core.mjs는 en/ko/ja/zh/vi, 자동 브라우저·영어 기본값, URL/수동 우선순위·검색/해시 보존 구현. 최초 모듈 없음 RED, Node 7/7 GREEN.
- 실제 Java 관리자 HTML 및 mv28/mv29/mv30 Thymeleaf 헤더에 5언어+자동 링크·CSS/JS 로드. 관리자 CSP 자사 스크립트만 허용, 기존 권한 유지. Java 처음 4개 RED 후 GREEN.
- 모바일 언어창이 아래쪽 문의 동글과 겹칠 수 있음을 새 RED 테스트로 발견하고 작은 화면 상단 safe-area에 고정, GREEN.
- 병행 핵심 화면은 쿠키 외 localStorage wdmv_locale_preference로 수동 언어를 저장해 메뉴에서 돌아갈 수 있는 버그를 RED→GREEN으로 해결. Auto도 같은 키 사용.
- 격리 Spring H2 실제 HTTP 5/5 PASS, 320/390/768/1440 실 Chromium 합성 언어 선택기 10/10 PASS(모든 언어/수동·자동/문의 동글/키보드/API 무호출). 실제 금융/로그인 E2E는 아님.
- 최종 전체 Java clean test bootJar 262/262 PASS, 실패/건너뜀0, JAR SHA256 2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b.


## 종료 — 실제 완료 범위와 운영 판단
- 실제 Java 관리자/Thymeleaf 공통 선택기 및 CSS/모듈, Node/JUnit/Chromium 합성 테스트, 영/한 상세 기획·QA·변경 이력·작업로그 기록. 내부 업데이트는 .gitignore로 미니PC에만 보관.
- 180개 이미지 전 경로 Spring 전환 미완료. 본 v39는 기존 Java 계산기/허브/상태/관리자 공통 UI에 적용, 병행 PR #3296은 8개 핵심 회원 화면 전용. 서로 파일 충돌/미공개 로컬 main 이력 혼입 없음.
- 공식 5언어+Auto/수동 기능은 구현했지만 JA/ZH/VI의 Java 네이티브 전체 본문 번역은 미완료임을 명시. **사용자 전체 페이지 목표는 아직 일부 구현**.
- 실제 회원 인증·원장·퀘스트·쪽지/문의 양성·음성 E2E, 최신 보안 통합·공식 Test 정확 SHA·180개 전체 브라우저 시각 비교·무중단 롤백이 미실시이므로 운영 승격 HOLD. Nginx/DB/회원/원장/실서비스 무변경.

## GitHub 검토 PR 인계
- 독립 Draft PR #3297: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3297 / 기존 관리자 Spring PR #3295 기반 스택.
- 실제 회원 핵심 8화면 PR #3296과 같은 언어 선호 설정 키를 사용하며 소유 파일 충돌 0개 검증.
- 소스 31파일 변경, Java clean 262 PASS/Node7/H2 HTTP5/격리 Chrome10, 구버전/운영 배포 없음. 공개 main 및 동시 브랜치 SHA 다시 확인.
- 실제 운영 배포가 되었다는 주장 금지. 로그인/원장/전체180화면/모바일 원본 이미지·무중단 Test/롤백 미검증으로 승격 HOLD.
