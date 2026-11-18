# v2026.11.18.16 — 예약 시맨틱 QA 실행·안전·장애 대응 매뉴얼

상태: Test 전용 후보. 인증된 전체 라우트 QA도, 운영 애플리케이션 승격도 아님. [English](QA_SCHEDULED_SEMANTIC_RUNBOOK_v2026.11.18.16.md). 상위 문서: [프로젝트 기획](../planning/PROJECT_PLAN.ko.md), [통합 기획](../planning/INTEGRATED_PLANNING_MASTER.ko.md), [프로필 참고 자료](../planning/QA_PUBLIC_PROFILE_REFERENCE_v2026.11.18.16.ko.md), [QA 12단계 초안 PR #3269](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3269).

## 2026-11-18 KST 실측

기존 moneyverse-qa.timer는 매시간 정각 실행되고 마지막 v2026.11.16.1 불변 예약 스크립트를 사용한다. 15:00:09 기준 26건 HTTP 200·실패 0·세션 378이지만 full_functional_QA=NOT_TESTED로 표시한다. 기존 QA·디스크 정리 수정 금지. 공식 Test는 버전 API만 200 JSON, 홈/로그인/관리자/robots/sitemap은 502. 운영의 없는 주소·robots.txt·sitemap.xml은 200 HTML 폴백으로 잘못 응답해 기존 상태코드 QA에 거짓 양성 위험이 있다.

## 완전 분리된 Test 예약

- 코드 scripts/qa/scheduled-semantic-qa.mjs, 테스트 scripts/qa/scheduled-semantic-qa.test.mjs.
- 불변 Test 실행 파일: /srv/moneyverse-data/qa-scheduler-releases/v2026.11.18.16/scripts/qa/scheduled-semantic-qa.mjs.
- 별도 moneyverse-qa-semantic-test.timer: 매시 20분 + 최대 30초 분산, 기존 정각 예약과 독립.
- 비로그인 GET 7회만 순차 실행. 쿠키·POST·회원 정보·금융/DB/Android/Discord 쓰기·Instagram 재수집·디스크 삭제 금지. 요청당 8초·응답 본문 256KiB·전체 110초·RAM 128MiB·CPU 25% 및 읽기전용 보호.
- journal은 시간·검사 버전·환경·경로·HTTP 코드·Content-Type·PASS/FAIL/BLOCKED·사유·소요 시간만 기록. 원문 본문·개인정보·토큰·비밀번호 기록 금지. 실제 배포 SHA 미확인 시 UNATTESTED. 전체 기능/관리자 인증/원장/Android/Discord 음성/정확 SHA는 NOT_TESTED, releaseCertification은 항상 BLOCKED.

| TC | 실제 GET | 통과 판정 |
|---|---|---|
| SEM-HOME | / | 200 및 진짜 HTML 문서 |
| SEM-LOGIN | /login | 200 HTML 문서 |
| SEM-VERSION | /api/version | 200 JSON 및 Spring 버전/엔진 형태 |
| SEM-ADMIN | 비로그인 /admin | 401/403 또는 동일 출처 /login 이동. 200은 권한 통과 아님 |
| SEM-ROBOTS | /robots.txt | 200 text/plain + User-agent 규칙 |
| SEM-SITEMAP | /sitemap.xml | 200 XML + urlset/sitemapindex |
| SEM-404 | 존재하지 않는 고정 테스트 경로 | 404/410, 200 폴백 실패 |

PASS는 해당 읽기 전용 조건 충족, FAIL은 HTTP가 도착했으나 계약 위반, BLOCKED는 연결 장애·시간 초과, NOT_TESTED는 범위 밖. 7건 전부 PASS여도 인증된 전체 페이지·금융/관리자 기능 합격 아님.

## QA 진행 12단계

1. 최신 통합 기획·라우트·API·권한·원장 요구 분석, 2. 정확한 후보 SHA·별도 브랜치·위험·롤백 계획 확정.
3. 성공/실패/재시도·회복 시나리오, 4. 경계값/동등 분할/결정/상태전이 TC 설계.
5. 공식 Test 환경 확인, 6. 실제 개인정보가 없는 로그인·관리자·금융 합성 픽스처 준비. 이 예약은 익명 연결만 검사.
7. 실제 GET 7회 실행 및 증빙 기록. 별도로 전체 라우트 5회·관리자/원장/Android/Discord 음성 인증 E2E 시행.
8. FAIL/BLOCKED 결함 등록, 9. 수정 전후 재테스트, 10. 변경 공유 컴포넌트 및 API 전체 회귀.
11. PASS/FAIL/BLOCKED/NOT_TESTED를 각각 집계하고 비식별 근거 첨부.
12. G0~G6 보안·금융·원천 데이터·정확 SHA 공식 Test·독립 복구 검증을 만족해야 별도 운영 GO 판정. 이 예약은 자동 승격하지 않는다.

## 작업 순서·확인·원복

독립 워크트리와 작업 전·중간·종료 기록 및 최신 main 재확인 → 실패 테스트(RED) → 코드 수정 → GREEN → systemd 단위 검증 → 공식 Test HTTPS → 불변 실행 파일과 별도 Test 서비스/타이머 설치 → 실제 단발 실행과 다음 예약 시각·journal 확인. Test가 502면 버전 API 200과 관계없이 FAIL. 서비스 배포/운영 승격 절대 자동 실행 안 함.

상태 확인: systemctl status moneyverse-qa-semantic-test.timer; journalctl -u moneyverse-qa-semantic-test.service --since today --no-pager.

직접 검사: node scripts/qa/scheduled-semantic-qa.mjs --base-url https://test.easy-scraping.com --label test

원복: 새 moneyverse-qa-semantic-test.timer만 disable --now, 새 서비스만 reset-failed, 신규 /etc/systemd/system/moneyverse-qa-semantic-test.service 및 .timer만 제거한 뒤 daemon-reload. 기존 moneyverse-qa.timer와 디스크 정리는 유지. 모든 개인 정보/원장/운영 로그 원문은 GitHub 업로드 금지.
