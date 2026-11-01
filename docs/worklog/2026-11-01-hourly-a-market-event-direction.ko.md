# 개발 A 작업일지 — 2026-11-01 09:25 KST

**시작:** Debian 13.6 미니PC 서비스 정상, 개발 PostgreSQL 17.11. 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9` 확인. 기존 main 작업 폴더의 다른 작업 `implementation_plan.md` 수정은 보존하고 새 분리 worktree만 사용. 원격 브랜치 64개, 열린 PR 62개.

**개발:** 공개 시장 이벤트 방향 필터를 Nest controller/service/SQL 함수 조회, 웹 `/newspaper/events`, Android 게이트웨이에 연결. 중복·잘못된 필터는 400, 필터가 적용되지 않은 Android HTTP 200은 503으로 차단. 신규 마이그레이션·권한·원장·금전 쓰기 없음. 테스트 RED 확인 후 수정 및 대상 GREEN.

**중간:** main과 기획서 재확인, 변동 없음. 개발 DB의 실제 호재 3건·악재 0건을 읽기 전용 확인 후 ROLLBACK. Frontend 전체 관리자 세션 2건 실패는 변경하지 않은 main에서도 재현. 개발 DB P0 직접 DML 권한 위반 잔존.

**종료:** Backend 전체 2,960 PASS/517 SKIP, Frontend 전체 2,904 PASS/2 FAIL 및 워커 오류, DB 단위 62 PASS/4 SKIP, 모바일 API 계약 184 PASS, 보안 10 PASS, 타입검사 PASS, Lint 오류 0, 단일 워커 빌드 PASS. 정확 SHA 공식 Test E2E·운영 승격 차단. 브랜치 삭제·main 병합·배포·서비스 재시작·DB 변경·롤백 없음. 증거: `/srv/moneyverse-data/tasks/mv-a-20261101-0925-market-event-filter/evidence/`.

**GitHub 종료:** Draft PR #2293, 원격 브랜치 65개/열린 PR 63개, 삭제·병합 0건. 최초 코드 SHA `0ec87cf3d55ab669699f6e7da4b0146c00a000d6`; 최종 기록 SHA는 PR에 기재. 정확 SHA CI 진행 중.

**v3 추가 검토:** 구형 무필터 HTTP 200 빈 배열이 Android 검증을 통과할 수 있어 `appliedDirection` 증거를 Backend·웹·Android에 추가. 빈 결과도 정확히 검증. TDD RED 2+2, GREEN 12+7, Backend 전체 2,962 PASS/517 SKIP. Frontend 전체 재실행 EPIPE 중단, 이전 2건 실패 잔존. rayon 스레드 자원 부족으로 빌드 첫 실패 후 스레드 제한 재시도 PASS. 테스트 변수명 수정 후 Lint 오류 0. 새 SHA는 PR에 기록. 배포 없음.

**v4:** 모바일 API 계약 검사에서 응답 union 스키마 평탄화 오류 발견. 단일 선택 필드 타입으로 수정 후 계약·영문/국문 참조 재생성. Backend 12/Frontend 7 PASS, 타입검사 PASS. 최종 SHA·CI는 PR #2293 기록.
