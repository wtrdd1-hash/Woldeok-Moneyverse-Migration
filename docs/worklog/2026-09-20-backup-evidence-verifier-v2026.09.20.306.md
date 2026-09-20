# Backup recovery evidence verifier v2026.09.20.306

## English (canonical)

Development B advances P0 `BAK-106-01` from planning-only evidence requirements into executable release tooling.

- Added `scripts/backup/verify-backup-evidence.mjs` with fail-closed validation for backup identity, SHA-256, isolated restore target, restore-drill result, migration parity, least-privilege connectivity, ledger and derived-balance reconciliation, RPO/RTO, rollback target and operator audit identity.
- The verifier rejects any restore evidence that used a Production endpoint or Production credential.
- `pg_dump` custom archives are checksum-verified and structurally inspected with `pg_restore --list`.
- Physical base backups are verified with `pg_verifybackup`; PITR evidence additionally requires explicit WAL coverage.
- Added Node regression tests and wired them into the repository `test` gate so the recovery evidence policy cannot silently regress.
- This does not claim that a backup is recoverable merely because its archive verifies. Production promotion still requires an actual isolated restore drill and the evidence fields above.

## 한국어 (secondary)

개발 B에서 P0 `BAK-106-01`의 문서상 복구 증거 요구사항을 실제 실행 가능한 검증 도구로 전진시켰다.

- 백업 식별자·SHA-256·격리 복구 대상·복구훈련 결과·migration parity·최소권한 연결·ledger/파생잔액 대사·RPO/RTO·rollback target·operator audit ID를 fail-closed로 검증한다.
- Production endpoint 또는 Production credential을 사용한 복구 증거는 거부한다.
- `pg_dump` custom archive는 checksum과 `pg_restore --list`를 검증하고 physical base backup은 `pg_verifybackup`을 실행한다.
- PITR이면 WAL coverage 성공 증거도 필수다.
- Node 회귀 테스트를 전체 `test` gate에 연결했다.
- archive 검증만으로 복구 가능성을 주장하지 않으며 실제 isolated restore drill은 계속 Production 승격의 필수 조건이다.

## v2026.09.20.309 — CI unblock

### English (canonical)
- Removed a stale unused `Input` import in the account security page that caused the repository-wide lint gate to fail before DR tests could run.
- Re-ran `pnpm lint` and `git diff --check`; lint now completes with warnings only and no errors.

### 한국어 (secondary)
- DR 테스트 실행 전에 전체 저장소 lint gate를 막던 account security 페이지의 미사용 `Input` import를 제거했습니다.
- `pnpm lint`와 `git diff --check`를 다시 실행했으며 lint error 0건을 확인했습니다.
