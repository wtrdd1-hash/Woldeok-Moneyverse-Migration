# 백업 및 복구

[English](backup-and-recovery.md) | **한국어** | [문서 색인](../INDEX.ko.md)

> 현재 Debian/systemd 권위: v2026.09.17.174. 과거 Docker 백업 스크립트는 명시적으로 현재 환경에 맞게 수정하고 재검증하기 전에는 참고자료로만 취급합니다.

## 현재 자동 백업 계약

권위 Debian 호스트는 `ops/backup/moneyverse-backup.sh`와 `moneyverse-backup.timer`로 6시간 주기 암호화 백업을 수행합니다. 보호 대상은 권위 PostgreSQL 논리 DB와 운영 사진 오브젝트 디렉터리입니다.

기본 운영 계약:

- DB 컨테이너: `woldeok-moneyverse-dev-db-1`(legacy 이름이며 실제 DB 권위는 별도 검증)
- 사진 원본: `/srv/moneyverse-data/images/photos`
- 암호화 백업 목적지: `/var/backups/moneyverse`
- 암호화 키: `/etc/moneyverse/backup.key`, root 전용 `0600`, Git에 절대 저장하지 않음
- 주기: 현지시간 00:20, 06:20, 12:20, 18:20 + 최대 10분 랜덤 지연
- 보존: 14일
- 아카이브 형식: `moneyverse-backup-v1`

## 장애영역 분리 가드

백업이 DB 데이터 또는 사진과 같은 파일시스템에 저장되면 안 됩니다. 스크립트는 Docker PostgreSQL host mount와 사진 원본을 `findmnt`로 확인하고 `BACKUP_DEST`가 둘 중 하나와 같은 장치면 fail-closed 합니다.

2026-09-17 실측 기준 DB 데이터와 사진은 `/dev/sdb1`, `/var/backups/moneyverse`는 `/dev/sda1`입니다. 따라서 애플리케이션 데이터 디스크 장애에는 대비하지만 두 디스크 모두 같은 VM에 연결되어 있으므로 이는 **별도 디스크 로컬 복구**이지 검증된 off-host DR은 아닙니다.

## 암호화 및 검증

각 실행은 PostgreSQL custom-format dump와 zstd 사진 아카이브를 만들고 manifest 및 내부 SHA-256을 기록한 뒤 하나의 패키지로 묶어 OpenSSL AES-256-CBC + PBKDF2/SHA-256으로 암호화합니다. 암호화 파일에도 별도 SHA-256을 생성합니다.

성공 조건은 `moneyverse-backup-verify.sh`가 암호화 파일 checksum, 복호화, 내부 checksum, `pg_restore -l` DB 구조 검사, zstd 사진 아카이브 검사, 형식 marker를 모두 통과하는 것입니다. 평문 staging 데이터는 실행 종료 시 제거합니다.

## 복구 및 복구훈련 정책

검증을 이유로 Production에 직접 복구하지 않습니다. 복구 훈련은 격리된 일회용 PostgreSQL과 email/Discord/webhook/indexing outbound를 끈 환경에서 수행합니다. migration parity, ledger/balance, entitlement/provenance, 대표 사진, 주요 application read path까지 검증해야 `VERIFIED_RESTORABLE`로 표시할 수 있습니다.

운영 복구는 명시적 범위, backup identity/checksum, source/target identity, rollback target, operator/audit 기록이 필요합니다. 복구를 강제하려고 Docker volume을 삭제하면 안 됩니다.

## 남은 P0: 호스트 외부 재해복구

현재 자동 로컬 별도디스크 백업만으로 host/hypervisor/site/credential/ransomware 장애를 막을 수 없습니다. 독립 failure domain에 암호화 immutable/off-host 복사본이 존재하고 정기 isolated restore로 RPO/RTO를 실측하기 전까지 P0는 OPEN입니다. 별도 관리 NAS 또는 versioning/retention lock이 있는 object storage처럼 application runtime이 삭제 권한을 갖지 않는 대상이 필요합니다.
