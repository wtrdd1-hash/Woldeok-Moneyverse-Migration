# Isolated restore drill v2026.09.21.321

## English (canonical)

Development B adds an executable P0 DR restore drill rather than treating archive verification as recovery proof.

- `ops/backup/moneyverse-restore-drill.sh` decrypts and checksum-verifies a backup, then restores its PostgreSQL custom dump into an ephemeral PostgreSQL 17 container with `--network none` and a fresh random credential.
- The drill uses neither a Production endpoint nor a Production database credential. The container is always removed by a trap.
- It fail-closes unless the restored `schema_migrations` filenames exactly equal the immutable migration files in the checked-out candidate.
- It also rejects orphan ledger postings and any transaction whose credit/debit postings do not balance.
- A live drill against the newest verified backup `moneyverse-debian13-20260921T032438Z.tar.zst.enc` intentionally failed: the restored database records `221-stock-halt-cost-basis-settlement.sql`, while authoritative `main` ends at `220-private-chat-core.sql`.
- No migration history was rewritten or deleted. This is evidence of database/repository migration drift and remains a release/DR blocker until reconciled by an immutable, audited path.

## 한국어 (secondary)

개발 B에서 단순 archive 검증을 복구 성공으로 간주하지 않고 실제 P0 격리 복구 훈련 도구를 추가했습니다.

- 백업을 복호화·checksum 검증한 뒤 `--network none` 임시 PostgreSQL 17 컨테이너와 새 임의 credential로 복구합니다.
- Production endpoint/DB credential을 사용하지 않으며 종료 시 임시 컨테이너를 제거합니다.
- 복구 DB의 `schema_migrations`와 현재 후보의 immutable migration 파일 목록이 정확히 일치하지 않으면 실패합니다.
- orphan ledger posting과 debit/credit 불균형 transaction도 실패 처리합니다.
- 최신 검증 백업 실훈련에서 DB에는 `221-stock-halt-cost-basis-settlement.sql`이 기록되어 있지만 authoritative `main`은 `220-private-chat-core.sql`에서 끝나 drift가 검출되었습니다.
- migration 기록을 삭제·재작성하지 않았습니다. immutable하고 감사 가능한 reconciliation 전까지 release/DR blocker로 유지합니다.
