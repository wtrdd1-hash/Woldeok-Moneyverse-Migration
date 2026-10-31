# Moneyverse 개발 A2153 — 주식 알림 조건 필터 QA 및 운영 보류

- 시작: 2026-10-31 21:53 KST, 기준 main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`.
- 독립 브랜치: `auto/hourly-a-20261031-2153-stock-alert-status` 및 별도 worktree. A #2205, B #2207, C #2202의 변경을 수정하지 않음.
- 기능: 회원 전용 가상주식 알림을 전체/조건 충족/감시 중으로 검색. PostgreSQL 기존 소유자 범위 `SECURITY DEFINER` 함수를 재사용하고 SQL 파라미터로 필터링. 웹·NestJS·Android app-api 연계, 중복/잘못된 요청과 필터 미적용 200 응답 차단, 캐시 금지 및 검색엔진 색인 방지.
- 테스트: 신규 RED→GREEN 확인. 격리 PostgreSQL 17.11에 SQL 312개 적용, 사용자별 결과 2/1/1 확인, 직접 SELECT/DELETE 거부, ROLLBACK 후 합성 데이터 0·원장 거래 0. 컨테이너 종료.
- 최초 전체 검증에서 기존 테스트의 함수 호출 인자 기대값 1건이 변경된 API와 불일치하여 실패, 수정 후 대상 회귀테스트 통과. 동시에 실행된 검증 명령으로 OS 스레드 자원이 부족해 최초 빌드 실패. 본 작업의 중복 실행만 종료, 다른 개발 작업은 유지.
- 원격 브랜치 137개(비-main 136, 선조 11, 고유·분기 125), 열린 PR 116개(충돌 8, Draft 113). 삭제·병합 0.
- 공식 Test/Production 공개 SHA는 `bc8cd8a6...`, 현재 작업 SHA와 다름. 운영 Backend/Frontend 프로세스는 삭제된 v1515 배포 경로에서 실행 중. 정확 SHA 인증 E2E·독립 백업 복원·GitOps 릴리스 조건 미충족. **Production HOLD**, 배포·DB 변경·재시작·롤백 없음.
- 최종 전체 게이트는 `final-gates.results`의 실제 종료 코드로만 판정.
- 코드 SHA `0c94655...` 재검증: 전체 lint/typecheck PASS, `pnpm test` 0. 보안 27, 모바일 계약 41, DB 단위 62 PASS/4 SKIP, Backend 2,790 PASS/501 SKIP, Frontend 2,782 PASS. 빌드 최종 결과 대기.
- Android에서 필터 미적용 빈 배열(HTTP 200)을 정상 검색 결과로 오인할 가능성을 확인하여 `filterApplied` 검증 마커 및 알 수 없는 쿼리 차단 보완 예정. 기존 빌드 실행 중 코드는 수정하지 않음.
- **최종 코드 보완:** 필터 결과가 빈 배열이어도 `filterApplied` 검증 마커가 없으면 Android에서 HTTP 503으로 차단. Backend는 알 수 없는 쿼리도 400 처리, OpenAPI에 허용 enum 추가. RED Backend 2 FAIL·Frontend 2 FAIL → GREEN Backend 11 PASS·Frontend 6 PASS. 이전 SHA 전체 PASS를 최종 SHA 전체 PASS로 오인하지 않음.
- **브랜치 보존:** C의 고유 미통합 브랜치 2개가 외부 작업 중 삭제됨. 원격 브랜치 변경 없이 별도 로컬 Git bundle로 복구 근거 보존, 이슈 #1968 기록. C 담당자 확인 전 삭제·복원·병합 금지.
