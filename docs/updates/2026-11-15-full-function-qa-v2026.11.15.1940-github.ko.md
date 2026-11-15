# GitHub 변경 기록 — 전체 기능 QA v2026.11.15.1940

[English canonical](2026-11-15-full-function-qa-v2026.11.15.1940-github.md) | [한국어 상세 보고서](../qa/2026-11-15-full-function-qa-v2026.11.15.1940.ko.md)

QA 결과 문서와 작업 로그만 추가. 기능 코드·서버·원장·운영 배포 변경 없음. 메인 기준 04ef008aeff2516df4afc891430227a40a12418e, 분리 브랜치 qa/full-function-v2026.11.15.1940.

테스트: 페이지 177개(정적 HTTP 요청 144개), 프론트 3,064 PASS, 백엔드 3,046 PASS(518 SKIP), 계약 41 PASS, Spring 23 PASS, QA/보안 32 PASS. 타입검사 통과, 린트 오류 0/경고 1,067.

차단: 실제 비인증 관리자 정보 노출 [P0 #3174](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3174). 전 기능 5회 E2E, 로그인 사용자·관리자 금융 명령 테스트·복구 증거 없어 운영승격 보류.
