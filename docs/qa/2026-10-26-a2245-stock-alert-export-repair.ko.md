# 개발 A2245 QA — 본인 활성 가상 주식 알림 CSV 통합 복구

**판정: PARTIAL / BLOCKED — 병합·운영 배포 금지.** 기존 A1555 Draft #1425를 최신 main `0fe614b2ca1a7bc0df540514e54db78130479e2a`에서 별도 repair 브랜치로 다시 구성하고 Android OpenAPI 생성물 불일치를 수정했습니다. 신규 DB 마이그레이션·운영 데이터·금융 원장 쓰기 없음.

- 작업 브랜치 `auto/hourly-a-repair-stock-alert-export-20261026-2245`; 격리 Worktree는 데이터 디스크에 위치. 보고서 작성 전 검증 SHA `7b5e4957d7485b312ae1a54da293481a01fb3185`. 최종 SHA는 PR 기록으로 별도 고정.
- 변경: Backend 본인 인증 조회, SECURITY DEFINER 재사용, 최대 100건 완전 CSV·101건 초과 차단, Frontend 다운로드 및 접근성, Android app-api 180개 계약, 테스트·기록. 생성기와 불일치했던 `limit const=100` 문서 표현을 생성 결과 `number`로 수정하고 런타임의 100건 검증은 유지.
- 집중 테스트 Backend 3 PASS, Frontend/Android 18 PASS. 전체 테스트 Contract 38 PASS, DB 15 PASS/3 SKIP, Backend 1329 PASS/398 SKIP, Frontend 1431 PASS. Typecheck PASS, Lint PASS(오류 0/경고 1131), 기본 Build PASS, app-api 180개 PASS.
- 격리 PostgreSQL `wdmv_a2245_test` 실제 트랜잭션: 본인 101건, 타인 0건, 9007199254740993 정밀도 유지, 앱 테이블 직접 SELECT·원장 INSERT 차단, ROLLBACK 후 0건. 격리 DB 적용 마이그레이션 281개/최신 main SQL 278개로 전체 마이그레이션 정합성 PASS는 아님.
- 운영 의존성 보안 검사 PASS. 전체 보안 검사 FAIL(critical 2/high 8/moderate 11/low 3), Bot 보안 FAIL(critical 1/high 5). 전체 DB 테스트 398건 SKIP은 PASS 아님.
- 공식 Test 공개 SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Test 호스트 아티팩트 SHA `9f39f041c336b59f41e9a8c43ea14dc1d29a2586`, Production 공개 SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`. 후보와 불일치해 Test 정확 SHA 인증 E2E·GitOps 릴리스 차단.
- 시작 감사: 원격 브랜치 289개, 열린 PR 282개, 미통합 확정 276개, Git 객체 미확보 10개, 통합 확정이지만 보존 2개, 충돌 PR 9개, 실패 체크 PR 204개. 브랜치 삭제 0건. 다른 개발 예약의 고유 변경 보존.
- 운영 배포/DB 쓰기/서비스 재시작 0건. 향후 승인된 통합 후 롤백은 읽기 전용 API·UI·계약 변경 revert이며 DB 데이터 롤백 없음. 필수 보안·격리 Test exact SHA·인증 E2E·백업/복원 증거가 확보되기 전에는 배포 금지.
