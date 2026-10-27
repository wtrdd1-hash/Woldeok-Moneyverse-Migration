# 개발 A — 검증 도움말 실시간 만료 무결성 (2026-10-27 16:25 KST)
상태: 실제 코드 후보 / Draft / 운영배포 보류. 영문 원본 문서의 한국어 동반 기록.

## 기준 및 보호
- Debian 13.6 미니PC 직접 연결, 서비스와 PostgreSQL 정상. 최신 main c2a9306ddc0424438bc0ab297ea9543bb167aee6 시작·중간 확인.
- AGENTS/README/영문·국문 통합기획/이전 QA와 PR/CI 확인. 최신 기획 v1364 #1549는 미승인 Draft/HOLD 고객지원 운영시간 제안이며 본 작업과 별개.
- 최신 main에서 별도 auto/hourly-a-help-live-expiry-20261027-1625 브랜치/Worktree 생성, 이전 A 도움말 커밋만 안전하게 재적용. A/B/C/Gemini/QA 기존 작업 및 PR 보호.
- 시작 감사: 원격 359브랜치(비-main 358), 열린 PR 351(초안 336), 충돌 26, 실패·취소 체크 205, 분기 351·앞선 5·main 포함 2, 중복 SHA 0, 객체 미확보 0. 삭제 0.

## 결함과 수정
- DB 조회 시점에는 검증 유효기한이 살아 있어도 API 응답 전에 만료되거나, 열린 웹 검색/상세 화면에 오래된 검증 내용이 남는 P1 오류.
- RED→GREEN: Backend 검색·상세 응답 직전 만료·잘못된 날짜 거부. 공개 Android app-api에도 동일한 Backend 검사 적용. KO/EN 검색·상세에서 단발 타이머 및 탭 재활성화 시 재검사, 만료 시 본문·원본 근거 링크 제거.
- 신규 미적용 Migration 280과 SECURITY DEFINER/권한/멱등성/독립 승인/감사 불변성 유지. 기능 기본 OFF, 원장·운영 DB 변경 없음.
- 네트워크 없는 임시 PostgreSQL 17.11 컨테이너에서 bootstrap/280/admin/positive/negative 모두 PASS. PUBLIC 함수 실행·앱 직접 테이블 접근 거부, 만료·미승인 자료 비노출, 독립 승인·재시도·불변 감사 검증. 테스트 컨테이너 삭제.
- 테스트·빌드·보안 근거: /srv/moneyverse-data/reports/Moneyverse-A-2026-10-27-1625-*.

## 통합·배포 보류
- 전체 의존성 Critical 2/High 8, Bot Critical 1/High 5; Production 전용 의존성 감사만 PASS. 열린 PR들의 280번 마이그레이션 충돌 미해결.
- 공식 Test 6f697e74..., Production 6a989b5a...는 후보/main과 SHA 불일치. 공식 인증 E2E, 복원, 전체 라우트·접근성, GitOps 게이트 미검증.
- main 병합·운영배포·기능 활성화·운영 DB/원장 쓰기·롤백·브랜치 삭제 모두 없음. 미통합 고유 변경 보존.

## 최종 로컬 검증 (16:39 KST)
- 최종 코드 변경 후 타입검사 PASS, 전체 테스트 Backend 1341 PASS/398 SKIP·Frontend 1436 PASS·DB 19 PASS/3 SKIP·계약 38 PASS, 린트 PASS(오류 0/경고 1132), Backend 빌드 PASS, Next.js Webpack 빌드 PASS.
- 최초 1024MiB Webpack 빌드는 메모리 부족으로 실패. 3072MiB로 다시 실행해 PASS. 실패를 성공으로 집계하지 않음.
- Bot 테스트 8 PASS. 전체 의존성 감사 Critical 2/High 8 FAIL, Bot Critical 1/High 5 FAIL, Production 의존성만 PASS.
- 라우트 목록 171개(관리자 35/동적 32) 생성. 실제 5회 QA 증거 부재로 BLOCKED. 공식 Test exact SHA 인증 E2E·독립 복원·GitOps도 BLOCKED.
- 커밋 직전 main 동일, 후보 Draft/HOLD만 보존, 브랜치 삭제 0.
