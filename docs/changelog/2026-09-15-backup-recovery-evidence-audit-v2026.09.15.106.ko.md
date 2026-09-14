# v2026.09.15.106 — 백업·복구 증거 및 데이터손실 방지 감사

> 날짜: 2026-09-15
> 범위: 기획/문서만 변경. 런타임/API/DB/인프라/보안코드 변경 없음.

## 최우선 발견

`BAK-106-01`을 통합 기획에서 **P0 / OPEN / 파괴적 변경 운영승격 차단**으로 승격한다. GitHub issue #139는 아직 열려 있으며 지정 별도 백업 SSD `/mnt/backup`이 read-only였고, 당시 최신 파일은 2026-09-07 백업이며, Kubernetes 전환 후 별도매체 자동백업은 관찰되지 않았고, 응급 PostgreSQL dump도 같은 시스템 디스크에 저장됐다고 기록한다. 복구 전용 PostgreSQL DB는 점검·빠른 논리복구에 유용하지만 독립된 암호화 백업을 대체하지 않는다.

현재 `docs/operations/backup-and-recovery.md`는 운영 변경 전에 운영 DB/사진을 암호화 백업한다고 설명하지만, 이는 목표 운영계약이지 현재 복구 가능성의 증거가 아니다. 독립매체의 최신 백업과 실제 restore 증거가 기계적으로 확인되기 전에는 파괴적 또는 schema/data-changing 운영 작업을 fail-closed로 차단한다.

## 외부 근거 직접채택

- PostgreSQL 최신 `pg_verifybackup`: base backup 무결성 검증은 유용하지만 실제로 서버가 복구되어 올바른 데이터를 제공하는지까지 보장하지 않으므로 test restore가 계속 필요하다.
- PostgreSQL 최신 continuous archiving/PITR: PITR을 채택하면 base backup뿐 아니라 필요한 WAL 보존과 recovery target 동작도 복구계약에 포함한다.
- CISA StopRansomware: 중요 데이터는 offline/encrypted backup으로 유지하고 재해복구 상황에서 가용성과 무결성을 정기적으로 시험한다.
- NIST SP 1339(2026-06-17): 백업을 변경관리와 연결하고 정기 생성·테스트·복구훈련을 수행한다. Moneyverse가 OT 서비스라는 의미가 아니라 운영 설계 참고로 채택한다.

## 필수 구조/백로그

1. **복구 편의용 DB**와 **재해복구 백업**을 분리한다. `moneyverse_recovery`는 동일 장애영역·온라인 자격증명에 의존하면 백업으로 계산하지 않는다.
2. RPO/RTO는 수치가 있는 승인된 서비스 목표로 정의하고 실제 restore 측정치로 검증한다. 기획 자동화가 임의 숫자를 만들지 않는다.
3. 최소 백업대상은 권위 PostgreSQL 데이터, migration/schema/version manifest, 필요한 object/photo 저장소, restore metadata/checksum, 해당 데이터를 해석할 application/GitOps 버전이다. 비밀키는 별도 승인된 암호화·키복구 절차로만 보호한다.
4. 독립 failure domain/off-host 또는 동등하게 독립복구 가능한 저장소, at-rest/in-transit encryption, least-privilege backup identity, 가능한 경우 immutable/tamper-resistant retention, 키 분리와 키복구 시험을 요구한다.
5. physical base backup/PITR 사용 시 PostgreSQL 버전에 맞는 manifest/checksum 검증과 필요한 WAL 범위를 확인한다. logical dump 사용 시 `pg_restore` 구조검증만으로 완료하지 않고 isolated full restore를 수행한다.
6. restore drill은 decrypt/read, source/target 환경식별, clean isolated target, migration parity, 최소권한 app 접속, 대표 무결성, ledger 차변/대변 대사, 파생잔액 대사, shop/inventory/entitlement 정합성, object-store 샘플, Production endpoint/credential 미사용을 확인한다.
7. 파괴적/schema-changing 운영 승격증거에는 backup ID/생성시각/source DB/독립매체 분류/checksum·manifest 결과/restore drill 시각·결과/migration parity/ledger reconciliation/RPO·RTO 상태/rollback target/operator audit ID를 포함한다. 누락은 `BLOCKED`다.
8. stale/failed backup, checksum mismatch, decrypt failure, storage 부족, restore drill 실패, PITR 사용 시 WAL gap, key unavailable, recovery refresh 실패를 알림화하되 secret과 원시 개인정보/경제 데이터를 알림에 넣지 않는다.

## 보안·개인정보

backup-key 탈취, plaintext/off-host 오설정, 잘못된 환경으로 restore, recovery에서 Production credential 재사용, 보유기간 초과, 백업 삭제, 오염된 backup/WAL, backup 로그·artifact를 통한 사용자/경제 데이터 노출을 위협등록부에 추가한다. 백업 artifact와 restore/admin endpoint는 private이며 SEO/sitemap에서 제외하고 공개 status 페이지에서 내부 위치·키·파일명을 노출하지 않는다.

## 사업성·비용효율

백업/복구의 직접매출은 0이다. 가치는 데이터손실·다운타임·fraud/refund/CS 피해의 기대비용 회피와 복구시간 감소다. backup storage/egress, encryption/key management, restore-drill compute, 운영자 시간, monitoring 비용과 `사고확률 × 예상 데이터손실/다운타임/부정사용/환불/지원 영향`을 비교한다. 승인 RPO/RTO와 restore 성공 SLO를 합리적 비용으로 충족하면 `SCALE`, 백업은 있으나 restore 증거·비용이 약하면 `ITERATE`, 증거 부족 시 파괴적 release `HOLD`, 독립복구가 불가능하거나 secret/privacy 위험이 큰 경로는 `KILL`한다.

## QA·운영승격 수용

- 최신성과 독립 failure domain 증명;
- checksum/manifest/decryption 검증;
- 빈 isolated target으로 전체 restore;
- migration version/checksum·DB role 경계 확인;
- Production endpoint 없이 복구 DB에 application smoke;
- ledger와 derived balance reconciliation;
- object/photo restore sample;
- missing/corrupt/stale backup, wrong key, storage-full, WAL-gap 상태에서 fail-closed 확인;
- 마지막 known-good immutable application/GitOps rollback rehearsal;
- drill duration을 기록해 승인 RTO와 비교.

## 기존 차단항목

`AUTH-105-01`, `QA-104-01`, `REL-104-02`는 P0 OPEN 유지, `AUTH-105-02`, `REL-104-03`은 P1 TODO 유지한다. v106은 기존 수용조건을 약화하지 않는다.

## 현재 증거상태

시작·중간 `main`은 `e1dce34cf3e7544d3bb3fe53a80caf992945a213`였다. issue #139는 OPEN이고 recovery worklog도 `moneyverse_recovery`가 별도매체 백업을 대체하지 않는다고 명시한다. 시작 SHA의 connected GitHub combined status에는 status entry가 없고 PR-triggered workflow 조회도 비어 있어 CI/test-server 통과를 주장하지 않는다. 이번 회차에서 현재 운영 `/status` 직접조회는 성공하지 못했으므로 이전 snapshot을 현재 상태처럼 재사용하지 않는다.
