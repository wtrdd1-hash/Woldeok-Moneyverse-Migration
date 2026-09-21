# Off-host restore drill — v2026.09.21.324

## English canonical

- Extended the real PostgreSQL disaster-recovery drill to accept either a local encrypted archive or an `rclone` off-host object.
- Off-host recovery fetches both the encrypted archive and its sidecar SHA-256 file into a mode-0700 temporary directory before any decryption.
- The downloaded object is verified with the same checksum, encrypted-container, internal `SHA256SUMS`, manifest, migration-authority, orphan-ledger, and balanced-ledger checks as a local backup.
- Restored PostgreSQL remains isolated with `--network none` and a fresh random credential; no production database endpoint or credential is used.
- Remote sources are restricted to the expected timestamped `moneyverse-*.tar.zst.enc` object naming contract and reject newline/carriage-return input.
- This closes the tooling gap between immutable off-host delivery and a real restore exercise. It does not claim operational DR success until a configured off-host remote is restored successfully.
- The existing orphan `221-stock-halt-cost-basis-settlement.sql` migration-authority drift remains fail-closed and is not rewritten or bypassed.

## 한국어

- 실제 PostgreSQL 재해복구 훈련이 로컬 암호화 백업뿐 아니라 `rclone` 원격 백업 객체도 직접 입력받도록 확장했다.
- 원격 복구 시 암호화 아카이브와 SHA-256 sidecar를 임시 디렉터리로 받은 뒤 복호화 전에 무결성을 검증한다.
- 이후 기존과 동일하게 내부 체크섬, manifest, migration authority, orphan ledger, debit/credit balance를 검증한다.
- 복구 PostgreSQL은 계속 `--network none`과 매회 새 임의 비밀번호를 사용한다.
- 실제 off-host remote에서 성공한 restore 증거가 생기기 전까지 DR 완료로 간주하지 않는다.
