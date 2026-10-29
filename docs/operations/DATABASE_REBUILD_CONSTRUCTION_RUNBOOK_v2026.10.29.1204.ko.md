# 머니버스 데이터베이스 실제 구축·재구축 절차서 — v2026.10.29.1204

**상태: 격리 DB 구축·전체 복원·SQL 검사 성공 / 운영 전환 미실행.** [영어 정본](DATABASE_REBUILD_CONSTRUCTION_RUNBOOK_v2026.10.29.1204.md). 이 문서는 진단 결과만 요약한 것이 아니라 실제 실행했던 구축 명령, 디렉터리, 복원·검증 순서 및 향후 전환 절차를 기록한다.

## 0. 전제 조건 및 기존 환경

- 사용자가 기존 금융 테이블의 쓰기 권한 유지를 명확히 지시했다. GRANT 회수 금지. 원본 계정·잔액·세션·원장·국고 기록을 삭제하거나 임의 보정하지 않는다.
- 작업 전 `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, 통합 기획서, `packages/database/README.md`, 이전 작업로그를 읽고 `origin/main` 최신 SHA를 확인한다. Gemini 등 동시 개발자의 작업 브랜치를 덮어쓰지 않는다.
- 원본은 `woldeok-moneyverse-dev-db-1` 컨테이너, `woldeok_moneyverse_dev` DB, PostgreSQL 17.11. 이름은 dev지만 과거 통합문서에 운영 API와 DB 공유 가능성이 있으므로 원본 쓰기/초기화 금지.
- 실제 2번째 데이터 디스크 `/dev/sda1` (ext4), `/srv/moneyverse-data`에 마운트. 기존 PostgreSQL은 `/srv/moneyverse-data/postgres` 바인드 마운트. 새 DB 데이터 폴더는 `/srv/moneyverse-data/db-rebuild-v1202/pgdata`. 확인 당시 디스크 사용 약 79%.
- 새 컨테이너 `mv-db-rebuild-v1202`, 새 DB `moneyverse_rebuild`, 이미지 `postgres:17.11-alpine`, 네트워크 `none`으로 격리. 운영 서비스가 이 새 DB를 사용하게 변경한 적 없음.

## 1. 원본 및 디스크 확인 (읽기 전용)

```bash
lsblk -f
df -h /srv/moneyverse-data
docker inspect woldeok-moneyverse-dev-db-1 --format '{{json .Mounts}}'
docker exec woldeok-moneyverse-dev-db-1 sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

재부팅 후 자동 마운트는 UUID·`/etc/fstab`을 별도 검증한다. 실행했던 이번 작업에서는 디스크 포맷·파티션 변경·원본 DB 중지를 하지 않았다.

## 2. 격리 작업 브랜치 및 데이터 백업

동시 작업 충돌 방지를 위해 `fix/ledger-storage-v2026.10.29.1201`(정밀 금액 코덱), `feat/database-rebuild-v2026.10.29.1202`(전체 복원·키 검사) 브랜치를 분리했다. 이미 존재하는 브랜치를 재생성하지 않는다.

```bash
sudo install -d -m 0700 /srv/moneyverse-data/db-rebuild-v1202
docker exec woldeok-moneyverse-dev-db-1 sh -c \
 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner' \
 > /srv/moneyverse-data/db-rebuild-v1202/source-with-acl.dump
chmod 0600 /srv/moneyverse-data/db-rebuild-v1202/source-with-acl.dump
```

`pg_dump -Fc`는 일관된 시점의 논리 스냅샷이며 지속 복제는 아니다. `--no-owner`는 소유권 SQL만 제외하고 GRANT는 보존한다. 금융 권한 유지를 위해 복원용 덤프에는 `--no-acl`을 사용하지 않는다. 실제 복원용 ACL 포함 파일은 약 101MB. 비교용 `--no-acl` 덤프는 약 100MB로 따로 보관했다. 개인정보 포함 백업은 GitHub에 업로드하지 않는다.

## 3. 2번째 디스크에 신규 PostgreSQL 구축

```bash
sudo install -d /srv/moneyverse-data/db-rebuild-v1202/pgdata
# ISOLATED_REBUILD_PASSWORD는 Git/문서/로그가 아닌 비밀 저장 경로에서 공급
# 이미 존재하는 컨테이너나 데이터 폴더에 재실행하지 않는다.
docker run -d --name mv-db-rebuild-v1202 --restart=no --network none \
 -e POSTGRES_USER=postgres \
 -e POSTGRES_PASSWORD="$ISOLATED_REBUILD_PASSWORD" \
 -e POSTGRES_DB=moneyverse_rebuild \
 -v /srv/moneyverse-data/db-rebuild-v1202/pgdata:/var/lib/postgresql/data \
 -v /srv/moneyverse-data/db-rebuild-v1202:/restore:ro \
 postgres:17.11-alpine
docker exec mv-db-rebuild-v1202 pg_isready -U postgres -d moneyverse_rebuild
```

`--network none`으로 운영 앱이 접속하지 못하도록 격리했다. 바인드 마운트 기반이므로 메모리 저장이 아니라 디스크에 영속 보존한다. 실제 테스트 생성에는 폐기 가능한 임시 암호를 사용했다. 운영 인증정보 재사용 금지.

## 4. 역할 생성과 전체 스키마·데이터 복원

```bash
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild \
 -c 'CREATE ROLE moneyverse_app NOLOGIN; CREATE ROLE moneyverse_migrator NOLOGIN; CREATE ROLE moneyverse_minecraft_executor NOLOGIN; CREATE ROLE moneyverse_reconciler NOLOGIN; CREATE ROLE moneyverse_status_collector NOLOGIN;'
docker exec mv-db-rebuild-v1202 pg_restore --no-owner --exit-on-error \
 -U postgres -d moneyverse_rebuild /restore/source-with-acl.dump
```

위 명령은 이미 복원된 DB에는 재실행하지 않는다. 실제 복원은 `RESTORE_EXIT:0` 성공. 복제 환경의 역할은 NOLOGIN이지만 원본 금융 DML GRANT는 보존됨. 글로벌 사용자·로그인·소유권 등은 개별 DB 덤프만으로 완전히 복원되지 않으므로 운영 전환 전 `pg_dumpall --globals-only`를 별도로 감사해야 한다.

복원 결과: 공개 테이블 **247**, 계정 **40**, 잔액 레코드 **40**, 원장 거래 **890**, 전표 **1,810**, 국고 별도 기록 **552**.

## 5. 금액 청크·키·인덱스 구조 적용

- `292-ledger-postings-transaction-fk-index.sql`: 원장 `ledger_postings.transaction_id`의 FK 참조 조회 인덱스를 추가. 기존 데이터·권한을 변경하지 않는다.
- `293-exact-money-chunk-codec.sql`: PostgreSQL NUMERIC 금액을 10억 단위 정수 청크 JSONB로 정확히 직렬화/복원. JSONB는 전송 표현이며 실제 돈의 정본은 NUMERIC 복식부기 원장. 최초 파일명 `282-`는 이미 존재한 `282-verified-help-center.sql`과 충돌하여 `293-`으로 수정.

```bash
# 두 SQL이 모두 있는 검증된 소스 작업트리에서 실행
docker cp packages/database/migrations/292-ledger-postings-transaction-fk-index.sql mv-db-rebuild-v1202:/tmp/292.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/292.sql
docker cp packages/database/migrations/293-exact-money-chunk-codec.sql mv-db-rebuild-v1202:/tmp/293.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/293.sql
```

실제 격리 DB에서는 동일한 코덱 SQL을 파일 번호 변경 전에 적용·통과했다. 운영 DB에는 적용하지 않았다. 모든 마이그레이션의 이력·해시·적용 순서는 정식 Test에서 추가 검증해야 한다.

## 6. 데이터·키·원장 검증

```bash
docker cp packages/database/verify/rebuild-finance-readonly.sql mv-db-rebuild-v1202:/tmp/rebuild-finance-readonly.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/rebuild-finance-readonly.sql
docker cp packages/database/verify/292-financial-schema-integrity.sql mv-db-rebuild-v1202:/tmp/292-verify.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/292-verify.sql
# 코덱 PR 또는 병합 메인 소스를 사용
docker cp packages/database/verify/293-money-chunk-codec.sql mv-db-rebuild-v1202:/tmp/293-verify.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/293-verify.sql
```

실측: PK **243**, FK **285**, UNIQUE **110**, CHECK **586**, 미검증 제약 **0**, 유효하지 않은 인덱스 **0**, PK 없는 일반 테이블 **0**, 사용 중지된 사용자 트리거 **0**. 거래별 차대 불균형 **0**, 멱등성 키 NULL **0**, 불완전 전표 검사 통과. 코덱 정밀도/잘못된 입력 거부 시험 성공.

**남은 원장 조사:** 저장 잔액과 단순 전표 합계 차이 **24계좌**, 절댓값 합계 **20,261,240 WLD**. 국고 552기록의 `ledger_transaction_id`가 모두 NULL. 과거 기초 잔액, 계정별 부호, 당시 국고 분리 정책 검토 없이 자동 잔액 변경·가짜 분개 생성 금지. 이 차이들은 현 단계에서 최종 무결성 오류로 확정되지 않았다.

## 7. 운영에 적용하려면 추가로 필요한 과정 (아직 미실행)

1. 운영/API-DB 실제 연결관계와 백업·복구, 디스크 용량 검증. 이름만 dev인 DB를 테스트용으로 착각하지 말 것.
2. 마이그레이션 **292→293** 및 다른 개발자 파일의 번호·체크섬, 전체 스키마·확장·역할·권한을 공식 Test에서 재실행.
3. 24개 잔액 차이 및 국고 552개 기록의 과거 기초 원장, 은행·조폐국·중앙은행 연결 관계 확인. 사용자 승인 금융 쓰기 권한 유지.
4. 독립 Test 애플리케이션을 재구축 DB에만 연결하여 로그인·세션·금액·동시성·중복 거래·캐시 재시작 E2E 검증.
5. 일회성 덤프 시점 이후 발생한 신규 거래를 **최종 일관 동기화**. 기존 DB를 교체하기 전 비교 검증 및 원본 보존.
6. 정확한 SHA의 Blue-Green 운영 전환, 서비스 헬스체크, 세션 보존·롤백 시험. 현재 이 단계는 **수행하지 않음**.

## 8. 연동 기록

- [청크 구조 PR #1808](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1808)
- [DB 재구축·키 검사 PR #1809](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1809)
- `docs/operations/database-rebuild-v1202.ko.md`, `docs/worklog/2026-10-29-financial-keys-v1203.ko.md`

**원본 DB 쓰기 없음, 운영 DB 교체 없음, 고객 금액 수정 없음.**
