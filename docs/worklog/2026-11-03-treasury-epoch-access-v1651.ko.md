# v2026.11.03.1651 — 국고 수입·지출 집계 실제 SQL 권한 오류 정상화

**작업 시작 2026-11-03 12:55 KST. 상태: 개발 시작 / Test·운영 적용 전.**

- 사용자 요구: 국고와 조폐 등 실제 기능 정상화. 구동 중인 운영 v1629에서 수입 검증 불가가 표시됨. 시작 원격 main `a8e967b11bc67948caf422f120410c04306657b2`, 다른 개발자의 미커밋 보안 감사 소스는 건드리지 않고 전용 브랜치 `fix/treasury-revenue-expense-scoped-epoch-v1651`에서 작업.
- 통합 기획, 국고·중앙은행 조폐 사양, 과거 320/326/327/328 마이그레이션과 최소권한 테스트 확인.
- 실 운영 백엔드 포트 4234의 실제 DB 연결을 비공개로 확보해 `moneyverse_app` 계정으로 BEGIN READ ONLY 검사. `getRevenue` 사용 SQL은 오류 **42501 permission denied for table treasury_fiscal_epochs**. `system_treasury_ledger` SELECT=true, `treasury_fiscal_epochs` SELECT=false로 재현. 이는 SQL320/327의 의도된 재무 감사정보 접근 제한이므로 직접 GRANT SELECT 금지.
- 기존 DB 소유자 SECURITY DEFINER `public.treasury_fiscal_proof_read()`는 app EXECUTE=true이고 실제 `epoch_opened_at=2026-10-31T13:53:31.686Z` 반환, 필터링한 현 국고 거래 0건(초기화 후 정상 가능한 결과)을 READ ONLY 검증. 수입·지출 두 조회의 필터만 이 스코프 함수로 수정하고, 앱의 원본 테이블 직접 SELECT는 계속 금지.
- 본 작업에 금융 발권/계좌 잔액 덮어쓰기, 회원 자금 이동, 미증빙 지급 해제, DB 직접 권한 부여 없음.
- 중간/종료: TDD, CI, 공식 Test, 운영 API 실제 200 및 원장 미변경, 국문·영문 기록 추가.

## Midpoint
중간: 수입·지출 SQL 두 곳을 기존 감사용 함수로 대체. 직접 표 권한 확대 없음. 테스트 27건 통과. 타입/린트 확인 중.
