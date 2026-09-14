# 2026-09-15 — 백업·복구 증거 감사 v2026.09.15.106

## 범위

문서/기획만 변경한다. 런타임 코드, API, DB, migration, 인프라, branch policy, secret, 백업 장치, 운영 데이터는 수정하지 않았다.

## 수행 순서

1. 외부 조사: PostgreSQL 최신 backup 검증/PITR, CISA ransomware recovery, NIST 2026 backup 자료와 기존 OWASP/Google/FTC 근거 재검토.
2. GitHub/main·QA 증거: 최신 `PROJECT_PLAN.md`/`.ko.md`, issue #139, backup/recovery 문서, recovery DB worklog, 시작 SHA의 commit status/workflow 가시성 확인.
3. 기획: 독립백업·restore proof를 P0 데이터손실 gate로 승격하고 구조/보안/QA/SEO·privacy/사업성/릴리스 증거를 상세화.
4. 작업 중간 main 재확인: `e1dce34cf3e7544d3bb3fe53a80caf992945a213`; 문서 commit 시작 전 동시변경 없음.
5. 영문/한국어 통합기획·changelog·worklog 동기화.

## 핵심 실제 증거

- issue #139는 OPEN이다. 기록된 점검에서 `/mnt/backup`의 `/dev/sda1`이 read-only였고 별도매체에 최신 Kubernetes-era 자동백업이 관찰되지 않았다. 응급 PostgreSQL custom-format dump는 같은 시스템 디스크에 있었으며 독립 재해복구로 인정되지 않는다.
- `docs/worklog/2026-09-12-cicd-db-isolation-backup.md`도 recovery-only PostgreSQL이 암호화 별도매체 백업을 대체하지 않으며 #139를 복구위험으로 유지한다고 명시한다.
- `docs/operations/backup-and-recovery.md`는 운영 변경 전 암호화 백업을 설명하지만 open issue 때문에 이를 현재 운영증거로 간주할 수 없다.
- 시작 SHA의 connected GitHub combined status에는 개별 status가 없고 PR-triggered workflow 조회도 비어 있어 CI/test-server 성공을 주장하지 않는다.
- 이번 회차에서 현재 운영 `/status`의 fresh 직접검증은 불가능했으므로 과거 snapshot을 현재 증거처럼 재사용하지 않는다.

## 기획 판정

신규 통합 이슈: `BAK-106-01 — P0 — OPEN — 독립 백업 및 restore 증거 부재`.

심각도 근거: 프로젝트 우선순위에서 데이터손실/DB 무결성은 신규기능보다 앞서며, 현재 증거는 전체 host/storage failure에 대한 독립 복구경로를 입증하지 못한다. GitHub issue 제목의 P1 이력을 수정하지 않고 Living Plan의 운영승격/파괴적 변경 gate에서는 P0로 취급한다.

## 개발 backlog

- DevOps/DB: 독립 backup destination 수리/교체/선정, least-privilege scheduled backup, encryption/key separation, machine-readable freshness/result evidence.
- DB: 승인 RPO/RTO 기준으로 logical/base-backup/PITR 결정. PITR이면 WAL 보존·검증과 migration checksum을 복구증거에 포함.
- QA: 빈 isolated 환경 full restore, migration parity, DB role, app smoke, ledger/derived-balance reconciliation, object/photo sample 검증 자동화.
- Security: backup/key access audit, wrong-environment safeguard, secret/log redaction, 삭제·변조 보호, stale/corrupt/wrong-key/storage-full 시나리오.
- Release: current backup+restore evidence 없으면 destructive/schema-changing Production 작업 fail-closed.
- Operations: stale/failed backup, checksum/decrypt/restore failure, PITR WAL gap, key unavailable, recovery refresh failure alert와 정기 recovery drill/RTO 측정.
- Analytics/Business: storage/egress/compute/operator cost와 회피 사고·다운타임·환불·fraud·CS 비용을 측정하고 매출을 임의 생성하지 않는다.

## 외부 근거 적용

- PostgreSQL `pg_verifybackup`: compatible physical backup 무결성 검증에 직접채택하되 실제 restore test는 계속 필수.
- PostgreSQL continuous archiving/PITR: PITR 선택 시 WAL coverage를 복구증거에 직접 반영.
- CISA StopRansomware: offline/encrypted backup과 정기 가용성·무결성 검증을 resilience 원칙으로 직접채택.
- NIST SP 1339(2026-06-17): 백업을 변경관리·정기테스트·복구훈련에 연결하는 운영원칙을 참고/직접적용. Moneyverse를 OT 시스템이라고 정의하는 것은 아니다.

## 보안·SEO·개인정보·사업성

backup artifact/checksum/storage path/key/restore control은 private/non-indexable이며 public sitemap 밖에 둔다. 공개 status에서 backup health를 표시한다면 truthfully safe category/timestamp 정도만 허용하고 location/credential/topology/user/economy data/recovery key를 노출하지 않는다.

사업성은 비용회피 모델이다. 백업/복구 직접매출은 0이며 승인 RPO/RTO/restore 성공증거와 storage/key-management/drill/operator cost, 예상 사고손실을 비교한다.

## 기존 차단항목

P0 OPEN: `AUTH-105-01`, `QA-104-01`, `REL-104-02`, 신규 `BAK-106-01`.
P1 TODO: `AUTH-105-02`, `REL-104-03`.

## 통합상태

영문/한국어 changelog·worklog를 `main`에 생성했다. 통합 기획서는 같은 v106 정책을 반영하면서 v105까지의 기능/보안/SEO/수익성 계약을 유지한다. 최종 보고 전 main을 다시 확인하고 force update는 사용하지 않는다.
