# v2026.10.29.1202 — 격리 데이터베이스 재구축 기록

사용자가 금융 테이블 쓰기 권한을 명시적으로 승인했으므로 **기존 GRANT 유지**. 권한 보유 자체를 원장 불일치의 원인으로 확정하지 않는다. 원본 DB를 삭제하거나 초기화하지 않고 일관성 스냅샷을 별도 DB로 복원했다. `woldeok_moneyverse_dev` 명칭과 달리 운영 API와 DB가 공유될 수 있다는 통합 기획서 경고를 준수한다.

기준 main `2ac90063`, 브랜치 `feat/database-rebuild-v2026.10.29.1202`. PostgreSQL 17.11 `pg_dump -Fc` 읽기 전용 추출 및 ACL 포함, `pg_restore --no-owner --exit-on-error` 성공. 격리 컨테이너 `mv-db-rebuild-v1202`는 `--network none`, 파일은 두 번째 디스크 `/srv/moneyverse-data/db-rebuild-v1202/pgdata`에 저장. 계정 역할은 격리 DB에서 NOLOGIN으로 복원하되 테이블 GRANT 유지.

복원 확인: 테이블 247, 계정 40, 잔액 40, 원장 거래 890, 전표 1,810, 국고 기록 552. 청크 코덱 282 SQL 격리 적용 및 테스트 성공. 전표 불균형 0건. 그러나 계좌 24개의 단순 계산 잔액 차이 절댓값 합계 20,261,240 WLD: MINT 1건 10,121,620, SINK 1건 474,600, USER_BANK 4건 115,416, USER_CASH 18건 9,549,604. 초기 잔액과 부호 규칙을 확인하기 전에는 오류로 확정할 수 없다. 국고 기록 552건 모두 원장 거래 연결 ID 없음; 원본 정책과 당시 처리 방식 조사 전 임의 전표 생성 금지.

반복 조회 SQL: `packages/database/verify/rebuild-finance-readonly.sql`. 후속 필수 단계: 운영 연결 경로·백업 복원 확인, 계정별 차이 원인 분석, 국고 별도 기록 대사, 애플리케이션 메모리/캐시·동시성 점검, 정확 SHA 공식 Test E2E, 최종 증분 데이터 동기화, 세션 보존 및 무중단 Blue-Green 전환. 기존 금융 권한은 유지한다. **운영 원본 DB/잔액 미변경, 운영 승격 미실행.**
