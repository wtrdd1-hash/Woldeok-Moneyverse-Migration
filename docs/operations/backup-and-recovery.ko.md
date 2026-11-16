# 백업 및 복구

[English](backup-and-recovery.md) | **한국어** | [문서 색인](../INDEX.ko.md)

> 현재 Debian/systemd 권위: v2026.09.17.174. 과거 Docker 백업 스크립트는 명시적으로 현재 환경에 맞게 수정하고 재검증하기 전에는 참고자료로만 취급합니다.

## 현재 자동 백업 계약

권위 Debian 호스트는 `/usr/local/lib/moneyverse-backup/moneyverse-backup.sh`를 `moneyverse-backup.service`·`moneyverse-backup.timer`로 호출하여 6시간 주기 암호화 백업을 수행합니다. 보호 대상은 권위 PostgreSQL 논리 DB와 운영 사진 오브젝트 디렉터리입니다.

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


## 미니PC 실서버 장애 조치 검증 — v2026.11.17.1 (2026-11-17 KST)

**2026-09-17 기록의 디스크 명칭은 현재와 반대입니다.** 운영 DB 데이터 `/srv/moneyverse-data/db-rebuild-v1202/pgdata`는 `/dev/sda1`, 암호화 백업 `/var/backups/moneyverse`는 `/dev/sdb1`입니다. 같은 호스트 안의 별도 디스크이며 **원격지 재해복구는 미검증**입니다. NestJS·Spring 운영 API의 DB 연결은 `127.0.0.1:5433/woldeok_moneyverse_dev`이고, 이름에 dev가 있는 `woldeok-moneyverse-dev-db-1` 컨테이너의 호스트 포트와 일치합니다.

- `moneyverse-backup.timer` 활성·사용 설정 확인. 11월 17일 00:26:14~00:26:32 실행 성공, DB 덤프·사진·매니페스트 SHA-256 및 읽기 검증 성공. 14일 보존, 암호화 아카이브 60개, 최신 184,664,272바이트 실측. 백업 디렉터리 `0700`.
- `debian` 계정의 매일 04:00 구형 크론은 **폐기된 비실행** `backup-r2-free.sh`를 호출하여 `Permission denied`를 반복했습니다. 과거 평문 gzip 백업을 다루던 스크립트이므로 chmod로 재활성화하면 안 됩니다. 비공개 작업기록에 원본 크론을 보관한 뒤 11월 17일 검토된 비공개 호스트용 제거 스크립트로 해당 줄만 제거했습니다. 6시간 간격 systemd 작업은 건드리지 않았고, 과거 오류 로그는 보존했습니다. 보안 정책상 실제 크론 변경 셸 스크립트는 Git에 넣지 않고 비공개 작업기록에 보존했습니다. 소스의 읽기 전용 검사기 `node scripts/backup/check-legacy-cron.mjs`는 구형 크론 재발 및 암호화 백업 타이머 오류를 탐지하지만 운영 설정을 변경하지 않습니다.
- **격리 복원 스모크 시험 성공:** `moneyverse-debian13-20261116T152614Z.tar.zst.enc`의 암호문 SHA-256을 확인한 뒤 호스트에 평문 덤프를 저장하지 않고 네트워크가 차단된 PostgreSQL 17 일회용 컨테이너에 전체 `pg_restore`를 실행했습니다. DB 크기 1,653MB, 공개 테이블 276개, 원장 거래 943건, 분개 1,950건, 계정 잔액 43건 읽기 확인. 컨테이너와 임시 DB 파일 정리. **금융 정합성 전체 검증, 마이그레이션 패리티, 사진 읽기, 애플리케이션 E2E, 전체 DR 인증까지 완료된 것은 아닙니다.**
- 기존 텔레그램 운영 감시에서 백업 타이머·서비스 상태를 조회하고 연결된 관리자 채팅 설정도 확인했습니다. 브리지 회귀 시험 16개 통과. 다만 실제 장애 발생을 유도하지 않았고 외부 전송 성공은 별도 미검증입니다. 백업 최신성·원격지 복제·불변 보존·전체 DR 시험은 후속 통과 조건입니다.
- 원격 저장소 자격 증명·대상은 검증되지 않았으므로 백업을 외부로 업로드하지 않았습니다. 독립 관리되는 버전 잠금/불변 저장소에 **암호화 파일만** 최소 권한으로 복제한 뒤 원격 체크섬과 독립 복원을 검증해야 P0를 닫을 수 있습니다.
- 관리자 시스템 로그 열람 기능은 main의 #3201에 이미 병합됐고, 이번 백업 작업에서 해당 프론트엔드·Spring 코드를 변경하거나 배포하지 않았습니다.

**적용 범위:** Debian 호스트의 폐기 크론 정리로, Next/Nest/Spring 애플리케이션 신규 릴리스가 아닙니다. 백업/알림 실행 코드 변경은 별도로 정확한 SHA의 Test·운영 승격 게이트를 통과해야 합니다. GitHub #1066, `docs/worklog/2026-11-17-backup-recovery-v2026.11.17.1.ko.md` 참조.
